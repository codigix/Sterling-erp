# Outsourcing Task Processing Flow - Implementation Guide

## Overview

This document outlines the complete implementation of the Outsourcing Task Processing flow in the Sterling ERP system. This flow manages the process of outsourcing production phases to external vendors.

## Architecture

### Database Schema

#### 1. `outsourcing_tasks` Table
Stores information about outsourced production phases.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| production_plan_stage_id | INT | Foreign key to production_plan_stages |
| production_plan_id | INT | Foreign key to production_plans |
| project_id | INT | Foreign key to projects |
| root_card_id | INT | Foreign key to root_cards |
| product_name | VARCHAR(255) | Product name from Root Card |
| status | ENUM | pending, outward_challan_generated, inward_challan_generated, completed |
| selected_vendor_id | INT | Foreign key to vendors |
| assigned_department | VARCHAR(100) | Department handling the task (default: Production) |
| created_by | INT | Foreign key to users |
| created_at | TIMESTAMP | Task creation time |
| updated_at | TIMESTAMP | Last update time |

#### 2. `outward_challans` Table
Records materials sent to vendors.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| outsourcing_task_id | INT | Foreign key to outsourcing_tasks |
| challan_number | VARCHAR(100) | Unique challan identifier (format: OC-YYYYMMDD-XXXX) |
| vendor_id | INT | Foreign key to vendors |
| status | ENUM | draft, issued, received, cancelled |
| material_sent_date | DATE | Date materials were sent |
| expected_return_date | DATE | Expected return date |
| notes | TEXT | Additional notes |
| created_by | INT | Foreign key to users |
| created_at | TIMESTAMP | Challan creation time |
| updated_at | TIMESTAMP | Last update time |

#### 3. `outward_challan_items` Table
Line items for outward challans.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| outward_challan_id | INT | Foreign key to outward_challans |
| material_id | INT | Foreign key to inventory |
| quantity | DECIMAL(10,2) | Quantity sent |
| unit | VARCHAR(50) | Unit of measurement |
| remarks | TEXT | Item-level remarks |
| created_at | TIMESTAMP | Item creation time |
| updated_at | TIMESTAMP | Last update time |

#### 4. `inward_challans` Table
Records materials received back from vendors.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| outward_challan_id | INT | Foreign key to outward_challans |
| challan_number | VARCHAR(100) | Unique challan identifier (format: IC-YYYYMMDD-XXXX) |
| status | ENUM | draft, received, inspected, rejected |
| received_date | DATE | Date materials were received |
| received_by | INT | Foreign key to users |
| inspection_notes | TEXT | Quality inspection notes |
| quality_status | VARCHAR(50) | Quality assessment |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Challan creation time |
| updated_at | TIMESTAMP | Last update time |

#### 5. `inward_challan_items` Table
Line items for inward challans.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| inward_challan_id | INT | Foreign key to inward_challans |
| outward_challan_item_id | INT | Foreign key to outward_challan_items |
| material_id | INT | Foreign key to inventory |
| quantity_received | DECIMAL(10,2) | Quantity received |
| quantity_expected | DECIMAL(10,2) | Expected quantity |
| unit | VARCHAR(50) | Unit of measurement |
| quality_status | ENUM | accepted, rejected, pending_inspection |
| remarks | TEXT | Item-level remarks |
| created_at | TIMESTAMP | Item creation time |
| updated_at | TIMESTAMP | Last update time |

## Backend Implementation

### Models

Located in `backend/models/`:

1. **OutsourcingTask.js** - CRUD operations for outsourcing tasks
   - `create(data)` - Create new task
   - `findById(id)` - Fetch task with all details
   - `findByProductionPlanStageId(stageId)` - Get task by stage
   - `findByProductionPlanId(planId)` - Get tasks by plan
   - `findAll(filters)` - List tasks with filtering
   - `selectVendor(taskId, vendorId)` - Assign vendor
   - `updateStatus(id, status)` - Update task status
   - `delete(id)` - Remove task

2. **OutwardChallan.js** - Outward challan management
   - `create(data)` - Create challan with auto-generated number
   - `findById(id)` - Fetch challan with details
   - `findByOutsourcingTaskId(taskId)` - Get challans by task
   - `addItem(challanId, item)` - Add material line item
   - `getItems(challanId)` - Fetch all items for challan
   - `updateStatus(id, status)` - Change challan status
   - `update(id, data)` - Update challan details
   - `delete(id)` - Remove challan and items

3. **InwardChallan.js** - Inward challan management
   - `create(data)` - Create challan with auto-generated number
   - `findById(id)` - Fetch challan with details
   - `findByOutwardChallanId(outwardChallanId)` - Get inward challans
   - `addItem(challanId, item)` - Add received material
   - `getItems(challanId)` - Fetch all received items
   - `updateStatus(id, status)` - Change challan status
   - `updateItemStatus(itemId, qualityStatus)` - Set item quality
   - `delete(id)` - Remove challan and items

### Controller

