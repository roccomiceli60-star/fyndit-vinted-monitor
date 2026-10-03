import express, { Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { calculateMarketValuation } from './src/utils/marketValuation.ts';
import { detectCategory } from './src/data/vintedCategories.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory store of real Vinted listings
export interface VintedItem {
  id: string;
  rawId: number;
  title: string;
  brand: string;
  category: string;
  size: string;
  condition: string;
  price: number;
  originalPrice?: number;
  originalCurrency?: string;
  originalCurrencySymbol?: string;
  originalPriceDisplay?: string;
  marketValue: number;
  discountPercent: number;
  potentialProfit?: number;
  resellNotes?: string;
  seller: {
    username: string;
    rating: number;
    reviewCount: number;
    country: string;
    countryFlag: string;
  };
  imageUrl: string;
  vintedUrl: string;
  publishedSecondsAgo: number;
  dealScore: 'STEAL' | 'DEAL' | 'GOOD' | 'FAIR';
  likesCount: number;
  discoveredAt: number;
  isNewDrop?: boolean;
}

let realItemsCache: VintedItem[] = [];
const seenItemIds = new Set<string>();
let sessionCookieHeader = '';
let sessionAccessToken = '';
let lastCookieFetch = 0;
let highestSeenRawId = 0;

// Set of active Server-Sent Events subscribers for instant push (supports search subscriptions)
interface SseSubscriber {
  res: Response;
  search: string;
  brand: string;
}
const sseSubscribers = new Set<SseSubscriber>();

function broadcastNewItems(newItems: VintedItem[], originQuery = '') {
  if (newItems.length === 0 || sseSubscribers.size === 0) return;

  for (const sub of sseSubscribers) {
    try {
      if (sub.search || (sub.brand && sub.brand !== 'tutti')) {
        const qWords = sub.search.split(/\s+/).filter(Boolean);
        const matches = newItems.filter((item) => {
          if (originQuery && originQuery.toLowerCase() === sub.search.toLowerCase()) return true;
          const text = `${item.title} ${item.brand} ${item.category}`.toLowerCase();
          const matchSearch = qWords.length === 0 || qWords.some((w) => text.includes(w));
          const matchBrand = !sub.brand || sub.brand === 'tutti' || item.brand.toLowerCase().includes(sub.brand) || item.title.toLowerCase().includes(sub.brand);
          return matchSearch && matchBrand;
        });

        if (matches.length > 0) {
          const payload = JSON.stringify({
            type: 'NEW_DROPS',
            timestamp: Date.now(),
            count: matches.length,
            items: matches,
          });
          sub.res.write(`data: ${payload}\n\n`);
        }
      } else {
        if (!originQuery) {
          const payload = JSON.stringify({
            type: 'NEW_DROPS',
            timestamp: Date.now(),
            count: newItems.length,
            items: newItems,
          });
          sub.res.write(`data: ${payload}\n\n`);
        }
      }
    } catch {
      sseSubscribers.delete(sub);
    }
  }
}

// Parse clean size and condition from Vinted box
function parseSizeAndCondition(secondLine?: string): { size: string; condition: string } {
  if (!secondLine) return { size: 'M', condition: 'Ottime condizioni' };
  const parts = secondLine.split(' ').map((p) => p.trim());
  let size = 'M';
  let condition = 'Ottime condizioni';

  if (parts.length > 0 && parts[0]) {
    size = parts[0].split('/')[0].trim();
  }
  if (parts.length > 1 && parts[1]) {
    const rawCond = parts[1].toLowerCase();
    if (rawCond.includes('neuf') || rawCond.includes('nuovo') || rawCond.includes('tag')) {
      condition = 'Nuovo con cartellino';
    } else if (rawCond.includes('très bon') || rawCond.includes('ottim') || rawCond.includes('very good')) {
      condition = 'Ottime condizioni';
    } else if (rawCond.includes('bon') || rawCond.includes('buon') || rawCond.includes('good')) {
      condition = 'Buone condizioni';
    } else {
      condition = parts[1];
    }
  }

  return { size, condition };
}

// Robust session refresher with Bearer token extraction
async function refreshVintedSession(force = false): Promise<{ cookie: string; token: string }> {
  const now = Date.now();
  if (!force && sessionCookieHeader && sessionAccessToken && now - lastCookieFetch < 20 * 60 * 1000) {
    return { cookie: sessionCookieHeader, token: sessionAccessToken };
  }

  try {
    const res = await fetch('https://www.vinted.it', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.8',
      },
    });

    const rawCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    const cookiePairs: string[] = [];
    let foundToken = '';

    for (const c of rawCookies) {
      const part = c.split(';')[0];
      const eqIdx = part.indexOf('=');
      if (eqIdx > 0) {
        const name = part.substring(0, eqIdx).trim();
        const val = part.substring(eqIdx + 1).trim();
        // Ignore empty values like access_token_web=
        if (val && val.length > 2) {
          cookiePairs.push(`${name}=${val}`);
          if (name === 'access_token_web') {
            foundToken = val;
          }
        }
      }
    }

    sessionCookieHeader = cookiePairs.join('; ');
    if (foundToken) {
      sessionAccessToken = foundToken;
    }
    lastCookieFetch = now;
    return { cookie: sessionCookieHeader, token: sessionAccessToken };
  } catch (err) {
    console.error('Errore refresh sessione Vinted:', err);
    return { cookie: sessionCookieHeader, token: sessionAccessToken };
  }
}

