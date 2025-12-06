import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { AlertCircle, X, CheckCircle, Bell, Trash2 } from "lucide-react";

const EmployeeAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const response = await axios.get(`/api/employee/portal/alerts/${user.id}`);
          setAlerts(response.data || []);
        }
      } catch (error) {
        console.error('Fetch alerts error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user?.id]);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const markAsRead = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "error": return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
      case "warning": return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700";
      case "success": return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700";
      default: return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700";
    }
  };

  const getAlertBadgeColor = (type) => {
    switch (type) {
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "success": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "error": return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default: return <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Alerts & Notifications
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Stay updated with important notifications and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full font-semibold">
            {unreadCount} new
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              You're all caught up! No new alerts.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Check back soon for updates
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border ${getAlertColor(alert.type)} ${!alert.read ? 'ring-2 ring-primary-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1 flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</h4>
                        <Badge className={getAlertBadgeColor(alert.type)}>
                          {alert.type}
                        </Badge>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-600"
                      title="Dismiss"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeAlerts;
