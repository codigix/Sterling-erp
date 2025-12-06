const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testWorkflow() {
  try {
    console.log('🧪 Testing Wizard Integration Flow\n');
    
    // Step 1: Get health
    console.log('1. Checking API health...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ API is healthy\n');

    // Step 2: Login (you need to get auth token)
    console.log('2. Testing workflow initialization endpoint...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'password'
    });
    const token = loginRes.data.token;
    console.log('✅ Authentication successful\n');

    // Step 3: Create a sales order (assuming you have test data)
    console.log('3. Creating a test sales order...');
    const orderRes = await axios.post(
      `${API_URL}/sales/orders`,
      {
        poNumber: 'TEST-' + Date.now(),
        poDate: new Date().toISOString().split('T')[0],
        clientName: 'Test Client',
        clientAddress: 'Test Address',
        projectName: 'Test Project',
        projectCategory: 'Defense',
        deliveryTimeline: '30 days',
        paymentTerms: 'Net 30',
        specialInstructions: 'Test instructions',
        customerContact: 'John Doe',
        clientEmail: 'test@example.com',
        clientPhone: '+91-1234567890',
        billingAddress: 'Billing Address',
        shippingAddress: 'Shipping Address',
        projectStartDate: new Date().toISOString().split('T')[0],
        estimatedEndDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        projectPriority: 'medium',
        internalProjectOwner: '1',
        totalAmount: '100000',
        materials: [],
        projectEmployees: [],
        documents: { poDocuments: [] }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const orderId = orderRes.data.order.id;
    console.log(`✅ Sales order created: ID ${orderId}\n`);

    // Step 4: Initialize workflow
    console.log('4. Initializing workflow...');
    const workflowRes = await axios.post(
      `${API_URL}/sales/workflow/initialize`,
      { salesOrderId: orderId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Workflow initialized:', workflowRes.data.message);
    console.log(`   Steps created: ${workflowRes.data.stepsCreated}\n`);

    // Step 5: Get workflow steps
    console.log('5. Fetching workflow steps...');
    const stepsRes = await axios.get(
      `${API_URL}/sales/workflow/${orderId}/steps`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Retrieved ${stepsRes.data.steps.length} workflow steps:`);
    stepsRes.data.steps.forEach(step => {
      console.log(`   - Step ${step.step_number}: ${step.step_name} (${step.status})`);
    });

    console.log('\n🎉 All tests passed! Wizard integration is working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testWorkflow();