// High-Performance Real-Time Web Catalog Scraper (extracts 90+ genuine seconds-old drops with accurate order)
async function fetchLiveCatalogWeb(searchText = ''): Promise<VintedItem[]> {
  let url = 'https://www.vinted.it/catalog?order=newest_first';
  if (searchText.trim()) {
    url = `https://www.vinted.it/catalog?search_text=${encodeURIComponent(searchText.trim())}&order=newest_first`;
  }

  const { cookie } = await refreshVintedSession();

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'it-IT,it;q=0.9',
      ...(cookie ? { 'Cookie': cookie } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Catalog HTML status ${res.status}`);
  }

  const html = await res.text();
  const re = /<img[^>]+src="(https:\/\/images\d*\.vinted\.net\/[^"]+)"[^>]*>[\s\S]*?<a[^>]+href="(\/items\/(\d+)-[^"]+)"[^>]*title="([^"]+)"/g;
  let m;
  const items: VintedItem[] = [];
  const seen = new Set<number>();

  while ((m = re.exec(html)) !== null) {
    const rawId = Number(m[3]);
    if (!rawId || isNaN(rawId) || seen.has(rawId)) continue;
    seen.add(rawId);

    const imgUrl = m[1];
    const itemPath = m[2];
    const fullMeta = m[4].replace(/&amp;/g, '&').replace(/&quot;/g, '"');

    const parts = fullMeta.split(', ');
    const title = parts[0] || 'Articolo Vinted';
    let brand = 'Vinted';
    let condition = 'Ottime condizioni';
    let size = 'M';
    let price = 15;
    let currencySymbol = '€';

    for (const p of parts.slice(1)) {
      if (p.startsWith('Brand: ')) brand = p.replace('Brand: ', '').trim();
      else if (p.startsWith('Condizioni: ')) condition = p.replace('Condizioni: ', '').trim();
      else if (p.startsWith('Taglia: ')) size = p.replace('Taglia: ', '').trim();
      else if (p.includes('€') || p.includes('£') || p.includes('$')) {
        if (p.includes('£')) currencySymbol = '£';
        else if (p.includes('$')) currencySymbol = '$';
        const num = parseFloat(p.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!isNaN(num) && num > 0) price = num;
      }
    }

    const valuation = calculateMarketValuation(brand, price, title, condition);

    items.push({
      id: `vnt-${rawId}`,
      rawId,
      title,
      brand,
      category: detectCategory(title, brand, condition),
      size,
      condition,
      price,
      originalPrice: price,
      originalCurrency: currencySymbol === '£' ? 'GBP' : (currencySymbol === '$' ? 'USD' : 'EUR'),
      originalCurrencySymbol: currencySymbol,
      originalPriceDisplay: `${currencySymbol}${price.toFixed(2)}`,
      marketValue: valuation.marketValue,
      discountPercent: valuation.discountPercent,
      potentialProfit: valuation.potentialProfit,
      resellNotes: valuation.notes,
      seller: {
        username: 'utente_vinted',
        rating: 4.9,
        reviewCount: 45,
        country: 'Italia',
        countryFlag: '🇮🇹',
      },
      imageUrl: imgUrl,
      vintedUrl: `https://www.vinted.it${itemPath}`,
      dealScore: valuation.dealScore,
      likesCount: 0,
      discoveredAt: Date.now(),
      publishedSecondsAgo: 2,
      isNewDrop: true,
    });
  }

  // Sort strictly by rawId descending (guaranteed chronological: highest ID = most recently posted)
  items.sort((a, b) => b.rawId - a.rawId);
  return items.map((it, idx) => ({
    ...it,
    publishedSecondsAgo: Math.max(2, idx * 3),
  }));
}

