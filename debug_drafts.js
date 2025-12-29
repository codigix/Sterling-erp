const pool = require('./backend/config/database');

async function debugDrafts() {
    try {
        console.log("Checking for drafts for all users...");
        
        // List all drafts
        const [drafts] = await pool.execute('SELECT id, user_id, updated_at FROM sales_order_drafts');
        
        if (drafts.length === 0) {
            console.log("No drafts found in the database.");
        } else {
            console.log(`Found ${drafts.length} drafts:`);
            drafts.forEach(d => {
                console.log(`- Draft ID: ${d.id}, User ID: ${d.user_id}, Updated At: ${d.updated_at}`);
            });
        }
        
        // Check specific draft ID 5
        const targetId = 5;
        console.log(`\nChecking specifically for Draft ID ${targetId}...`);
        
        const [targetDraft] = await pool.execute('SELECT * FROM sales_order_drafts WHERE id = ?', [targetId]);
        
        if (targetDraft.length > 0) {
            console.log(`Draft ${targetId} exists!`);
            console.log(`Owner User ID: ${targetDraft[0].user_id}`);
        } else {
            console.log(`Draft ${targetId} DOES NOT EXIST in the database.`);
        }

    } catch (error) {
        console.error("Database Error:", error);
    } finally {
        process.exit();
    }
}

debugDrafts();