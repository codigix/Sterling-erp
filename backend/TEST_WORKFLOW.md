# Complete Sales Order to Task Assignment Workflow Test

## Overview
This document describes the complete workflow of how a sales order automatically creates and assigns tasks to department workers when the status changes.

## Step-by-Step Workflow

### Step 1: Create Sales Order
1. Navigate to `http://localhost:5173/admin/sales-orders`
2. Click "New Order" button
3. Fill in:
   - **Client Name**: "ABC Corporation"
   - **PO Number**: "PO-2025-001"
   - **Order Date**: Today
   - **Due Date**: 2 weeks from now
   - **Total Amount**: 500000
   - Add at least one line item
4. Click "Create" button

**API Call**:
```
POST /api/sales/orders
{
  "clientName": "ABC Corporation",
  "poNumber": "PO-2025-001",
  "orderDate": "2025-12-18",
  "dueDate": "2026-01-01",
  "total": 500000,
  "priority": "high",
  "items": [{...}],
  "status": "pending"
}
```

### Step 2: Create Root Card with Manufacturing Stages
1. Navigate to Production → Root Cards
2. Create a new root card for the sales order's project:
   - **Title**: "Manufacturing Plan for PO-2025-001"
   - **Project**: Select the project linked to your sales order
3. Add Manufacturing Stages:
   - **Stage 1**: "Material Preparation"
     - **Type**: In-house
     - **Assigned Worker**: Select a worker (e.g., Worker A)
   - **Stage 2**: "Welding & Fabrication"
     - **Type**: In-house
     - **Assigned Worker**: Select a different worker (e.g., Worker B)
   - **Stage 3**: "Quality Check"
     - **Type**: In-house
     - **Assigned Worker**: Select another worker (e.g., Worker C)
4. Save the root card

**Database State After This**:
- `root_cards`: 1 new record
- `manufacturing_stages`: 3 new records (one for each stage)

### Step 3: Change Sales Order Status to "Ready to Start"
1. Go back to `http://localhost:5173/admin/sales-orders`
2. Find your sales order in the list
3. Click the status dropdown (currently shows "Pending")
4. Select "Ready to Start"
5. The status will update

**API Call**:
```
PATCH /api/sales/orders/1/status
{
  "status": "ready_to_start"
}
```

**What Happens Automatically** ✨:
- Backend receives the status change
- Checks the trigger condition: `status = 'ready_to_start'` → TRUE
- Calls `assignTasksFromRootCard(1)` function
- Finds the project linked to sales order
- Finds the root card in that project
- Finds all manufacturing stages with assigned workers
- **Creates 3 worker tasks**:
  - Task 1: "Material Preparation - Sales Order #1" → Worker A
  - Task 2: "Welding & Fabrication - Sales Order #1" → Worker B
  - Task 3: "Quality Check - Sales Order #1" → Worker C

**Database State After This**:
- `worker_tasks`: 3 new records (one for each manufacturing stage with assigned worker)

**Console Output**:
```
[TaskAssignment] Task created - Stage: Material Preparation, Worker: 1, Sales Order: 1
[TaskAssignment] Task created - Stage: Welding & Fabrication, Worker: 2, Sales Order: 1
[TaskAssignment] Task created - Stage: Quality Check, Worker: 3, Sales Order: 1
```

### Step 4: Workers See Tasks in Dashboard
1. **Worker A** logs in (User ID: 1)
2. Navigates to "My Tasks" in the dashboard
3. Sees the task:
   - **Title**: "Material Preparation - Sales Order #1"
   - **Status**: Pending
   - **Root Card Info**: "Manufacturing Plan for PO-2025-001"
   - **Stage**: "Material Preparation"
   - **Project**: Project name and code
   - **Sales Order Info**:
     - PO Number: PO-2025-001
     - Customer: ABC Corporation
     - Order Amount: ₹5,00,000
     - Due Date: 01/01/2026

4. The same task is visible for **Worker B** and **Worker C** with their respective stage information

**API Call (Frontend)**:
```
GET /api/employee/portal/tasks/1
```

