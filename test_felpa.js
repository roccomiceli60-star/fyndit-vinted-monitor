async function run() {
  const r = await fetch("https://www.vinted.it/catalog?search_text=felpa&order=newest_first", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept-Language": "it-IT,it;q=0.9"
    }
  });
  const html = await r.text();
  const re = /href="\/items\/(\d+)-([^"]+)"/g;
  let m;
  let count = 0;
  while ((m = re.exec(html)) !== null && count < 10) {
    count++;
    console.log("Felpa HTML Item:", m[1], m[2]);
  }
}
run();
