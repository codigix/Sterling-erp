# Project Inventory Tasks - Feature Documentation

## Overview
This system tracks inventory workflow progress for each project through 7 sequential steps. Tasks can only be marked as complete when accessed via the Department Tasks view with a project context (projectId in URL).

## Workflow Steps

1. **Create RFQ** (Request for Quotation)
   - Prepare and create quotation request for vendors
   - Select materials needed for the project

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
CREATE TABLE project_inventory_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  root_card_id INT,
  step_number INT (1-7),
  step_name VARCHAR(100),
  status ENUM('pending', 'in_progress', 'completed'),
  reference_id VARCHAR(100),  -- RFQ/PO/GRN number
  reference_type VARCHAR(50), -- rfq, po, grn, quotation
  completed_by INT,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## API Endpoints

### Get Project Inventory Tasks
```
GET /api/inventory/project-tasks/project/:projectId/tasks
```
Returns all 7 workflow tasks for a project with current status and progress.

**Response:**
```json
{
  "project": {
    "id": 1,
    "title": "Motor Assembly Unit",
    "code": "PROJ-001"
  },
  "tasks": [
    {
      "id": 1,
      "projectId": 1,
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
GET /api/inventory/project-tasks/project/:projectId/task/:taskId
```
Get details of a specific task within a project context.

### Complete Task
```
PATCH /api/inventory/project-tasks/project/:projectId/task/:taskId/complete
Body: {
  "notes": "Optional completion notes"
}
```
Mark a task as completed. Only available when projectId is provided (Department Tasks context).

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
PATCH /api/inventory/project-tasks/project/:projectId/task/:taskId/status
Body: {
  "status": "in_progress" | "pending" | "completed"
}
```

### Link Reference to Task
```
PATCH /api/inventory/project-tasks/project/:projectId/task/:taskId/link-reference
Body: {
  "referenceId": "QT-123456",
  "referenceType": "quotation"  // or "rfq", "po", "grn"
}
```
Link a reference document (quotation number, PO number, GRN number) to a task.

### Get Workflow Progress
```
GET /api/inventory/project-tasks/project/:projectId/progress
```
Get overall workflow progress for a project.

## Key Features

### 1. Project Context Required for Completion
- Tasks can only be marked as completed when accessed from Department Tasks view
- URL must include `projectId` parameter
- This ensures traceability to which project the task belongs

### 2. Auto-Initialization
- When a new project is created, all 7 inventory tasks are automatically initialized
- When a root card is created, inventory tasks are initialized if not already present
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
When a user selects a project from the Department Tasks section and navigates to the inventory tasks:

1. URL should be: `/department-tasks/inventory?projectId=X&rootCardId=Y`
2. Load all 7 steps with current status
3. Display visual progress indicator
4. Show step-by-step workflow

### Direct Access Restriction
When accessing inventory screens directly (not through Department Tasks):
- Show task list but **disable** the "Mark Complete" button
- Display message: "Select a project from Department Tasks to track completion"
- This prevents unmarked completion and maintains audit trail

## Example Frontend Flow

```
Department Tasks Page
↓
Select Project (Root Card)
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
Click on Step 2 → Opens inventory screen WITH project context
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
  - Project ID (which project)
  - Notes (optional context)
- Only users with inventory_manager role can mark tasks complete
- Completion must be done with project context (URL parameter validation)
