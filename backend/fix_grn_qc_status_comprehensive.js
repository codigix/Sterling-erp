const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sterling_erp',
};

async function fixGRNQcStatus() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    console.log('Altering grn table qc_status column...');
    
    // We want to ensure qc_status supports the values used in controller
    // grnStatus can be: 'approved', 'rejected', 'hold', 'pending', 'completed'
    const alterQuery = `
      ALTER TABLE grn 
      MODIFY COLUMN qc_status ENUM(
        'pending', 
        'approved', 
        'completed', 
        'rejected', 
        'hold',
        'cancelled'
      ) DEFAULT 'pending';
    `;

    await connection.query(alterQuery);
    console.log('Successfully updated grn qc_status column definition.');

  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

fixGRNQcStatus();
