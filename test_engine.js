import { calculateMarketValuation } from './src/utils/marketValuation.ts';
import { detectCategory } from './src/data/vintedCategories.ts';

async function fetchLiveCatalog(searchText = '') {
  let url = 'https://www.vinted.it/catalog?order=newest_first';
  if (searchText.trim()) {
    url = `https://www.vinted.it/catalog?search_text=${encodeURIComponent(searchText.trim())}&order=newest_first`;
  }

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'it-IT,it;q=0.9',
    },
  });

  const html = await res.text();
  const re = /<img[^>]+src="(https:\/\/images\d*\.vinted\.net\/[^"]+)"[^>]*>[\s\S]*?<a[^>]+href="(\/items\/(\d+)-[^"]+)"[^>]*title="([^"]+)"/g;
  let m;
  const items = [];
  const seen = new Set();

  while ((m = re.exec(html)) !== null) {
    const rawId = Number(m[3]);
    if (!rawId || seen.has(rawId)) continue;
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
      isNewDrop: true,
    });
  }

  // Sort strictly by rawId descending (highest ID = published literally seconds ago)
  items.sort((a, b) => b.rawId - a.rawId);
  return items.map((it, idx) => ({
    ...it,
    publishedSecondsAgo: Math.max(2, idx * 3),
  }));
}

async function testAll() {
  for (const q of ['', 'scarpe', 'nike', 'felpa trapstar']) {
    const list = await fetchLiveCatalog(q);
    console.log(`Query: "${q}" -> Total items: ${list.length}`);
    if (list.length > 0) {
      const top = list[0];
      console.log(`   Top Drop: [ID: ${top.rawId}] "${top.title}" | Brand: ${top.brand} | ${top.originalPriceDisplay} | ${top.publishedSecondsAgo}s fa`);
    }
  }
}
testAll();
