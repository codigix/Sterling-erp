import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const EmployeeAttendance = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    presentDays: 0,
    absenceDays: 0,
    halfDays: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const response = await axios.get(`/api/employee/portal/attendance/${user.id}`);
          setAttendance(response.data.attendance || []);
          setStats(response.data.stats || {});
        }
      } catch (err) {
        setError('Failed to load attendance');
        console.error('Fetch attendance error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user?.id]);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(timeString);
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setCheckOutTime(timeString);
    setIsCheckedIn(false);
  };

  const getStatusBadge = (status) => {
    if (status === "present") {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Present</Badge>;
    }
    if (status === "half_day") {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Half Day</Badge>;
    }
    if (status === "absent") {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Absent</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Attendance
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your daily attendance and check-in/check-out status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-green-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Present Days</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.presentDays}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">Regular attendance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Half Days</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.halfDays}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Partial attendance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Absences</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.absenceDays}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">Days absent</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Attendance Rate</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.attendancePercentage}%</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Excellent</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Today's Check-In/Out
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Status</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {isCheckedIn ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Checked In
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    Not Checked In
                  </>
                )}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Check-In Time</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {checkInTime || "---"}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Check-Out Time</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {checkOutTime || "---"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              className="flex-1 flex items-center justify-center gap-2"
              variant={isCheckedIn ? "secondary" : "default"}
            >
              <Clock className="w-4 h-4" />
              Check In
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
              className="flex-1 flex items-center justify-center gap-2"
              variant={!isCheckedIn ? "secondary" : "default"}
            >
              <Clock className="w-4 h-4" />
              Check Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Attendance History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{record.date}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {record.checkIn === "-" ? "No attendance record" : `${record.checkIn} - ${record.checkOut}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Duration: {record.hours}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(record.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;
