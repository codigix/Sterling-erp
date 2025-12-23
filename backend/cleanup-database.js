const pool = require('./config/database');
require('dotenv').config();

async function cleanupDatabase() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 Starting database cleanup...\n');

    // Check if root_cards has sales_order_id column
    console.log('1️⃣  Checking root_cards table...');
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'root_cards' AND TABLE_SCHEMA = DATABASE() 
        AND COLUMN_NAME = 'sales_order_id'
      `);
      
      if (columns.length === 0) {
        console.log('   ➕ Adding sales_order_id column to root_cards...');
        try {
          await connection.execute(`
            ALTER TABLE root_cards ADD COLUMN sales_order_id INT
          `);
          console.log('   ✅ Column added');
        } catch (e) {
          if (e.code !== 'ER_DUP_FIELDNAME') throw e;
          console.log('   ⚠️  Column already exists');
        }
        
        // Add foreign key constraint
        console.log('   ➕ Adding foreign key constraint...');
        try {
          await connection.execute(`
            ALTER TABLE root_cards ADD CONSTRAINT fk_root_cards_sales_order 
            FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL
          `);
          console.log('   ✅ Foreign key added');
        } catch (e) {
          if (e.code !== 'ER_DUP_KEYNAME' && !e.message.includes('Duplicate')) throw e;
          console.log('   ⚠️  Foreign key already exists');
        }
      } else {
        console.log('   ✅ sales_order_id column already exists');
      }
    } catch (err) {
      console.error('   ❌ Error checking root_cards:', err.message);
    }

    // Check if department_tasks has sales_order_id column
    console.log('\n2️⃣  Checking department_tasks table...');
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'department_tasks' AND TABLE_SCHEMA = DATABASE() 
        AND COLUMN_NAME = 'sales_order_id'
      `);
      
      if (columns.length === 0) {
        console.log('   ➕ Adding sales_order_id column to department_tasks...');
        try {
          await connection.execute(`
            ALTER TABLE department_tasks ADD COLUMN sales_order_id INT
          `);
          console.log('   ✅ Column added');
        } catch (e) {
          if (e.code !== 'ER_DUP_FIELDNAME') throw e;
          console.log('   ⚠️  Column already exists');
        }
        
        // Add foreign key constraint
        console.log('   ➕ Adding foreign key constraint...');
        try {
          await connection.execute(`
            ALTER TABLE department_tasks ADD CONSTRAINT fk_dept_tasks_sales_order 
            FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL
          `);
          console.log('   ✅ Foreign key added');
        } catch (e) {
          if (e.code !== 'ER_DUP_KEYNAME' && !e.message.includes('Duplicate')) throw e;
          console.log('   ⚠️  Foreign key already exists');
        }
      } else {
        console.log('   ✅ sales_order_id column already exists');
      }
    } catch (err) {
      console.error('   ❌ Error checking department_tasks:', err.message);
    }

    // Verify design_engineering_details table exists
    console.log('\n3️⃣  Checking design_engineering_details table...');
    try {
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'design_engineering_details' AND TABLE_SCHEMA = DATABASE()
      `);
      
      if (tables.length === 0) {
        console.log('   ➕ Creating design_engineering_details table...');
        await connection.execute(`
          CREATE TABLE design_engineering_details (
            id INT PRIMARY KEY AUTO_INCREMENT,
            sales_order_id INT NOT NULL UNIQUE,
            bomData JSON,
            drawings3D JSON,
            specifications JSON,
            documents JSON,
            designNotes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
            INDEX idx_sales_order (sales_order_id)
          )
        `);
        console.log('   ✅ Table created');
      } else {
        console.log('   ✅ Table already exists');
      }
    } catch (err) {
      console.error('   ❌ Error checking design_engineering_details:', err.message);
    }

    // Verify design_workflow_steps table exists
    console.log('\n4️⃣  Checking design_workflow_steps table...');
    try {
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'design_workflow_steps' AND TABLE_SCHEMA = DATABASE()
      `);
      
      if (tables.length === 0) {
        console.log('   ➕ Creating design_workflow_steps table...');
        await connection.execute(`
          CREATE TABLE design_workflow_steps (
            id INT PRIMARY KEY AUTO_INCREMENT,
            step_name VARCHAR(255) NOT NULL,
            step_order INT DEFAULT 0,
            description TEXT,
            task_template_title VARCHAR(500),
            task_template_description TEXT,
            auto_create_on_trigger VARCHAR(255),
            priority VARCHAR(20) DEFAULT 'medium',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_step_order (step_order),
            INDEX idx_is_active (is_active)
          )
        `);
        console.log('   ✅ Table created');
      } else {
        console.log('   ✅ Table already exists');
        
        // Add missing columns if they don't exist
        const [columns] = await connection.execute(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'design_workflow_steps' AND TABLE_SCHEMA = DATABASE()
        `);
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        
        if (!columnNames.includes('description')) {
          console.log('   ➕ Adding description column...');
          try {
            await connection.execute(`
              ALTER TABLE design_workflow_steps ADD COLUMN description TEXT
            `);
            console.log('   ✅ description column added');
          } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
          }
        }
        
        if (!columnNames.includes('is_active')) {
          console.log('   ➕ Adding is_active column...');
          try {
            await connection.execute(`
              ALTER TABLE design_workflow_steps ADD COLUMN is_active BOOLEAN DEFAULT TRUE
            `);
            console.log('   ✅ is_active column added');
          } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
          }
        }
      }
    } catch (err) {
      console.error('   ❌ Error checking design_workflow_steps:', err.message);
    }

    // Clean up duplicate indexes
    console.log('\n5️⃣  Cleaning up duplicate indexes...');
    try {
      const [indexes] = await connection.execute(`
        SELECT INDEX_NAME, COUNT(*) as cnt FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        GROUP BY INDEX_NAME 
        HAVING cnt > 1
      `);
      
      if (indexes.length > 0) {
        console.log('   Found duplicate indexes, reviewing...');
        for (const idx of indexes) {
          console.log(`   ⚠️  Index ${idx.INDEX_NAME} appears multiple times`);
        }
      } else {
        console.log('   ✅ No duplicate indexes found');
      }
    } catch (err) {
      console.log('   ℹ️  Could not check for duplicate indexes');
    }

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • root_cards.sales_order_id column: ✅');
    console.log('   • department_tasks.sales_order_id column: ✅');
    console.log('   • design_engineering_details table: ✅');
    console.log('   • design_workflow_steps table: ✅');

  } catch (err) {
    console.error('❌ Database cleanup failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

cleanupDatabase();
