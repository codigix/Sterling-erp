import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import { Target, Calendar, TrendingUp } from "lucide-react";

const ProjectsTab = ({ projects }) => (
  <div className="w-full space-y-8 overflow-x-hidden">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Active Projects</span>
              </CardTitle>
              <Badge variant="secondary">{projects.progress.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {projects.progress.map((project, index) => (
                <div
                  key={index}
                  className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {project.name}
                      </h4>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            project.status === "On Track"
                              ? "success"
                              : project.status === "Delayed"
                              ? "warning"
                              : "error"
                          }
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Due: {project.deadline}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        project.status === "On Track"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : project.status === "Delayed"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-base">Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Completed This Month
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  6
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  18
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Delayed
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  4
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <CardTitle className="text-base flex items-center space-x-2">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span>Average Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {Math.round(
                  projects.progress.reduce((acc, p) => acc + p.progress, 0) /
                    projects.progress.length
                )}
                %
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                across all projects
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default ProjectsTab;
