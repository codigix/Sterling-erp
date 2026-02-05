const pool = require('./config/database');

async function debug() {
  try {
    const planId = 48;
    console.log(`--- Debugging Plan ${planId} ---`);
    
    const [plans] = await pool.execute('SELECT * FROM production_plans WHERE id = ?', [planId]);
    console.log('Production Plan Record:', JSON.stringify(plans[0], null, 2));
    
    if (plans[0]) {
      const { sales_order_id, root_card_id } = plans[0];
      
      const [detailsBySO] = await pool.execute('SELECT id, sales_order_id, root_card_id FROM production_plan_details WHERE sales_order_id = ?', [sales_order_id]);
      console.log(`Details by SO (${sales_order_id}):`, JSON.stringify(detailsBySO, null, 2));
      
      const [detailsByRC] = await pool.execute('SELECT id, sales_order_id, root_card_id FROM production_plan_details WHERE root_card_id = ?', [root_card_id]);
      console.log(`Details by RC (${root_card_id}):`, JSON.stringify(detailsByRC, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
