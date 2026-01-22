const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const baseURL = (process.env.VITE_API_URL || 'http://localhost:5001') + '/api';

async function testStep5And7() {
  try {
    console.log('Testing Step 5 and 7 endpoints (Quality Check and Delivery)...\n');

    // Use the existing root card ID 6
    const rootCardId = 6;

    // Test Step 5 - Quality Check
    console.log(`📝 Testing Step 5 - POST /root-cards/steps/${rootCardId}/quality-check`);
    const step5Payload = {
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
      const step5Response = await axios.post(`${baseURL}/root-cards/steps/${rootCardId}/quality-check`, step5Payload);
      console.log('✅ Step 5 (QC) saved successfully');
      console.log('Response:', step5Response.data?.data ? '✓ Has data' : 'X No data');
    } catch (error) {
      console.error('❌ Step 5 failed:', error.response?.data?.message || error.message);
    }

    // Test Step 7 - Delivery
    console.log(`\n📝 Testing Step 7 - POST /root-cards/steps/${rootCardId}/delivery`);
    const step7Payload = {
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
      const step7Response = await axios.post(`${baseURL}/root-cards/steps/${rootCardId}/delivery`, step7Payload);
      console.log('✅ Step 7 (Delivery) saved successfully');
      console.log('Response:', step7Response.data?.data ? '✓ Has data' : 'X No data');
    } catch (error) {
      console.error('❌ Step 7 failed:', error.response?.data?.message || error.message);
    }

    // Verify data was saved
    console.log('\n🔍 Verifying saved data...');
    try {
      const mysql = require('mysql2/promise');
      const pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sterling_erp'
      });
      
      const [qc] = await pool.execute('SELECT * FROM quality_check_details WHERE sales_order_id = ?', [rootCardId]);
      console.log(`✅ Step 5 (QC) in DB: ${qc.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
      
      const [delivery] = await pool.execute('SELECT * FROM delivery_details WHERE sales_order_id = ?', [rootCardId]);
      console.log(`✅ Step 7 (Delivery) in DB: ${delivery.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
      
      await pool.end();
    } catch (error) {
      console.error('Verification error:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testStep5And7();
