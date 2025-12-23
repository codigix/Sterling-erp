import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { User, Mail, Briefcase, Building2, Lock, Save, Edit2 } from "lucide-react";

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Please fill all password fields");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    alert("Password changed successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold  dark: mb-2">
          My Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and manage your profile information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xs space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center text-xs justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0) || "E"}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold  text-left">
                {user?.name}
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">{user?.designation}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Employee ID: EMP-{String(user?.id).padStart(5, '0')}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Email Address</p>
                <p className=" dark: flex items-center text-xs gap-2 font-medium">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user?.email}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Designation</p>
                <p className=" dark: flex items-center text-xs gap-2 font-medium">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {user?.designation}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Department</p>
                <p className=" dark: flex items-center text-xs gap-2 font-medium">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {user?.department}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Role</p>
                <p className="text-slate-900 dark:text-white font-medium">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex items-center text-xs gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xs space-x-2">
            <Lock className="w-5 h-5" />
            <span>Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Enter your current password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark: placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark: placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">At least 8 characters, mix of upper/lower case and numbers</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark: placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <Button onClick={handleChangePassword} className="flex items-center text-xs gap-2 w-full justify-center">
            <Save className="w-4 h-4" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">24</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Projects</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">156</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Hours</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">95%</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Attendance</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">38</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Tasks Done</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
