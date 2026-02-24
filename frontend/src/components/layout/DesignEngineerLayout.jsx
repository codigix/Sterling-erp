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
import RawDesignsPage from '../../pages/design-engineer/documents/RawDesignsPage';
import RequiredDocsPage from '../../pages/design-engineer/documents/RequiredDocsPage';

// BOM
import CreateBOMPage from '../../pages/design-engineer/bom/CreateBOMPage';
import ViewBOMsPage from '../../pages/design-engineer/bom/ViewBOMsPage';
import BOMDetailsPage from '../../pages/design-engineer/bom/BOMDetailsPage';
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
import RootCardDetailPage from '../../pages/design-engineer/RootCardDetailPage';

const navigationItems = [
  {
    title: 'Dashboard',
    path: '/design-engineer/dashboard',
    icon: Wrench,
  },
  {
    title: 'Root Cards',
    path: '/design-engineer/root-cards',
    icon: FileText,
  },
  {
    title: 'Design Documents',
    icon: FileText,
    submenu: [
      { title: 'Raw Design and Drawings', path: '/design-engineer/documents/raw-designs', icon: FileText },
      { title: 'Required Documents for Project', path: '/design-engineer/documents/required-docs', icon: FileText },
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
        <Route path="root-cards" element={<ProjectDetailsPage />} />
        <Route path="root-cards/:rootCardId" element={<RootCardDetailPage />} />
        
        {/* Documents Routes */}
        <Route path="documents/raw-designs" element={<RawDesignsPage />} />
        <Route path="documents/required-docs" element={<RequiredDocsPage />} />
        
        {/* BOM Routes */}
        <Route path="bom/create" element={<CreateBOMPage />} />
        <Route path="bom/view" element={<ViewBOMsPage />} />
        <Route path="bom/view/:id" element={<BOMDetailsPage />} />
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
