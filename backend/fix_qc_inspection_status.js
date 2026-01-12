const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sterling_erp',
};

async function fixQCInspectionStatus() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    console.log('Altering qc_inspections table status column...');
    
    // Check current column definition if possible, or just overwrite with a superset
    // Common statuses + the ones causing issues
    const validStatuses = [
        'pending', 
        'in_progress', 
        'passed', 
        'failed', 
        'conditional', 
        'partially_completed',
        'shortage',
        'overage',
        'rejected',
        'approved' 
    ];
    
    const alterQuery = `
      ALTER TABLE qc_inspections 
      MODIFY COLUMN status ENUM(
        'pending', 
        'in_progress', 
        'passed', 
        'failed', 
        'conditional', 
        'partially_completed', 
        'shortage', 
        'overage',
        'rejected',
        'approved'
      ) DEFAULT 'pending';
    `;

    await connection.query(alterQuery);
    console.log('Successfully updated qc_inspections status column definition.');

  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

fixQCInspectionStatus();
