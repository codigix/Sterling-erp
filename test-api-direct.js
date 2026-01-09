const http = require('http');

console.log('Testing API without token...\n');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/employee/portal/tasks/18',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    console.log('\n--- Test 2: With fake token ---\n');
    
    testWithToken();
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

req.end();

function testWithToken() {
  const options2 = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/employee/portal/tasks/18',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer fake-token-12345'
    }
  };

  const req2 = http.request(options2, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      process.exit(0);
    });
  });

  req2.on('error', (error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });

  req2.end();
}
