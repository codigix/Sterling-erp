# Sales Order Wizard Implementation Guide

## Overview

A comprehensive 9-step sales order workflow system with employee task assignment and automatic notifications.

## Features

### 1. **9-Step Workflow Tracker**
   - **Step 1**: PO Details - Basic purchase order information
   - **Step 2**: Sales Details - Sales and client information
   - **Step 3**: Documents Upload & Verification - PO documents and verification
   - **Step 4**: Designs Upload & Verification - Design documents and verification
   - **Step 5**: Material Request & Verification - Material requirements
   - **Step 6**: Production Plan & Verification - Production planning details
   - **Step 7**: Quality Check & Verification - QC process and verification
   - **Step 8**: Shipment & Update - Shipping details
   - **Step 9**: Delivered - Final delivery confirmation

### 2. **Visual Progress Tracking**
   - Progress bar showing workflow completion percentage
   - Step indicator with status badges (pending, in-progress, completed)
   - Current step/Total steps counter

### 3. **Employee Assignment**
   - Assign employees to each workflow step
   - Automatic task creation in employee dashboard
   - Instant notifications to assigned employees
   - Assignment history and audit trail

### 4. **Document Management**
   - Upload documents for each step
   - Document tracking and storage
   - Verification data recording

### 5. **Status Management**
   - Start step/In Progress transition
   - Complete step with verification
   - Reject step with reason
   - On-hold state for pausing

## Database Schema

### Key Tables

#### `sales_order_workflow_steps`
- Tracks individual workflow steps for each sales order
- Stores step status, assignments, timestamps
- Maintains audit information

#### `sales_order_step_assignments`
- Records employee assignments to workflow steps
- Tracks who assigned the employee and when
- Stores assignment reason

#### `sales_order_step_audits`
- Complete audit trail of all status changes
- Records old/new status and change reason
- Timestamps all modifications

#### `employee_tasks`
- Tasks created for employees from workflow assignments
- Tracks task status and completion
- Links back to sales order

#### Sales Orders Extended Columns
- `current_step`: Current workflow step number (1-9)
- `workflow_status`: Overall workflow status (draft, in_progress, completed, on_hold, cancelled)
- `estimated_completion_date`: Expected completion date

## API Endpoints

### Workflow Management
```
POST   /api/sales/workflow/initialize
       - Initialize workflow for a sales order
       - Payload: { salesOrderId }

GET    /api/sales/workflow/:salesOrderId/steps
       - Get all workflow steps for an order
       
GET    /api/sales/workflow/:salesOrderId/details
       - Get detailed workflow info with audit history
       
GET    /api/sales/workflow/stats/summary
       - Get workflow statistics across all orders
```

### Step Management
```
POST   /api/sales/workflow/steps/assign
       - Assign employee to a step
       - Payload: { stepId, employeeId, reason }

PUT    /api/sales/workflow/steps/:stepId/status
       - Update step status
       - Payload: { status, rejectionReason, verificationData, notes }

POST   /api/sales/workflow/steps/:stepId/upload
       - Upload documents for a step
       - Form data: files (multipart)
```

## Frontend Components

### SalesOrderWizard Component
**Location**: `frontend/src/components/sales/SalesOrderWizard.jsx`

Main wizard component with:
- Step progress tracker with visual indicators
- Current step content display
- Employee assignment selector
- Document upload interface
- Step navigation (Next/Previous)
- Status controls (Start/Complete/Reject)

#### Props
- `salesOrderId` (number): ID of the sales order
- `onComplete` (function): Callback when workflow completes
- `onCancel` (function): Callback to exit wizard

#### State Management
- `currentStep`: Active step (1-9)
- `workflowSteps`: All steps data from API
- `employees`: List of employees for assignment
- `stepData`: Form data for current step

### SalesOrdersManagementPage
**Location**: `frontend/src/pages/admin/SalesOrdersManagementPage.jsx`

Full-featured management page with:
- Sales order listing with filters
- Quick access to start/view workflows
- Progress visualization
- Order summary statistics
- Create new sales order form
- Integrated workflow wizard

## Usage Flow

### For Admin/Manager:

1. **Navigate to Sales Orders**
   - Go to `/admin/sales-orders` (or navigate via sidebar)

2. **Create New Sales Order** (Optional)
   - Click "New Sales Order" button
   - Fill in basic order details
   - Save order

3. **Start Workflow**
   - Click "Start" button next to the order
   - Workflow initializes with all 9 steps

4. **Assign Employees**
   - In each step, select an employee from dropdown
   - Employee receives notification automatically
   - Task appears in their dashboard

5. **Navigate Steps**
   - Use Next/Previous buttons
   - View step progress in tracker
   - Add notes for each step

6. **Update Status**
   - "Start Step" - Move to in-progress
   - "Complete Step" - Mark as done (moves to next step)
   - Can view completed steps' details

### For Employee:

1. **Receive Task Assignment**
   - Get notification: "You have been assigned to: [Step Name]"
   - Task appears in employee dashboard

2. **Access Task**
   - View task details
   - Click to open workflow step

3. **Complete Step**
   - Upload required documents (for document steps)
   - Add notes if needed
   - Click "Complete Step" when done

