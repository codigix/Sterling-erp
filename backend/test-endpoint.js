const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('Testing API endpoint for employee ID 18...');
    const response = await axios.get('http://localhost:5001/employee/portal/tasks/18', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    if (e.response) {
      console.error('Response status:', e.response.status);
      console.error('Response data:', e.response.data);
    }
    process.exit(1);
  }
}

testEndpoint();
