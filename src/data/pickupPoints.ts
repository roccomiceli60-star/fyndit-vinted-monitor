import { VintedPickupPoint } from '../types';

export const SAMPLE_PICKUP_POINTS_MILAN: VintedPickupPoint[] = [
  {
    id: 'inp-mil-01',
    carrier: 'InPost Locker 24/7',
    name: 'Locker InPost - Stazione Centrale / Via Vittor Pisani',
    address: 'Via Vittor Pisani 14',
    city: 'Milano',
    postalCode: '20124',
    country: 'Italia',
    distanceMeters: 140,
    openingHours: 'Aperto 24 ore su 24 · 7 giorni su 7',
    isLocker247: true,
    shippingFee: 2.89,
    code: 'INP-IT-MIL104',
  },
  {
    id: 'punto-poste-02',
    carrier: 'PuntoPoste (Poste Italiane)',
    name: 'PuntoPoste · Tabaccheria Bar Duomo',
    address: 'Corso Buenos Aires 36',
    city: 'Milano',
    postalCode: '20124',
    country: 'Italia',
    distanceMeters: 290,
    openingHours: 'Lun - Sab: 07:30 - 20:00 · Dom: 08:30 - 13:00',
    isLocker247: false,
    shippingFee: 3.19,
    code: 'POS-IT-MI209',
  },
  {
    id: 'brt-fermo-03',
    carrier: 'BRT Fermopoint',
    name: 'BRT Fermopoint · Cartolibreria & Edicola San Babila',
    address: 'Via Senato 11',
    city: 'Milano',
    postalCode: '20121',
    country: 'Italia',
    distanceMeters: 450,
    openingHours: 'Lun - Ven: 08:00 - 19:30 · Sab: 08:30 - 13:00',
    isLocker247: false,
    shippingFee: 3.29,
    code: 'BRT-MI-881',
  },
  {
    id: 'mondial-relay-04',
    carrier: 'Mondial Relay / Punto Pack',
    name: 'Punto Pack Mondial Relay · Negozio Tech & Phone',
    address: 'Via Lazzaro Palazzi 8',
    city: 'Milano',
    postalCode: '20124',
    country: 'Italia',
    distanceMeters: 520,
    openingHours: 'Lun - Sab: 09:30 - 19:30',
    isLocker247: false,
    shippingFee: 2.99,
    code: 'MR-IT-0042',
  },
  {
    id: 'ups-access-05',
    carrier: 'UPS Access Point',
    name: 'UPS Access Point · Copy & Print Center',
    address: 'Viale Tunisia 22',
    city: 'Milano',
    postalCode: '20124',
    country: 'Italia',
    distanceMeters: 680,
    openingHours: 'Lun - Ven: 09:00 - 19:00',
    isLocker247: false,
    shippingFee: 3.49,
    code: 'UPS-AP-9921',
  },
  {
    id: 'inp-mil-06',
    carrier: 'InPost Locker 24/7',
    name: 'Locker InPost - Supermercato Carrefour Express',
    address: 'Via Panfilo Castaldi 30',
    city: 'Milano',
    postalCode: '20124',
    country: 'Italia',
    distanceMeters: 740,
    openingHours: 'Aperto 24 ore su 24 · 7 giorni su 7',
    isLocker247: true,
    shippingFee: 2.89,
    code: 'INP-IT-MIL238',
  },
];

export const DEFAULT_VINTED_ACCOUNT = {
  isConnected: true,
  username: 'rocco_resell',
  email: 'rocco.vinted@gmail.com',
  rating: 5.0,
  reviewCount: 84,
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  country: 'Italia',
  preferredPickupPoint: SAMPLE_PICKUP_POINTS_MILAN[0],
  paymentMethod: {
    type: 'Vinted Wallet + Carta Mastercard',
    last4: '4821',
    balance: 145.50,
  },
  connectedAt: Date.now() - 86400000 * 5,
};

