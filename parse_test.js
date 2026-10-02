async function run() {
  const r = await fetch("https://www.vinted.it/catalog?search_text=scarpe&order=newest_first", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept-Language": "it-IT,it;q=0.9"
    }
  });
  const html = await r.text();
  
  // Extract all productItem from HTML
  const items = [];
  const regex = /"productItem":\s*(\{[^}]+\"id\":\d+[^}]+price[^}]+\})/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      // Find full json of productItem
      const startIdx = m.index + 14;
      let depth = 0;
      let endIdx = startIdx;
      for (let i = startIdx; i < html.length; i++) {
        if (html[i] === '{') depth++;
        else if (html[i] === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
      const rawJson = html.slice(startIdx, endIdx);
      const parsed = JSON.parse(rawJson);
      items.push(parsed);
    } catch (e) {
      // ignore
    }
  }

  console.log("Successfully extracted productItems directly from HTML:", items.length);
  for (const it of items.slice(0, 5)) {
    console.log("  ID:", it.id, "Title:", it.title, "Price:", it.price, "Url:", it.url);
  }
}
run();
