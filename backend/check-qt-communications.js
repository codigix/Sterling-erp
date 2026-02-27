const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [quotations] = await connection.execute(
      'SELECT id, quotation_number FROM quotations WHERE quotation_number = ?',
      ['QT-20260226-001-Q02']
    );
    
    console.log('📋 Quotation found:', quotations[0]);
    
    if (quotations[0]) {
      const [comms] = await connection.execute(
        'SELECT id, sender_email, subject, created_at FROM quotation_communications WHERE quotation_id = ?',
        [quotations[0].id]
      );
      
      console.log('\n💬 Communications in DB:', comms.length);
      if (comms.length > 0) {
        comms.forEach((c, i) => {
          console.log(`\n${i + 1}. ID: ${c.id}`);
          console.log(`   From: ${c.sender_email}`);
          console.log(`   Subject: ${c.subject}`);
          console.log(`   Created: ${c.created_at}`);
        });
      } else {
        console.log('❌ No communications found in database');
      }
    } else {
      console.log('❌ Quotation not found in database');
    }
    
    connection.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