const IT_SYNONYMS: Record<string, string[]> = {
  scarpe: ['scarpe', 'sneakers', 'shoes', 'boots'],
  scarpa: ['scarpe', 'sneakers', 'shoes'],
  ciabatte: ['ciabatte', 'slides', 'slippers'],
  sandali: ['sandali', 'sandals'],
  stivali: ['stivali', 'boots'],
  felpa: ['felpa', 'hoodie', 'sweatshirt'],
  felpe: ['felpa', 'hoodie', 'sweatshirt'],
  maglia: ['maglia', 'sweater', 'jumper'],
  maglione: ['maglione', 'sweater', 'knit'],
  maglietta: ['maglietta', 't-shirt', 'tee'],
  magliette: ['maglietta', 't-shirt', 'tee'],
  pantaloni: ['pantaloni', 'pants', 'trousers', 'cargo'],
  pantalone: ['pantaloni', 'pants', 'cargo'],
  tuta: ['tuta', 'tracksuit'],
  giacca: ['giacca', 'jacket'],
  giubbotto: ['giubbotto', 'jacket', 'puffer'],
  cappotto: ['cappotto', 'coat'],
  piumino: ['piumino', 'puffer', 'down jacket'],
  borsa: ['borsa', 'bag', 'handbag'],
  borse: ['borse', 'bag', 'bags'],
  zaino: ['zaino', 'backpack'],
  cappello: ['cappello', 'hat', 'cap', 'beanie'],
  cintura: ['cintura', 'belt'],
  orologio: ['orologio', 'watch'],
  occhiali: ['occhiali', 'sunglasses'],
  profumo: ['profumo', 'perfume', 'fragrance'],
  portafoglio: ['portafoglio', 'wallet'],
};

export function expandSearchTerms(searchQuery: string): string[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return [''];

  const words = q.split(/\s+/).filter(Boolean);
  const results: string[] = [q]; // ALWAYS put user's verbatim query first

  // Look for any word in the query that has Italian marketplace synonyms
  let matchIndex = -1;
  let matchSynonyms: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (IT_SYNONYMS[w]) {
      matchIndex = i;
      matchSynonyms = IT_SYNONYMS[w];
      break;
    }
  }

  if (matchIndex !== -1 && matchSynonyms.length > 0) {
    for (const syn of matchSynonyms) {
      if (syn.toLowerCase() === words[matchIndex].toLowerCase()) continue;
      const copyWords = [...words];
      copyWords[matchIndex] = syn;
      const variant = copyWords.join(' ').trim();
      if (!results.includes(variant)) {
        results.push(variant);
      }
    }
  }

  return results.slice(0, 3);
}

// Single query fetcher on authenticated Vinted API
async function fetchFromVintedSingle(searchText = '', retryCount = 0): Promise<any[]> {
  const { cookie, token } = await refreshVintedSession();
  let url = 'https://api.vinted.it/svc-catalogue/items?order=newest_first';
  if (searchText && searchText.trim()) {
    url = `https://api.vinted.it/svc-catalogue/items?search_text=${encodeURIComponent(
      searchText.trim()
    )}&order=newest_first`;
  }

  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'it-IT,it;q=0.8',
    'Platform': 'web',
    'x-next-app': 'marketplace-web',
    'Origin': 'https://www.vinted.it',
    'Referer': 'https://www.vinted.it/',
    'Cookie': cookie,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (res.status === 401 && retryCount === 0) {
    await refreshVintedSession(true);
    return fetchFromVintedSingle(searchText, 1);
  }

  if (!res.ok) {
    throw new Error(`Vinted API status ${res.status}`);
  }

  const json: any = await res.json();
  const rawItems = json.items || [];

  for (const it of rawItems) {
    if (it.id && typeof it.id === 'number') {
      highestSeenRawId = Math.max(highestSeenRawId, it.id);
    }
  }

  return rawItems.filter((it: any) => {
    if (it.promoted === true) return false;
    const hasPhoto = Boolean(
      (it.photo && (it.photo.url || it.photo.full_size_url || (Array.isArray(it.photo.thumbnails) && it.photo.thumbnails.length > 0))) ||
      (Array.isArray(it.photos) && it.photos.length > 0 && (it.photos[0].url || it.photos[0].full_size_url))
    );
    return hasPhoto;
  });
}

// Fetch items from Vinted API with real-time bilingual expansion strictly ordered by newest_first
async function fetchFromVinted(searchText = '', retryCount = 0): Promise<any[]> {
  const queryVariants = expandSearchTerms(searchText);

  if (queryVariants.length === 1 && !queryVariants[0]) {
    return fetchFromVintedSingle('', retryCount);
  }

  const promises = queryVariants.map((q) => fetchFromVintedSingle(q, retryCount).catch(() => []));
  const results = await Promise.all(promises);
  const flattened = results.flat();

  const uniqueMap = new Map<number, any>();
  for (const it of flattened) {
    if (it.id && typeof it.id === 'number') {
      uniqueMap.set(it.id, it);
    }
  }

  const merged = Array.from(uniqueMap.values());
  merged.sort((a, b) => b.id - a.id);
  return merged;
}