Located in `backend/controllers/production/outsourcingController.js`:

#### Endpoints

**GET /api/production/outsourcing/tasks**
- List all outsourcing tasks
- Query filters: status, vendorId, productionPlanId
- Returns array of tasks with vendor details

**GET /api/production/outsourcing/tasks/:id**
- Fetch single task with all related data
- Returns task with outward and inward challans

**GET /api/production/outsourcing/tasks/production-stage/:stageId**
- Get outsourcing task for specific production stage
- Returns task if stage is outsourced

**POST /api/production/outsourcing/tasks/:taskId/select-vendor**
- Assign vendor to outsourcing task
- Body: { vendorId }
- Updates task with selected vendor

**GET /api/production/outsourcing/project/:projectId/materials**
- List materials available for project
- Returns inventory items for material selection

**POST /api/production/outsourcing/tasks/:taskId/outward-challan**
- Create outward challan with materials
- Body: { vendorId, materialSentDate, expectedReturnDate, notes, items[] }
- Updates task status to `outward_challan_generated`

**GET /api/production/outsourcing/outward-challan/:challanId**
- Fetch outward challan with line items
- Returns challan details and items list

**POST /api/production/outsourcing/outward-challan/:outwardChallanId/inward-challan**
- Create inward challan recording received materials
- Body: { receivedDate, qualityStatus, inspectionNotes, notes, items[] }
- Updates task status to `inward_challan_generated`

**GET /api/production/outsourcing/inward-challan/:challanId**
- Fetch inward challan with line items
- Returns challan details and received items

**POST /api/production/outsourcing/tasks/:taskId/complete**
- Mark outsourcing task as completed
- Updates task status to `completed`
- Marks associated production stage as complete

## Frontend Implementation

### Components

Located in `frontend/src/components/outsourcing/`:

#### OutsourcingTaskScreen.jsx
Main component displaying the complete workflow with step-by-step guide.

**Features:**
- Task details display (project, product, vendor)
- Step indicator showing workflow progress
- Status-driven UI showing available actions
- Responsive design with dark mode support

**Props:**
- `taskId` - The outsourcing task ID
- `onClose` - Callback when user closes modal
- `onTaskCompleted` - Callback when task is completed

#### VendorSelector.jsx
Component for selecting vendor for outsourcing.

**Features:**
- Display available vendors (outsourcing partners)
- Show vendor details (name, contact, category, rating)
- Vendor selection with confirmation
- Error handling

**Props:**
- `task` - Current task object
- `vendors` - Array of available vendors
- `onVendorSelected` - Callback after selection

#### OutwardChallanForm.jsx
Form for creating outward challan and selecting materials.

**Features:**
- Date pickers for material sent and expected return dates
- Material selector with project-filtered inventory
- Material line items with quantity and remarks
- Automatic challan number generation
- Form validation

**Props:**
- `task` - Current task object
- `materials` - Available materials for the project
- `onChallanCreated` - Callback after challan creation

#### InwardChallanForm.jsx
Form for creating inward challan and recording received materials.

**Features:**
- Auto-populate from outward challan items
- Quantity received vs expected comparison
- Quality status assessment per item
- Inspection notes and remarks
- Material quantity reconciliation

**Props:**
- `task` - Current task object
- `onChallanCreated` - Callback after challan creation

## Workflow Flow

### Step 1: Vendor Selection
```
Status: PENDING
┌─ User clicks "Select Vendor"
│  └─ Opens VendorSelector modal
│     └─ Displays list of outsourcing partner vendors
│        └─ User selects vendor
│           └─ API: POST /api/production/outsourcing/tasks/:taskId/select-vendor
│              └─ Task status remains PENDING
│                 └─ Move to Step 2
```

### Step 2: Outward Challan Creation
```
Status: PENDING (vendor selected)
┌─ User clicks "Create Outward Challan"
│  └─ Opens OutwardChallanForm
│     └─ Displays project materials for selection
│        └─ User selects materials and quantities
│           └─ User enters dates and notes
│              └─ Submits form
│                 └─ API: POST /api/production/outsourcing/tasks/:taskId/outward-challan
│                    └─ Create outward_challans record
│                       └─ Create outward_challan_items records
│                          └─ Update task status to OUTWARD_CHALLAN_GENERATED
│                             └─ Move to Step 3
```

### Step 3: Inward Challan Creation
```
Status: OUTWARD_CHALLAN_GENERATED
┌─ After material is processed by vendor
│  └─ User clicks "Generate Inward Challan"
│     └─ Opens InwardChallanForm
│        └─ Auto-populates from outward challan items
│           └─ User records received quantities
│              └─ User assesses quality per item
│                 └─ Submits form
│                    └─ API: POST /api/production/outsourcing/outward-challan/:outwardChallanId/inward-challan
│                       └─ Create inward_challans record
│                          └─ Create inward_challan_items records
│                             └─ Update task status to INWARD_CHALLAN_GENERATED
│                                └─ Move to Step 4
```

