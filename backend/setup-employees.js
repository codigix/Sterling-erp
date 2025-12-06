const pool = require('./config/database');

async function setup() {
  try {
    console.log('Setting up employee management tables...');
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        designation VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        role_id INT NOT NULL,
        login_id VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        actions JSON,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        INDEX idx_login_id (login_id),
        INDEX idx_department (department),
        INDEX idx_status (status)
      )`,
      
      `CREATE TABLE IF NOT EXISTS employee_attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        check_in TIMESTAMP NULL,
        check_out TIMESTAMP NULL,
        status ENUM('present', 'absent', 'half_day', 'leave') DEFAULT 'present',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (employee_id, attendance_date)
      )`,
      
      `CREATE TABLE IF NOT EXISTS employee_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        project_id INT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('pending', 'in_progress', 'completed', 'on_hold') DEFAULT 'pending',
        assigned_by INT,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE SET NULL
      )`
    ];

    for (const table of tables) {
      try {
        await pool.execute(table);
        const tableName = table.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
        console.log(`✓ Table '${tableName}' created or already exists`);
      } catch (error) {
        if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.error('Error creating table:', error.message);
        }
      }
    }

    console.log('\n✓ Employee management setup completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error.message);
    process.exit(1);
  }
}

setup();