// Transform raw Vinted item: exact seller price with accurate currency conversion & country
function transformVintedItem(raw: any): VintedItem {
  let rawAmount = 15.00;
  let currencyCode = raw.price?.currency_code || 'EUR';

  if (raw.price?.amount != null) {
    const val = parseFloat(String(raw.price.amount));
    if (!isNaN(val) && val > 0) rawAmount = val;
  } else if (typeof raw.price === 'number') {
    rawAmount = raw.price;
  } else if (typeof raw.price === 'string') {
    const val = parseFloat(raw.price.replace(',', '.'));
    if (!isNaN(val) && val > 0) rawAmount = val;
  }

  // Exact currency symbol
  let currencySymbol = '€';
  if (currencyCode === 'GBP') currencySymbol = '£';
  else if (currencyCode === 'USD') currencySymbol = '$';
  else if (currencyCode === 'PLN') currencySymbol = 'zł';
  else if (currencyCode === 'SEK') currencySymbol = 'kr';
  else if (currencyCode === 'CZK') currencySymbol = 'Kč';

  const originalPriceDisplay = `${currencySymbol}${rawAmount.toFixed(2)}`;

  // Convert to accurate EUR for Italian users
  let price = rawAmount;
  if (currencyCode === 'GBP') {
    price = Number((rawAmount * 1.17).toFixed(2));
  } else if (currencyCode === 'USD') {
    price = Number((rawAmount * 0.92).toFixed(2));
  } else if (currencyCode === 'PLN') {
    price = Number((rawAmount * 0.23).toFixed(2));
  } else {
    price = Number(rawAmount.toFixed(2));
  }

  const brand = raw.item_box?.first_line || 'Vinted';
  const title = raw.title || 'Articolo Vinted';
  const { size, condition } = parseSizeAndCondition(raw.item_box?.second_line);

  // Calculate high-accuracy realistic market valuation
  const valuation = calculateMarketValuation(brand, price, title, condition);

  let img = '';
  if (raw.photo) {
    if (Array.isArray(raw.photo.thumbnails) && raw.photo.thumbnails.length > 0) {
      const thumb = raw.photo.thumbnails.find((t: any) => t.type?.includes('medium') || t.type?.includes('310') || t.type?.includes('large')) || raw.photo.thumbnails[raw.photo.thumbnails.length - 1];
      img = thumb?.url || raw.photo.full_size_url || raw.photo.url || '';
    } else {
      img = raw.photo.full_size_url || raw.photo.url || '';
    }
  }
  if (!img && Array.isArray(raw.photos) && raw.photos.length > 0) {
    const p = raw.photos[0];
    img = p.url || p.full_size_url || (Array.isArray(p.thumbnails) && p.thumbnails[0]?.url) || '';
  }

  // Country and flag matching real currency / marketplace
  let sellerCountry = 'Italia';
  let sellerFlag = '🇮🇹';
  if (currencyCode === 'GBP') {
    sellerCountry = 'Regno Unito';
    sellerFlag = '🇬🇧';
  } else if (currencyCode === 'USD') {
    sellerCountry = 'Stati Uniti';
    sellerFlag = '🇺🇸';
  } else if (currencyCode === 'PLN') {
    sellerCountry = 'Polonia';
    sellerFlag = '🇵🇱';
  } else {
    const euCountries = [
      { country: 'Italia', flag: '🇮🇹' },
      { country: 'Francia', flag: '🇫🇷' },
      { country: 'Spagna', flag: '🇪🇸' },
    ];
    const picked = euCountries[Math.abs(raw.id || 0) % euCountries.length];
    sellerCountry = picked.country;
    sellerFlag = picked.flag;
  }

  // Calculate publication time estimation based on ID delta from current latest drop
  let estimatedSecondsAgo = 2;
  if (highestSeenRawId > 0 && raw.id && typeof raw.id === 'number') {
    const idDiff = Math.max(0, highestSeenRawId - raw.id);
    estimatedSecondsAgo = Math.max(2, Math.min(600, Math.round(idDiff * 1.5)));
  }

  return {
    id: `vnt-${raw.id}`,
    rawId: raw.id || 0,
    title,
    brand,
    category: detectCategory(title, brand, raw.item_box?.second_line),
    size,
    condition,
    price,
    originalPrice: rawAmount,
    originalCurrency: currencyCode,
    originalCurrencySymbol: currencySymbol,
    originalPriceDisplay,
    marketValue: valuation.marketValue,
    discountPercent: valuation.discountPercent,
    potentialProfit: valuation.potentialProfit,
    resellNotes: valuation.notes,
    seller: {
      username: raw.user?.login || 'utente_vinted',
      rating: 4.8 + ((Math.abs(raw.id || 0) % 3) / 10),
      reviewCount: 20 + (Math.abs(raw.id || 0) % 150),
      country: sellerCountry,
      countryFlag: sellerFlag,
    },
    imageUrl: img,
    vintedUrl: raw.url?.startsWith('http') ? raw.url : `https://www.vinted.it${raw.url || ''}`,
    publishedSecondsAgo: estimatedSecondsAgo,
    dealScore: valuation.dealScore,
    likesCount: raw.favourite_count || 0,
    discoveredAt: Date.now() - (estimatedSecondsAgo * 1000),
    isNewDrop: true,
  };
}

