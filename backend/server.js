const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import migration runner
const { runMigrations } = require('./utils/migrationRunner');
const emailMonitorService = require('./services/emailMonitorService');

const authRoutes = require('./routes/auth/authRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const rootCardRoutes = require('./routes/root-cards/rootCardRoutes');
const rootCardStepsRoutes = require('./routes/root-cards/rootCardStepsRoutes');
const engineeringRoutes = require('./routes/engineering/engineeringRoutes');
const productionRoutes = require('./routes/production/productionRoutes');
const productionPhaseRoutes = require('./routes/production/productionPhaseRoutes');
const productionPhaseMasterRoutes = require('./routes/production/productionPhaseMasterRoutes');
const productionPlanRoutes = require('./routes/production/productionPlanRoutes');
const workOrderRoutes = require('./routes/production/workOrderRoutes');
const workstationRoutes = require('./routes/production/workstationRoutes');
const productionStageTaskRoutes = require('./routes/production/productionStageTaskRoutes');
const productionStageRoutes = require('./routes/production/productionStageRoutes');
const materialRoutes = require('./routes/inventory/materialRoutes');
const itemGroupRoutes = require('./routes/inventory/itemGroupRoutes');
const facilityRoutes = require('./routes/inventory/facilityRoutes');
const vendorRoutes = require('./routes/inventory/vendorRoutes');
const quotationRoutes = require('./routes/inventory/quotationRoutes');
const grnRoutes = require('./routes/inventory/grnRoutes');
const notificationRoutes = require('./routes/notifications/notificationRoutes');
const alertsRoutes = require('./routes/notifications/alertsRoutes');
const taskRoutes = require('./routes/production/taskRoutes');
const purchaseOrderRoutes = require('./routes/inventory/purchaseOrderRoutes');
const materialRequestRoutes = require('./routes/inventory/materialRequestRoutes');
const trackingRoutes = require('./routes/reports/trackingRoutes');
const employeeRoutes = require('./routes/employee/employeeRoutes');
const employeePortalRoutes = require('./routes/employee/employeePortalRoutes');
const procurementPortalRoutes = require('./routes/inventory/procurementInventoryPortalRoutes');
const inventoryPortalRoutes = require('./routes/inventory/inventoryPortalRoutes');
const rootCardInventoryTaskRoutes = require('./routes/inventory/rootCardInventoryTaskRoutes');
const qcPortalRoutes = require('./routes/qc/qcPortalRoutes');
const productionPortalRoutes = require('./routes/production/productionPortalRoutes');
const departmentPortalRoutes = require('./routes/department/departmentPortalRoutes');
const outsourcingRoutes = require('./routes/production/outsourcingRoutes');
const comprehensiveBOMRoutes = require('./routes/engineering/comprehensiveBOMRoutes');
const salesManagementRoutes = require('./routes/sales/salesManagementRoutes');
const customerRoutes = require('./routes/sales/customerRoutes');
const warehouseRoutes = require('./routes/inventory/warehouseRoutes');
const stockEntryRoutes = require('./routes/inventory/stockEntryRoutes');
const designEngineerDocumentsRoutes = require('./routes/design-engineer/designEngineerDocumentsRoutes');
const fileDownloadRoutes = require('./routes/files/fileDownloadRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://sterlingerp.codigix.co'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/root-cards', rootCardRoutes);
app.use('/api/root-cards/steps', rootCardStepsRoutes);
app.use('/api/engineering/bom/comprehensive', comprehensiveBOMRoutes);
app.use('/api/engineering', engineeringRoutes);
app.use('/api/production/plans', productionPlanRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/production/phases', productionPhaseRoutes);
app.use('/api/production/phases-master', productionPhaseMasterRoutes);
app.use('/api/production/work-orders', workOrderRoutes);
app.use('/api/production/workstations', workstationRoutes);
app.use('/api/production/stage-tasks', productionStageTaskRoutes);
app.use('/api/production/stages', productionStageRoutes);
app.use('/api/production/portal', productionPortalRoutes);
app.use('/api/production/outsourcing', outsourcingRoutes);
app.use('/api/inventory/materials', materialRoutes);
app.use('/api/inventory/item-groups', itemGroupRoutes);
app.use('/api/inventory/facilities', facilityRoutes);
app.use('/api/inventory/vendors', vendorRoutes);
app.use('/api/inventory/quotations', quotationRoutes);
app.use('/api/inventory/grns', grnRoutes);
app.use('/api/inventory/portal', inventoryPortalRoutes);
app.use('/api/inventory/root-card-tasks', rootCardInventoryTaskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee/tasks', taskRoutes);
app.use('/api/employee/portal', employeePortalRoutes);
app.use('/api/inventory/purchase-orders', purchaseOrderRoutes);
app.use('/api/inventory/material-requests', materialRequestRoutes);
app.use('/api/inventory/procurement-portal', procurementPortalRoutes);
app.use('/api/qc/portal', qcPortalRoutes);
app.use('/api/department/portal', departmentPortalRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/sales/management', salesManagementRoutes);
app.use('/api/sales/customers', customerRoutes);
app.use('/api/inventory/warehouses', warehouseRoutes);
app.use('/api/inventory/stock-entries', stockEntryRoutes);
app.use('/api/design-engineer/documents', designEngineerDocumentsRoutes);
app.use('/api/files', fileDownloadRoutes);

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
    // Run migrations in background to prevent blocking server start
    setTimeout(async () => {
      try {
        console.log('Running database migrations in background...');
        await runMigrations();
        console.log('✅ Migrations completed successfully');
      } catch (migrationError) {
        console.error('❌ Background Migration failed:', migrationError.message);
      }
    }, 1000);

    // Start Email Monitor
    emailMonitorService.start();

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
