import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import { BarChart3, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Calendar, CheckSquare } from "lucide-react";

const EmployeeDashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    attendanceRate: 0,
    upcomingTasks: 0,
    projectsActive: 0,
    hoursLogged: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.id) {
          const response = await axios.get(`/api/employee/portal/stats/${user.id}`);
          setStats({
            tasksCompleted: response.data.tasksCompleted || 0,
            tasksInProgress: response.data.tasksInProgress || 0,
            attendanceRate: response.data.attendanceRate || 0,
            upcomingTasks: response.data.tasksPending || 0,
            projectsActive: 2,
            hoursLogged: response.data.hoursLogged || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold  dark: mb-2">
          Welcome back, {user?.name || 'Employee'}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {user?.designation} • {user?.department}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all border-l-4 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Tasks Completed</p>
                <p className="text-3xl font-bold  dark:">{stats.tasksCompleted}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 2 this week</p>
              </div>
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center text-xs justify-center">
                <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">In Progress</p>
                <p className="text-3xl font-bold  dark:">{stats.tasksInProgress}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">2 due this week</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center text-xs justify-center">
                <TrendingUp className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold  dark:">{stats.attendanceRate}%</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">On track</p>
              </div>
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center text-xs justify-center">
                <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Upcoming Tasks</p>
                <p className="text-3xl font-bold  dark:">{stats.upcomingTasks}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Next 7 days</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center text-xs justify-center">
                <AlertCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Projects</p>
                <p className="text-3xl font-bold  dark:">{stats.projectsActive}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Running smoothly</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center text-xs justify-center">
                <BarChart3 className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-cyan-500">
          <CardContent className="p-6">
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Hours Logged</p>
                <p className="text-3xl font-bold  dark:">{stats.hoursLogged}h</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">This month</p>
              </div>
              <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center text-xs justify-center">
                <Clock className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xs gap-2">
              <CheckSquare className="w-5 h-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { title: "Fix Login Bug", status: "In Progress", priority: "High" },
              { title: "Database Migration", status: "Pending", priority: "Medium" },
              { title: "API Documentation", status: "In Progress", priority: "Low" }
            ].map((task, i) => (
              <div key={i} className="flex items-center text-xs justify-between p-3 rounded bg-slate-50 dark:bg-slate-700/50">
                <div>
                  <p className="font-medium  dark: text-sm">{task.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{task.status}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xs gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { event: "Team Standup", date: "Today, 10:00 AM" },
              { event: "Project Review", date: "Tomorrow, 2:00 PM" },
              { event: "Sprint Planning", date: "Friday, 11:00 AM" }
            ].map((item, i) => (
              <div key={i} className="flex items-center text-xs justify-between p-3 rounded bg-slate-50 dark:bg-slate-700/50">
                <div>
                  <p className="font-medium  dark: text-sm">{item.event}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboardHome;