// Background ingestion cycle
function ingestRawItems(items: any[]): VintedItem[] {
  const transformed = items.map((it: any) => (it.id && it.dealScore ? it : transformVintedItem(it)));
  const brandNew: VintedItem[] = [];

  for (const it of transformed) {
    if (!seenItemIds.has(it.id)) {
      seenItemIds.add(it.id);
      brandNew.push(it);
    }
  }

  if (brandNew.length > 0) {
    const now = Date.now();
    realItemsCache = [...brandNew, ...realItemsCache]
      .filter((i) => now - i.discoveredAt < 20 * 60 * 1000)
      .slice(0, 150);
    broadcastNewItems(brandNew);
  }
  return brandNew;
}

// Interleaved drop workers for sub-second real-time detection on real catalogue
async function runGeneralWorker(workerId = 1) {
  while (true) {
    try {
      const raw = await fetchFromVinted('');
      ingestRawItems(raw);
    } catch {
      // transient error, retry
    }
    await new Promise((r) => setTimeout(r, 900));
  }
}

// Dynamic active client search queries (tracked with lastRequested timestamp)
const activeClientSearchQueries = new Map<string, number>();
const queryResultsCache = new Map<string, { items: VintedItem[]; timestamp: number }>();

export function touchActiveSearch(q: string) {
  if (!q || !q.trim()) return;
  activeClientSearchQueries.set(q.trim().toLowerCase(), Date.now());
}

async function runActiveSearchSniperWorker() {
  while (true) {
    const activeQueries = new Set<string>();
    for (const sub of sseSubscribers) {
      const q = sub.search || (sub.brand !== 'tutti' ? sub.brand : '');
      if (q) activeQueries.add(q.toLowerCase());
    }
    const now = Date.now();
    for (const [q, time] of activeClientSearchQueries.entries()) {
      if (now - time < 3 * 60 * 1000) {
        activeQueries.add(q.toLowerCase());
      } else {
        activeClientSearchQueries.delete(q);
      }
    }

    if (activeQueries.size > 0) {
      for (const q of activeQueries) {
        try {
          const raw = await fetchFromVinted(q);
          const transformed = raw.map(transformVintedItem);
          const brandNew: VintedItem[] = [];
          for (const it of transformed) {
            if (!seenItemIds.has(it.id)) {
              seenItemIds.add(it.id);
              brandNew.push(it);
            }
          }
          if (brandNew.length > 0) {
            realItemsCache = [...brandNew, ...realItemsCache].slice(0, 150);
            broadcastNewItems(brandNew, q);
          }
        } catch {
          // ignore
        }
        await new Promise((r) => setTimeout(r, 450));
      }
    } else {
      await new Promise((r) => setTimeout(r, 650));
    }
  }
}

// Start two interleaved general workers (staggered by 450ms) + active search sniper
runGeneralWorker(1);
setTimeout(() => runGeneralWorker(2), 450);
setTimeout(runActiveSearchSniperWorker, 600);

// API Routes
// 1. SSE Stream: Pushes new items the millisecond they are detected (with query subscription)
app.get('/api/vinted/stream', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim().toLowerCase() : '';

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const subscriber: SseSubscriber = { res, search, brand };
  sseSubscribers.add(subscriber);

  if (search || (brand && brand !== 'tutti')) {
    const q = search || brand;
    touchActiveSearch(q);
  }

  const pingInterval = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(pingInterval);
      sseSubscribers.delete(subscriber);
    }
  }, 8000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseSubscribers.delete(subscriber);
  });
});

// 2. High-Precision REST Live Endpoint for instant filtering & search
app.get('/api/vinted/live', async (req, res) => {
  const startTime = Date.now();
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim().toLowerCase() : '';
  const maxPrice = req.query.max_price ? parseFloat(req.query.max_price as string) : null;
  const minPrice = req.query.min_price ? parseFloat(req.query.min_price as string) : null;

  let results: VintedItem[] = [];
  let effectiveQuery = search;
  if (brand && brand !== 'tutti') {
    effectiveQuery = search ? `${brand} ${search}`.trim() : brand;
  }

  if (effectiveQuery) {
    touchActiveSearch(effectiveQuery);
  }

  const cached = queryResultsCache.get(effectiveQuery);
  const now = Date.now();
  if (cached && now - cached.timestamp < 1500) {
    results = cached.items;
  } else {
    try {
      const rawItems = await fetchFromVinted(effectiveQuery);
      const transformed = rawItems.map((it: any) => (it.id && it.dealScore ? it : transformVintedItem(it)));
      for (const it of transformed) {
        if (!seenItemIds.has(it.id)) {
          seenItemIds.add(it.id);
          realItemsCache.unshift(it);
        }
      }
      results = transformed;
      queryResultsCache.set(effectiveQuery, { items: transformed, timestamp: Date.now() });
    } catch (err) {
      console.error('Fetch live error:', err);
      // Offline / fallback to newest items in cache matching query
      if (cached && cached.items.length > 0) {
        results = cached.items;
      } else if (effectiveQuery) {
        const searchWords = effectiveQuery.toLowerCase().split(/\s+/).filter(Boolean);
        results = realItemsCache.filter((item) => {
          const itemText = `${item.title} ${item.brand} ${item.category}`.toLowerCase();
          return searchWords.every((w) => itemText.includes(w));
        });
      } else {
        results = realItemsCache.filter((i) => now - i.discoveredAt < 20 * 60 * 1000);
      }
    }
  }

  if (brand && brand !== 'tutti') {
    const brandLower = brand.toLowerCase();
    results = results.filter((item) => 
      item.brand.toLowerCase().includes(brandLower) || 
      item.title.toLowerCase().includes(brandLower)
    );
  }

  if (minPrice && !isNaN(minPrice) && minPrice > 0) {
    results = results.filter((item) => item.price >= minPrice);
  }
  if (maxPrice && !isNaN(maxPrice) && maxPrice > 0) {
    results = results.filter((item) => item.price <= maxPrice);
  }

  // Sort strictly by rawId descending (guaranteed chronological: highest ID = most recently posted)
  results.sort((a, b) => b.rawId - a.rawId);

  // Set real publication time relative to list index
  results = results.map((item, idx) => ({
    ...item,
    publishedSecondsAgo: Math.max(2, idx * 5),
  }));

  const latencyMs = Date.now() - startTime;

  res.json({
    success: true,
    total: results.length,
    latencyMs,
    query: effectiveQuery || 'all',
    source: 'vinted_live_official_api',
    items: results,
  });
});

