import React from 'react';
import { ProjectsTab } from './AdminDashboard';

const mockProjects = {
  progress: [
    {
      name: "DRDO Missile System",
      progress: 85,
      status: "On Track",
      deadline: "2025-12-15",
    },
    {
      name: "Defense Radar Unit",
      progress: 72,
      status: "Delayed",
      deadline: "2025-11-30",
    },
    {
      name: "Naval Communication",
      progress: 91,
      status: "On Track",
      deadline: "2025-12-20",
    },
    {
      name: "Aerospace Components",
      progress: 45,
      status: "Critical",
      deadline: "2025-11-25",
    },
  ],
};

const ProjectsPage = () => {
  return <ProjectsTab projects={mockProjects} />;
};

export default ProjectsPage;
