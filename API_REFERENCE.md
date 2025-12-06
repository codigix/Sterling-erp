# Sterling ERP - API Reference Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 📌 Production Plans API

### Create Production Plan
```
POST /production/plans
Content-Type: application/json

{
  "projectId": 1,
  "salesOrderId": 1,
  "planName": "Q1 2025 Production",
  "startDate": "2025-01-15",
  "endDate": "2025-03-15",
  "estimatedCompletionDate": "2025-03-10",
  "assignedSupervisor": 5,
  "notes": "Standard production plan"
}

Response: { message, planId }
```

### Get All Production Plans
```
GET /production/plans?status=draft&search=production

Response: [{ id, planName, status, project_name, ... }]
```

### Get Production Plan Details
```
GET /production/plans/:id

Response: { id, planName, stages, project_name, ... }
```

### Update Production Plan
```
PUT /production/plans/:id
Content-Type: application/json

{
  "planName": "Updated Plan",
  "status": "approved",
  "notes": "Updated notes"
}

Response: { message }
```

### Update Plan Status
```
PATCH /production/plans/:id/status
Content-Type: application/json

{
  "status": "approved" | "draft" | "planning" | "in_progress" | "completed" | "cancelled"
}

Response: { message }
```

### Get Production Plans Stats
```
GET /production/plans/stats

Response: {
  total_plans,
  draft_plans,
  approved_plans,
  in_progress_plans,
  completed_plans
}
```

---

## 📋 Production Stage Tasks API

### Create Task
```
POST /production/stage-tasks
Content-Type: application/json

{
  "productionStageId": 1,
  "employeeId": 5,
  "taskName": "Machine Part A",
  "description": "Cut and shape part A",
  "priority": "high" | "medium" | "low",
  "notes": "Follow specifications in drawing D-123"
}

Response: { message, taskId }
```

### Get Employee Tasks
```
GET /production/stage-tasks/employee/:employeeId?status=all&dateFilter=today

Query Params:
  status: to_do | in_progress | pause | done | cancel | all
  dateFilter: all | today | week | month
  productionPlanId: (optional)

Response: [{ id, task_name, status, priority, plan_name, ... }]
```

### Get Employee Task Stats
```
GET /production/stage-tasks/employee/:employeeId/stats

Response: {
  total_tasks,
  to_do,
  in_progress,
  paused,
  completed,
  cancelled
}
```

### Get Production Stage Stats
```
GET /production/stage-tasks/stage/:productionStageId/stats

Response: {
  total_tasks,
  to_do,
  in_progress,
  paused,
  completed,
  cancelled
}
```

### Get Task Details
```
GET /production/stage-tasks/:id

Response: { id, task_name, status, priority, description, pause_count, total_pause_duration, ... }
```

### Update Task Status
```
PATCH /production/stage-tasks/:id/status
Content-Type: application/json

{
  "status": "to_do" | "in_progress" | "pause" | "done" | "cancel",
  "cancelReason": "Not possible due to X" (required if status is cancel)
}

Response: { message }
```

### Pause Task
```
PATCH /production/stage-tasks/:id/pause
Content-Type: application/json

{
  "pauseDuration": 30 (minutes, optional)
}

Response: { message }
```

### Get All Tasks
```
GET /production/stage-tasks?status=all&employeeId=5

Query Params:
  status: to_do | in_progress | pause | done | cancel | all
  employeeId: (optional)
  productionStageId: (optional)

Response: [{ id, task_name, status, employee_name, stage_name, ... }]
```

---

## 🔔 Alerts & Notifications API

### Create Alert
```
POST /alerts
Content-Type: application/json

{
  "userId": 5,
  "fromUserId": 2,
  "alertType": "task_blocked" | "status_update" | "delay_alert" | "material_shortage" | "quality_issue" | "other",
  "message": "Task is blocked due to material shortage",
  "relatedTable": "production_stage_tasks",
  "relatedId": 10,
  "priority": "high" | "medium" | "low"
}

Response: { message, alertId }
```

### Get User Alerts
```
GET /alerts/user/:userId?isRead=false&alertType=all&priority=high&limit=10

Query Params:
  isRead: true | false (optional)
  alertType: task_blocked | status_update | delay_alert | ... | all
  priority: high | medium | low | all
  limit: number (default 20)

Response: [{ id, message, alert_type, priority, is_read, created_at, ... }]
```

### Get Unread Alert Count
```
GET /alerts/user/:userId/unread-count

Response: { unreadCount: 5 }
```

### Get Alert Statistics
```
GET /alerts/user/:userId/stats

Response: {
  total_alerts,
  unread,
  task_blocked,
  status_update,
  delay_alert,
  material_shortage,
  quality_issue
}
```

### Mark Alert as Read
```
PATCH /alerts/:id/read

Response: { message }
```

### Mark All Alerts as Read
```
PATCH /alerts/user/:userId/read-all

Response: { message }
```

### Delete Alert
```
DELETE /alerts/:id

Response: { message }
```

---

## 🏢 Facilities API

### Create Facility
```
POST /inventory/facilities
Content-Type: application/json

{
  "name": "Machining Center 1",
  "location": "Building A, Floor 2",
  "capacity": 100,
  "equipment": ["CNC Machine", "Lathe", "Drill"],
  "status": "active" | "inactive" | "maintenance"
}

Response: { message, facilityId }
```

### Get All Facilities
```
GET /inventory/facilities?status=active&search=machining

Query Params:
  status: active | inactive | maintenance | all
  search: string

Response: [{ id, name, location, capacity, status, ... }]
```

