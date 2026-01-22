# Department Tasks Integration Guide

## Overview

When users navigate to an inventory task from the **Department Tasks** interface, they can complete actions that automatically update the task status in the root card inventory workflow. This document explains how to integrate this functionality into inventory pages.

## How It Works

### 1. User navigates from Department Tasks → Task Page
- User clicks on a task in **Department Tasks → Inventory Tasks**
- The system passes `rootCardId`, `taskId`, and other parameters in the URL
- Task page detects these parameters and provides feedback to the user

### 2. User completes the task action
- User performs the required action (create quotation, send PO, receive material, etc.)
- Upon successful completion, the task status is automatically marked as **completed** in the `root_card_inventory_tasks` table

### 3. Normal behavior for direct navigation
- If a user navigates directly to a task page (without coming from Department Tasks), the page works normally
- No automatic task status updates occur

## Integration Steps

### Step 1: Import the Hook

```javascript
import useRootCardInventoryTask from "../../hooks/useRootCardInventoryTask";
```

### Step 2: Use the Hook in Your Component

```javascript
const MyInventoryPage = () => {
  const { completeCurrentTask, isFromDepartmentTasks, getTaskParams } = useRootCardInventoryTask();
  
  // ... rest of your component code
};
```

### Step 3: Add Context Banner (Optional)

Display a banner to inform users they're in a Department Tasks workflow:

```javascript
{isFromDepartmentTasks() && (
  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
      📋 Inventory Task Context
    </p>
    <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
      You're working on a task from the Department Tasks workflow. When you complete actions here, the task status will be automatically updated.
    </p>
  </div>
)}
```

### Step 4: Call completeCurrentTask on Successful Action

When the user completes the required action, call `completeCurrentTask()`:

```javascript
const handleSaveAction = async () => {
  try {
    // Your existing logic to save/create/send something
    await axios.post('/api/your-endpoint', data);
    
    // Mark the task as complete if navigating from Department Tasks
    if (isFromDepartmentTasks()) {
      await completeCurrentTask("Action description or notes");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

## Available Hook Methods

### `isFromDepartmentTasks()`
Returns `true` if the page was navigated from Department Tasks, `false` otherwise.

```javascript
if (isFromDepartmentTasks()) {
  // Show context banner, auto-complete tasks, etc.
}
```

### `getTaskParams()`
Returns an object with task parameters:

```javascript
const { taskId, rootCardId, taskTitle } = getTaskParams();
```

### `completeCurrentTask(notes = '')`
Marks the current task as completed in the root card inventory workflow.

```javascript
await completeCurrentTask("Optional notes about completion");
```

### `updateTaskStatus(status)`
Updates the task to a specific status: `'pending'`, `'in_progress'`, or `'completed'`.

```javascript
await updateTaskStatus('in_progress');
```

## URL Parameters Format

When navigating from Department Tasks, the following parameters are included:

- `taskId` - The ID of the root card inventory task
- `rootCardId` - The ID of the root card (project)
- `taskTitle` - The title of the task (URL encoded)

Example URL:
```
/inventory-manager/vendors/quotations?taskId=1&rootCardId=5&taskTitle=Create%20RFQ%20Quotation
```

## Example Implementation

### QuotationsPage.jsx

```javascript
import useRootCardInventoryTask from "../../hooks/useRootCardInventoryTask";

const QuotationsPage = () => {
  const { completeCurrentTask, isFromDepartmentTasks } = useRootCardInventoryTask();

  const handleSaveRequirements = async () => {
    try {
      // Save requirements
      await axios.post('/api/requirements', data);
      
      // Mark task as complete if from Department Tasks
      if (isFromDepartmentTasks()) {
        await completeCurrentTask("Requirements reviewed and quotation prepared");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {isFromDepartmentTasks() && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm font-semibold">📋 Inventory Task Context</p>
          <p className="text-xs mt-1">Task status will be updated automatically.</p>
        </div>
      )}
      
      {/* Rest of page content */}
    </div>
  );
};
```

## Task Completion Conditions

The task is marked as complete when:
1. User navigates FROM Department Tasks (rootCardId in URL params)
2. User successfully completes an action (saves, sends, creates, receives, etc.)
3. `completeCurrentTask()` is called

The task remains incomplete if:
1. User navigates directly to the page (no rootCardId in URL)
2. `completeCurrentTask()` is never called
3. An error occurs during the action

## Pages That Support This Feature

Currently integrated:
- ✅ QuotationsPage

Should be integrated:
- POPage (Purchase Orders)
- GRNPage (Goods Receipt Notes)
- InspectionsPage (Quality Control)
- StockPage (Stock Management)
- And other inventory task pages

## Task Workflow Mapping

| Workflow Step | Page | Completion Action |
|---|---|---|
| Check Root Card Material Requirements | InventoryTasksPage | Task auto-marked complete |
| Create RFQ | QuotationsPage | Save requirements |
| Send RFQ to Vendor | QuotationsPage | Send email |
| Receive & Record Quotes | QuotationsPage | Receive response |
| Create PO | POPage | Create purchase order |
| Approve PO | POPage | Approve order |
| GRN Processing & QC | GRNPage | Process GRN |
| QC Inspection | InspectionsPage | Complete inspection |
| Add to Stock | StockPage | Add materials |
| Batch & Location | StockPage | Assign batch info |
| View Stock | StockPage | (context only) |
| Stock Movements | StockPage | Record movement |
| Reorder Levels | StockPage | Update reorder levels |

## Error Handling

If task completion fails, the action still succeeds, but an error is logged:

```javascript
if (isFromDepartmentTasks()) {
  try {
    await completeCurrentTask("Notes");
  } catch (error) {
    console.error("Task completion failed:", error);
    // Action still completed, but task wasn't marked as complete
  }
}
```

## Testing

To test the integration:

1. Navigate to Department Tasks → Inventory Tasks
2. Click on a specific task (e.g., "Create RFQ")
3. Verify the URL contains `?taskId=...&rootCardId=...`
4. Verify the context banner appears
5. Complete the required action
6. Verify the task status changes to "completed" in Department Tasks
7. Navigate back to Department Tasks to confirm
