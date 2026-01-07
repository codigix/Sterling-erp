# Task Completion Integration Guide

## Overview
When navigating from Department Tasks → Inventory Workflow Tasks, each task should auto-complete when the user performs the required action on that page.

## Task Completion Workflow

### 1. Create RFQ Quotation
**Page:** `/inventory-manager/vendors/quotations`  
**Completion Trigger:** When user creates a new RFQ  
**Integration:**
```javascript
import { taskService } from "@/utils/taskService";

// After successfully creating RFQ
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "RFQ created");
}
```

---

### 2. Send Quotation to Vendor
**Page:** `/inventory-manager/vendors/quotations`  
**Completion Trigger:** When user clicks "Send Email" button to send RFQ to vendor  
**Integration:**
```javascript
// After sending email
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "RFQ sent to vendor");
}
```

---

### 3. Receive Vendor Quotation
**Page:** `/inventory-manager/vendors/quotations` (on "Received Quotes" tab)  
**Completion Trigger:** When user creates/records a received vendor quotation  
**Integration:**
```javascript
// After recording vendor quotation response
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "Vendor quotation received");
}
```

---

### 4. Create Purchase Order
**Page:** `/inventory-manager/vendors/po`  
**Completion Trigger:** When user creates a PO from quotation  
**Integration:**
```javascript
// After successfully creating PO
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "PO created");
}
```

---

### 5. Send PO to Vendor
**Page:** `/inventory-manager/vendors/po`  
**Completion Trigger:** When user clicks "Send Email" button to send PO  
**Integration:**
```javascript
// After sending PO email
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "PO sent to vendor");
}
```

---

### 6. Receive Material
**Page:** `/inventory-manager/vendors/po`  
**Completion Trigger:** When user checks/reviews email communication about material arrival  
**Integration:**
```javascript
// After reviewing delivery confirmation/email
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "Material received from vendor");
}
```

---

### 7. Approve Purchase Order
**Page:** `/inventory-manager/vendors/po`  
**Completion Trigger:** When user changes PO status to "Approved"  
**Integration:**
```javascript
// After changing PO status to Approved
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "PO approved");
}
```

---

### 8. GRN Processing
**Page:** `/inventory-manager/qc/grn`  
**Completion Trigger:** When GRN is created/processed  
**Integration:**
```javascript
// After creating/processing GRN
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "GRN processed");
}
```

---

### 9. QC Inspection
**Page:** `/inventory-manager/qc/inspections`  
**Completion Trigger:** When QC inspection is completed (items accepted/rejected)  
**Integration:**
```javascript
// After completing QC inspection
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "QC inspection completed");
}
```

---

### 10. Stock Addition
**Page:** `/inventory-manager/stock/view`  
**Completion Trigger:** When inspected materials are added to stock inventory  
**Integration:**
```javascript
// After adding items to stock
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "Stock added to inventory");
}
```

---

### 11. Batch & Location Management
**Page:** `/inventory-manager/tracking/batches`  
**Completion Trigger:** When batches are created and locations assigned  
**Integration:**
```javascript
// After creating batches and assigning locations
const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
if (taskId && projectId) {
  await taskService.completeProjectInventoryTask(taskId, projectId, "Batch and location assigned");
}
```

---

### 12. View Stock
**Page:** `/inventory-manager/stock/view`  
**Completion Trigger:** When user views and monitors stock levels (automatic on page load with context)  
**Integration:**
```javascript
// On component mount, if task context present
useEffect(() => {
  const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
  if (taskId && projectId) {
    await taskService.completeProjectInventoryTask(taskId, projectId, "Stock levels viewed");
  }
}, []);
```

---

## URL Parameters Passed to Pages

All pages receive these query parameters:
- `taskId` - Backend inventory task ID
- `projectId` - Project ID
- `rootCardId` - Root card ID
- `taskTitle` - Task name (e.g., "Create RFQ Quotation")

**Example URL:**
```
/inventory-manager/vendors/quotations?taskId=5&projectId=8&rootCardId=21&taskTitle=Create%20RFQ%20Quotation
```

## Helper Function Usage

```javascript
import { taskService } from "@/utils/taskService";

// Extract task parameters
const { taskId, projectId, rootCardId, taskTitle } = taskService.getProjectInventoryTaskParams();

// Check if navigated from department tasks
if (taskService.isNavigatingFromDepartmentTasks()) {
  // Show task completion indicators
}

// Complete task with notes
await taskService.completeProjectInventoryTask(taskId, projectId, "Action completed successfully");

// Update task status (pending, in_progress, completed)
await taskService.updateProjectInventoryTaskStatus(taskId, projectId, "in_progress");
```

## Error Handling

```javascript
try {
  const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
  if (taskId && projectId) {
    await taskService.completeProjectInventoryTask(taskId, projectId, "Notes here");
    console.log("Task completed successfully");
    // Optionally refresh task list in parent component
  }
} catch (error) {
  console.error("Failed to complete task:", error);
  // Show user-friendly error message
}
```

## Implementation Checklist

- [ ] Fix API endpoints in `taskService.js` (add `/api` prefix)
- [ ] Fix API endpoint in `InventoryTasksPage.jsx` (add `/api` prefix)
- [ ] Add task completion calls to `QuotationsPage.jsx`
- [ ] Add task completion calls to `PurchaseOrdersPage.jsx`
- [ ] Add task completion calls to `GrnPage.jsx`
- [ ] Add task completion calls to `QCInspectionsPage.jsx`
- [ ] Add task completion calls to `StockPage.jsx`
- [ ] Add task completion calls to `BatchPage.jsx`
- [ ] Test workflow: Navigate → Complete Action → Task Auto-completes
- [ ] Verify task status updates in Department Tasks dashboard
