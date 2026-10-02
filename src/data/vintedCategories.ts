// Official Vinted Catalog Category Hierarchy & Data

export interface VintedSubcategory {
  id: string;
  name: string;
  keywords: string[];
}

export interface VintedCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: VintedSubcategory[];
}

export const VINTED_CATEGORIES: VintedCategory[] = [
  {
    id: 'all',
    name: 'Tutte le Categorie',
    icon: 'Layers',
    description: 'Monitora qualsiasi categoria su tutto il catalogo Vinted',
    subcategories: [],
  },
  {
    id: 'men',
    name: 'Uomo',
    icon: 'Shirt',
    description: 'Streetwear, Sneakers, Giacche, Felpe, Tute, Accessori maschili',
    subcategories: [
      { id: 'men_all', name: 'Tutto in Uomo', keywords: ['uomo', 'men', 'maschile'] },
      { id: 'men_hoodies', name: 'Felpe & Maglioni (Trapstar, Corteiz, Nike, Stüssy)', keywords: ['hoodie', 'felpa', 'sweatshirt', 'crewneck', 'girocollo', 'maglione', 'knit', 'cable'] },
      { id: 'men_jackets', name: 'Giacche & Piumini (Carhartt Detroit, Nuptse, Stone Island)', keywords: ['giacca', 'jacket', 'puffer', 'piumino', 'bomber', 'harrington', 'windbreaker', 'parka'] },
      { id: 'men_tracksuits', name: 'Tute & Tracksuit (Trapstar Chenille, Corteiz, Tech Fleece)', keywords: ['tracksuit', 'tuta', 'pantalone tuta', 'jogger', 'set'] },
      { id: 'men_sneakers', name: 'Sneakers & Scarpe (Jordan, Dunk, TN, Salomon)', keywords: ['sneaker', 'scarpe', 'dunk', 'jordan', 'air max', 'tn', 'travis', 'yeezy', 'scarpa'] },
      { id: 'men_pants', name: 'Pantaloni & Cargo (Double Knee, Guerillaz)', keywords: ['cargo', 'pantaloni', 'double knee', 'jeans', 'levis', 'pantalone'] },
      { id: 'men_tshirts', name: 'T-shirt, Magliette & Polo', keywords: ['t-shirt', 'maglietta', 'tee', 'polo'] },
      { id: 'men_accessories', name: 'Borse, Borselli, Cinture & Cappellini', keywords: ['borsello', 'cappello', 'beanie', 'cintura', 'crossbody', 'portafoglio', 'occhiali'] },
    ],
  },
  {
    id: 'women',
    name: 'Donna',
    icon: 'Sparkles',
    description: 'Abbigliamento, Scarpe, Borse firmate, Accessori, Bellezza',
    subcategories: [
      { id: 'women_all', name: 'Tutto in Donna', keywords: ['donna', 'women', 'femminile'] },
      { id: 'women_bags', name: 'Borse, Pochette & Zaini firmati', keywords: ['borsa', 'bag', 'pochette', 'handbag', 'tote', 'tracolla', 'zaino'] },
      { id: 'women_shoes', name: 'Scarpe, Tacchi, Stivali & Sneakers', keywords: ['scarpe', 'stivali', 'tacchi', 'sneakers', 'sandali', 'boots'] },
      { id: 'women_clothes', name: 'Vestiti, Abiti, Cappotti & Giacche', keywords: ['vestito', 'abito', 'dress', 'gonna', 'cappotto', 'blazer', 'maglione'] },
      { id: 'women_sweaters', name: 'Maglieria, Cardigan & Felpe', keywords: ['maglione', 'cardigan', 'felpa', 'top', 'maglia'] },
      { id: 'women_jewelry', name: 'Gioielli & Orologi (Anelli, Collane, Bracciali)', keywords: ['collana', 'anello', 'orecchini', 'bracciale', 'orologio', 'argento', 'oro'] },
      { id: 'women_beauty', name: 'Profumi, Make-up & Skincare', keywords: ['profumo', 'makeup', 'rossetto', 'palette', 'skincare', 'crema'] },
    ],
  },
  {
    id: 'entertainment_electronics',
    name: 'Intrattenimento & Elettronica',
    icon: 'Gamepad2',
    description: 'Console, Videogiochi, Carte Pokémon, Telefonia, Audio, Vinili, Libri & Manga',
    subcategories: [
      { id: 'ent_all', name: 'Tutto in Intrattenimento & Elettronica', keywords: ['elettronica', 'entertainment', 'gaming', 'tech'] },
      { id: 'consoles_games', name: 'Console & Videogiochi (PS5, Switch, Xbox, Retro)', keywords: ['ps5', 'playstation', 'nintendo', 'switch', 'xbox', 'game', 'videogioco', 'zelda', 'mario', 'pokemon game', 'gameboy'] },
      { id: 'trading_cards', name: 'Carte Collezionabili (Pokémon, Yu-Gi-Oh!, Magic, Calciatori)', keywords: ['pokemon', 'pokémon', 'charizard', 'booster', 'tcg', 'yu-gi-oh', 'magic the gathering', 'psa', 'bustina', 'carte'] },
      { id: 'audio_tech', name: 'Audio & Cuffie (Apple AirPods, Casse, Cuffie)', keywords: ['airpods', 'cuffie', 'headphones', 'bluetooth', 'speaker', 'jbl', 'bose', 'sony'] },
      { id: 'phones_accessories', name: 'Telefonia & Smartwatch (iPhone, Apple Watch, Custodie)', keywords: ['iphone', 'smartphone', 'apple watch', 'samsung', 'cover', 'custodia'] },
      { id: 'manga_books', name: 'Fumetti, Manga & Libri', keywords: ['manga', 'fumetto', 'one piece', 'berserk', 'naruto', 'libro', 'comics'] },
      { id: 'music_vinyl', name: 'Musica & Vinili (Dischi, CD, Merch)', keywords: ['vinile', 'vinyl', 'cd', 'disco', 'album'] },
      { id: 'board_games', name: 'Giochi da Tavolo & Puzzle', keywords: ['gioco da tavolo', 'board game', 'puzzle', 'monopoly', 'catan'] },
    ],
  },
  {
    id: 'kids',
    name: 'Bambini',
    icon: 'Baby',
    description: 'Giocattoli, LEGO, Abbigliamento neonati e ragazzi, Passeggini',
    subcategories: [
      { id: 'kids_all', name: 'Tutto in Bambini', keywords: ['bambini', 'kids', 'baby'] },
      { id: 'kids_lego_toys', name: 'LEGO & Giocattoli (Ninjago, Star Wars, Peluche, Bambole)', keywords: ['lego', 'giocattolo', 'toy', 'peluche', 'bambola', 'ninjago', 'barbie', 'hot wheels'] },
      { id: 'kids_clothes', name: 'Abbigliamento Bambina & Bambino', keywords: ['bambino', 'bambina', 'kids', 'tuta bambino', 'vestito bimba'] },
      { id: 'kids_baby_gear', name: 'Passeggini, Seggiolini & Cura neonati', keywords: ['passeggino', 'seggiolino', 'culla', 'neonato', 'chicco', 'cybex'] },
      { id: 'kids_shoes', name: 'Scarpe Bambini', keywords: ['scarpe bambino', 'scarpe bimbo', 'primi passi'] },
    ],
  },
  {
    id: 'home',
    name: 'Casa & Living',
    icon: 'Home',
    description: 'Decorazioni, Articoli per la tavola, Tessili, Candele, Lampade',
    subcategories: [
      { id: 'home_all', name: 'Tutto in Casa', keywords: ['casa', 'home', 'living'] },
      { id: 'home_decor', name: 'Decorazioni, Quadri, Vasi & Specchi', keywords: ['vaso', 'specchio', 'quadro', 'candela', 'soprammobile', 'poster', 'cornice'] },
      { id: 'home_kitchen', name: 'Cucina & Tavola (Tazze, Bicchieri, Stoviglie)', keywords: ['tazza', 'mug', 'bicchiere', 'piatto', 'pentola', 'servizio piatti'] },
      { id: 'home_textiles', name: 'Tessili (Coperte, Cuscini, Lenzuola, Tende)', keywords: ['coperta', 'cuscino', 'lenzuola', 'tappeto', 'tenda'] },
      { id: 'home_lighting', name: 'Lampade & Illuminazione', keywords: ['lampada', 'lampadario', 'abat-jour', 'luce'] },
    ],
  },
  {
    id: 'pets',
    name: 'Animali',
    icon: 'Cat',
    description: 'Cani, Gatti, Cucce, Guinzagli, Giochi per animali',
    subcategories: [
      { id: 'pets_all', name: 'Tutto in Animali', keywords: ['animali', 'pets', 'cane', 'gatto'] },
      { id: 'pets_dogs', name: 'Cani (Guinzagli, Cappottini, Pettorine, Cucce)', keywords: ['cane', 'dog', 'guinzaglio', 'pettorina', 'cappottino cane', 'cuccia'] },
      { id: 'pets_cats', name: 'Gatti (Tiragraffi, Giochi, Trasportini, Cucce)', keywords: ['gatto', 'cat', 'tiragraffi', 'trasportino', 'lettiera'] },
    ],
  },
];

