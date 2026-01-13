const pool = require('./backend/config/database');

async function checkRootCards() {
  try {
    const [rows] = await pool.execute('SELECT * FROM root_cards');
    rows.forEach(row => {
      console.log(`Root Card #${row.id}: title = "${row.title}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRootCards();
