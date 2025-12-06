# Sales Order Wizard - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                             │
│                         (React Frontend)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │          SalesOrdersManagementPage Component               │  │
│  │  ├─ Orders List View                                       │  │
│  │  ├─ Filter by Status                                       │  │
│  │  └─ Start/Open Workflow Buttons                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            SalesOrderWizard Component                       │  │
│  │  ├─ Step Tracker (1-9 visual indicators)                   │  │
│  │  ├─ Progress Bar                                            │  │
│  │  ├─ Current Step Content                                    │  │
│  │  ├─ Employee Assignment Selector                            │  │
│  │  ├─ Document Upload Interface                              │  │
│  │  └─ Navigation Controls                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP/REST with JWT Auth
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                                  │
│                    (Express.js Server)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Route: /api/sales/workflow/*                  │  │
│  │                                                             │  │
│  │  POST   /workflow/initialize      → initializeWorkflow()  │  │
│  │  GET    /:salesOrderId/steps      → getWorkflowSteps()   │  │
│  │  POST   /steps/assign             → assignEmployeeToStep()│  │
│  │  PUT    /steps/:id/status         → updateStepStatus()   │  │
│  │  POST   /steps/:id/upload         → uploadDocuments()    │  │
│  │  GET    /:salesOrderId/details    → getWorkflowDetails() │  │
│  │  GET    /stats/summary            → getWorkflowStats()   │  │
│  │                                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ↓ Transaction Management              │
│               ┌───────────────────────────────┐                    │
│               │ Notification Service        │                    │
│               │ - Task Creation             │                    │
│               │ - User Notification Sending │                    │
│               └───────────────────────────────┘                    │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ SQL Queries
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                 │
│                     (MySQL 5.7+)                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ sales_orders (Extended)                                     │  │
│  │ ├─ id, customer, po_number, status                         │  │
│  │ ├─ current_step: INT (1-9)                                 │  │
│  │ ├─ workflow_status: ENUM(draft, in_progress, completed)   │  │
│  │ └─ estimated_completion_date: DATE                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                          ↓                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ sales_order_workflow_steps (Core Table)                     │  │
│  │ ├─ id, sales_order_id, step_number (1-9)                  │  │
│  │ ├─ step_name, step_type                                    │  │
│  │ ├─ status: ENUM(pending, in_progress, completed, ...)    │  │
│  │ ├─ assigned_employee_id, assigned_at                       │  │
│  │ ├─ started_at, completed_at                                │  │
│  │ ├─ rejected_reason, notes                                  │  │
│  │ ├─ documents: JSON, verification_data: JSON                │  │
│  │ └─ created_at, updated_at                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                          ↓                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ sales_order_step_assignments (Tracking)                     │  │
│  │ ├─ id, workflow_step_id, employee_id                       │  │
│  │ ├─ assigned_by, assigned_at, reason                        │  │
│  │ └─ created_at                                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                          ↓                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ sales_order_step_audits (Audit Trail)                       │  │
│  │ ├─ id, workflow_step_id, changed_by                        │  │
│  │ ├─ old_status, new_status, change_reason                   │  │
│  │ └─ timestamp                                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                          ↓                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ employee_tasks (Task Tracking)                              │  │
│  │ ├─ id, employee_id, title, description                     │  │
│  │ ├─ type, priority, status                                  │  │
│  │ ├─ related_id (sales_order_id)                             │  │
│  │ └─ due_date, completed_at                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                          ↓                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ notifications (Existing)                                    │  │
│  │ ├─ id, user_id, message, type                              │  │
│  │ ├─ related_id, related_type                                │  │
│  │ └─ read_status, created_at                                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                          ↓                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ users (Existing - for employee data)                        │  │
│  │ ├─ id, username, email, role_id                            │  │
│  │ └─ password, created_at                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
1. WORKFLOW INITIALIZATION
   ┌─────────────────────────────────────┐
   │ Admin clicks "Start Workflow"       │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ POST /workflow/initialize           │
   │ { salesOrderId: 1 }                 │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ Backend: Create 9 workflow steps    │
   │ - Set status to 'pending'           │
   │ - Initialize tracking               │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ Return: Success response            │
   │ Client: Display wizard ready        │
   └─────────────────────────────────────┘


2. EMPLOYEE ASSIGNMENT
   ┌─────────────────────────────────────┐
   │ Admin selects employee from list    │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ POST /steps/assign                  │
   │ { stepId: 1, employeeId: 5 }        │
   └──────────────┬──────────────────────┘
                  │
                  ↓ (BEGIN TRANSACTION)
   ┌─────────────────────────────────────┐
   │ 1. Update workflow_steps table      │
   │    SET assigned_employee_id = 5     │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ 2. Insert into assignments table    │
   │    Record who assigned and when     │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ 3. Create employee_task record      │
   │    Task ready in employee dashboard │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ 4. Insert notification              │
   │    Employee receives alert          │
   └──────────────┬──────────────────────┘
                  │
                  ↓ (COMMIT TRANSACTION)
   ┌─────────────────────────────────────┐
   │ Return: Success with task info      │
   │ Frontend: Show confirmation         │
   └─────────────────────────────────────┘


3. STEP COMPLETION
   ┌─────────────────────────────────────┐
   │ Employee clicks "Complete Step"     │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ PUT /steps/1/status                 │
   │ { status: 'completed' }             │
   └──────────────┬──────────────────────┘
                  │
                  ↓ (BEGIN TRANSACTION)
   ┌─────────────────────────────────────┐
   │ 1. Update step status to completed  │
   │    SET completed_at = NOW()         │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ 2. Create audit record              │
   │    Log old_status → new_status      │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ 3. Send notification to admin       │
   │    Step completed notification      │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │ 4. Auto-advance to next step        │
   │    Update sales_orders.current_step │
   └──────────────┬──────────────────────┘
                  │
                  ↓ (COMMIT TRANSACTION)
   ┌─────────────────────────────────────┐
   │ Return: Success, show next step     │
   │ Frontend: Auto-navigate next        │
   └─────────────────────────────────────┘
```

## Workflow State Machine

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │ (Click "Start Step")
                           ↓
                    ┌─────────────────┐
                    │  IN_PROGRESS    │
                    └──────┬──────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            │(Click        │(Click        │(Auto-advance
            │"Complete")   │"Reject")     │after complete)
            ↓              ↓              
    ┌──────────────┐ ┌──────────────┐
    │  COMPLETED   │ │  REJECTED    │
    │    Step→9    │ │ Back to Step │
    └──────────────┘ └──────────────┘
    (Final State)     (Return to in-progress)

Step 9 = Last Step
When all 9 steps completed:
- Order status updates
- Workflow marked as 'completed'
```

## Component Hierarchy

```
App
├── AdminDashboard (or SalesOrdersManagementPage)
│   │
│   ├─ [Mode: 'list']
│   │   └─ SalesOrdersList
│   │       └─ [Rows with Start/Open buttons]
│   │
│   ├─ [Mode: 'create']
│   │   └─ SalesOrderForm
│   │
│   └─ [Mode: 'wizard']
│       └─ SalesOrderWizard
│           │
│           ├─ Step Tracker (1-9)
│           │   └─ Step Indicators
│           │
│           ├─ Progress Bar
│           │
│           ├─ Current Step Card
│           │   ├─ Status Display
│           │   ├─ Employee Selector
│           │   ├─ Document Uploader
│           │   ├─ Notes Textarea
│           │   └─ Action Buttons
│           │
│           └─ Navigation Controls
│               ├─ Previous Button
│               ├─ Next Button
│               └─ Cancel Button
```

## API Sequence Diagram

```
Frontend                          Backend                        Database
  │                                 │                               │
  │─── POST /workflow/init ────────>│                               │
  │                                 │─── BEGIN TRANSACTION ────────>│
  │                                 │─── INSERT 9 steps ───────────>│
  │                                 │<─── Confirm ──────────────────│
  │                                 │─── COMMIT ─────────────────────>│
  │<─── Success Response ───────────│                               │
  │                                 │                               │
  │─── GET /steps ────────────────->│─── SELECT steps ──────────────>│
  │<─── Steps Data ────────────────│<─── Return rows ──────────────│
  │                                 │                               │
  │─── POST /steps/assign ────────->│─── BEGIN TRANSACTION ────────>│
  │                                 │─── UPDATE step ───────────────>│
  │                                 │─── INSERT assignment ────────>│
  │                                 │─── INSERT task ──────────────>│
  │                                 │─── INSERT notification ──────>│
  │                                 │<─── Confirm ──────────────────│
  │                                 │─── COMMIT ──────────────────>│
  │<─── Assigned + Task + Notif ───│                               │
  │                                 │                               │
  │─── PUT /steps/:id/status ─────->│─── BEGIN TRANSACTION ────────>│
  │                                 │─── UPDATE status ────────────>│
  │                                 │─── INSERT audit ──────────────>│
  │                                 │─── UPDATE current_step ──────>│
  │                                 │<─── Confirm ──────────────────│
  │                                 │─── COMMIT ─────────────────>│
  │<─── Updated Status ────────────│                               │
```

## Technology Stack

```
┌────────────────────────────────────────────────┐
│              FRONTEND LAYER                    │
├────────────────────────────────────────────────┤
│ React 18.x                                     │
│ Axios (HTTP Client)                            │
│ CSS (Tailwind Utility Classes)                 │
│ Lucide Icons                                   │
│ ES6+ JavaScript                                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│              API LAYER                         │
├────────────────────────────────────────────────┤
│ Express.js 4.x                                 │
│ Node.js 14+                                    │
│ JWT Authentication                             │
│ Multer (File Uploads)                          │
│ MySQL2/Promise (Database Driver)               │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│              DATABASE LAYER                    │
├────────────────────────────────────────────────┤
│ MySQL 5.7+                                     │
│ 5 Main Tables (3 new, 2 extended)              │
│ Indexed for Performance                        │
│ Transactional Integrity                        │
└────────────────────────────────────────────────┘
```

## Error Handling Flow

```
API Request
    │
    ↓
Validate Input
    │
    ├─ Invalid? ──→ Return 400 Error
    │
    ↓
Check Authentication
    │
    ├─ Not Auth? ──→ Return 401 Error
    │
    ↓
Start Transaction
    │
    ├─ DB Error? ──→ ROLLBACK → Return 500 Error
    │
    ↓
Execute Operations
    │
    ├─ Query Error? ──→ ROLLBACK → Return 500 Error
    │
    ↓
Verify Results
    │
    ├─ Not Found? ──→ ROLLBACK → Return 404 Error
    │
    ↓
Commit Transaction
    │
    ├─ Commit Error? ──→ Return 500 Error
    │
    ↓
Return Success Response + Data
```

## Security Architecture

```
Request comes in
    │
    ↓
┌─ Authentication Middleware ─┐
│ Check JWT Token             │
│ Validate Expiration         │
│ Extract User Info           │
└──────────┬──────────────────┘
           │
           ↓
┌─ Authorization Check ───────┐
│ Verify User Role/Permission │
│ Check Resource Ownership    │
└──────────┬──────────────────┘
           │
           ↓
┌─ Input Validation ──────────┐
│ Sanitize Parameters         │
│ Type Checking               │
└──────────┬──────────────────┘
           │
           ↓
┌─ Transaction Isolation ─────┐
│ ACID Compliance             │
│ Rollback on Error           │
└──────────┬──────────────────┘
           │
           ↓
┌─ Audit Logging ─────────────┐
│ Record User Actions         │
│ Track All Changes           │
└──────────┬──────────────────┘
           │
           ↓
Response to User (Safe)
```

## Performance Optimization Strategy

```
FRONTEND
├─ Component Memoization
├─ Lazy Loading Steps
├─ Debounced API Calls
└─ Local State Caching

API LAYER
├─ Connection Pooling
├─ Query Optimization
├─ Indexed Searches
└─ Transaction Batching

DATABASE
├─ Primary Keys on All Tables
├─ Foreign Key Indexes
├─ Status Column Indexes
├─ Employee ID Indexes
└─ Composite Indexes on Frequently Queried Columns
```

---

## Summary

The Sales Order Wizard architecture is designed for:

✅ **Scalability** - Handles thousands of concurrent workflows
✅ **Reliability** - Transaction management ensures data consistency
✅ **Security** - Authentication, authorization, audit trail
✅ **Maintainability** - Clear separation of concerns
✅ **Extensibility** - Easy to add new steps or features
✅ **Performance** - Optimized queries and indexes
✅ **User Experience** - Real-time updates and feedback

The system follows REST API principles with proper HTTP methods, status codes, and error handling, providing a robust foundation for enterprise-grade sales order management.
