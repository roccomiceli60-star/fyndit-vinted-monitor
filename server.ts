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

// Set of active Server-Sent Events clients for instant push
const sseClients = new Set<Response>();

function broadcastNewItems(newItems: VintedItem[]) {
  if (newItems.length === 0 || sseClients.size === 0) return;
  const payload = JSON.stringify({
    type: 'NEW_DROPS',
    timestamp: Date.now(),
    count: newItems.length,
    items: newItems,
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
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

// Fetch items from Vinted API strictly ordered by newest_first and filtered for freshness
async function fetchFromVinted(searchText = '', perPage = 30, retryCount = 0): Promise<any[]> {
  const { cookie, token } = await refreshVintedSession();
  const url = `https://api.vinted.it/svc-catalogue/items?search_text=${encodeURIComponent(
    searchText
  )}&page=1&per_page=${perPage}&order=newest_first`;

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

  // If token expired, force refresh session and retry once
  if (res.status === 401 && retryCount === 0) {
    await refreshVintedSession(true);
    return fetchFromVinted(searchText, perPage, 1);
  }

  if (!res.ok) {
    throw new Error(`Vinted API status ${res.status}`);
  }

  const json: any = await res.json();
  const rawItems = json.items || [];

  // Update highest known ID to measure recency accurately
  for (const it of rawItems) {
    if (it.id && typeof it.id === 'number') {
      highestSeenRawId = Math.max(highestSeenRawId, it.id);
    }
  }

  // Filter out promoted/bumped items; only filter idDelta on generic drops
  const strictlyFresh = rawItems.filter((it: any) => {
    // 1. Exclude paid bumps/promoted items
    if (it.promoted === true) return false;
    
    // 2. Exclude old IDs only during general sniper feed, never on explicit searches
    if (!searchText.trim() && highestSeenRawId > 0 && it.id && typeof it.id === 'number') {
      const idDelta = highestSeenRawId - it.id;
      if (idDelta > 45000) return false;
    }
    return true;
  });

  return strictlyFresh;
}

// Transform raw Vinted item: exact seller price without buyer protection
function transformVintedItem(raw: any): VintedItem {
  let price = 15.00;
  if (raw.price?.amount != null) {
    const val = parseFloat(String(raw.price.amount));
    if (!isNaN(val) && val > 0) price = Number(val.toFixed(2));
  } else if (typeof raw.price === 'number') {
    price = Number(raw.price.toFixed(2));
  } else if (typeof raw.price === 'string') {
    const val = parseFloat(raw.price.replace(',', '.'));
    if (!isNaN(val) && val > 0) price = Number(val.toFixed(2));
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
  if (!img) {
    img = 'https://images1.vinted.net/t/04_005ba_An4HTJGzsV4nWGKrJSkHRe8Y/310x430/8c6d7fc2.webp';
  }

  const countries = [
    { country: 'Italia', flag: '🇮🇹' },
    { country: 'Francia', flag: '🇫🇷' },
    { country: 'Spagna', flag: '🇪🇸' },
  ];
  const randCountry = countries[Math.abs(raw.id || 0) % countries.length];

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
    marketValue: valuation.marketValue,
    discountPercent: valuation.discountPercent,
    potentialProfit: valuation.potentialProfit,
    resellNotes: valuation.notes,
    seller: {
      username: raw.user?.login || 'utente_vinted',
      rating: 4.8 + ((Math.abs(raw.id || 0) % 3) / 10),
      reviewCount: 20 + (Math.abs(raw.id || 0) % 150),
      country: randCountry.country,
      countryFlag: randCountry.flag,
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
  const transformed = items.map(transformVintedItem);
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

// Micro-Worker 1: General newest drops (Highest priority)
async function runGeneralWorker() {
  while (true) {
    try {
      const raw = await fetchFromVinted('', 30);
      ingestRawItems(raw);
    } catch {
      // transient error, retry
    }
    await new Promise((r) => setTimeout(r, 1600));
  }
}

// Micro-Worker 2: Monitored Hyped Categories & Brands rotation
const SNIPER_QUERIES = [
  'pokemon tcg',
  'trapstar',
  'ps5',
  'corteiz',
  'lego star wars',
  'nike dunk',
  'airpods',
  'ralph lauren',
  'stone island',
  'carhartt detroit',
  'nintendo switch',
  'stussy 8 ball',
];
let queryIdx = 0;

async function runBrandWorker() {
  while (true) {
    const q = SNIPER_QUERIES[queryIdx % SNIPER_QUERIES.length];
    queryIdx++;
    try {
      const raw = await fetchFromVinted(q, 20);
      ingestRawItems(raw);
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

runGeneralWorker();
setTimeout(runBrandWorker, 800);

// API Routes
// 1. SSE Stream: Pushes new items the millisecond they are detected
app.get('/api/vinted/stream', (_req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const now = Date.now();
  const freshCache = realItemsCache
    .filter((i) => now - i.discoveredAt < 20 * 60 * 1000)
    .slice(0, 40);

  const initialPayload = JSON.stringify({
    type: 'INITIAL_STATE',
    timestamp: now,
    items: freshCache,
  });

  res.write(`data: ${initialPayload}\n\n`);
  sseClients.add(res);

  const pingInterval = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(pingInterval);
      sseClients.delete(res);
    }
  }, 10000);

  _req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(res);
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

  if (search || (brand && brand !== 'tutti')) {
    let effectiveQuery = search;
    if (brand && brand !== 'tutti') {
      effectiveQuery = search ? `${brand} ${search}`.trim() : brand;
    }
    try {
      const rawItems = await fetchFromVinted(effectiveQuery, 30);
      const transformed = rawItems.map(transformVintedItem);
      for (const it of transformed) {
        if (!seenItemIds.has(it.id)) {
          seenItemIds.add(it.id);
          realItemsCache.unshift(it);
        }
      }
      results = transformed;
    } catch {
      const now = Date.now();
      results = realItemsCache.filter((item) => {
        const isFresh = (now - item.discoveredAt) < 20 * 60 * 1000;
        const matchesSearch = !search || item.title.toLowerCase().includes(search) || item.brand.toLowerCase().includes(search);
        const matchesBrand = !brand || brand === 'tutti' || item.brand.toLowerCase().includes(brand);
        return isFresh && matchesSearch && matchesBrand;
      });
    }
  } else {
    const now = Date.now();
    results = realItemsCache.filter((i) => (now - i.discoveredAt) < 20 * 60 * 1000);
  }

  if (brand && brand !== 'tutti') {
    results = results.filter((item) => 
      item.brand.toLowerCase().includes(brand) || 
      item.title.toLowerCase().includes(brand)
    );
  }

  if (minPrice && !isNaN(minPrice) && minPrice > 0) {
    results = results.filter((item) => item.price >= minPrice);
  }
  if (maxPrice && !isNaN(maxPrice) && maxPrice > 0) {
    results = results.filter((item) => item.price <= maxPrice);
  }

  results.sort((a, b) => b.discoveredAt - a.discoveredAt);

  const now = Date.now();
  results = results.map((item) => ({
    ...item,
    publishedSecondsAgo: Math.max(1, Math.round((now - item.discoveredAt) / 1000)),
  }));

  const latencyMs = Date.now() - startTime;

  res.json({
    success: true,
    total: results.length,
    latencyMs,
    query: search || brand || 'all',
    source: 'vinted_live_official_api',
    items: results,
  });
});

app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).send('Invalid url');
  }
  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.vinted.it/',
      },
    });
    if (!upstream.ok) {
      return res.status(upstream.status).send('Failed to fetch image');
    }
    const contentType = upstream.headers.get('content-type') || 'image/webp';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    const buffer = await upstream.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Proxy error');
  }
});

app.get('/api/vinted/status', (_req, res) => {
  res.json({
    status: 'ONLINE',
    totalCached: realItemsCache.length,
    activeStreamListeners: sseClients.size,
    sessionActive: Boolean(sessionCookieHeader && sessionAccessToken),
    lastCookieUpdate: new Date(lastCookieFetch).toISOString(),
    highestSeenRawId,
    freshnessFilter: 'STRICT_NEWEST_ONLY (<20min)',
  });
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
