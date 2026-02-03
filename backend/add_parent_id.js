const mysql = require('mysql2/promise');
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Kale@1234',
  database: 'sterling_erp'
};

async function main() {
  const connection = await mysql.createConnection(config);
  try {
    console.log('Checking if parent_root_card_id exists in root_cards table...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM root_cards LIKE "parent_root_card_id"');
    
    if (columns.length === 0) {
      console.log('Adding parent_root_card_id to root_cards table...');
      await connection.execute('ALTER TABLE root_cards ADD COLUMN parent_root_card_id INT');
      await connection.execute('ALTER TABLE root_cards ADD CONSTRAINT fk_parent_root_card FOREIGN KEY (parent_root_card_id) REFERENCES root_cards(id)');
      console.log('Success!');
    } else {
      console.log('Column parent_root_card_id already exists.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

main();