### Step 4: Task Completion
```
Status: INWARD_CHALLAN_GENERATED
┌─ User clicks "Swipe to Complete Task"
│  └─ SwipeButton interactive component
│     └─ User swipes left-to-right (80% threshold)
│        └─ API: POST /api/production/outsourcing/tasks/:taskId/complete
│           └─ Update task status to COMPLETED
│              └─ Mark production_plan_stage as completed
│                 └─ Task locked (read-only state)
```

## Task Status States

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| PENDING | Task created, waiting for vendor selection | Select Vendor |
| OUTWARD_CHALLAN_GENERATED | Materials sent to vendor, awaiting return | Generate Inward Challan |
| INWARD_CHALLAN_GENERATED | Materials received from vendor | Swipe to Complete |
| COMPLETED | Task finalized and locked | None (read-only) |

## API Integration

### Production Plan Stage Integration

When a production plan is created with an outsource phase:

1. Production plan stage is created with `stage_type = 'outsource'`
2. Outsourcing task is automatically created
3. Task inherits product_name from root_card
4. Task inherits project_id from production plan

### Employee Task Workflow

When an in-house phase completes and unlocks an outsource phase:

1. Production plan stage is unlocked
2. Outsourcing task becomes visible in production dashboard
3. Production department staff can access task details
4. Workflow begins

## Usage Example

### In Production Plan Creation:

```javascript
const stages = [
  {
    stageName: 'Manufacturing',
    stageType: 'in_house',
    assignedEmployeeId: 5,
    plannedStartDate: '2025-01-15',
    plannedEndDate: '2025-01-25'
  },
  {
    stageName: 'Heat Treatment',
    stageType: 'outsource',  // This triggers outsourcing task creation
    assignedVendorId: null,  // Will be selected during workflow
    plannedStartDate: '2025-01-26',
    plannedEndDate: '2025-02-05'
  }
];

// POST /api/production/plans
await createProductionPlan({
  salesOrderId: 1,
  rootCardId: 2,
  planName: 'Plan-001',
  stages: stages,
  ...otherData
});
// Outsourcing task is created automatically for outsource stages
```

### In Frontend Workflow:

```jsx
import OutsourcingTaskScreen from './components/outsourcing/OutsourcingTaskScreen';

function ProductionDashboard() {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <>
      {/* Task list showing outsource tasks */}
      {outsourceTasks.map(task => (
        <TaskCard 
          task={task}
          onClick={() => setSelectedTask(task)}
        />
      ))}

      {/* Workflow screen */}
      {selectedTask && (
        <OutsourcingTaskScreen
          taskId={selectedTask.id}
          onClose={() => setSelectedTask(null)}
          onTaskCompleted={() => {
            setSelectedTask(null);
            refetchTasks();
          }}
        />
      )}
    </>
  );
}
```

## Database Migrations

Run migrations in order:

1. **039_create_outsourcing_tasks_table.js** - Creates outsourcing_tasks table
2. **040_create_outward_challan_table.js** - Creates outward challan tables
3. **041_create_inward_challan_table.js** - Creates inward challan tables

Migrations are automatically executed on server startup via the migration runner.

## Testing Checklist

- [ ] Create production plan with outsource phase
- [ ] Verify outsourcing task is created
- [ ] Select vendor for task
- [ ] Create outward challan with materials
- [ ] Verify task status changes to OUTWARD_CHALLAN_GENERATED
- [ ] Create inward challan with received materials
- [ ] Verify task status changes to INWARD_CHALLAN_GENERATED
- [ ] Complete task with swipe gesture
- [ ] Verify task status changes to COMPLETED
- [ ] Verify production stage is marked as completed
- [ ] Test with multiple materials
- [ ] Test with quality rejection scenarios
- [ ] Test dark mode rendering
- [ ] Test responsive design on mobile
- [ ] Test error handling (invalid inputs, network failures)

## Security Considerations

1. **Role-based Access** - All endpoints require authentication and role validation
   - Admin, Management, Production roles required
   
2. **Data Validation** - All inputs validated on backend
   - Vendor existence checked before assignment
   - Material existence verified before adding to challan
   - Quantity validations performed
   
3. **Audit Trail** - All actions logged with user_id and timestamp
   - created_by field tracks task creator
   - updated_at tracks all modifications
   - Status transitions logged via status field

4. **Data Integrity** - Foreign keys enforced
   - Vendor cannot be deleted if assigned to active task
   - Tasks cannot be deleted if outward challan exists
   - Cascading deletes properly configured

## Future Enhancements

1. **Email Notifications** - Notify vendor when outward challan created
2. **QC Integration** - Link inward challan to quality check process
3. **Payment Processing** - Track vendor payments against challans
4. **Document Uploads** - Attach inspection reports to inward challan
5. **Analytics** - Track vendor performance, turnaround time, quality metrics
6. **Batch Operations** - Create multiple challenges in bulk
7. **Mobile App** - Mobile interface for on-the-go updates
8. **Barcode Scanning** - QR code scanning for material tracking
