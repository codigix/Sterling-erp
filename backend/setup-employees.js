const pool = require('./config/database');

async function setup() {
  try {
    console.log('Setting up employee management tables...');
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        code VARCHAR(50),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status)
      )`,
      
      `CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        designation VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        department_id INT,
        role_id INT NOT NULL,
        login_id VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        actions JSON,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_login_id (login_id),
        INDEX idx_department (department),
        INDEX idx_department_id (department_id),
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

    console.log('\nAdding department_id column to employees table if missing...');
    try {
      await pool.execute(`
        ALTER TABLE employees 
        ADD COLUMN department_id INT,
        ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        ADD INDEX idx_department_id (department_id)
      `);
      console.log('✓ department_id column and foreign key added to employees table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_KEY_COLUMN_DOES_NOT_EXIST') {
        console.log('✓ department_id column already exists in employees table');
      } else {
        console.error('Error adding department_id column:', error.message);
      }
    }

    console.log('\nUpdating manufacturing_stages foreign key to reference employees table...');
    try {
      await pool.execute(`
        ALTER TABLE manufacturing_stages 
        DROP FOREIGN KEY manufacturing_stages_ibfk_2
      `);
      console.log('✓ Old foreign key dropped from manufacturing_stages');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('✓ Foreign key does not exist, skipping drop');
      } else {
        console.error('Error dropping foreign key:', error.message);
      }
    }

    try {
      await pool.execute(`
        ALTER TABLE manufacturing_stages 
        ADD FOREIGN KEY (assigned_worker) REFERENCES employees(id) ON DELETE SET NULL
      `);
      console.log('✓ Foreign key added to manufacturing_stages to reference employees table');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_KEY_COLUMN_DOES_NOT_EXIST') {
        console.log('✓ Foreign key already exists for manufacturing_stages');
      } else {
        console.error('Error adding foreign key:', error.message);
      }
    }

    console.log('\nUpdating worker_tasks foreign key to reference employees table...');
    try {
      await pool.execute(`
        ALTER TABLE worker_tasks 
        DROP FOREIGN KEY worker_tasks_ibfk_2
      `);
      console.log('✓ Old foreign key dropped from worker_tasks');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('✓ Foreign key does not exist in worker_tasks, skipping drop');
      } else {
        console.error('Error dropping foreign key:', error.message);
      }
    }

    try {
      await pool.execute(`
        ALTER TABLE worker_tasks 
        ADD FOREIGN KEY (worker_id) REFERENCES employees(id) ON DELETE CASCADE
      `);
      console.log('✓ Foreign key added to worker_tasks to reference employees table');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_KEY_COLUMN_DOES_NOT_EXIST') {
        console.log('✓ Foreign key already exists for worker_tasks');
      } else {
        console.error('Error adding foreign key:', error.message);
      }
    }

    console.log('\nInserting default departments...');
    const defaultDepartments = [
      { name: 'Engineering', code: 'ENG', description: 'Engineering Department' },
      { name: 'Production', code: 'PROD', description: 'Production Department' },
      { name: 'Quality Control', code: 'QC', description: 'Quality Control Department' },
      { name: 'Procurement', code: 'PROC', description: 'Procurement Department' },
      { name: 'Inventory', code: 'INV', description: 'Inventory Management Department' },
      { name: 'Sales', code: 'SALES', description: 'Sales Department' },
      { name: 'HR', code: 'HR', description: 'Human Resources Department' },
      { name: 'Finance', code: 'FIN', description: 'Finance Department' }
    ];

    for (const dept of defaultDepartments) {
      try {
        await pool.execute(
          'INSERT IGNORE INTO departments (name, code, description) VALUES (?, ?, ?)',
          [dept.name, dept.code, dept.description]
        );
        console.log(`✓ Department '${dept.name}' inserted or already exists`);
      } catch (error) {
        console.error(`Error inserting department '${dept.name}':`, error.message);
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