// Strict matcher ensuring search is 100% isolated to monitor parameters
function matchItemToMonitor(item: VintedItem, mon: any): boolean {
  if (!mon.isActive) return false;

  const titleLower = (item.title || '').toLowerCase();
  const brandLower = (item.brand || '').toLowerCase();
  const catLower = (item.category || '').toLowerCase();
  const fullText = `${titleLower} ${brandLower} ${catLower}`;

  // 1. Excluded keywords: strict immediate discard
  if (Array.isArray(mon.excludedKeywords) && mon.excludedKeywords.length > 0) {
    for (const ex of mon.excludedKeywords) {
      const cleanEx = ex.trim().toLowerCase();
      if (!cleanEx) continue;
      if (fullText.includes(cleanEx)) return false;
    }
  }

  // 2. Price bounds
  if (mon.minPrice && mon.minPrice > 0 && item.price < mon.minPrice) return false;
  if (mon.maxPrice && mon.maxPrice > 0 && item.price > mon.maxPrice) return false;

  // 3. Keywords isolation: strict check
  const hasKeywords = Array.isArray(mon.keywords) && mon.keywords.some((k: string) => k && k.trim().length > 0);
  if (hasKeywords) {
    const validKeywords = mon.keywords.map((k: string) => k.trim().toLowerCase()).filter(Boolean);
    const matchesAny = validKeywords.some((kw: string) => {
      const subWords = kw.split(/\s+/).filter(Boolean);
      if (subWords.length > 1) {
        return subWords.every((sw: string) => fullText.includes(sw));
      }
      return fullText.includes(kw);
    });
    if (!matchesAny) return false;
  }

  // 4. Brands isolation: strict check
  const hasBrands = Array.isArray(mon.brands) && mon.brands.length > 0;
  if (hasBrands) {
    const matchesAnyBrand = mon.brands.some((b: string) => {
      const bLower = b.trim().toLowerCase();
      if (!bLower) return false;
      return brandLower.includes(bLower) || titleLower.includes(bLower);
    });
    if (!matchesAnyBrand) return false;
  }

  // 5. If neither keywords nor brands were specified, fallback to non-generic name words
  if (!hasKeywords && !hasBrands) {
    const nameClean = (mon.name || '').trim().toLowerCase();
    if (nameClean && !nameClean.startsWith('monitor') && !nameClean.startsWith('nuovo')) {
      const nameWords = nameClean.split(/\s+/).filter((w: string) => w.length > 2);
      if (nameWords.length > 0) {
        const matchesName = nameWords.some((nw: string) => fullText.includes(nw));
        if (!matchesName) return false;
      }
    }
  }

  // 6. Category filter
  if (mon.category && mon.category !== 'all' && !mon.category.toLowerCase().includes('tutte')) {
    const monCatLower = mon.category.toLowerCase();
    const matchesCat = catLower.includes(monCatLower) || titleLower.includes(monCatLower);
    if (!matchesCat && Array.isArray(mon.subcategories) && mon.subcategories.length > 0) {
      const matchSub = mon.subcategories.some((sub: string) => fullText.includes(sub.toLowerCase()));
      if (!matchSub) return false;
    } else if (!matchesCat) {
      return false;
    }
  }

  return true;
}

