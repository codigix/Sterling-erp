require('dotenv').config({ path: '../.env' });

console.log('📧 Email Configuration from .env:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('IMAP_HOST:', process.env.IMAP_HOST || 'imap.gmail.com (default)');
console.log('IMAP_PORT:', process.env.IMAP_PORT || '993 (default)');
console.log('\n🔍 Testing IMAP Connection...\n');

const imaps = require('imap-simple');

const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST === 'smtp.gmail.com' ? 'imap.gmail.com' : (process.env.IMAP_HOST || 'imap.gmail.com'),
    port: parseInt(process.env.IMAP_PORT || '993'),
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 20000
  }
};

imaps.connect(config).then(async (connection) => {
  console.log('✅ IMAP Connection successful!\n');
  
  await connection.openBox('INBOX');
  
  const searchCriteria = ['UNSEEN'];
  const fetchOptions = {
    bodies: ['HEADER'],
    markSeen: false
  };
  
  const messages = await connection.search(searchCriteria, fetchOptions);
  console.log(`📬 Found ${messages.length} unread emails\n`);
  
  if (messages.length > 0) {
    messages.slice(0, 3).forEach((item, index) => {
      const subject = item.parts.find(p => p.which === 'HEADER').body.subject[0];
      console.log(`${index + 1}. Subject: ${subject}`);
    });
  }
  
  connection.end();
  process.exit(0);
}).catch((err) => {
  console.error('❌ IMAP Connection Failed:');
  console.error(err.message);
  process.exit(1);
});
