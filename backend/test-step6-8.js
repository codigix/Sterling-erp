const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const baseURL = (process.env.VITE_API_URL || 'http://localhost:5001') + '/api';

async function testStep6And8() {
  try {
    console.log('Testing Step 6 and 8 endpoints...\n');

    // Use the existing sales order ID 6
    const salesOrderId = 6;

    // Test Step 6 - Quality Check
    console.log(`📝 Testing Step 6 - POST /sales/steps/${salesOrderId}/quality-check`);
    const step6Payload = {
      qualityCompliance: {
        qualityStandards: 'ISO 9001:2015',
        weldingStandards: 'AWS D1.1',
        surfaceFinish: 'Ra 1.6',
        mechanicalLoadTesting: '1.5x load',
        electricalCompliance: 'IEC 61439',
        documentsRequired: 'QAP, FAT'
      },
      warrantySupport: {
        warrantyPeriod: '12 months',
        serviceSupport: '24/7 support'
      },
      internalProjectOwner: null,
      assignedTo: null
    };

    try {
      const step6Response = await axios.post(`${baseURL}/sales/steps/${salesOrderId}/quality-check`, step6Payload);
      console.log('✅ Step 6 saved successfully');
      console.log('Response:', step6Response.data?.data ? '✓ Has data' : 'X No data');
    } catch (error) {
      console.error('❌ Step 6 failed:', error.response?.data?.message || error.message);
    }

    // Test Step 8 - Delivery
    console.log(`\n📝 Testing Step 8 - POST /sales/steps/${salesOrderId}/delivery`);
    const step8Payload = {
      deliveryTerms: {
        deliverySchedule: '12-16 weeks',
        installationRequired: 'Yes',
        siteCommissioning: 'After delivery'
      },
      warrantySupport: {
        warrantyPeriod: '12 months'
      },
      customerContact: 'John Doe - 9999999999',
      projectRequirements: {
        acceptanceCriteria: 'Functional test passed'
      },
      internalInfo: {
        projectManager: 'Manager Name',
        productionSupervisor: 'Supervisor Name'
      },
      assignedTo: null
    };

    try {
      const step8Response = await axios.post(`${baseURL}/sales/steps/${salesOrderId}/delivery`, step8Payload);
      console.log('✅ Step 8 saved successfully');
      console.log('Response:', step8Response.data?.data ? '✓ Has data' : 'X No data');
    } catch (error) {
      console.error('❌ Step 8 failed:', error.response?.data?.message || error.message);
    }

    // Verify data was saved
    console.log('\n🔍 Verifying saved data...');
    try {
      const [{ execute }] = require('mysql2/promise');
      const pool = require('./config/database');
      
      const [qc] = await pool.execute('SELECT * FROM quality_check_details WHERE sales_order_id = ?', [salesOrderId]);
      console.log(`✅ Step 6 in DB: ${qc.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
      
      const [delivery] = await pool.execute('SELECT * FROM delivery_details WHERE sales_order_id = ?', [salesOrderId]);
      console.log(`✅ Step 8 in DB: ${delivery.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    } catch (error) {
      console.error('Verification error:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testStep6And8();
