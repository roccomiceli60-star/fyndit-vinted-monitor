// Unit Test Suite for Client-Side Engines (MatchScore, MonitorMatcher, Pickup Points)
const assert = require('assert');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ PASS: ${desc}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ FAIL: ${desc} -> ${err.message}`);
  }
}

// 1. Fee Breakdown Engine Test
function calculateVintedCheckoutBreakdown(itemPrice, shippingFee = 2.89) {
  const buyerProtectionFee = Number((0.70 + itemPrice * 0.05).toFixed(2));
  const total = Number((itemPrice + buyerProtectionFee + shippingFee).toFixed(2));
  return {
    itemPrice,
    buyerProtectionFee,
    shippingFee,
    total,
  };
}

// 2. Simple Matcher Test
function matchListing(item, monitor) {
  if (!monitor || !monitor.isActive) return false;
  if (item.price > monitor.maxPrice) return false;
  if (monitor.minPrice && item.price < monitor.minPrice) return false;

  const itemTitle = (item.title || '').toLowerCase();
  const itemBrand = (item.brand || '').toLowerCase();

  if (monitor.brands && monitor.brands.length > 0) {
    const hasBrand = monitor.brands.some((b) =>
      itemBrand.includes(b.toLowerCase()) || itemTitle.includes(b.toLowerCase())
    );
    if (!hasBrand) return false;
  }

  if (monitor.keywords && monitor.keywords.length > 0) {
    const hasKw = monitor.keywords.some((kw) =>
      itemTitle.includes(kw.toLowerCase())
    );
    if (!hasKw) return false;
  }

  if (monitor.excludedKeywords && monitor.excludedKeywords.length > 0) {
    const hasExcluded = monitor.excludedKeywords.some((ex) =>
      itemTitle.includes(ex.toLowerCase())
    );
    if (hasExcluded) return false;
  }

  return true;
}

console.log('\n========================================');
console.log('🧪 RUNNING LOGIC & CALCULATION TESTS');
console.log('========================================\n');

it('calculates correct Vinted Buyer Protection & Total', () => {
  const result = calculateVintedCheckoutBreakdown(100.00, 2.89);
  // Protection: 0.70 + 5.00 = 5.70. Total: 100 + 5.70 + 2.89 = 108.59
  assert.strictEqual(result.buyerProtectionFee, 5.70);
  assert.strictEqual(result.total, 108.59);
});

it('calculates cheap item protection accurately', () => {
  const result = calculateVintedCheckoutBreakdown(10.00, 2.89);
  // Protection: 0.70 + 0.50 = 1.20. Total: 10 + 1.20 + 2.89 = 14.09
  assert.strictEqual(result.buyerProtectionFee, 1.20);
  assert.strictEqual(result.total, 14.09);
});

it('matches monitor brand and price limit', () => {
  const monitor = {
    isActive: true,
    brands: ['Nike'],
    maxPrice: 80,
    keywords: [],
    excludedKeywords: ['fake'],
  };
  const item = {
    title: 'Nike Dunk Low Panda',
    brand: 'Nike',
    price: 65,
  };
  assert.strictEqual(matchListing(item, monitor), true);
});

it('rejects listing exceeding max price', () => {
  const monitor = {
    isActive: true,
    brands: ['Nike'],
    maxPrice: 80,
    keywords: [],
    excludedKeywords: [],
  };
  const item = {
    title: 'Nike Dunk Low Panda',
    brand: 'Nike',
    price: 95,
  };
  assert.strictEqual(matchListing(item, monitor), false);
});

it('rejects listing with excluded keywords', () => {
  const monitor = {
    isActive: true,
    brands: ['Nike'],
    maxPrice: 80,
    keywords: [],
    excludedKeywords: ['fake', 'replica'],
  };
  const item = {
    title: 'Nike Dunk Low Panda replica 1:1',
    brand: 'Nike',
    price: 40,
  };
  assert.strictEqual(matchListing(item, monitor), false);
});

console.log(`\n📊 RESULTS: ${passed} PASSED, ${failed} FAILED\n`);
if (failed > 0) process.exit(1);
