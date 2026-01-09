const pool = require('./config/database');

async function seedAttendance() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    // Get first 10 employees
    const [employees] = await connection.execute('SELECT id FROM employees LIMIT 10');
    
    if (employees.length === 0) {
      console.log('⚠️ No employees found. Please run employee setup first.');
      process.exit(0);
    }

    const employeeIds = employees.map(emp => emp.id);
    const statuses = ['present', 'absent', 'half_day', 'on_leave'];
    const today = new Date();

    // Insert attendance records for the past 30 days
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - i);
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

      for (const employeeId of employeeIds) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let checkInTime = null;
        let checkOutTime = null;
        let hoursWorked = null;

        if (status === 'present') {
          const hour = String(9 + Math.floor(Math.random() * 1)).padStart(2, '0');
          const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
          checkInTime = `${hour}:${minute}:00`;
          
          const outHour = String(17 + Math.floor(Math.random() * 2)).padStart(2, '0');
          const outMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
          checkOutTime = `${outHour}:${outMinute}:00`;
          
          hoursWorked = (parseFloat(outHour) - parseFloat(hour) + (parseFloat(outMinute) - parseFloat(minute)) / 60).toFixed(2);
        } else if (status === 'half_day') {
          checkInTime = '09:00:00';
          checkOutTime = '13:00:00';
          hoursWorked = '4.00';
        }

        const dateStr = currentDate.toISOString().split('T')[0];

        await connection.execute(
          `INSERT INTO attendance (employee_id, attendance_date, status, check_in_time, check_out_time, hours_worked, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [employeeId, dateStr, status, checkInTime, checkOutTime, hoursWorked]
        );
      }
    }

    await connection.query('COMMIT');
    console.log('✅ Attendance records seeded successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error seeding attendance:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

seedAttendance()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
