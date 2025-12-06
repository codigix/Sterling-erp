import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { TrendingUp, Calendar, User, Megaphone } from "lucide-react";

const EmployeeUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/employee/portal/company-updates');
        setUpdates(response.data || []);
      } catch (error) {
        console.error('Fetch updates error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Project': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'System': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Feature': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Policy': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Team': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Training': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[category] || colors['System'];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Company Updates & Announcements
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Stay informed with the latest news and updates from your organization
        </p>
      </div>

      <div className="space-y-4">
        {updates.map((update) => (
          <Card key={update.id} className="hover:shadow-md transition group border-l-4 border-primary-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {update.title}
                    </h3>
                    <Badge className={getCategoryColor(update.category)}>
                      {update.category}
                    </Badge>
                    <Badge className={getPriorityColor(update.priority)}>
                      {update.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    {update.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span>{update.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{update.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeUpdates;
