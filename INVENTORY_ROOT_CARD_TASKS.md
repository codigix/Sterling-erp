# Root Card Inventory Tasks - Feature Documentation

## Overview
This system tracks inventory workflow progress for each root card through 7 sequential steps. Tasks can only be marked as complete when accessed via the Department Tasks view with a root card context (rootCardId in URL).

## Workflow Steps

1. **Create RFQ** (Request for Quotation)
   - Prepare and create quotation request for vendors
   - Select materials needed for the root card

2. **Send RFQ to Vendor**
   - Send quotation requests to vendors via email
   - Track vendor responses

3. **Receive & Record Quotes**
   - Receive vendor quotations
   - Record vendor quotes with pricing details
   - Compare quotations

4. **Create PO** (Purchase Order)
   - Select approved quotation
   - Create purchase order
   - Set delivery expectations

5. **Approve PO**
   - Approve the purchase order
   - Finalize PO details
   - Authorize vendor delivery

6. **GRN Processing & QC**
   - Goods receipt note (GRN) processing
   - Quality control inspection
   - Record any variations in materials

7. **Add to Stock**
   - Add approved materials to inventory
   - Update stock levels
   - Complete inventory intake

## Database Schema

```sql
CREATE TABLE root_card_inventory_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  root_card_id INT NOT NULL,
  production_root_card_id INT,
  step_number INT NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  reference_id VARCHAR(100),  -- RFQ/PO/GRN number
  reference_type VARCHAR(50), -- rfq, po, grn, quotation
  completed_by INT,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE KEY unique_root_card_step (root_card_id, step_number),
  FOREIGN KEY (root_card_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

## API Endpoints

### Get Root Card Inventory Tasks
```
GET /api/inventory/root-card-tasks/root-card/:rootCardId/tasks
```
Returns all 7 workflow tasks for a root card with current status and progress.

**Response:**
```json
{
  "rootCard": {
    "id": 1,
    "name": "Motor Assembly Unit",
    "code": "PROJ-001"
  },
  "tasks": [
    {
      "id": 1,
      "rootCardId": 1,
      "stepNumber": 1,
      "stepName": "Create RFQ",
      "status": "pending",
      "referenceId": null,
      "referenceType": null,
      "completedBy": null,
      "completedAt": null
    },
    ...
  ],
  "progress": {
    "completed": 2,
    "inProgress": 1,
    "pending": 4,
    "completionPercentage": 28
  }
}
```

### Get Task Details
```
GET /api/inventory/root-card-tasks/root-card/:rootCardId/task/:taskId
```
Get details of a specific task within a root card context.

### Complete Task
```
PATCH /api/inventory/root-card-tasks/root-card/:rootCardId/task/:taskId/complete
```
Mark a task as completed. Only available when rootCardId is provided (Department Tasks context).

**Response:**
```json
{
  "message": "Task completed successfully",
  "task": {
    "id": 1,
    "status": "completed",
    "completedBy": 5,
    "completedAt": "2026-01-02T10:30:00Z",
    "notes": "RFQ sent to vendors"
  },
  "progress": {
    "completed": 3,
    "completionPercentage": 42
  }
}
```

### Update Task Status
```
PATCH /api/inventory/root-card-tasks/root-card/:rootCardId/task/:taskId/status
```

### Link Reference to Task
```
PATCH /api/inventory/root-card-tasks/root-card/:rootCardId/task/:taskId/link-reference
```
Link a reference document (quotation number, PO number, GRN number) to a task.

### Get Workflow Progress
```
GET /api/inventory/root-card-tasks/root-card/:rootCardId/progress
```
Get overall workflow progress for a root card.

## Key Features

### 1. Root Card Context Required for Completion
- Tasks can only be marked as completed when accessed from Department Tasks view
- URL must include `rootCardId` parameter
- This ensures traceability to which root card the task belongs

### 2. Auto-Initialization
- When a new root card (project) is created, all 7 inventory tasks are automatically initialized
- When a production root card is created, inventory tasks are initialized if not already present
- All tasks start with "pending" status

### 3. Task Tracking
- Each task tracks:
  - Current status (pending/in_progress/completed)
  - Who marked it complete (completed_by user ID)
  - When it was completed (completed_at timestamp)
  - Reference documents (RFQ numbers, PO numbers, GRN numbers)
  - Additional notes

### 4. Progress Tracking
- Real-time completion percentage
- Count of pending/in_progress/completed tasks
- Sequential workflow visibility

## Frontend Implementation Notes

### Department Tasks View (Inventory)
When a user selects a root card from the Department Tasks section and navigates to the inventory tasks:

1. URL should be: `/department-tasks/inventory?rootCardId=X`
2. Load all 7 steps with current status
3. Display visual progress indicator
4. Show step-by-step workflow

### Direct Access Restriction
When accessing inventory screens directly (not through Department Tasks):
- Show task list but **disable** the "Mark Complete" button
- Display message: "Select a root card from Department Tasks to track completion"
- This prevents unmarked completion and maintains audit trail

## Example Frontend Flow

```
Department Tasks Page
↓
Select Root Card
↓
View Inventory Workflow (7 steps)
  Step 1: Create RFQ [Completed ✓]
  Step 2: Send RFQ  [In Progress...] 
  Step 3: Receive Quotes [Pending]
  Step 4: Create PO [Pending]
  Step 5: Approve PO [Pending]
  Step 6: GRN & QC [Pending]
  Step 7: Add to Stock [Pending]
↓
Click on Step 2 → Opens inventory screen WITH root card context
↓
Complete action in inventory screen
↓
Return to Department Tasks → Step 2 now shows "Completed"
↓
Progress: 28% → 42%
```

## Security & Audit Trail

- All completions tracked with:
  - User ID (who marked complete)
  - Timestamp (when marked)
  - Root Card ID (which root card)
  - Notes (optional context)
- Only users with inventory_manager role can mark tasks complete
- Completion must be done with root card context (URL parameter validation)
