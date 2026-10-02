async function run() {
  const r = await fetch("https://www.vinted.it/catalog?search_text=scarpe&order=newest_first", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept-Language": "it-IT,it;q=0.9"
    }
  });
  const html = await r.text();
  
  // Find all items by matching title attribute on overlay-link:
  // title="Scarpe ginnastica, Brand: Nike, Condizioni: Ottime, Taglia: 38, 20.00 €, 21.70 €"
  const overlayRegex = /href="\/items\/(\d+)-([^"]+)"[^>]*title="([^"]+)"/g;
  let m;
  const items = [];
  while ((m = overlayRegex.exec(html)) !== null) {
    const id = m[1];
    const slug = m[2];
    const fullTitle = m[3];
    items.push({ id, slug, fullTitle });
  }
  console.log("Matched via overlay links:", items.length);
  for (const it of items.slice(0, 5)) {
    console.log("  Item:", it.id, it.fullTitle);
  }
}
run();
