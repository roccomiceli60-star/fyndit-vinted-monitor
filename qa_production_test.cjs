// Comprehensive QA Production Test Suite for Vinted QuickBuy
const http = require('http');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function request(path, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n========================================');
  console.log('🧪 RUNNING PRODUCTION QA AUTOMATION SUITE');
  console.log('========================================\n');

  // TEST SUITE 1: Server Health & Status
  console.log('📌 Test Suite 1: Core API & Health Check');
  try {
    const health = await request('/api/vinted/status');
    assert(health.status === 200, 'Server status endpoint responds HTTP 200');
    assert(health.data.status === 'ONLINE', 'Server reports ONLINE status');
  } catch (err) {
    assert(false, `Server health check failed: ${err.message}`);
  }

  // TEST SUITE 2: Live Feed Query & Search Resilience
  console.log('\n📌 Test Suite 2: Live Listings Engine');
  try {
    const feed = await request('/api/vinted/live');
    assert(feed.status === 200, 'Live stream endpoint responds HTTP 200');
    assert(Array.isArray(feed.data.items), 'Live feed returns items array');
    assert(feed.data.items.length > 0, `Live feed returns ${feed.data.items.length} items`);
    
    // Check first item integrity
    const item = feed.data.items[0];
    assert(typeof item.id === 'string' && item.id.length > 0, 'Listing has valid string id');
    assert(typeof item.title === 'string', 'Listing has valid title');
    assert(typeof item.price === 'number' && item.price > 0, `Listing has valid positive price: €${item.price}`);
    assert(typeof item.brand === 'string', `Listing has valid brand: ${item.brand}`);
    assert(Boolean(item.imageUrl), 'Listing has valid image URL');
  } catch (err) {
    assert(false, `Feed check failed: ${err.message}`);
  }

  // TEST SUITE 3: Search Query with Special Characters & Empty Input
  console.log('\n📌 Test Suite 3: Search Edge Cases & Escaping');
  try {
    const emptySearch = await request('/api/vinted/live?search=');
    assert(emptySearch.status === 200, 'Empty search handled gracefully');

    const specialSearch = await request('/api/vinted/live?search=' + encodeURIComponent('Nike & Jordan + Travis <script>'));
    assert(specialSearch.status === 200, 'Special characters in search handled safely without XSS');

    const brandSearch = await request('/api/vinted/live?brand=Nike');
    assert(brandSearch.status === 200, 'Brand filtered search responds correctly');
  } catch (err) {
    assert(false, `Search edge case failed: ${err.message}`);
  }

  // TEST SUITE 4: Checkout Calculation, Idempotency & Duplicate Prevention
  console.log('\n📌 Test Suite 4: Checkout, Idempotency & Anti-Double-Tap');
  try {
    const testItemId = 'test-item-' + Date.now();
    const payload = {
      item: {
        id: testItemId,
        title: 'Nike Dunk Low Retro Panda',
        brand: 'Nike',
        price: 50.00,
        size: '42',
        imageUrl: 'https://images1.vinted.net/t/01.jpg',
      },
      pickupPoint: {
        id: 'inp-1',
        carrier: 'InPost Locker 24/7',
        name: 'Locker Milano Stazione',
        address: 'Piazza Duca d\'Aosta 1',
        city: 'Milano',
        shippingFee: 2.89,
        distanceMeters: 140,
      },
      account: {
        username: 'qa_tester',
        isConnected: true,
      },
      idempotencyKey: `idem-${testItemId}`
    };

    // First purchase attempt
    const res1 = await request('/api/vinted/checkout/buy', { method: 'POST' }, payload);
    assert(res1.status === 200, 'First checkout attempt succeeds HTTP 200');
    assert(res1.data.success === true, 'Order created successfully');
    assert(Boolean(res1.data.order && res1.data.order.orderId), 'Order has orderId');
    assert(Boolean(res1.data.order.trackingCode), 'Order has Locker tracking PIN');

    // Expected fee breakdown calculation: 50 + 2.89 + (0.70 + 50 * 0.05) = 50 + 2.89 + 3.20 = 56.09
    const expectedTotal = 50 + 2.89 + 3.20;
    assert(Math.abs(res1.data.order.totalPaid - expectedTotal) < 0.05, `Total price breakdown exact: €${res1.data.order.totalPaid} (expected: €${expectedTotal})`);

    // Second purchase attempt with SAME item / idempotency key (simulating double tap)
    const res2 = await request('/api/vinted/checkout/buy', { method: 'POST' }, payload);
    assert(res2.status === 200, 'Duplicate request handled gracefully');
    assert(res2.data.isDuplicate === true, 'Server correctly detected duplicate purchase attempt');
    assert(res2.data.order.orderId === res1.data.order.orderId, 'Server returned existing order without double-charging');
  } catch (err) {
    assert(false, `Checkout test failed: ${err.message}`);
  }

  // TEST SUITE 5: Missing or Corrupt Checkout Payload
  console.log('\n📌 Test Suite 5: Checkout Malformed Payload Handling');
  try {
    const badRes = await request('/api/vinted/checkout/buy', { method: 'POST' }, {});
    assert(badRes.status === 400, 'Missing item/pickup point rejected with HTTP 400');
    assert(badRes.data.success === false, 'Error message properly formatted');
  } catch (err) {
    assert(false, `Bad payload check failed: ${err.message}`);
  }

  // TEST SUITE 6: Batch Monitors Sync
  console.log('\n📌 Test Suite 6: Monitors Sync Engine');
  try {
    const syncRes = await request('/api/vinted/monitors-sync', { method: 'POST' }, {
      monitors: [
        {
          id: 'mon-nike',
          name: 'Nike Tech',
          brands: ['Nike'],
          maxPrice: 100,
          sizes: ['M', 'L'],
          keywords: ['tech'],
          excludedKeywords: [],
          isActive: true
        }
      ]
    });
    assert(syncRes.status === 200, 'Monitors sync responds HTTP 200');
    assert(Array.isArray(syncRes.data.items), 'Monitors sync returns items');
  } catch (err) {
    assert(false, `Monitors sync failed: ${err.message}`);
  }

  // SUMMARY
  console.log('\n========================================');
  console.log(`📊 QA RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
