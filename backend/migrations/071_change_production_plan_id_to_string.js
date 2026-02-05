const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('Starting migration: production_plans.id to VARCHAR(255)');

        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Drop existing foreign keys
        const fks = [
            { table: 'material_requests', name: 'material_requests_ibfk_2' },
            { table: 'outsourcing_tasks', name: 'outsourcing_tasks_ibfk_2' },
            { table: 'production_plan_details', name: 'fk_pp_details_pp_id' },
            { table: 'production_plan_stages', name: 'production_plan_stages_ibfk_1' },
            { table: 'production_stages', name: 'production_stages_ibfk_1' }
        ];

        for (const fk of fks) {
            try {
                await connection.execute(`ALTER TABLE ${fk.table} DROP FOREIGN KEY ${fk.name}`);
                console.log(`Dropped FK ${fk.name} from ${fk.table}`);
            } catch (e) {
                console.warn(`Could not drop FK ${fk.name} from ${fk.table}: ${e.message}`);
            }
        }

        // 2. Add temporary column to keep track of old IDs
        try {
            await connection.execute('ALTER TABLE production_plans ADD COLUMN old_id INT');
            await connection.execute('UPDATE production_plans SET old_id = id');
            console.log('Created old_id backup');
        } catch (e) {
            console.warn('old_id column might already exist, skipping creation');
        }

        // 3. Change ID column type and remove auto_increment
        await connection.execute('ALTER TABLE production_plans MODIFY id VARCHAR(255) NOT NULL');
        console.log('Changed production_plans.id to VARCHAR(255)');

        // 4. Update ID to use plan_name (the PP- identity)
        await connection.execute('UPDATE production_plans SET id = plan_name');
        console.log('Updated production_plans.id values from plan_name');

        // 5. Update related tables
        const relatedTables = [
            'material_requests',
            'outsourcing_tasks',
            'production_plan_details',
            'production_plan_stages',
            'production_stages'
        ];

        for (const table of relatedTables) {
            console.log(`Updating ${table}...`);
            await connection.execute(`ALTER TABLE ${table} MODIFY production_plan_id VARCHAR(255)`);
            await connection.execute(`
                UPDATE ${table} t
                JOIN production_plans p ON CAST(t.production_plan_id AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(p.old_id AS CHAR) COLLATE utf8mb4_unicode_ci
                SET t.production_plan_id = p.id
            `);
        }

        // 6. Remove temporary column
        await connection.execute('ALTER TABLE production_plans DROP COLUMN old_id');
        console.log('Removed old_id column');

        // 7. Re-add foreign keys
        const newFks = [
            { table: 'material_requests', name: 'material_requests_ibfk_2', col: 'production_plan_id' },
            { table: 'outsourcing_tasks', name: 'outsourcing_tasks_ibfk_2', col: 'production_plan_id' },
            { table: 'production_plan_details', name: 'fk_pp_details_pp_id', col: 'production_plan_id' },
            { table: 'production_plan_stages', name: 'production_plan_stages_ibfk_1', col: 'production_plan_id' },
            { table: 'production_stages', name: 'production_stages_ibfk_1', col: 'production_plan_id' }
        ];

        for (const fk of newFks) {
            await connection.execute(`
                ALTER TABLE ${fk.table} 
                ADD CONSTRAINT ${fk.name} 
                FOREIGN KEY (${fk.col}) REFERENCES production_plans(id)
                ON DELETE CASCADE ON UPDATE CASCADE
            `);
            console.log(`Re-added FK ${fk.name} to ${fk.table}`);
        }

        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
        await connection.end();
    }
}

migrate();