/**
 * Generates dynamic pickup points tailored to the user's city or address
 */
export function getNearbyPickupPoints(query = '', country = 'Italia'): VintedPickupPoint[] {
  const cleanQ = query.trim();
  const city = cleanQ.length > 2 ? cleanQ : 'La tua zona';

  return [
    {
      id: `inp-${Math.random().toString(36).substring(2, 7)}`,
      carrier: 'InPost Locker 24/7',
      name: `Locker InPost 24/7 - ${city} Centro`,
      address: cleanQ ? `${cleanQ}, civico 12` : 'Via Roma 12',
      city: cleanQ || 'Milano',
      postalCode: '20121',
      country,
      distanceMeters: 130,
      openingHours: 'Aperto 24 ore su 24 · Ritiro con codice QR / PIN',
      isLocker247: true,
      shippingFee: 2.89,
      code: `INP-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    {
      id: `pos-${Math.random().toString(36).substring(2, 7)}`,
      carrier: 'PuntoPoste (Poste Italiane)',
      name: `PuntoPoste Tabacchi & Servizi - ${city}`,
      address: cleanQ ? `Corso Principale 45, ${city}` : 'Corso Garibaldi 45',
      city: cleanQ || 'Milano',
      postalCode: '20121',
      country,
      distanceMeters: 260,
      openingHours: 'Lun - Sab: 08:00 - 20:00 · Dom: Mattina',
      isLocker247: false,
      shippingFee: 3.19,
      code: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    {
      id: `brt-${Math.random().toString(36).substring(2, 7)}`,
      carrier: 'BRT Fermopoint',
      name: `BRT Fermopoint Edicola & Cartoleria - ${city}`,
      address: cleanQ ? `Piazza Centrale 8, ${city}` : 'Piazza Duomo 8',
      city: cleanQ || 'Milano',
      postalCode: '20121',
      country,
      distanceMeters: 390,
      openingHours: 'Lun - Ven: 08:30 - 19:30 · Sab: 09:00 - 13:00',
      isLocker247: false,
      shippingFee: 3.29,
      code: `BRT-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    {
      id: `mr-${Math.random().toString(36).substring(2, 7)}`,
      carrier: 'Mondial Relay / Punto Pack',
      name: `Mondial Relay Punto Pack - ${city}`,
      address: cleanQ ? `Viale Europa 24, ${city}` : 'Viale Europa 24',
      city: cleanQ || 'Milano',
      postalCode: '20121',
      country,
      distanceMeters: 510,
      openingHours: 'Lun - Sab: 09:30 - 19:30',
      isLocker247: false,
      shippingFee: 2.99,
      code: `MR-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    {
      id: `ups-${Math.random().toString(36).substring(2, 7)}`,
      carrier: 'UPS Access Point',
      name: `UPS Access Point - Negozio Servizi ${city}`,
      address: cleanQ ? `Via Mazzini 31, ${city}` : 'Via Mazzini 31',
      city: cleanQ || 'Milano',
      postalCode: '20121',
      country,
      distanceMeters: 670,
      openingHours: 'Lun - Ven: 09:00 - 19:00',
      isLocker247: false,
      shippingFee: 3.49,
      code: `UPS-${Math.floor(1000 + Math.random() * 9000)}`,
    },
  ];
}

/**
 * Official Vinted Fee calculation formula:
 * Buyer Protection: 0.70€ + 5% of item price
 */
export function calculateVintedCheckoutBreakdown(itemPrice: number, shippingFee = 2.89) {
  const buyerProtectionFee = Number((0.70 + itemPrice * 0.05).toFixed(2));
  const total = Number((itemPrice + buyerProtectionFee + shippingFee).toFixed(2));
  return {
    itemPrice: Number(itemPrice.toFixed(2)),
    buyerProtectionFee,
    shippingFee: Number(shippingFee.toFixed(2)),
    total,
  };
}
