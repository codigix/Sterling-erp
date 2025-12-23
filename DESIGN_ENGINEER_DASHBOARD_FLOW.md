# Design Engineer Dashboard - Real Data Flow & Architecture

## Overview
The Design Engineer Dashboard now fetches **100% real data** from the backend API. No mock data is used. All information displayed is directly from the database.

---

## Data Flow Architecture

### 1. **Initial Load Sequence**
```
User visits /design-engineer/dashboard
    ↓
React Component Mounts
    ↓
useEffect Hook Triggers (componentDidMount)
    ↓
fetchDashboardData() executes
    ↓
[Parallel API Calls using Promise.all()]
    ├─ getRoleId('design_engineer')
    ├─ fetchTasksForDesignEngineer(roleId)
    └─ fetchTaskStats(roleId)
    ↓
Data Received & State Updated
    ↓
Dashboard Renders with Real Data
```

---

## API Endpoints Used

### A. **Get Role ID**
```
GET /api/department/portal/role/design_engineer

Response:
{
  "roleId": 5,
  "roleName": "design_engineer"
}

Purpose: Convert role name to role ID for subsequent API calls
```

### B. **Get Department Tasks**
```
GET /api/department/portal/tasks/{roleId}

Example: GET /api/department/portal/tasks/5

Response: Array of Task Objects
[
  {
    "id": 1,
    "taskId": 1,
    "title": "[Root Card Title] - Design Engineer Review & Approval",
    "description": "Review and prepare the root card for design engineer processing",
    "status": "pending",
    "priority": "high",
    "rootCard": {
      "id": 10,
      "title": "Assembly Design - Project X",
      "code": "RC-001",
      "priority": "high"
    },
    "project": {
      "id": 5,
      "name": "Project X",
      "code": "PROJ-001"
    },
    "salesOrder": {
      "id": 3,
      "poNumber": "PO-2025-001",
      "customer": "Acme Corp",
      "total": "500000",
      "orderDate": "2025-12-18",
      "dueDate": "2026-01-20"
    },
    "department": {
      "roleId": 5,
      "roleName": "design_engineer"
    },
    "assignedBy": "System",
    "createdAt": "2025-12-18T10:30:00Z",
    "updatedAt": "2025-12-18T10:30:00Z"
  }
  // ... more tasks
]

Purpose: Fetch all tasks assigned to the design_engineer role
```

### C. **Get Task Statistics**
```
GET /api/department/portal/stats/{roleId}

Example: GET /api/department/portal/stats/5

Response:
{
  "total": 8,
  "pending": 3,
  "in_progress": 2,
  "completed": 2,
  "on_hold": 1,
  "critical_count": 1
}

Purpose: Get statistical overview of tasks
```

---

## Component State Management

### State Variables:
```javascript
const [stats, setStats] = useState([]);
// Array of 4 KPI cards with real counts
// Generated from departmentTasks data

const [departmentTasks, setDepartmentTasks] = useState([]);
// Array of all tasks assigned to design engineer
// Used to populate charts and task lists

const [taskStats, setTaskStats] = useState(null);
// Statistics object with counts by status
// Used for progress bars and metrics

const [loading, setLoading] = useState(true);
// Boolean to show/hide loading spinner

const [error, setError] = useState(null);
// Error message if API calls fail
```

---

## Data Processing Flow

### 1. **generateStatisticsFromTasks(tasks)**
When tasks are fetched, this function processes them to create KPI statistics:

```javascript
const pendingCount = tasks.filter(t => t.status === 'pending').length;
const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
const completedCount = tasks.filter(t => t.status === 'completed').length;
const criticalCount = tasks.filter(t => t.priority === 'critical').length;

// Generate 4 stat cards:
// 1. Assigned Projects: total task count
// 2. Pending Tasks: pending count
// 3. Completed: completed count
// 4. Critical Priority: critical count
```

### 2. **Chart Data Generation**
Charts are dynamically generated from the fetched tasks:

**Task Status Data (Doughnut Chart):**
```javascript
{
  labels: ['Pending', 'In Progress', 'Completed', 'On Hold'],
  data: [pending_count, inProgress_count, completed_count, onHold_count]
}
```

**Priority Distribution Data (Bar Chart):**
```javascript
{
  labels: ['Critical', 'High', 'Medium', 'Low'],
  data: [critical_count, high_count, medium_count, low_count]
}
```

---

## Dashboard Sections & Real Data Sources

### Section 1: KPI Cards (Top)
**Data Source:** `generateStatisticsFromTasks(departmentTasks)`
**Display:** 4 cards showing:
- Assigned Projects: `departmentTasks.length`
- Pending Tasks: Count of tasks with status='pending'
- Completed: Count of tasks with status='completed'
- Critical Priority: Count of tasks with priority='critical'

### Section 2: Charts (Middle)
**Data Source:** `departmentTasks` array
**Displays:**
- Task Status Overview (Bar Chart): Task counts by status
- Task Distribution (Doughnut Chart): Tasks by status breakdown

### Section 3: Assigned Root Cards (Bottom Left)
**Data Source:** `departmentTasks.slice(0, 5)`
**Display:** Top 5 tasks showing:
- Root Card Title
- Customer Name (from salesOrder)
- Task Status (badge)
- Priority Level
- PO Number

