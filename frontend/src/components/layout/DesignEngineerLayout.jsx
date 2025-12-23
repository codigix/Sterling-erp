import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleDashboardLayout from './RoleDashboardLayout';
import {
  Wrench,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

// Dashboard
import DesignEngineerDashboard from '../../pages/roles/DesignEngineerDashboard';

// Documents
import MyDesignsPage from '../../pages/design-engineer/documents/MyDesignsPage';
import DrawingsPage from '../../pages/design-engineer/documents/DrawingsPage';
import SpecificationsPage from '../../pages/design-engineer/documents/SpecificationsPage';
import TechnicalFilesPage from '../../pages/design-engineer/documents/TechnicalFilesPage';

// BOM
import CreateBOMPage from '../../pages/design-engineer/bom/CreateBOMPage';
import ViewBOMsPage from '../../pages/design-engineer/bom/ViewBOMsPage';
import BOMHistoryPage from '../../pages/design-engineer/bom/BOMHistoryPage';

// Reviews
import PendingReviewsPage from '../../pages/design-engineer/reviews/PendingReviewsPage';
import ApprovedReviewsPage from '../../pages/design-engineer/reviews/ApprovedReviewsPage';
import RejectedReviewsPage from '../../pages/design-engineer/reviews/RejectedReviewsPage';

// Tasks
import MyTasksPage from '../../pages/design-engineer/tasks/MyTasksPage';
import ProjectTasksPage from '../../pages/design-engineer/tasks/ProjectTasksPage';
import TaskDetailPage from '../../pages/design-engineer/tasks/TaskDetailPage';

// Reports
import DesignEngineerReportsPage from '../../pages/design-engineer/DesignEngineerReportsPage';

// Project Details
import ProjectDetailsPage from '../../pages/design-engineer/ProjectDetailsPage';
import ProjectListPage from '../../pages/design-engineer/ProjectListPage';
import CreateProjectPage from '../../pages/design-engineer/CreateProjectPage';
import ProjectDetailViewPage from '../../pages/design-engineer/ProjectDetailViewPage';

const navigationItems = [
  {
    title: 'Dashboard',
    path: '/design-engineer/dashboard',
    icon: Wrench,
  },
  {
    title: 'Project Details',
    path: '/design-engineer/project-details',
    icon: FileText,
  },
  {
    title: 'Design Documents',
    icon: FileText,
    submenu: [
      { title: 'My Designs', path: '/design-engineer/documents/designs', icon: Wrench },
      { title: 'Drawings', path: '/design-engineer/documents/drawings', icon: FileText },
      { title: 'Specifications', path: '/design-engineer/documents/specs', icon: FileText },
      { title: 'Technical Files', path: '/design-engineer/documents/technical', icon: FileText },
    ]
  },
  {
    title: 'Bill of Materials',
    icon: BarChart3,
    submenu: [
      { title: 'Create BOM', path: '/design-engineer/bom/create', icon: FileText },
      { title: 'View BOMs', path: '/design-engineer/bom/view', icon: BarChart3 },
      { title: 'BOM History', path: '/design-engineer/bom/history', icon: Clock },
    ]
  },
  {
    title: 'Reviews & Approvals',
    icon: CheckCircle,
    submenu: [
      { title: 'Pending Reviews', path: '/design-engineer/reviews/pending', icon: Clock },
      { title: 'Approved', path: '/design-engineer/reviews/approved', icon: CheckCircle },
      { title: 'Rejected', path: '/design-engineer/reviews/rejected', icon: AlertCircle },
    ]
  },
  {
    title: 'Engineering Tasks',
    icon: Clock,
    submenu: [
      { title: 'My Tasks', path: '/design-engineer/tasks/list', icon: Clock },
      { title: 'Project Tasks', path: '/design-engineer/tasks/projects', icon: Wrench },
    ]
  },
  {
    title: 'Reports',
    path: '/design-engineer/reports',
    icon: BarChart3,
  },
];

const DesignEngineerLayout = () => {
  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="Design Engineer"
      roleIcon={Wrench}
    >
      <Routes>
        <Route path="dashboard" element={<DesignEngineerDashboard />} />
        <Route path="project-details" element={<ProjectDetailsPage />} />
        <Route path="project-details/new" element={<CreateProjectPage />} />
        <Route path="project-details/view" element={<ProjectDetailViewPage />} />
        
        {/* Documents Routes */}
        <Route path="documents/designs" element={<MyDesignsPage />} />
        <Route path="documents/drawings" element={<DrawingsPage />} />
        <Route path="documents/specs" element={<SpecificationsPage />} />
        <Route path="documents/technical" element={<TechnicalFilesPage />} />
        
        {/* BOM Routes */}
        <Route path="bom/create" element={<CreateBOMPage />} />
        <Route path="bom/view" element={<ViewBOMsPage />} />
        <Route path="bom/history" element={<BOMHistoryPage />} />
        
        {/* Reviews Routes */}
        <Route path="reviews/pending" element={<PendingReviewsPage />} />
        <Route path="reviews/approved" element={<ApprovedReviewsPage />} />
        <Route path="reviews/rejected" element={<RejectedReviewsPage />} />
        
        {/* Tasks Routes */}
        <Route path="tasks/list" element={<MyTasksPage />} />
        <Route path="tasks/projects" element={<ProjectTasksPage />} />
        <Route path="tasks/detail/:taskId" element={<TaskDetailPage />} />
        
        {/* Reports Route */}
        <Route path="reports" element={<DesignEngineerReportsPage />} />
        
        <Route path="*" element={<Navigate to="/design-engineer/dashboard" replace />} />
      </Routes>
    </RoleDashboardLayout>
  );
};

export default DesignEngineerLayout;
