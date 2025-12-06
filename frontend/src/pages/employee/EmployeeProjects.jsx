import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Briefcase, Users, Calendar, TrendingUp, Target } from "lucide-react";

const EmployeeProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const response = await axios.get(`/api/employee/portal/projects/${user.id}`);
          setProjects(response.data || []);
        }
      } catch (err) {
        setError('Failed to load projects');
        console.error('Fetch projects error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.id]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          My Projects
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View all projects you're assigned to
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Projects</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{projects.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Assigned to you</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">In Progress</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{projects.filter(p => p.status === 'in_progress').length}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Active projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Completed</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{projects.filter(p => p.status === 'completed').length}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">Finished</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {project.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {project.startDate} to {project.endDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace("_", " ")}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{project.progress}%</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{project.team} team members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span>{project.manager}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{project.endDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeProjects;