### Get Available Facilities
```
GET /inventory/facilities/available

Response: [{ id, name, location, capacity, status=active, ... }]
```

### Get Facility Details
```
GET /inventory/facilities/:id

Response: { id, name, location, capacity, equipment, status, ... }
```

### Update Facility
```
PUT /inventory/facilities/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "capacity": 150,
  "status": "maintenance"
}

Response: { message }
```

### Delete Facility
```
DELETE /inventory/facilities/:id

Response: { message }
```

---

## 📊 Project Tracking API

### Create Project Milestone
```
POST /tracking/project-milestone
Content-Type: application/json

{
  "projectId": 1,
  "milestoneName": "Design Approval",
  "targetDate": "2025-02-15"
}

Response: { message, milestoneId }
```

### Get Project Milestones
```
GET /tracking/project/:projectId/milestones

Response: [{ id, milestone_name, target_date, status, completion_percentage, ... }]
```

### Get Project Overall Progress
```
GET /tracking/project/:projectId/progress

Response: {
  total_milestones,
  completed_milestones,
  in_progress_milestones,
  delayed_milestones,
  average_completion (%)
}
```

### Update Milestone Progress
```
PATCH /tracking/milestone/:id/progress
Content-Type: application/json

{
  "completionPercentage": 75
}

Response: { message }
```

### Update Milestone Status
```
PATCH /tracking/milestone/:id/status
Content-Type: application/json

{
  "status": "not_started" | "in_progress" | "completed" | "delayed"
}

Response: { message }
```

### Get Project Team
```
GET /tracking/project/:projectId/team

Response: [{ id, employee_name, email, tasks_assigned, tasks_completed, efficiency_percentage, ... }]
```

---

## 👥 Employee Tracking API

### Create Employee Tracking
```
POST /tracking/employee
Content-Type: application/json

{
  "employeeId": 5,
  "projectId": 1,
  "productionStageId": 3
}

Response: { message, trackingId }
```

### Get Employee Tracking Records
```
GET /tracking/employee/:employeeId

Response: [{ id, employee_name, project_name, stage_name, tasks_assigned, tasks_completed, efficiency_percentage, ... }]
```

### Get Employee Performance
```
GET /tracking/employee/:employeeId/performance

Response: {
  total_tasks_assigned,
  total_tasks_completed,
  total_tasks_in_progress,
  total_tasks_paused,
  total_tasks_cancelled,
  average_efficiency (%),
  total_hours_worked
}
```

### Update Employee Task Stats
```
PATCH /tracking/employee/:employeeId/project/:projectId/stats
Content-Type: application/json

{
  "tasksAssigned": 10,
  "tasksCompleted": 8,
  "tasksInProgress": 1,
  "tasksPaused": 0,
  "tasksCancelled": 1
}

Response: { message }
```

### Update Employee Efficiency
```
PATCH /tracking/employee/:employeeId/project/:projectId/efficiency
Content-Type: application/json

{
  "efficiencyPercentage": 85
}

Response: { message }
```

### Get Project Team Performance
```
GET /tracking/project/:projectId/team-performance

Response: [{ 
  employee_id, 
  employee_name, 
  tasks_assigned, 
  tasks_completed, 
  efficiency_percentage, 
  total_hours_worked, 
  ... 
}]
```

---

## 📦 Material API

### Create Material
```
POST /inventory/materials
Content-Type: application/json

{
  "itemCode": "MAT-001",
  "itemName": "Steel Rod",
  "batch": "BATCH-2025-01",
  "specification": "10mm diameter, 1m length",
  "unit": "pieces",
  "category": "Raw Material",
  "quantity": 100,
  "reorderLevel": 20,
  "location": "A-1-2",
  "vendorId": 1,
  "unitCost": 50
}

Response: { message, materialId }
```

### Get All Materials
```
GET /inventory/materials?search=steel&category=Raw%20Material

Response: [{ id, itemCode, itemName, quantity, reorderLevel, vendorId, ... }]
```

### Get Material Details
```
GET /inventory/materials/:id

Response: { id, itemCode, itemName, specification, quantity, location, ... }
```

### Update Material
```
PUT /inventory/materials/:id
Content-Type: application/json

{
  "quantity": 150,
  "reorderLevel": 25
}

Response: { message }
```

### Delete Material
```
DELETE /inventory/materials/:id

Response: { message }
```

---

## 🔐 Error Responses

All endpoints return error responses in this format:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Example Request/Response Cycle

### Creating a Production Plan with Stages

**Step 1: Create Production Plan**
```bash
curl -X POST http://localhost:5000/api/production/plans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "planName": "Phase 1 Production",
    "startDate": "2025-02-01",
    "estimatedCompletionDate": "2025-03-01"
  }'

# Response: { "message": "Production plan created successfully", "planId": 5 }
```

**Step 2: Create Production Stage Task**
```bash
curl -X POST http://localhost:5000/api/production/stage-tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productionStageId": 1,
    "employeeId": 5,
    "taskName": "Assembly Line A",
    "priority": "high"
  }'

# Response: { "message": "Task created successfully", "taskId": 10 }
```

**Step 3: Employee Views Tasks**
```bash
curl -X GET "http://localhost:5000/api/production/stage-tasks/employee/5?status=all" \
  -H "Authorization: Bearer <token>"

# Response: [{ id: 10, task_name: "Assembly Line A", status: "to_do", priority: "high", ... }]
```

**Step 4: Employee Starts Task**
```bash
curl -X PATCH http://localhost:5000/api/production/stage-tasks/10/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "in_progress" }'

# Response: { "message": "Task status updated successfully" }
```

---

**API Version**: 1.0
**Last Updated**: 2025-11-29
