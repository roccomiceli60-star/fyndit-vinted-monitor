// Professional Streetwear, Luxury & Resell Market Valuation Engine

export interface MarketValuation {
  marketValue: number;
  discountPercent: number;
  potentialProfit: number;
  dealScore: 'STEAL' | 'DEAL' | 'GOOD' | 'FAIR';
  tier: 'LUXURY' | 'HYPED_STREETWEAR' | 'CONTEMPORARY' | 'SNEAKERS' | 'FAST_FASHION' | 'STANDARD';
  notes: string;
}

export function calculateMarketValuation(
  rawBrand: string,
  price: number,
  rawTitle: string,
  condition?: string
): MarketValuation {
  const brand = (rawBrand || '').toLowerCase().trim();
  const title = (rawTitle || '').toLowerCase().trim();
  const text = `${brand} ${title}`;

  let estimatedRetailOrResell = 0;
  let tier: MarketValuation['tier'] = 'STANDARD';
  let notes = 'Stima basata sul prezzo medio di mercato';

  // 1. HIGH-END LUXURY
  if (
    brand.includes('louis vuitton') ||
    brand.includes('gucci') ||
    brand.includes('prada') ||
    brand.includes('dior') ||
    brand.includes('balenciaga') ||
    brand.includes('fendi') ||
    brand.includes('bottega veneta') ||
    brand.includes('saint laurent') ||
    brand.includes('celine') ||
    brand.includes('goyard')
  ) {
    tier = 'LUXURY';
    if (text.includes('borsa') || text.includes('bag') || text.includes('pochette') || text.includes('backpack')) {
      estimatedRetailOrResell = 850;
      notes = 'Borsa/Accessorio Luxury alta richiesta';
    } else if (text.includes('scarpe') || text.includes('sneaker') || text.includes('shoes')) {
      estimatedRetailOrResell = 520;
      notes = 'Sneaker Luxury retail medio €650+';
    } else if (text.includes('giacca') || text.includes('jacket') || text.includes('coat')) {
      estimatedRetailOrResell = 750;
      notes = 'Capospalla Maison di Lusso';
    } else if (text.includes('cintura') || text.includes('belt') || text.includes('portafoglio') || text.includes('wallet')) {
      estimatedRetailOrResell = 290;
      notes = 'Pelletteria piccola Lusso';
    } else {
      estimatedRetailOrResell = 340;
      notes = 'Abbigliamento Designer Luxury';
    }
  }

  // 2. STONE ISLAND & C.P. COMPANY
  else if (brand.includes('stone island') || brand.includes('c.p. company') || brand.includes('cp company')) {
    tier = 'HYPED_STREETWEAR';
    if (text.includes('giacca') || text.includes('jacket') || text.includes('puffer') || text.includes('soft shell') || text.includes('down') || text.includes('parka')) {
      estimatedRetailOrResell = 480;
      notes = 'Giacca tecnica badge Stone Island / C.P.';
    } else if (text.includes('felpa') || text.includes('hoodie') || text.includes('crewneck') || text.includes('girocollo')) {
      estimatedRetailOrResell = 240;
      notes = 'Felpa iconica con badge sulla manica';
    } else if (text.includes('maglione') || text.includes('knit') || text.includes('knitwear')) {
      estimatedRetailOrResell = 260;
      notes = 'Maglieria in lana/cotone con badge';
    } else if (text.includes('t-shirt') || text.includes('maglietta') || text.includes('polo')) {
      estimatedRetailOrResell = 110;
      notes = 'T-shirt/Polo patch Stone Island';
    } else if (text.includes('pantaloni') || text.includes('cargo') || text.includes('pants')) {
      estimatedRetailOrResell = 230;
      notes = 'Pantalone cargo tecnico con badge';
    } else {
      estimatedRetailOrResell = 190;
      notes = 'Streetwear tecnico premium';
    }
  }

  // 3. CORTEIZ (CRTZ)
  else if (brand.includes('corteiz') || brand.includes('crtz') || text.includes('corteiz') || text.includes('crtz')) {
    tier = 'HYPED_STREETWEAR';
    if (text.includes('tracksuit') || text.includes('tuta') || (text.includes('hoodie') && text.includes('jogger'))) {
      estimatedRetailOrResell = 240;
      notes = 'Tracksuit completo Corteiz sold-out';
    } else if (text.includes('hoodie') || text.includes('felpa')) {
      estimatedRetailOrResell = 150;
      notes = 'Felpa Corteiz Alcatraz/OG';
    } else if (text.includes('cargo') || text.includes('guerillaz') || text.includes('pantalon')) {
      estimatedRetailOrResell = 175;
      notes = 'Guerillaz Cargo pant Corteiz';
    } else if (text.includes('giacca') || text.includes('jacket') || text.includes('bolow')) {
      estimatedRetailOrResell = 290;
      notes = 'Giacca/Puffer Corteiz';
    } else if (text.includes('t-shirt') || text.includes('maglietta') || text.includes('tee')) {
      estimatedRetailOrResell = 65;
      notes = 'T-shirt grafica Corteiz';
    } else if (text.includes('beanie') || text.includes('cappello') || text.includes('berretto')) {
      estimatedRetailOrResell = 45;
      notes = 'Corteiz Beanie';
    } else {
      estimatedRetailOrResell = 120;
      notes = 'Pezzo Corteiz da drop limitato';
    }
  }

  // 4. TRAPSTAR
  else if (brand.includes('trapstar') || text.includes('trapstar')) {
    tier = 'HYPED_STREETWEAR';
    if (text.includes('tracksuit') || text.includes('tuta') || text.includes('chenille') || text.includes('decoded')) {
      estimatedRetailOrResell = 230;
      notes = 'Tracksuit Trapstar Chenille Decoded';
    } else if (text.includes('giacca') || text.includes('jacket') || text.includes('hyperdrive') || text.includes('puffer')) {
      estimatedRetailOrResell = 290;
      notes = 'Giacca Hyperdrive / Puffer Trapstar';
    } else if (text.includes('felpa') || text.includes('hoodie')) {
      estimatedRetailOrResell = 140;
      notes = 'Hoodie Trapstar Decoded';
    } else if (text.includes('t-shirt') || text.includes('tee')) {
      estimatedRetailOrResell = 65;
      notes = 'Trapstar T-shirt Decoded';
    } else if (text.includes('borsello') || text.includes('bag') || text.includes('crossbody')) {
      estimatedRetailOrResell = 90;
      notes = 'Borsello Trapstar T-Crossbody';
    } else {
      estimatedRetailOrResell = 130;
      notes = 'Streetwear UK Trapstar London';
    }
  }

  // 5. CARHARTT / CARHARTT WIP
  else if (brand.includes('carhartt') || text.includes('carhartt')) {
    tier = 'CONTEMPORARY';
    if (text.includes('detroit') || text.includes('active') || text.includes('michigan') || text.includes('giacca') || text.includes('jacket')) {
      estimatedRetailOrResell = 210;
      notes = 'Giacca Carhartt Workwear / Detroit ricercatissima';
    } else if (text.includes('double knee') || text.includes('cargo') || text.includes('single knee')) {
      estimatedRetailOrResell = 125;
      notes = 'Pantaloni Double Knee / Lavoro resistenti';
    } else if (text.includes('felpa') || text.includes('hoodie') || text.includes('chase')) {
      estimatedRetailOrResell = 95;
      notes = 'Felpa Carhartt Chase / WIP';
    } else if (text.includes('berretto') || text.includes('beanie') || text.includes('watch')) {
      estimatedRetailOrResell = 25;
      notes = 'Carhartt Watch Beanie classico';
    } else {
      estimatedRetailOrResell = 85;
      notes = 'Carhartt WIP Workwear';
    }
  }

  // 6. STÜSSY
  else if (brand.includes('stussy') || brand.includes('stüssy') || text.includes('stussy')) {
    tier = 'HYPED_STREETWEAR';
    if (text.includes('8 ball') || text.includes('eight ball') || text.includes('fleece') || text.includes('sherpa')) {
      estimatedRetailOrResell = 210;
      notes = 'Pezzo virale Stüssy 8 Ball';
    } else if (text.includes('hoodie') || text.includes('felpa') || text.includes('crewneck')) {
      estimatedRetailOrResell = 145;
      notes = 'Felpa Stüssy Basic Logo / Dice';
    } else if (text.includes('giacca') || text.includes('jacket')) {
      estimatedRetailOrResell = 220;
      notes = 'Giacca / Windbreaker Stüssy';
    } else if (text.includes('t-shirt') || text.includes('tee')) {
      estimatedRetailOrResell = 60;
      notes = 'T-shirt Stüssy grafiche iconiche';
    } else {
      estimatedRetailOrResell = 110;
      notes = 'Streetwear Californiano Stüssy';
    }
  }

  // 7. RALPH LAUREN (POLO)
  else if (brand.includes('ralph lauren') || brand.includes('polo ralph') || text.includes('ralph lauren')) {
    tier = 'CONTEMPORARY';
    if (text.includes('maglione') || text.includes('treccia') || text.includes('knit') || text.includes('cable')) {
      estimatedRetailOrResell = 160;
      notes = 'Maglione treccia Polo Ralph Lauren';
    } else if (text.includes('giacca') || text.includes('jacket') || text.includes('harrington') || text.includes('piumino')) {
      estimatedRetailOrResell = 220;
      notes = 'Giacca / Piumino Ralph Lauren';
    } else if (text.includes('felpa') || text.includes('hoodie') || text.includes('zip')) {
      estimatedRetailOrResell = 140;
      notes = 'Felpa con pony ricamato Ralph Lauren';
    } else if (text.includes('polo') || text.includes('camicia') || text.includes('shirt')) {
      estimatedRetailOrResell = 95;
      notes = 'Polo / Camicia Oxford Ralph Lauren';
    } else if (text.includes('cappellino') || text.includes('cap')) {
      estimatedRetailOrResell = 45;
      notes = 'Cappellino Pony Ralph Lauren';
    } else {
      estimatedRetailOrResell = 90;
      notes = 'Abbigliamento classico Ralph Lauren';
    }
  }

  // 8. NIKE / JORDAN / AIR MAX
  else if (brand.includes('jordan') || brand.includes('nike') || text.includes('jordan') || text.includes('dunk') || text.includes('air max') || text.includes('tech fleece')) {
    tier = 'SNEAKERS';
    if (text.includes('jordan 4') || text.includes('aj4') || text.includes('retro 4')) {
      estimatedRetailOrResell = 310;
      notes = 'Air Jordan 4 ad altissima richiesta di mercato';
    } else if (text.includes('jordan 1') || text.includes('aj1') || text.includes('retro high')) {
      estimatedRetailOrResell = 190;
      notes = 'Air Jordan 1 High OG';
    } else if (text.includes('dunk low') || text.includes('panda') || text.includes('dunk')) {
      estimatedRetailOrResell = 120;
      notes = 'Nike Dunk Low classico quotidiano';
    } else if (text.includes('tn') || text.includes('air max plus') || text.includes('requin') || text.includes('drift')) {
      estimatedRetailOrResell = 175;
      notes = 'Nike TN / Air Max Plus streetwear';
    } else if (text.includes('tech fleece') || text.includes('tech pack')) {
      estimatedRetailOrResell = 150;
      notes = 'Nike Tech Fleece tuta completa o pezzo singolo';
    } else if (text.includes('scarpe') || text.includes('sneaker')) {
      estimatedRetailOrResell = 110;
      notes = 'Sneaker Nike';
    } else if (text.includes('felpa') || text.includes('hoodie')) {
      estimatedRetailOrResell = 70;
      notes = 'Felpa Nike Vintage / Club Fleece';
    } else {
      estimatedRetailOrResell = 65;
      notes = 'Abbigliamento sportivo Nike';
    }
  }

  // 9. ARC'TERYX / THE NORTH FACE / GORPCORE
  else if (brand.includes("arc'teryx") || brand.includes('arcteryx') || brand.includes('the north face') || brand.includes('salomon')) {
    tier = 'CONTEMPORARY';
    if (text.includes('beta') || text.includes('alpha') || text.includes('gore-tex') || text.includes('gore tex') || text.includes('nuptse') || text.includes('700')) {
      estimatedRetailOrResell = 360;
      notes = 'Capo Gorpcore tecnico ad alto valore (Beta LT / Nuptse)';
    } else if (text.includes('giacca') || text.includes('jacket') || text.includes('piumino')) {
      estimatedRetailOrResell = 220;
      notes = 'Giacca tecnica outdoor di marca';
    } else if (text.includes('scarpe') || text.includes('xt-6') || text.includes('salomon')) {
      estimatedRetailOrResell = 170;
      notes = 'Sneaker tecnica Salomon / Trail';
    } else {
      estimatedRetailOrResell = 95;
      notes = 'Outdoor & Gorpcore gear';
    }
  }

  // 10. ENTERTAINMENT, GAMING & TCG (POKÉMON, PS5, SWITCH)
  else if (
    brand.includes('pokemon') ||
    brand.includes('pokémon') ||
    brand.includes('nintendo') ||
    brand.includes('playstation') ||
    brand.includes('sony') ||
    text.includes('pokemon') ||
    text.includes('pokémon') ||
    text.includes('charizard') ||
    text.includes('ps5') ||
    text.includes('switch') ||
    text.includes('xbox') ||
    text.includes('lego')
  ) {
    tier = 'CONTEMPORARY';
    if (text.includes('ps5') || text.includes('playstation 5')) {
      estimatedRetailOrResell = text.includes('gioco') || text.includes('game') ? 55 : 420;
      notes = text.includes('gioco') ? 'Videogioco PS5 recente' : 'Console PlayStation 5';
    } else if (text.includes('switch')) {
      estimatedRetailOrResell = text.includes('gioco') || text.includes('game') ? 45 : 220;
      notes = text.includes('gioco') ? 'Videogioco Nintendo Switch' : 'Console Nintendo Switch';
    } else if (text.includes('charizard') || text.includes('booster') || text.includes('bundle') || text.includes('box')) {
      estimatedRetailOrResell = Math.max(price * 1.8, 85);
      notes = 'Carte TCG Pokémon / Booster Box ricercato';
    } else if (text.includes('lego')) {
      estimatedRetailOrResell = Math.max(price * 1.7, 45);
      notes = 'Set LEGO collezionabile';
    } else {
      estimatedRetailOrResell = Math.max(price * 1.6, price + 15);
      notes = 'Articolo Entertainment / Gaming';
    }
  }

  // 11. AUDIO & SMARTPHONE TECH (Apple AirPods, iPhone, etc.)
  else if (brand.includes('apple') || text.includes('airpods') || text.includes('iphone') || text.includes('dyson')) {
    tier = 'CONTEMPORARY';
    if (text.includes('airpods max')) {
      estimatedRetailOrResell = 450;
      notes = 'Cuffie Apple AirPods Max';
    } else if (text.includes('airpods pro') || text.includes('airpods')) {
      estimatedRetailOrResell = 170;
      notes = 'Auricolari wireless Apple AirPods';
    } else if (text.includes('iphone')) {
      estimatedRetailOrResell = Math.max(price * 1.5, 300);
      notes = 'Smartphone Apple iPhone';
    } else if (text.includes('dyson')) {
      estimatedRetailOrResell = 320;
      notes = 'Dispositivo Dyson';
    } else {
      estimatedRetailOrResell = Math.max(price * 1.5, price + 25);
      notes = 'Dispositivo Tech di marca';
    }
  }

  // 12. FAST FASHION (Zara, Shein, Bershka, H&M, Primark, Pull&Bear, Stradivarius)
  else if (
    brand.includes('zara') ||
    brand.includes('shein') ||
    brand.includes('bershka') ||
    brand.includes('h&m') ||
    brand.includes('primark') ||
    brand.includes('pull&bear') ||
    brand.includes('pull and bear') ||
    brand.includes('stradivarius') ||
    brand.includes('subdued')
  ) {
    tier = 'FAST_FASHION';
    if (text.includes('cappotto') || text.includes('giacca') || text.includes('piumino')) {
      estimatedRetailOrResell = Math.max(price * 1.5, 45);
      notes = 'Capospalla fast fashion retail circa €50-€80';
    } else if (text.includes('vestito') || text.includes('dress') || text.includes('pantaloni')) {
      estimatedRetailOrResell = Math.max(price * 1.4, 30);
      notes = 'Abbigliamento fast fashion standard';
    } else {
      estimatedRetailOrResell = Math.max(price * 1.3, 20);
      notes = 'Articolo fast fashion';
    }
  }

  // 11. GENERAL / OTHER BRANDS
  else {
    tier = 'STANDARD';
    if (text.includes('giacca') || text.includes('piumino') || text.includes('coat') || text.includes('jacket')) {
      estimatedRetailOrResell = Math.max(price * 2.0, 95);
      notes = 'Giacca/Capospalla valore medio di mercato';
    } else if (text.includes('scarpe') || text.includes('sneaker') || text.includes('boots')) {
      estimatedRetailOrResell = Math.max(price * 1.8, 75);
      notes = 'Calzatura stima prezzo di listino medio';
    } else if (text.includes('felpa') || text.includes('hoodie') || text.includes('maglione')) {
      estimatedRetailOrResell = Math.max(price * 1.8, 60);
      notes = 'Maglieria / Felpa valore medio';
    } else {
      estimatedRetailOrResell = Math.max(price * 1.6, price + 15);
      notes = 'Stima basata sul prezzo medio della categoria';
    }
  }

  // Condition adjustment
  let conditionFactor = 1.0;
  if (condition) {
    const c = condition.toLowerCase();
    if (c.includes('cartellino') || c.includes('nuovo con')) conditionFactor = 1.05;
    else if (c.includes('senza cartellino')) conditionFactor = 1.0;
    else if (c.includes('ottim')) conditionFactor = 0.92;
    else if (c.includes('buon')) conditionFactor = 0.80;
  }

  const finalMarketValue = Number((estimatedRetailOrResell * conditionFactor).toFixed(2));
  
  // Real buyers fee on Vinted: ~5% + €0.70
  const vintedBuyerFee = price * 0.05 + 0.70;
  const totalCost = price + vintedBuyerFee;
  const potentialProfit = Number(Math.max(0, finalMarketValue - totalCost).toFixed(2));

  let discountPercent = 0;
  if (finalMarketValue > price) {
    discountPercent = Math.min(92, Math.max(10, Math.round(((finalMarketValue - price) / finalMarketValue) * 100)));
  }

  let dealScore: MarketValuation['dealScore'] = 'FAIR';
  if (discountPercent >= 52 && potentialProfit >= 25) {
    dealScore = 'STEAL';
  } else if (discountPercent >= 38 && potentialProfit >= 15) {
    dealScore = 'DEAL';
  } else if (discountPercent >= 22 && potentialProfit >= 8) {
    dealScore = 'GOOD';
  } else {
    dealScore = 'FAIR';
  }

  return {
    marketValue: Math.max(finalMarketValue, price),
    discountPercent,
    potentialProfit,
    dealScore,
    tier,
    notes,
  };
}
