import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import Button from "../../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flag,
} from "lucide-react";

const TaskAssignmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    departmentId: "",
    employeeId: "",
    title: "",
    description: "",
    type: "general",
    priority: "medium",
    dueDate: "",
    notes: "",
  });

  const [assignedTasks, setAssignedTasks] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/employee/portal/departments");
      setDepartments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError("Failed to load departments");
    }
  };

  const fetchEmployeesByDepartment = async (departmentId) => {
    try {
      if (!departmentId) {
        setEmployees([]);
        return;
      }
      const response = await axios.get(
        `/employee/portal/departments/${departmentId}/employees`
      );
      setEmployees(response.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setFormData({
      ...formData,
      departmentId: deptId,
      employeeId: "",
    });
    fetchEmployeesByDepartment(deptId);
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setFormData({
      ...formData,
      employeeId: empId,
    });

    const selected = employees.find((emp) => emp.id.toString() === empId);
    setSelectedEmployee(selected);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.title) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("/employee/portal/assign-task", {
        employeeId: parseInt(formData.employeeId),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        notes: formData.notes,
      });

      setSuccessMessage(
        `Task assigned to ${selectedEmployee?.name} successfully!`
      );

      setFormData({
        departmentId: "",
        employeeId: "",
        title: "",
        description: "",
        type: "general",
        priority: "medium",
        dueDate: "",
        notes: "",
      });

      setSelectedEmployee(null);
      setEmployees([]);

      setTimeout(() => setSuccessMessage(null), 3000);
      setShowForm(false);
    } catch (err) {
      console.error("Assignment error:", err);
      setError(
        err.response?.data?.message || "Failed to assign task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Task Assignment
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Assign tasks to employees by department
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Assign New Task"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg border border-green-200 dark:border-green-900/50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {showForm && (
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-900/50">
            <CardHeader>
              <CardTitle>Create New Task Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Department *
                    </label>
                    <select
                      value={formData.departmentId}
                      onChange={handleDepartmentChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Employee *
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={handleEmployeeChange}
                      disabled={!formData.departmentId}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        {formData.departmentId
                          ? "Select an employee"
                          : "Select a department first"}
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Complete Project Report"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Task Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="project">Project</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="support">Support</option>
                      <option value="training">Training</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide detailed instructions for the task..."
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes or comments..."
                    rows="2"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Assigning..." : "Assign Task"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Task Assignment Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  How It Works
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>✓ Select a department</li>
                  <li>✓ Choose an employee from the department</li>
                  <li>✓ Fill in task details</li>
                  <li>✓ Click "Assign Task"</li>
                  <li>✓ Task appears on employee's dashboard</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/50">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Features
                </h3>
                <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                  <li>✓ Department-filtered employee list</li>
                  <li>✓ Set task priorities and types</li>
                  <li>✓ Define due dates</li>
                  <li>✓ Add detailed descriptions</li>
                  <li>✓ Track task completion</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskAssignmentPage;