// Helper to detect category accurately from title, brand, and box lines
export function detectCategory(title: string, brand: string, secondLine?: string): string {
  const fullText = `${title} ${brand} ${secondLine || ''}`.toLowerCase();

  // 1. Entertainment & Electronics
  if (
    fullText.includes('pokemon') ||
    fullText.includes('pokémon') ||
    fullText.includes('tcg') ||
    fullText.includes('charizard') ||
    fullText.includes('ps5') ||
    fullText.includes('playstation') ||
    fullText.includes('nintendo') ||
    fullText.includes('switch') ||
    fullText.includes('xbox') ||
    fullText.includes('videogioco') ||
    fullText.includes('airpods') ||
    fullText.includes('iphone') ||
    fullText.includes('manga') ||
    fullText.includes('vinyl') ||
    fullText.includes('vinile') ||
    fullText.includes('magic the gathering') ||
    fullText.includes('yu-gi-oh')
  ) {
    if (fullText.includes('pokemon') || fullText.includes('tcg') || fullText.includes('yu-gi-oh') || fullText.includes('magic')) {
      return 'Intrattenimento · Carte Collezionabili';
    }
    if (fullText.includes('ps5') || fullText.includes('switch') || fullText.includes('xbox') || fullText.includes('playstation')) {
      return 'Intrattenimento · Console & Videogiochi';
    }
    if (fullText.includes('manga') || fullText.includes('fumetto')) {
      return 'Intrattenimento · Manga & Libri';
    }
    if (fullText.includes('vinile') || fullText.includes('vinyl')) {
      return 'Intrattenimento · Musica & Vinili';
    }
    return 'Intrattenimento & Elettronica';
  }

  // 2. Kids / Toys
  if (
    fullText.includes('lego') ||
    fullText.includes('giocattol') ||
    fullText.includes('toy') ||
    fullText.includes('peluche') ||
    fullText.includes('bambola') ||
    fullText.includes('passeggino') ||
    fullText.includes('neonato') ||
    fullText.includes('chicco') ||
    fullText.includes('ninjago')
  ) {
    if (fullText.includes('lego')) return 'Bambini · LEGO & Giochi';
    return 'Bambini & Giocattoli';
  }

  // 3. Home & Living
  if (
    fullText.includes('lampada') ||
    fullText.includes('vaso') ||
    fullText.includes('specchio') ||
    fullText.includes('cuscino') ||
    fullText.includes('tazza') ||
    fullText.includes('bicchiere') ||
    fullText.includes('candela') ||
    fullText.includes('quadro') ||
    fullText.includes('stoviglie') ||
    fullText.includes('coperta')
  ) {
    return 'Casa & Living';
  }

  // 4. Pets
  if (fullText.includes('cane') || fullText.includes('gatto') || fullText.includes('tiragraffi') || fullText.includes('guinzaglio') || fullText.includes('cuccia')) {
    return 'Animali & Accessori';
  }

  // 5. Sneakers & Shoes
  if (
    fullText.includes('sneaker') ||
    fullText.includes('scarpe') ||
    fullText.includes('dunk') ||
    fullText.includes('jordan') ||
    fullText.includes('tn') ||
    fullText.includes('air max') ||
    fullText.includes('salomon') ||
    fullText.includes('stivali') ||
    fullText.includes('boots')
  ) {
    return 'Uomo · Sneakers & Scarpe';
  }

  // 6. Bags & Luxury
  if (fullText.includes('borsa') || fullText.includes('bag') || fullText.includes('pochette') || fullText.includes('handbag') || fullText.includes('tote')) {
    return 'Donna · Borse & Accessori';
  }

  // 7. Clothing / Streetwear
  if (fullText.includes('tracksuit') || fullText.includes('tuta')) {
    return 'Uomo · Tute & Tracksuit';
  }
  if (fullText.includes('giacca') || fullText.includes('jacket') || fullText.includes('puffer') || fullText.includes('piumino')) {
    return 'Uomo · Giacche & Piumini';
  }
  if (fullText.includes('felpa') || fullText.includes('hoodie')) {
    return 'Uomo · Felpe & Maglioni';
  }

  return 'Uomo · Streetwear';
}
