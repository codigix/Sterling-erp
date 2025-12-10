const http = require('http');
const fs = require('fs');

const postData = JSON.stringify({
  documents: [
    {
      type: 'Drawings',
      filePath: 'test_drawing.pdf',
      fileName: 'test_drawing.pdf'
    }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/sales/steps/8/design-engineering',
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
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(postData);
req.end();
