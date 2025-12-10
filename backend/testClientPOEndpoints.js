const http = require('http');

const BASE_URL = 'http://localhost:5000/api/sales/steps';
const SALES_ORDER_ID = 1;

const testEndpoints = [
  {
    name: 'POST Client Info',
    method: 'POST',
    path: `/${SALES_ORDER_ID}/client-po/client-info`,
    data: {
      poNumber: 'PO-001',
      poDate: '2024-01-01',
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      clientPhone: '1234567890'
    }
  },
  {
    name: 'GET Client Info',
    method: 'GET',
    path: `/${SALES_ORDER_ID}/client-po/client-info`,
    data: null
  },
  {
    name: 'POST Project Details',
    method: 'POST',
    path: `/${SALES_ORDER_ID}/client-po/project-details`,
    data: {
      projectName: 'Test Project',
      projectCode: 'TEST-001',
      billingAddress: '123 Billing St',
      shippingAddress: '456 Shipping Ave'
    }
  },
  {
    name: 'GET Project Details',
    method: 'GET',
    path: `/${SALES_ORDER_ID}/client-po/project-details`,
    data: null
  },
  {
    name: 'POST Project Requirements',
    method: 'POST',
    path: `/${SALES_ORDER_ID}/client-po/project-requirements`,
    data: {
      application: 'Container Assembly',
      numberOfUnits: 2,
      dimensions: '3000mm x 2000mm x 1500mm',
      loadCapacity: '5000 kg',
      materialGrade: 'EN8',
      finishCoatings: 'Powder Coated',
      testingStandards: 'IS 1566'
    }
  },
  {
    name: 'GET Project Requirements',
    method: 'GET',
    path: `/${SALES_ORDER_ID}/client-po/project-requirements`,
    data: null
  }
];

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Client PO Sub-Section Endpoints\n');
  
  for (const test of testEndpoints) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = await makeRequest(test.method, test.path, test.data);
      console.log(`Status: ${result.status}`);
      console.log(`Response:`, JSON.stringify(result.data, null, 2));
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Error testing ${test.name}:`, error.message);
      console.log('---\n');
    }
  }
}

setTimeout(() => {
  runTests().then(() => {
    console.log('✅ All tests completed!');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  });
}, 2000);
