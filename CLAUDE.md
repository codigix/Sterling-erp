# Commands

## Frontend
- Lint: `npm run lint`
- Dev: `npm run dev`

## Backend

### Database Setup
- Setup demo users: `npm run setup-demo`

### Employee Dashboard Backend
- Create Attendance table: `node backend/migrations/024_create_attendance_table.js`
- Create CompanyUpdates table: `node backend/migrations/025_create_company_updates_table.js`
- Seed Attendance data: `node backend/seed-attendance.js`
- Seed Company Updates: `node backend/seed-company-updates.js`

### Employee Dashboard API Endpoints
- GET `/employee/portal/departments` - Get all departments
- GET `/employee/portal/departments/:departmentId/employees` - Get employees by department
- GET `/employee/portal/stats/:employeeId` - Get employee statistics (tasks, hours, etc.)
- GET `/employee/portal/tasks/:employeeId` - Get employee tasks
- GET `/employee/portal/attendance/:employeeId` - Get employee attendance records
- GET `/employee/portal/projects/:employeeId` - Get employee projects
- GET `/employee/portal/alerts/:employeeId` - Get employee alerts
- GET `/employee/portal/company-updates` - Get company announcements and updates
