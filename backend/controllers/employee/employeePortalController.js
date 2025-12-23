const Employee = require('../../models/Employee');
const EmployeeTask = require('../../models/EmployeeTask');

exports.getEmployeeStats = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const stats = await EmployeeTask.getStatsByEmployee(employeeId);
    
    res.json({
      tasksCompleted: stats.completed || 0,
      tasksInProgress: stats.in_progress || 0,
      tasksPending: stats.pending || 0,
      tasksTotal: stats.total || 0,
      attendanceRate: 95,
      hoursLogged: 156
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, priority } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    let tasks = await EmployeeTask.getEmployeeTasks(employeeId);

    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }

    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }

    const formatted = tasks.map(task => ({
      id: task.id,
      taskId: task.id,
      title: task.task,
      description: task.root_card_title || 'No description',
      status: task.status,
      priority: task.priority || 'medium',
      dueDate: task.due_date || task.due_date,
      assignedBy: 'Manager',
      stageName: task.stage_name,
      stageId: task.stage_id,
      rootCard: {
        id: task.root_card_id,
        title: task.root_card_title,
        priority: task.priority
      },
      project: {
        id: task.project_id,
        name: task.project_name,
        code: task.project_code
      },
      salesOrder: task.sales_order_id ? {
        id: task.sales_order_id,
        poNumber: task.po_number,
        customer: task.customer,
        total: task.total,
        orderDate: task.order_date,
        dueDate: task.due_date
      } : null,
      createdAt: task.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get employee tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const attendance = [
      { id: 1, date: '2025-12-02', status: 'present', checkIn: '09:15 AM', checkOut: '06:00 PM', hours: '8.75h' },
      { id: 2, date: '2025-12-01', status: 'present', checkIn: '09:30 AM', checkOut: '05:45 PM', hours: '8.25h' },
      { id: 3, date: '2025-11-30', status: 'half_day', checkIn: '09:00 AM', checkOut: '01:00 PM', hours: '4h' },
      { id: 4, date: '2025-11-29', status: 'absent', checkIn: '-', checkOut: '-', hours: '0h' },
      { id: 5, date: '2025-11-28', status: 'present', checkIn: '09:45 AM', checkOut: '06:15 PM', hours: '8.5h' }
    ];

    const stats = {
      presentDays: 18,
      absenceDays: 1,
      halfDays: 2,
      attendancePercentage: 95
    };

    res.json({ attendance, stats });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeProjects = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const projects = [
      { id: 1, name: 'Dashboard Redesign', status: 'in_progress', progress: 65, team: 4, startDate: '2025-11-01', endDate: '2025-12-15', manager: 'John Smith', priority: 'high' },
      { id: 2, name: 'Mobile App Development', status: 'in_progress', progress: 40, team: 6, startDate: '2025-11-15', endDate: '2026-01-30', manager: 'Sarah Johnson', priority: 'critical' },
      { id: 3, name: 'API Integration', status: 'completed', progress: 100, team: 3, startDate: '2025-10-01', endDate: '2025-11-30', manager: 'Mike Chen', priority: 'medium' },
      { id: 4, name: 'Performance Optimization', status: 'pending', progress: 0, team: 2, startDate: '2025-12-10', endDate: '2026-01-15', manager: 'Lisa Brown', priority: 'medium' }
    ];

    res.json(projects);
  } catch (error) {
    console.error('Get employee projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeAlerts = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const alerts = [
      { id: 1, title: 'Task Overdue', message: "Your task 'Database Migration' is overdue by 2 days", type: 'error', timestamp: '2 hours ago', read: false },
      { id: 2, title: 'Meeting Reminder', message: 'Team standup meeting in 30 minutes in Conference Room A', type: 'warning', timestamp: '30 minutes ago', read: false },
      { id: 3, title: 'Project Milestone', message: 'Dashboard project reached 50% completion - Great work!', type: 'success', timestamp: '1 hour ago', read: true },
      { id: 4, title: 'Document Update', message: 'New project guidelines have been updated. Please review', type: 'info', timestamp: '3 hours ago', read: true },
      { id: 5, title: 'Performance Alert', message: 'Your performance this quarter: Excellent (4.8/5)', type: 'success', timestamp: '1 day ago', read: true },
      { id: 6, title: 'Task Assignment', message: "You have been assigned to 'API Documentation' task", type: 'info', timestamp: '2 days ago', read: true }
    ];

    res.json(alerts);
  } catch (error) {
    console.error('Get employee alerts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCompanyUpdates = async (req, res) => {
  try {
    const updates = [
      { id: 1, title: 'Project Kickoff', description: 'Dashboard Redesign project officially started today. First sprint planning scheduled for tomorrow at 2 PM.', author: 'Project Manager', date: '2025-12-02', priority: 'high', category: 'Project' },
      { id: 2, title: 'System Maintenance', description: 'Planned server maintenance tonight 11 PM - 3 AM EST. Please save your work before that time.', author: 'IT Admin', date: '2025-12-01', priority: 'medium', category: 'System' },
      { id: 3, title: 'New Feature Release', description: 'Employee portal now includes real-time project tracking and advanced analytics features. Check it out!', author: 'Development Team', date: '2025-11-28', priority: 'low', category: 'Feature' },
      { id: 4, title: 'Policy Update', description: 'Updated work-from-home policy is now in effect. You can WFH up to 3 days per week with manager approval.', author: 'HR Department', date: '2025-11-25', priority: 'high', category: 'Policy' },
      { id: 5, title: 'Team Expansion', description: 'Welcoming 5 new team members to our department! Onboarding starts next Monday.', author: 'Department Lead', date: '2025-11-22', priority: 'medium', category: 'Team' },
      { id: 6, title: 'Training Opportunity', description: "Free professional development training: 'Advanced React & Performance Optimization' - Register by Friday!", author: 'L&D Team', date: '2025-11-20', priority: 'low', category: 'Training' }
    ];

    res.json(updates);
  } catch (error) {
    console.error('Get company updates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
