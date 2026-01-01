require('dotenv').config({ path: '../.env' });
const imaps = require('imap-simple');

const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 20000
  }
};

imaps.connect(config).then(async (connection) => {
  try {
    console.log('🔍 Testing QT/PO email search...\n');
    
    await connection.openBox('INBOX');
    
    const searchCriteria = [
      ['OR', ['SUBJECT', 'QT-'], ['SUBJECT', 'PO-']]
    ];
    const fetchOptions = {
      bodies: ['HEADER'],
      markSeen: false
    };
    
    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`✅ Found ${messages.length} emails with QT or PO in subject\n`);
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentMessages = messages.filter(item => {
      try {
        const headerPart = item.parts.find(p => p.which === 'HEADER');
        const date = new Date(headerPart.body.date[0]).getTime();
        return date >= oneHourAgo;
      } catch (e) {
        return false;
      }
    });
    
    console.log(`📬 Recent emails (last 1 hour): ${recentMessages.length}\n`);
    
    if (recentMessages.length > 0) {
      recentMessages.slice(0, 5).forEach((item, index) => {
        const headerPart = item.parts.find(p => p.which === 'HEADER');
        const subject = headerPart.body.subject[0];
        const from = headerPart.body.from[0];
        const date = new Date(headerPart.body.date[0]).toLocaleString();
        console.log(`${index + 1}. From: ${from}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Date: ${date}\n`);
      });
    }
    
    connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    connection.end();
    process.exit(1);
  }
}).catch((err) => {
  console.error('❌ Connection Error:', err.message);
  process.exit(1);
});