**Response Format**:
```json
[
  {
    "id": 1,
    "taskId": 1,
    "title": "Material Preparation - Sales Order #1",
    "description": "Manufacturing Plan for PO-2025-001",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-01-01",
    "stageName": "Material Preparation",
    "stageId": 1,
    "rootCard": {
      "id": 1,
      "title": "Manufacturing Plan for PO-2025-001",
      "priority": "high"
    },
    "project": {
      "id": 1,
      "name": "ABC Corporation Project",
      "code": "PROJ-001"
    },
    "salesOrder": {
      "id": 1,
      "poNumber": "PO-2025-001",
      "customer": "ABC Corporation",
      "total": 500000,
      "orderDate": "2025-12-18",
      "dueDate": "2026-01-01"
    },
    "createdAt": "2025-12-18T10:30:00Z"
  }
]
```

### Step 5: Task Progress Updates
Workers can:
1. Click the task card
2. Update status: Pending → In Progress → Completed
3. View complete information about what they're working on

## Automatic Status Triggers

Tasks are automatically assigned when sales order status changes to:
- ✅ `assigned`
- ✅ `ready_to_start`
- ✅ `approved`
- ✅ `in_progress`

## Manual Task Assignment

If you want to manually trigger task assignment for an existing sales order:

```
POST /api/sales/orders/1/assign-tasks
```

**Response**:
```json
{
  "message": "Tasks assigned successfully from root card",
  "tasksCreated": 3,
  "details": {
    "success": true,
    "tasksCreated": 3,
    "tasks": [
      {
        "taskId": 1,
        "stageId": 1,
        "stageName": "Material Preparation",
        "workerId": 1,
        "taskDescription": "Material Preparation - Sales Order #1"
      },
      {
        "taskId": 2,
        "stageId": 2,
        "stageName": "Welding & Fabrication",
        "workerId": 2,
        "taskDescription": "Welding & Fabrication - Sales Order #1"
      },
      {
        "taskId": 3,
        "stageId": 3,
        "stageName": "Quality Check",
        "workerId": 3,
        "taskDescription": "Quality Check - Sales Order #1"
      }
    ],
    "salesOrderId": 1,
    "projectId": 1,
    "rootCardId": 1,
    "rootCardTitle": "Manufacturing Plan for PO-2025-001"
  }
}
```

## Task Information Displayed in Dashboard

Each task shows:
- **Title**: Task name (from manufacturing stage)
- **Status**: pending/in_progress/completed
- **Priority**: From root card
- **Root Card Details**:
  - Root card title/ID
  - Manufacturing stage name
- **Project Details**:
  - Project name and code
- **Root Card Details
** (if linked):
  - PO Number
  - Customer name
  - Order amount (in Indian Rupees with proper formatting)
  - Order date
  - Due date

## Data Flow Diagram

```
Sales Order (Status Change Event)
    ↓
Sales Order Controller
    ↓
updateSalesOrderStatus()
    ↓
[Check if status triggers assignment]
    ↓
assignTasksFromRootCard()
    ↓
Find Project ← Find Root Card ← Find Manufacturing Stages
    ↓
For each Stage with Assigned Worker:
    ↓
Create Worker Task
    ↓
Task Available in Employee Dashboard
    ↓
Employee sees:
  - Task Description
  - Root Card Info
  - Project Info
  - Sales Order Info
  - Manufacturing Stage Details
```

## Verification Checklist

- [ ] Sales order created with "Pending" status
- [ ] Root card created for the project with 3+ manufacturing stages
- [ ] Each stage has an assigned worker
- [ ] Sales order status changed to "ready_to_start"
- [ ] 3 worker tasks created (check database: `SELECT * FROM worker_tasks`)
- [ ] Worker A sees task in "My Tasks" dashboard
- [ ] Task shows complete information (root card, project, Root Card Details
)
- [ ] Worker B sees their assigned task
- [ ] Worker C sees their assigned task
- [ ] Task status can be updated to "in_progress" then "completed"

## Troubleshooting

**Tasks not appearing in dashboard?**
1. Check database: `SELECT * FROM worker_tasks WHERE worker_id = ?`
2. Check logs for errors: `[TaskAssignment]` messages
3. Verify manufacturing stages have `assigned_worker` values
4. Verify status change was to one of the trigger statuses

**Sales order information not showing?**
1. Verify project is linked to sales order
2. Verify root card is linked to project
3. Check database joins in the query

**Wrong worker seeing tasks?**
1. Verify `worker_id` in worker_tasks table
2. Check which user is logged in
