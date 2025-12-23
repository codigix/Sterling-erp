# Task Assignment Workflow

## Overview
This system automatically assigns tasks to workers/departments when a sales order status changes. Tasks are created based on the manufacturing stages defined in the root card associated with the sales order.

## How It Works

### 1. Status Change Trigger
When a sales order status is updated to one of these statuses:
- `assigned`
- `ready_to_start`
- `approved`
- `in_progress`

The system automatically creates worker tasks for all pending manufacturing stages.

### 2. Relationship Chain
```
Sales Order
    ↓
Project (via sales_order_id)
    ↓
Root Card (via project_id)
    ↓
Manufacturing Stages (via root_card_id)
    ↓
Worker Tasks (created for each stage with assigned_worker)
```

### 3. Task Creation Process
1. Find the project linked to the sales order
2. Find the root card linked to the project
3. Get all manufacturing stages from the root card
4. For each stage with an assigned worker, create a worker task
5. Tasks are created with status "pending" and assigned to the worker

## API Endpoints

### Automatic Task Assignment (on Status Change)
```
PATCH /api/sales/orders/:id/status
Body: { status: "assigned" | "ready_to_start" | "approved" | "in_progress" }
Response: { taskAssignmentTriggered: true, ... }
```

### Manual Task Assignment
```
POST /api/sales/orders/:salesOrderId/assign-tasks
Response: {
  message: "Tasks assigned successfully from root card",
  tasksCreated: 5,
  details: {
    success: true,
    tasks: [...],
    rootCardId: 1,
    projectId: 2
  }
}
```

## Database Tables Involved

- **sales_orders**: Stores sales order data
- **projects**: Links sales orders to root cards
- **root_cards**: Contains production planning information
- **manufacturing_stages**: Defines production stages with assigned workers
- **worker_tasks**: Stores individual tasks assigned to workers

## Task Assignment Helper

The `utils/taskAssignmentHelper.js` module provides:

### `assignTasksFromRootCard(salesOrderId, connection)`
Automatically creates worker tasks for a sales order based on its root card.

**Parameters:**
- `salesOrderId` (number): ID of the sales order
- `connection` (optional): Database connection object

**Returns:**
```javascript
{
  success: boolean,
  tasksCreated: number,
  tasks: [{
    taskId: number,
    stageId: number,
    stageName: string,
    workerId: number,
    taskDescription: string
  }],
  salesOrderId: number,
  projectId: number,
  rootCardId: number,
  rootCardTitle: string
}
```

### `getTasksAssignmentStatus(salesOrderId, connection)`
Retrieves all tasks assigned from a specific sales order.

**Parameters:**
- `salesOrderId` (number): ID of the sales order
- `connection` (optional): Database connection object

**Returns:**
```javascript
{
  tasksFound: number,
  tasks: [{
    id: number,
    stage_id: number,
    worker_id: number,
    task: string,
    status: string,
    stage_name: string
  }],
  salesOrderId: number,
  projectId: number,
  rootCardId: number
}
```

## Example Flow

1. **Create Root Card with Stages**
   - Create a root card for a project
   - Add manufacturing stages: "Material Prep", "Welding", "Finishing"
   - Assign workers to each stage (e.g., Worker A, Worker B, Worker C)

2. **Update Sales Order Status**
   - Update sales order status to "assigned"
   - System automatically creates 3 tasks:
     - Task 1: "Material Prep - Sales Order #123" → Worker A
     - Task 2: "Welding - Sales Order #123" → Worker B
     - Task 3: "Finishing - Sales Order #123" → Worker C

3. **Workers See Tasks**
   - Worker A sees the task in their dashboard
   - Can mark progress and update task status

4. **Manual Assignment (Optional)**
   - POST to `/api/sales/orders/123/assign-tasks` to manually trigger assignment

## Important Notes

- Tasks are only created for stages with an assigned worker (`assigned_worker IS NOT NULL`)
- Duplicate tasks are prevented by unique constraints
- Task description includes the stage name and sales order ID for easy reference
- The system uses try-catch to prevent failures in task creation from stopping the entire process
- All task operations are logged for debugging purposes

## Configuration

The trigger statuses can be modified in:
- `utils/taskAssignmentHelper.js` → `STATUS_TO_TRIGGER_ASSIGNMENT`
- `controllers/sales/salesController.js` → `updateSalesOrderStatus` function

## Error Handling

- If no project is linked to the sales order, logging happens but no error is returned
- If no root card is found, logging happens but no error is returned
- If task creation fails (except duplicate), the error is logged and other tasks continue
- The API endpoint returns success even if no tasks were created (as this might be expected)

## Future Enhancements

- Add webhook notifications when tasks are created
- Support bulk task assignment for multiple sales orders
- Add task reassignment logic
- Create audit logs for all task assignments
- Add email notifications to assigned workers
