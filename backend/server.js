const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import migration runner
const { runMigrations } = require('./utils/migrationRunner');

const authRoutes = require('./routes/auth/authRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const salesRoutes = require('./routes/sales/salesRoutes');
const salesOrderStepsRoutes = require('./routes/sales/salesOrderStepsRoutes');
const engineeringRoutes = require('./routes/engineering/engineeringRoutes');
const productionRoutes = require('./routes/production/productionRoutes');
const productionPhaseRoutes = require('./routes/production/productionPhaseRoutes');
const productionPlanRoutes = require('./routes/production/productionPlanRoutes');
const productionStageTaskRoutes = require('./routes/production/productionStageTaskRoutes');
const productionStageRoutes = require('./routes/production/productionStageRoutes');
const materialRoutes = require('./routes/inventory/materialRoutes');
const facilityRoutes = require('./routes/inventory/facilityRoutes');
const notificationRoutes = require('./routes/notifications/notificationRoutes');
const alertsRoutes = require('./routes/notifications/alertsRoutes');
const taskRoutes = require('./routes/production/taskRoutes');
const purchaseOrderRoutes = require('./routes/procurement/purchaseOrderRoutes');
const materialRequestRoutes = require('./routes/procurement/materialRequestRoutes');
const trackingRoutes = require('./routes/reports/trackingRoutes');
const employeeRoutes = require('./routes/employee/employeeRoutes');
const employeePortalRoutes = require('./routes/employee/employeePortalRoutes');
const procurementPortalRoutes = require('./routes/procurement/procurementPortalRoutes');
const inventoryPortalRoutes = require('./routes/inventory/inventoryPortalRoutes');
const qcPortalRoutes = require('./routes/qc/qcPortalRoutes');
const productionPortalRoutes = require('./routes/production/productionPortalRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});

app.use(limiter);

app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sales/steps', salesOrderStepsRoutes);
app.use('/api/engineering', engineeringRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/production/phases', productionPhaseRoutes);
app.use('/api/production/plans', productionPlanRoutes);
app.use('/api/production/stage-tasks', productionStageTaskRoutes);
app.use('/api/production/stages', productionStageRoutes);
app.use('/api/production/portal', productionPortalRoutes);
app.use('/api/inventory/materials', materialRoutes);
app.use('/api/inventory/facilities', facilityRoutes);
app.use('/api/inventory/portal', inventoryPortalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee/tasks', taskRoutes);
app.use('/api/employee/portal', employeePortalRoutes);
app.use('/api/procurement/purchase-orders', purchaseOrderRoutes);
app.use('/api/procurement/material-requests', materialRequestRoutes);
app.use('/api/procurement/portal', procurementPortalRoutes);
app.use('/api/qc/portal', qcPortalRoutes);
app.use('/api/tracking', trackingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Running database migrations...');
    await runMigrations();
    console.log('✅ Migrations completed successfully\n');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
