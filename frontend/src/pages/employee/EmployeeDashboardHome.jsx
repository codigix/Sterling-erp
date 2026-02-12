import React, { useState, useEffect, useCallback } from "react";
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
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStatsAndTasks = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      if (user?.id) {
        const [statsRes, tasksRes] = await Promise.all([
          axios.get(`/employee/portal/stats/${user.id}`),
          axios.get(`/employee/portal/tasks/${user.id}`)
        ]);
        
        setStats({
          tasksCompleted: statsRes.data.tasksCompleted || 0,
          tasksInProgress: statsRes.data.tasksInProgress || 0,
          attendanceRate: statsRes.data.attendanceRate || 0,
          upcomingTasks: statsRes.data.tasksPending || 0,
          projectsActive: 2,
          hoursLogged: statsRes.data.hoursLogged || 0
        });

        // Sort by creation date and take top 3
        const sortedTasks = (tasksRes.data || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setRecentTasks(sortedTasks);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStatsAndTasks(true);

    const interval = setInterval(() => {
      fetchStatsAndTasks(false);
    }, 5000); // Auto-refresh every 5 seconds

    return () => clearInterval(interval);
  }, [fetchStatsAndTasks]);

  return (
    <div className="w-full min-h-screen bg-white space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-xl text-left font-bold">
          Welcome back, {user?.name || 'Employee'}!
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-left">
          {user?.designation} • {user?.department}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tasks Completed */}
        <div className="bg-white border-2 border-green-100 dark:border-green-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-green-300 dark:hover:border-green-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-left mb-2">
                Tasks Completed
              </p>
              <p className="text-xl text-left font-bold dark:text-white">
                {stats.tasksCompleted}
              </p>
              <p className="text-xs text-left text-green-600 dark:text-green-400 mt-2 font-medium">
                ↑ 2 this week
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-900/30 rounded-xl flex items-center justify-center border border-green-200 dark:border-green-900/50">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border-2 border-blue-100 dark:border-blue-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-left mb-2">
                In Progress
              </p>
              <p className="text-xl text-left font-bold dark:text-white">
                {stats.tasksInProgress}
              </p>
              <p className="text-xs text-left text-blue-600 dark:text-blue-400 mt-2 font-medium">
                2 due this week
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-900/30 rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-900/50">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white border-2 border-amber-100 dark:border-amber-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-amber-300 dark:hover:border-amber-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-left mb-2">
                Attendance Rate
              </p>
              <p className="text-xl text-left font-bold dark:text-white">
                {stats.attendanceRate}%
              </p>
              <p className="text-xs text-left text-amber-600 dark:text-amber-400 mt-2 font-medium">
                On track
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-amber-100 dark:to-amber-900/30 rounded-xl flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border-2 border-purple-100 dark:border-purple-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-left mb-2">
                Upcoming Tasks
              </p>
              <p className="text-xl text-left font-bold dark:text-white">
                {stats.upcomingTasks}
              </p>
              <p className="text-xs text-left text-purple-600 dark:text-purple-400 mt-2 font-medium">
                Next 7 days
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-purple-100 dark:to-purple-900/30 rounded-xl flex items-center justify-center border border-purple-200 dark:border-purple-900/50">
                <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white border-2 border-orange-100 dark:border-orange-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-orange-300 dark:hover:border-orange-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-left mb-2">
                Active Projects
              </p>
              <p className="text-xl text-left font-bold dark:text-white">
                {stats.projectsActive}
              </p>
              <p className="text-xs text-left text-orange-600 dark:text-orange-400 mt-2 font-medium">
                Running smoothly
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-50 dark:from-orange-900/20 to-orange-100 dark:to-orange-900/30 rounded-xl flex items-center justify-center border border-orange-200 dark:border-orange-900/50">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Hours Logged */}
        <div className="bg-white border-2 border-cyan-100 dark:border-cyan-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-cyan-300 dark:hover:border-cyan-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-left mb-2">
                Hours Logged
              </p>
              <p className="text-xl text-left font-bold dark:text-white">
                {stats.hoursLogged}h
              </p>
              <p className="text-xs text-left text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
                This month
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-50 dark:from-cyan-900/20 to-cyan-100 dark:to-cyan-900/30 rounded-xl flex items-center justify-center border border-cyan-200 dark:border-cyan-900/50">
                <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks & Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white border-2 border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Tasks
            </h2>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent tasks</p>
            ) : (
              recentTasks.map((task, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 uppercase">{task.status.replace('_', ' ')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase whitespace-nowrap ml-2 ${
                    task.priority === 'critical' || task.priority === 'high'
                      ? 'bg-red-100 text-red-800' 
                      : task.priority === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border-2 border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Upcoming Events
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { event: "Team Standup", date: "Today, 10:00 AM" },
              { event: "Project Review", date: "Tomorrow, 2:00 PM" },
              { event: "Sprint Planning", date: "Friday, 11:00 AM" }
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{item.event}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardHome;
