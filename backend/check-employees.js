const pool = require("./config/database");

(async () => {
  try {
    const [users] = await pool.execute(
      "SELECT id, username, email FROM users WHERE id <= 20 ORDER BY id"
    );
    console.log("Available Users (IDs 1-20):");
    console.log(JSON.stringify(users, null, 2));

    const [count] = await pool.execute("SELECT COUNT(*) as total FROM users");
    console.log("\nTotal users in database:", count[0].total);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
