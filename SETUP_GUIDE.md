# Sterling ERP - Setup & Installation Guide

## Prerequisites

- **Node.js**: v14+ 
- **MySQL**: v5.7+
- **npm**: v6+

---

## 🔧 Installation Steps

### 1. Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE sterling_erp;
USE sterling_erp;

# Import schema
SOURCE schema.sql;

# Apply migrations
SOURCE migrations.sql;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=sterling_erp
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
EOF

# Start backend server
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173` (or next available port)

---

## 📋 Database Schema Overview

### Core Tables
- `users` - System users with roles
- `roles` - User roles and permissions
- `projects` - Project records from sales orders
- `sales_orders` - Client purchase orders

### Production Tables
- `production_plans` - Production plans with stages
- `production_stages` - Individual production stages
- `production_stage_tasks` - Employee task assignments
- `manufacturing_stages` - Original manufacturing stages
- `root_cards` - Root production cards

### Material & Inventory
- `inventory` - Material/item tracking
- `stock_movements` - Stock in/out tracking
- `facilities` - Production facilities
- `challan_materials` - Material challan tracking

### Notifications & Tracking
- `alerts_notifications` - Alert system
- `notifications` - System notifications
- `project_tracking` - Project milestones
- `employee_tracking` - Employee performance metrics

---

## 🔐 Default Admin User

After database setup, create admin user:

```bash
# In backend directory
node

# In Node console
const bcrypt = require('bcryptjs');
const password = bcrypt.hashSync('password', 10);
console.log(password);
// Copy the hash and insert into database
```

SQL to insert admin user:
```sql
INSERT INTO roles (name, permissions) VALUES 
('admin', '["*"]'),
('sales', '["sales.*"]'),
('engineering', '["engineering.*"]'),
('procurement', '["procurement.*"]'),
('qc', '["qc.*"]'),
('inventory', '["inventory.*"]'),
('production', '["production.*"]'),
('operator', '["production.tasks"]'),
('challan', '["challan.*"]');

INSERT INTO users (username, password, role_id, email) VALUES 
('admin', '<bcrypt_hash>', 1, 'admin@sterling.com');
```

**Login Credentials:**
- Username: `admin`
- Password: `password`

---

## 🚀 Running the Application

### Terminal 1: Backend
```bash
cd backend
npm start
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000 (or shown in terminal)
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 📊 Application Structure

### Backend Architecture
```
express server
  ├── Routes (by feature)
  ├── Controllers (business logic)
  ├── Models (database layer)
  ├── Middleware (auth, validation)
  └── Config (database connection)
```

### Frontend Architecture
```
React + Vite
  ├── Pages (feature pages)
  ├── Components (reusable UI)
  ├── Context (state management)
  ├── Utils (API calls)
  └── Styles (Tailwind CSS)
```

---

## 🧪 Testing the System

### 1. Login
1. Navigate to `http://localhost:3000`
2. Enter admin credentials
3. You'll be redirected to `/admin/dashboard`

### 2. Create Production Plan
1. Go to `/department/production` (if using production role)
2. Click "New Plan"
3. Go to `/department/production-plan`
4. Fill in the form with:
   - Select Project
   - Enter Plan Name
   - Add Production Stages
   - Submit

### 3. Assign Tasks to Employee
1. Create a production stage in the plan
2. Assign employee to stage
3. System creates tasks for employee

### 4. Employee Updates Task
1. Login as employee
2. Go to `/employee/portal`
3. View assigned tasks
4. Click "Update Status"
5. Change status (to_do → in_progress → done)

### 5. Monitor Progress
1. Go to `/reports/project-tracking`
2. Select project
3. View milestones and progress
4. Go to `/reports/employee-tracking`
5. View employee performance

---

## 🔍 Troubleshooting

### Backend Won't Start
```bash
# Check port
lsof -i :5000

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check MySQL connection
mysql -u root -p sterling_erp -e "SELECT 1"
```

### Frontend Build Issues
```bash
# Clear cache
rm -rf node_modules .vite

# Reinstall
npm install

# Check Node version
node --version  # Should be v14+
```

### Database Connection Error
```bash
# Verify MySQL is running
mysql -u root -p

# Check credentials in .env file
cat backend/.env

# Verify database exists
SHOW DATABASES;
```

### Routes Not Found
```bash
# Ensure migrations are applied
mysql sterling_erp < backend/migrations.sql

# Restart backend server
npm start
```

---

## 📦 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output: dist/ folder
```

**Backend:**
```bash
cd backend
# Update .env for production
NODE_ENV=production npm start
```

### Environment Variables for Production

**Backend .env**
```
PORT=5000
NODE_ENV=production
DATABASE_HOST=prod-mysql-server
DATABASE_USER=prod_user
DATABASE_PASSWORD=strong_password
DATABASE_NAME=sterling_erp_prod
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=very_long_random_secret_key
```

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS on production
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Keep Node.js and dependencies updated
- [ ] Implement rate limiting
- [ ] Enable CORS properly
- [ ] Use prepared statements (already in code)

---

## 📚 Documentation Files

1. **IMPLEMENTATION_GUIDE.md** - Features overview
2. **API_REFERENCE.md** - API endpoints documentation
3. **SETUP_GUIDE.md** - This file
4. **IMPLEMENTATION_SUMMARY.md** - Original summary

---

## 🆘 Support

For issues or questions:
1. Check documentation files
2. Review API_REFERENCE.md for endpoint details
3. Check database schema for table structure
4. Review error logs in backend console

---

## 📈 Next Steps

1. **Customize Styling** - Modify CSS for branding
2. **Add More Roles** - Create department-specific roles
3. **Email Integration** - Send notifications via email
4. **Mobile App** - Build React Native app
5. **Advanced Analytics** - Add charts and dashboards
6. **API Documentation** - Generate Swagger/OpenAPI docs
7. **Load Testing** - Test with production data volume
8. **Security Audit** - Conduct security assessment

---

**Version**: 1.0.0
**Last Updated**: 2025-11-29
**Status**: Ready for Development/Testing
