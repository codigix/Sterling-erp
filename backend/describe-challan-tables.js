const pool = require('./config/database');

async function describe() {
  try {
    const [oc] = await pool.execute('DESCRIBE outward_challans');
    console.log('--- OUTWARD_CHALLANS ---');
    console.log(JSON.stringify(oc, null, 2));

    const [oci] = await pool.execute('DESCRIBE outward_challan_items');
    console.log('\n--- OUTWARD_CHALLAN_ITEMS ---');
    console.log(JSON.stringify(oci, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

describe();
