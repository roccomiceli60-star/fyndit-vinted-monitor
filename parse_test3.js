async function run() {
  const r = await fetch("https://www.vinted.it/catalog?search_text=scarpe&order=newest_first", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept-Language": "it-IT,it;q=0.9"
    }
  });
  const html = await r.text();
  
  // Extract container by data-testid="product-item-id-XXXX"
  const containerRegex = /<div[^>]*data-testid="product-item-id-(\d+)"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  
  // Or match item blocks
  const blocks = html.split('data-testid="product-item-id-');
  const items = [];
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const id = b.slice(0, b.indexOf('"'));
    if (!id || isNaN(Number(id))) continue;

    // image url
    const imgMatch = b.match(/src="(https:\/\/images\d*\.vinted\.net\/[^"]+)"/);
    const imgUrl = imgMatch ? imgMatch[1] : '';

    // link & title details
    const linkMatch = b.match(/href="(\/items\/\d+-[^"]+)"[^>]*title="([^"]+)"/);
    if (!linkMatch) continue;

    const vintedPath = linkMatch[1];
    const fullMeta = linkMatch[2]; // e.g. "Scarpe da ginnastica, Brand: Nike, Condizioni: Ottime, Taglia: 39, 17.00 €, 18.55 €"

    // Parse fullMeta
    const parts = fullMeta.split(', ');
    const title = parts[0] || 'Articolo Vinted';
    let brand = 'Vinted';
    let condition = 'Ottime condizioni';
    let size = 'M';
    let price = 15;

    for (const p of parts.slice(1)) {
      if (p.startsWith('Brand: ')) brand = p.replace('Brand: ', '').trim();
      else if (p.startsWith('Condizioni: ')) condition = p.replace('Condizioni: ', '').trim();
      else if (p.startsWith('Taglia: ')) size = p.replace('Taglia: ', '').trim();
      else if (p.includes('€') || p.includes('£') || p.includes('$')) {
        const num = parseFloat(p.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!isNaN(num) && num > 0) price = num;
      }
    }

    items.push({
      id: Number(id),
      title,
      brand,
      condition,
      size,
      price,
      imgUrl,
      vintedUrl: `https://www.vinted.it${vintedPath}`,
    });
  }

  console.log("Extracted items perfectly:", items.length);
  for (const it of items.slice(0, 5)) {
    console.log(it);
  }
}
run();
