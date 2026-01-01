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
  console.log('🔍 Searching for QT emails...\n');
  
  await connection.openBox('INBOX');
  
  const searchCriteria = ['ALL'];
  const fetchOptions = {
    bodies: ['HEADER'],
    markSeen: false
  };
  
  const messages = await connection.search(searchCriteria, fetchOptions);
  console.log(`📬 Total emails in INBOX: ${messages.length}\n`);
  
  const qtEmails = messages.filter(item => {
    const subject = item.parts.find(p => p.which === 'HEADER').body.subject[0];
    return subject && subject.includes('QT-');
  });
  
  console.log(`📧 Emails with QT- pattern: ${qtEmails.length}\n`);
  
  if (qtEmails.length > 0) {
    qtEmails.slice(0, 10).forEach((item, index) => {
      const headerPart = item.parts.find(p => p.which === 'HEADER');
      const subject = headerPart.body.subject[0];
      const from = headerPart.body.from[0];
      console.log(`${index + 1}. From: ${from}`);
      console.log(`   Subject: ${subject}\n`);
    });
  } else {
    console.log('❌ No QT- emails found');
  }
  
  connection.end();
  process.exit(0);
}).catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
