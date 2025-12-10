const http = require('http');

const postData = JSON.stringify({
  materials: [
    {
      id: 1,
      steelSection: 'ISMB_300',
      steelSectionQuantity: "1",
      quantity: 1,
      unit: 'piece'
    }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/sales/steps/9/material-requirements',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
    'Authorization': 'Bearer demo-token'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(postData);
req.end();
