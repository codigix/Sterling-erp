import React from 'react';
import { ProjectsTab } from './AdminDashboard';

const ProjectsPage = () => {
  const projects = {
    progress: [
      {
        name: 'Manufacturing System Upgrade',
        status: 'On Track',
        deadline: '2025-12-30',
        progress: 85,
      },
      {
        name: 'Quality Control Automation',
        status: 'On Track',
        deadline: '2026-01-15',
        progress: 72,
      },
      {
        name: 'Production Line 2 Optimization',
        status: 'Delayed',
        deadline: '2025-12-20',
        progress: 60,
      },
      {
        name: 'Inventory Management System',
        status: 'On Track',
        deadline: '2026-02-10',
        progress: 45,
      },
      {
        name: 'Employee Training Program',
        status: 'On Track',
        deadline: '2026-01-31',
        progress: 68,
      },
      {
        name: 'Supply Chain Integration',
        status: 'Delayed',
        deadline: '2025-12-25',
        progress: 55,
      },
      {
        name: 'Energy Efficiency Initiative',
        status: 'On Track',
        deadline: '2026-03-15',
        progress: 38,
      },
      {
        name: 'Safety Compliance Upgrade',
        status: 'On Track',
        deadline: '2026-01-20',
        progress: 92,
      },
      {
        name: 'Data Analytics Platform',
        status: 'Delayed',
        deadline: '2026-01-10',
        progress: 50,
      },
      {
        name: 'Customer Portal Development',
        status: 'On Track',
        deadline: '2026-02-28',
        progress: 78,
      },
    ],
  };

  return <ProjectsTab projects={projects} />;
};

export default ProjectsPage;
