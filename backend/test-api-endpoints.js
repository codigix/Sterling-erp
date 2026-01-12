const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.PORT || 5000;
const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

const ENDPOINTS = [
  { method: 'POST', path: '/sales/steps/:salesOrderId/client-po', name: 'Step 1: Client PO' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/sales-order/sales-product', name: 'Step 2a: Sales & Product' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/sales-order/quality-compliance', name: 'Step 2b: Quality & Compliance' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/sales-order/payment-internal', name: 'Step 2c: Payment & Internal' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/design-engineering', name: 'Step 3: Design Engineering' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/material-requirements', name: 'Step 4: Material Requirements' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/production-plan', name: 'Step 5: Production Plan' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/quality-check', name: 'Step 6: Quality Check' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/shipment', name: 'Step 7: Shipment' },
  { method: 'POST', path: '/sales/steps/:salesOrderId/delivery', name: 'Step 8: Delivery' },
];

async function testEndpoints(salesOrderId, authToken) {
  console.log('\n🧪 Testing Root Card Wizard API Endpoints\n');
  console.log('='.repeat(80));
  console.log(`Sales Order ID: ${salesOrderId}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('='.repeat(80) + '\n');

  if (!authToken) {
    console.log('⚠️  No auth token provided. Using unauthenticated requests.');
    console.log('   Run with: node test-api-endpoints.js <salesOrderId> <authToken>\n');
  }

  const results = [];
  let working = 0;
  let failed = 0;

  for (const endpoint of ENDPOINTS) {
    const url = `${API_BASE_URL}${endpoint.path.replace(':salesOrderId', salesOrderId)}`;
    
    console.log(`Testing: ${endpoint.name}`);
    console.log(`  ${endpoint.method} ${url}`);

    try {
      const axiosConfig = {
        method: endpoint.method.toLowerCase(),
        url,
        data: getTestDataForEndpoint(endpoint.path),
        validateStatus: () => true
      };

      if (authToken) {
        axiosConfig.headers = {
          'Authorization': `Bearer ${authToken}`
        };
      }

      const response = await axios(axiosConfig);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`  ✅ Working (${response.status})\n`);
        working++;
        results.push({ name: endpoint.name, status: 'working', code: response.status });
      } else if (response.status === 401 || response.status === 403) {
        console.log(`  ⚠️  Auth Error (${response.status})\n`);
        results.push({ name: endpoint.name, status: 'auth-error', code: response.status });
      } else {
        console.log(`  ❌ Error (${response.status})`);
        if (response.data?.message) {
          console.log(`     ${response.data.message}\n`);
        } else {
          console.log(`     ${JSON.stringify(response.data).substring(0, 100)}\n`);
        }
        failed++;
        results.push({ name: endpoint.name, status: 'error', code: response.status });
      }
    } catch (error) {
      console.log(`  ❌ Request Failed`);
      console.log(`     ${error.message}\n`);
      failed++;
      results.push({ name: endpoint.name, status: 'failed', error: error.message });
    }
  }

  // Summary
  console.log('='.repeat(80));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Working endpoints: ${working}/${ENDPOINTS.length}`);
  console.log(`❌ Failed endpoints: ${failed}/${ENDPOINTS.length}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed endpoints:');
    results
      .filter(r => r.status !== 'working' && r.status !== 'auth-error')
      .forEach(r => {
        console.log(`   - ${r.name}`);
        console.log(`     ${r.error || `Status: ${r.code}`}`);
      });
  }

  console.log('\n💡 Next Steps:');
  console.log('   1. Check backend server is running on port 5000');
  console.log('   2. Provide auth token if authentication is required');
  console.log('   3. Check backend logs for error details');
  console.log('   4. Verify database tables exist:');
  console.log('      node backend/verify-db-tables.js\n');

  process.exit(failed > 0 ? 1 : 0);
}

function getTestDataForEndpoint(path) {
  const testData = {
    1: {
      poNumber: 'TEST-PO-001',
      poDate: '2026-01-12',
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      clientPhone: '1234567890',
      projectName: 'Test Project',
      projectCode: 'TP-001'
    },
    '2a': {
      clientEmail: 'test@example.com',
      clientPhone: '1234567890',
      estimatedEndDate: '2026-12-31',
      productDetails: {}
    },
    '2b': {
      qualityCompliance: {},
      warrantySupport: {}
    },
    '2c': {
      paymentTerms: 'Net 30',
      projectPriority: 'High',
      totalAmount: 100000
    },
    3: {
      generalDesignInfo: {},
      productSpecification: {}
    },
    4: {
      materials: []
    },
    5: {
      timeline: {
        startDate: '2026-02-01',
        endDate: '2026-11-30'
      }
    },
    6: {
      qualityCompliance: {}
    },
    7: {
      shipment: {}
    },
    8: {
      deliveryTerms: {}
    }
  };

  if (path.includes('sales-product')) {
    return testData['2a'];
  } else if (path.includes('quality-compliance')) {
    return testData['2b'];
  } else if (path.includes('payment-internal')) {
    return testData['2c'];
  } else if (path.includes('client-po')) {
    return testData[1];
  } else if (path.includes('design-engineering')) {
    return testData[3];
  } else if (path.includes('material-requirements')) {
    return testData[4];
  } else if (path.includes('production-plan')) {
    return testData[5];
  } else if (path.includes('quality-check')) {
    return testData[6];
  } else if (path.includes('shipment')) {
    return testData[7];
  } else if (path.includes('delivery')) {
    return testData[8];
  }

  return {};
}

// Run tests
const salesOrderId = process.argv[2];
const authToken = process.argv[3];

if (!salesOrderId) {
  console.error('❌ Usage: node test-api-endpoints.js <salesOrderId> [authToken]');
  console.error('   Example: node test-api-endpoints.js 5 "eyJhbGc..."');
  process.exit(1);
}

testEndpoints(salesOrderId, authToken);