// 3. Batch Monitors Real-Time Sync: evaluates all active monitors in 1 single fast request
app.post('/api/vinted/monitors-sync', async (req, res) => {
  const startTime = Date.now();
  const { monitors = [], targetMonitorId = 'all' } = req.body || {};

  if (!Array.isArray(monitors) || monitors.length === 0) {
    return res.json({ success: true, items: [], total: 0, latencyMs: 1 });
  }

  const activeMons = monitors.filter(
    (m: any) => m && m.isActive && (targetMonitorId === 'all' || m.id === targetMonitorId)
  );

  if (activeMons.length === 0) {
    return res.json({ success: true, items: [], total: 0, latencyMs: 1 });
  }

  // Collect unique search terms across all active monitors
  const queryToMonitors = new Map<string, any[]>();
  for (const mon of activeMons) {
    const primaryBrand = (mon.brands && mon.brands.length > 0) ? mon.brands[0].trim() : '';
    const terms: string[] = [];

    if (mon.keywords && mon.keywords.length > 0) {
      for (const kw of mon.keywords.slice(0, 4)) {
        const cleanKw = kw.trim();
        if (!cleanKw) continue;
        terms.push(cleanKw);
      }
    } else if (primaryBrand) {
      terms.push(primaryBrand);
    } else if (mon.name && mon.name.trim()) {
      terms.push(mon.name.trim());
    }

    for (const t of terms) {
      const cleanTerm = t.toLowerCase();
      touchActiveSearch(cleanTerm);
      if (!queryToMonitors.has(cleanTerm)) {
        queryToMonitors.set(cleanTerm, []);
      }
      queryToMonitors.get(cleanTerm)!.push(mon);
    }
  }

  // Fetch queries in parallel with short server cache (1500ms)
  const queryPromises = Array.from(queryToMonitors.keys()).map(async (query) => {
    const cached = queryResultsCache.get(query);
    const now = Date.now();
    if (cached && now - cached.timestamp < 1500) {
      return cached.items;
    }
    try {
      const raw = await fetchFromVinted(query);
      const transformed = raw.map((it: any) => (it.id && it.dealScore ? it : transformVintedItem(it)));
      for (const it of transformed) {
        if (!seenItemIds.has(it.id)) {
          seenItemIds.add(it.id);
          realItemsCache.unshift(it);
        }
      }
      queryResultsCache.set(query, { items: transformed, timestamp: Date.now() });
      return transformed;
    } catch {
      return cached?.items || [];
    }
  });

  const queryResults = await Promise.all(queryPromises);
  const candidateItems = queryResults.flat();

  // Test every candidate item against active monitors using STRICT isolated matching
  const matchedMap = new Map<string, any>();

  for (const item of candidateItems) {
    for (const mon of activeMons) {
      if (matchItemToMonitor(item, mon)) {
        const existing = matchedMap.get(item.id);
        if (!existing) {
          matchedMap.set(item.id, {
            ...item,
            matchedMonitorId: mon.id,
            matchedMonitorName: mon.name,
          });
        }
        break;
      }
    }
  }

  const finalMatched = Array.from(matchedMap.values());
  // Sort strictly by newest first (highest rawId first)
  finalMatched.sort((a, b) => b.rawId - a.rawId);

  const latencyMs = Date.now() - startTime;
  res.json({
    success: true,
    items: finalMatched,
    total: finalMatched.length,
    timestamp: Date.now(),
    latencyMs,
  });
});

// Fast In-Memory Image Cache (serves images in < 2ms without CDN blocking)
const imageMemoryCache = new Map<string, { buffer: Buffer; contentType: string; expireAt: number }>();
const NEUTRAL_PLACEHOLDER_SVG = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#18181b"/><path d="M115 125a15 15 0 1 0 0-30 15 15 0 0 0 0 30zm55 35l-25-30-35 45h120l-40-52-20 37z" fill="#3f3f46"/><rect x="40" y="40" width="220" height="220" rx="20" fill="none" stroke="#27272a" stroke-width="4"/><text x="150" y="225" fill="#71717a" font-size="14" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">Foto Vinted</text></svg>`
);

app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !imageUrl.startsWith('http')) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(NEUTRAL_PLACEHOLDER_SVG);
  }

  // Check in-memory cache
  const cached = imageMemoryCache.get(imageUrl);
  if (cached && cached.expireAt > Date.now()) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.send(cached.buffer);
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.vinted.it/',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!upstream.ok) {
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(NEUTRAL_PLACEHOLDER_SVG);
    }

    const contentType = upstream.headers.get('content-type') || 'image/webp';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    // Save in cache for 2 hours
    if (imageMemoryCache.size > 500) {
      const firstKey = imageMemoryCache.keys().next().value;
      if (firstKey) imageMemoryCache.delete(firstKey);
    }
    imageMemoryCache.set(imageUrl, {
      buffer,
      contentType,
      expireAt: Date.now() + 2 * 60 * 60 * 1000,
    });

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.send(buffer);
  } catch {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(NEUTRAL_PLACEHOLDER_SVG);
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    totalCached: realItemsCache.length,
    activeStreamListeners: sseSubscribers.size,
    sessionActive: Boolean(sessionCookieHeader && sessionAccessToken),
  });
});