### Section 4: Task Statistics (Bottom Right)
**Data Source:** `taskStats` (from stats API)
**Display:** Progress bars for:
- Total Tasks
- In Progress
- Completed
- On Hold

### Section 5: Recent Tasks (Bottom)
**Data Source:** `departmentTasks.slice(0, 4)`
**Display:** Timeline of 4 most recent tasks with:
- Task Title
- Root Card Reference
- Created Date (formatted to en-IN locale)

---

## Error Handling

```javascript
try {
  // Fetch all data
  const roleId = await getRoleId('design_engineer');
  if (!roleId) throw new Error('Role not found');
  
  await Promise.all([
    fetchTasksForDesignEngineer(roleId),
    fetchTaskStats(roleId),
  ]);
} catch (err) {
  console.error('Error:', err);
  setError(err.message);
  // Display error message to user
}
```

### Error Display:
If any API call fails, user sees:
```
Error Loading Dashboard
[Error message]
```

---

## Loading State

While data is being fetched, user sees:
```
[Loading Spinner]
Loading dashboard...
```

---

## Component Lifecycle

### 1. **Mount**
- `useEffect` runs
- `loading = true`
- `error = null`

### 2. **Fetching**
- Three parallel API calls
- State updates as data arrives

### 3. **Render**
- If `loading = true`: Show spinner
- If `error`: Show error message
- If data loaded: Show dashboard

### 4. **Update**
- Tasks can be updated by users on `/design-engineer/department-tasks`
- To refresh dashboard: User can refresh the page or re-visit dashboard

---

## Real Data Example Walkthrough

### Step 1: User navigates to dashboard
```
HTTP: GET /api/department/portal/role/design_engineer
Response: { roleId: 5 }
```

### Step 2: Fetch all design engineer tasks
```
HTTP: GET /api/department/portal/tasks/5

Returns 8 tasks:
- 3 pending
- 2 in_progress
- 2 completed
- 1 on_hold
- 1 critical priority
```

### Step 3: Fetch statistics
```
HTTP: GET /api/department/portal/stats/5

Returns: {
  "total": 8,
  "pending": 3,
  "in_progress": 2,
  "completed": 2,
  "on_hold": 1,
  "critical_count": 1
}
```

### Step 4: Process tasks
```
generateStatisticsFromTasks() processes 8 tasks:
- Creates 4 KPI cards
- Generates chart data
```

### Step 5: Render dashboard
```
Display:
✓ 4 KPI cards with real numbers
✓ Bar chart showing 1 critical, 2 high, 3 medium, 2 low
✓ Doughnut chart showing status distribution
✓ Top 5 root cards with real customer data
✓ Task statistics with progress bars
✓ Recent 4 tasks in timeline
```

---

## Key Features

### ✅ Real Data Only
- No hardcoded mock values
- All data from API
- Live updates when tasks change

### ✅ Error Handling
- Graceful error display
- Descriptive error messages
- User-friendly fallbacks

### ✅ Loading States
- Shows spinner while fetching
- Prevents flickering
- Better UX

### ✅ Data Filtering
- Tasks filtered by status
- Tasks filtered by priority
- Counts calculated dynamically

### ✅ Date Formatting
- Uses Indian locale (en-IN)
- Displays in DD/MM/YYYY format

### ✅ Responsive Design
- Works on mobile/tablet/desktop
- Charts are responsive
- Grid layouts are adaptive

---

## How to Add More Sections

To add a new section to the dashboard:

### 1. Create a fetch function:
```javascript
const fetchNewData = async (roleId) => {
  const response = await fetch(`/api/endpoint/${roleId}`);
  const data = await response.json();
  setNewData(data);
};
```

### 2. Add to fetchDashboardData:
```javascript
await Promise.all([
  fetchTasksForDesignEngineer(roleId),
  fetchTaskStats(roleId),
  fetchNewData(roleId),  // ← Add here
]);
```

### 3. Add state variable:
```javascript
const [newData, setNewData] = useState([]);
```

### 4. Render new section:
```javascript
<div className="...">
  {newData.map(item => (...))}
</div>
```

---

## Testing the Dashboard

### Test 1: Verify Real Data
1. Open browser DevTools → Network tab
2. Visit `/design-engineer/dashboard`
3. Check API calls in Network tab
4. Verify responses contain real data
5. Verify dashboard displays that data

### Test 2: Create Test Data
1. Log in as admin
2. Create a sales order
3. Set status to "assigned" or "ready_to_start"
4. Tasks automatically created for design_engineer role
5. Visit dashboard
6. Verify new tasks appear

### Test 3: Update Task Status
1. Visit `/design-engineer/department-tasks`
2. Click update button on a task
3. Change status
4. Return to dashboard
5. Verify counts updated

---

## Summary

The Design Engineer Dashboard now:
- ✅ Fetches real data from 3 API endpoints
- ✅ Displays live task counts and statistics
- ✅ Shows actual root cards and projects
- ✅ Handles errors gracefully
- ✅ Shows loading states
- ✅ Updates dynamically based on database
- ✅ No mock data whatsoever
