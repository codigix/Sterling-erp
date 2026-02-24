# Commands

## Frontend
- Lint: `npm run lint`
- Dev: `npm run dev`

## Backend

### Database Setup
- Setup demo users: `npm run setup-demo`
- Initialize database: `node backend/initDb.js`

### Database Verification Tools
- Verify all database tables exist: `node backend/verify-db-tables.js`
- Check data persistence for a sales order: `node backend/verify-data-persistence.js <salesOrderId>`
- Test all Root Card Wizard API endpoints: `node backend/test-api-endpoints.js <salesOrderId> [authToken]`

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

## Root Card Wizard Data Persistence

### Step-by-Step Data Flow
1. **Step 1**: Client PO Details & Product Details → `client_po_details` table
2. **Step 2**: Design Engineering → `design_engineering_details` table
3. **Step 3**: Material Requirements → `material_requirements_details` table
4. **Step 4**: Production Plan → `production_plan_details` table
5. **Step 5**: Quality Check → `quality_check_details` table
6. **Step 6**: Shipment → `shipment_details` table
7. **Step 7**: Delivery → `delivery_details` table

### Auto-Created Resources
- Root Card: Created automatically in `root_cards` table
- Project: Created automatically in `projects` table

### Advanced Field Validation
- Validate all fields per step: `node backend/validate-step-fields.js <salesOrderId>`
- Validate specific step: `node backend/validate-step-fields.js <salesOrderId> <stepNumber>`
- Comprehensive form data verification: `node backend/comprehensive-form-data-verification.js <salesOrderId>`
- Examples:
  ```bash
  node backend/validate-step-fields.js 5        # Check all steps for SO#5
  node backend/validate-step-fields.js 5 1      # Check only Step 1 for SO#5
  node backend/comprehensive-form-data-verification.js 5        # Full verification for SO#5
  node backend/comprehensive-form-data-verification.js 5 2      # Check Step 2 only
  ```

### File Path Recovery (for legacy uploads)
- **Automatic Recovery**: Old files (uploaded before path storage) are automatically recovered
- The system searches for files by name in the upload directory when fetching documents
- No manual migration needed - old files will work immediately when viewed/downloaded
- Backdrop blur effect enhanced for better modal appearance

### Documentation Files

**Quick Start:**
- **Step-by-Step Verification**: `STEP_BY_STEP_DATA_VERIFICATION.md` - Complete guide for verifying each form step
- **Data Storage Checklist**: `DATA_STORAGE_CHECKLIST.md` - Visual checklist for testing all 8 steps

**Detailed Reference:**
- **Form Field Mapping**: `FORM_FIELD_TO_DATABASE_MAPPING.md` - Every form field → database column mapping
- **Complete Data Flow**: `COMPLETE_DATA_FLOW_VERIFICATION.md` - Full system architecture and verification
- **Field-by-Field Mapping**: `FIELD_BY_FIELD_DB_MAPPING.md` - Original comprehensive mapping document
- **Data Persistence Guide**: `DATA_PERSISTENCE_CHECKLIST.md` - Step-by-step verification guide
- **Troubleshooting Guide**: `ROOT_CARD_DATA_FIX.md` - Common issues and solutions
