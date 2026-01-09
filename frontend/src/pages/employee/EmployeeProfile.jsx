import React, { useState } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Lock,
  Save,
  Edit2,
  X,
} from "lucide-react";

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "",
    designation: user?.designation || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setErrorMessage("First name and last name are required");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      setIsSaving(true);
      await axios.put(`/employee/portal/profile/${user?.id}`, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        designation: profileData.designation
      });
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to update profile");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.name?.split(' ')[0] || "",
      lastName: user?.name?.split(' ').slice(1).join(' ') || "",
      designation: user?.designation || "",
    });
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setErrorMessage("Please fill all password fields");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords don't match");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      setIsChangingPassword(true);
      await axios.put(`/employee/portal/change-password/${user?.id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to change password");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-left dark:text-white mb-2">My Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and manage your profile information
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-xl border border-green-200 dark:border-green-900/50 flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-800 dark:text-green-300 hover:text-green-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-800 dark:text-red-300 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white border-2 border-blue-100 dark:border-blue-900/30 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700">
        <div className="mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center text-xs justify-center text-white text-3xl font-bold shadow-lg">
              {profileData.firstName?.charAt(0) || "E"}
            </div>
            {!isEditing ? (
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-left">{profileData.firstName} {profileData.lastName}</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1 text-sm">
                  {profileData.designation}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Employee ID: EMP-{String(user?.id).padStart(5, "0")}
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Email Address
                  </p>
                  <p className="text-slate-900 dark:text-white flex items-center gap-2 font-medium">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {user?.email}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Designation
                  </p>
                  <p className="text-slate-900 dark:text-white flex items-center gap-2 font-medium">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {profileData.designation}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Department
                  </p>
                  <p className="text-slate-900 dark:text-white flex items-center gap-2 font-medium">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {user?.department}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Role
                  </p>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {user?.role}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={profileData.designation}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      Email Address
                    </p>
                    <p className="text-slate-900 dark:text-white flex items-center gap-2 font-medium">
                      <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      {user?.email}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      Department
                    </p>
                    <p className="text-slate-900 dark:text-white flex items-center gap-2 font-medium">
                      <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      {user?.department}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="flex items-center text-xs gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center text-xs gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  onClick={handleCancelEdit}
                  className="flex items-center text-xs gap-2 bg-slate-500 hover:bg-slate-600"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-purple-100 dark:border-purple-900/30 rounded-xl p-6 hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-700">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter your current password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              At least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="flex items-center text-xs gap-2 w-full justify-center"
          >
            <Save className="w-4 h-4" />
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Statistics</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-md transition">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              24
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Projects
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-md transition">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              156
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Hours
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-md transition">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              95%
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Attendance
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-md transition">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              38
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Tasks Done
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