4. **Receive Status Updates**
   - Notified when step is rejected
   - Can see step completion confirmation

## Step Details

### Step 1: PO Details
- **Assignee**: PO Coordinator
- **Task**: Verify PO information
- **Documents**: PO copy, authorization

### Step 2: Sales Details
- **Assignee**: Sales Manager
- **Task**: Confirm sales details with client
- **Documents**: Sales agreement, pricing confirmation

### Step 3: Documents Upload & Verification
- **Assignee**: Document Manager
- **Task**: Upload and verify PO documentation
- **Documents**: All PO-related files

### Step 4: Designs Upload & Verification
- **Assignee**: Design Lead
- **Task**: Upload design files and verify
- **Documents**: CAD files, drawings, specifications

### Step 5: Material Request
- **Assignee**: Procurement Lead
- **Task**: Process material requests
- **Documents**: BOM, material list, specifications

### Step 6: Production Plan
- **Assignee**: Production Manager
- **Task**: Create and verify production plan
- **Documents**: Schedule, resource allocation, timeline

### Step 7: Quality Check
- **Assignee**: QC Supervisor
- **Task**: Setup and verify QC processes
- **Documents**: QC plan, inspection checklist

### Step 8: Shipment & Update
- **Assignee**: Logistics Coordinator
- **Task**: Plan and update shipment
- **Documents**: Shipping details, courier info

### Step 9: Delivered
- **Assignee**: Customer Success
- **Task**: Confirm delivery and close order
- **Documents**: Delivery confirmation, feedback

## Notifications

### Automatic Notifications Sent For:

1. **Task Assignment**
   - Trigger: Employee assigned to step
   - Message: "You have been assigned to: [Step Name] for Sales Order #[ID]"

2. **Status Update**
   - Trigger: Step status changes
   - Message: "Status updated to [status] for step: [Step Name]"

3. **Rejection**
   - Trigger: Step is rejected
   - Priority: High
   - Message: "Your step was rejected with reason: [reason]"

## Database Migrations

### Applied Migrations:

1. **002_sales_order_workflow.js**
   - Creates workflow steps table
   - Creates assignments and audit tables
   - Adds columns to sales_orders table

2. **003_employee_tasks_table.js**
   - Creates employee_tasks table
   - Tracks tasks assigned to employees

**To apply migrations:**
```bash
cd backend
node migrations/002_sales_order_workflow.js
node migrations/003_employee_tasks_table.js
```

## Integration Points

### With Existing Systems:

1. **Employee System**
   - Uses existing users table
   - Creates tasks in employee_tasks table
   - Sends notifications via Notification model

2. **Sales Order System**
   - Extends existing sales_orders table
   - Maintains backward compatibility
   - Adds workflow tracking columns

3. **Notification System**
   - Uses existing Notification model
   - Creates automatic notifications on assignments
   - Tracks notification types

## Error Handling

### Transaction Management
- Uses database transactions for data consistency
- Rollback on errors to maintain integrity
- Graceful error messages to UI

### File Upload
- Multer configured for document uploads
- Stored in `backend/uploads/sales-orders/documents/`
- File metadata tracked in database

### Validation
- Step validation before advancing
- Employee verification before assignment
- Status validation for transitions

## Performance Optimizations

1. **Indexed Database Fields**
   - `sales_order_id` for fast lookups
   - `assigned_employee_id` for assignment tracking
   - `status` for filtering

2. **Async Operations**
   - Parallel employee data fetching
   - Non-blocking notifications
   - Efficient workflow queries

3. **Caching Considerations**
   - Employee list cached in component
   - Workflow steps cached with refresh capability
   - Status updates prompt real-time refresh

## Security Features

1. **Authentication**
   - All endpoints require authentication
   - JWT token validation

2. **Authorization**
   - Admin role required for creating/managing workflows
   - Employee can only view own tasks

3. **Data Protection**
   - Audit trail of all changes
   - Change reason tracking
   - User identification on all modifications

## Troubleshooting

### Workflow Not Initializing
- Check sales order exists
- Verify user has admin role
- Check database connection

### Notifications Not Appearing
- Verify user ID is correct
- Check notification table for errors
- Ensure employee is in users table

### Document Upload Failures
- Check upload directory permissions
- Verify multer configuration
- Check disk space

### Assignment Issues
- Verify employee exists in users table
- Check workflow step exists
- Ensure sales order is in workflow

## Future Enhancements

1. **Batch Operations**
   - Bulk assign employees to same step across orders
   - Batch status updates

2. **Advanced Filtering**
   - Filter by step status
   - Filter by assigned employee
   - Date range filtering

3. **Reporting**
   - Workflow completion times
   - Employee assignment statistics
   - Step bottleneck analysis

4. **Automation**
   - Auto-assignment based on rules
   - Automatic step progression
   - Scheduled notifications

5. **Mobile Support**
   - Mobile-responsive wizard
   - Mobile notifications
   - Offline capability

## Support & Maintenance

For issues or questions:
1. Check the audit trail for step history
2. Review notifications for assignment status
3. Verify database schema matches migrations
4. Check backend logs for errors

---

**Last Updated**: 2025-12-03
**Version**: 1.0
