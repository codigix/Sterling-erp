const pool = require('../config/database');

const up = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS grn (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_id INT NOT NULL,
      items JSON,
      qc_status ENUM('pending', 'approved', 'rejected', 'hold') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id)
    )
  `);
  console.log('GRN table created');
};

const down = async () => {
  await pool.execute('DROP TABLE IF EXISTS grn');
  console.log('GRN table dropped');
};

module.exports = { up, down };