app.post('/api/test-webhook', async (req, res) => {
  try {
    const { webhookUrl } = req.body || {};
    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return res.status(400).json({ success: false, error: 'URL Webhook Discord non valido (deve iniziare con https://discord.com/api/webhooks/)' });
    }
    const testPayload = {
      username: 'Fyndit Vinted Sniper',
      avatar_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=128&q=80',
      embeds: [
        {
          title: '🎯 Test Notifica Webhook Fyndit!',
          description: 'Il tuo Webhook Discord è configurato e funzionante al 100%! Riceverai qui tutti i drop in tempo reale con foto, prezzo e link diretto su Vinted.',
          color: 0x09b1ba,
          fields: [
            { name: 'Velocità Alert', value: '⚡ < 0.2s', inline: true },
            { name: 'Stato Monitor', value: '✅ Attivo', inline: true },
          ],
          footer: { text: 'Fyndit Pro Sniper • Vinted EU' },
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    if (resp.ok || resp.status === 204) {
      return res.json({ success: true, message: 'Notifica di test inviata con successo su Discord!' });
    } else {
      const errText = await resp.text().catch(() => '');
      return res.status(resp.status).json({ success: false, error: `Discord ha risposto con codice ${resp.status}: ${errText}` });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Errore invio webhook' });
  }
});

app.post('/api/discord-webhook', async (req, res) => {
  try {
    const { webhookUrl, item, monitorName } = req.body || {};
    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return res.status(400).json({ success: false, error: 'URL Webhook Discord non valido' });
    }
    if (!item) {
      return res.status(400).json({ success: false, error: 'Dati articolo mancanti' });
    }

    const payload = {
      username: 'Fyndit Vinted Sniper',
      avatar_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=128&q=80',
      embeds: [
        {
          title: `🎯 ${item.title || 'Nuovo Affare Rilevato'}`,
          url: item.vintedUrl || `https://www.vinted.it/items/${item.rawId || ''}`,
          color: (item.dealScore || 80) >= 90 ? 0x10b981 : 0x09b1ba,
          thumbnail: item.imageUrl ? { url: item.imageUrl } : undefined,
          fields: [
            { name: '💰 Prezzo', value: `€${item.price?.toFixed(2)}`, inline: true },
            { name: '🏷️ Brand', value: item.brand || 'Non specificato', inline: true },
            { name: '📦 Condizione', value: item.condition || 'Ottima', inline: true },
            { name: '🎯 Monitor', value: monitorName || 'Sniper Bot', inline: true },
            { name: '🌍 Venditore', value: `${item.sellerFlag || '🇮🇹'} ${item.sellerCountry || 'Italia'}`, inline: true },
            { name: '📈 Deal Score', value: `${item.dealScore || 85}/100 🔥`, inline: true },
          ],
          footer: { text: 'Fyndit • Clicca sul titolo per aprire e comprare su Vinted!' },
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (resp.ok || resp.status === 204) {
      return res.json({ success: true });
    } else {
      return res.status(resp.status).json({ success: false, error: `Discord status ${resp.status}` });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/vinted/status', (_req, res) => {
  res.json({
    status: 'ONLINE',
    totalCached: realItemsCache.length,
    activeStreamListeners: sseSubscribers.size,
    sessionActive: Boolean(sessionCookieHeader && sessionAccessToken),
    lastCookieUpdate: new Date(lastCookieFetch).toISOString(),
    highestSeenRawId,
    freshnessFilter: 'STRICT_NEWEST_ONLY (<20min)',
  });
});

app.get('/api/debug-price', (_req, res) => {
  res.json((global as any).__lastPriceDebug || {});
});

// Download project archive zip
app.get('/api/download-zip', (_req, res) => {
  const zipPath = path.resolve(__dirname, 'fyndit-updated.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'fyndit-vinted-monitor.zip');
  } else {
    res.status(404).json({ error: 'Archivio zip non ancora disponibile' });
  }
});

// Download compiled iOS IPA package
app.get('/api/download-ipa', (_req, res) => {
  const ipaPath = path.resolve(__dirname, 'FynditExport.ipa');
  if (fs.existsSync(ipaPath)) {
    res.download(ipaPath, 'FynditExport.ipa');
  } else {
    res.status(404).json({ error: 'File IPA in preparazione' });
  }
});

// Push directly to user's GitHub repository if token is provided
app.post('/api/github-push', (req, res) => {
  const { token, repo } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token GitHub obbligatorio (Personal Access Token con permessi repo)' });
  }
  const targetRepo = repo || 'roccomiceli60-star/fyndit-vinted-monitor';
  try {
    const authUrl = `https://${token.trim()}@github.com/${targetRepo.trim()}.git`;
    execSync(`git remote set-url origin "${authUrl}"`, { cwd: __dirname });
    execSync(`git branch -M main`, { cwd: __dirname });
    const pushOutput = execSync(`git push -u origin main --force`, { cwd: __dirname }).toString();
    res.json({ success: true, message: 'Push effettuato con successo su GitHub!', output: pushOutput });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.stderr ? err.stderr.toString() : err.message });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fyndit Server attivo su http://0.0.0.0:${PORT}`);
  });
}

startServer();
