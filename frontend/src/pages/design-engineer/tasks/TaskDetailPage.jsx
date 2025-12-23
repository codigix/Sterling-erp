import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axios from '@/utils/api';

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const taskPageMap = {
    'Enter Project Details': '/design-engineer/project-details',
    'Prepare Design Documents': '/design-engineer/documents/designs',
    'Create and Validate BOM': '/design-engineer/bom/create',
    'Submit Design for Review': '/design-engineer/reviews/pending',
    'Follow up on Pending Reviews': '/design-engineer/reviews/pending',
    'Document Approved Designs': '/design-engineer/reviews/approved',
    'Manage Technical Files': '/design-engineer/documents/technical',
  };

  useEffect(() => {
    redirectToTaskPage();
  }, [taskId]);

  const redirectToTaskPage = async () => {
    try {
      const response = await axios.get(`/api/department/portal/tasks/detail/${taskId}`);
      const task = response.data;
      
      let redirectPath = '/design-engineer/tasks/projects';
      
      if (task.title && taskPageMap[task.title]) {
        redirectPath = `${taskPageMap[task.title]}?taskId=${taskId}&taskTitle=${encodeURIComponent(task.title)}`;
        if (task.rootCard?.id) {
          redirectPath += `&rootCardId=${task.rootCard.id}`;
        }
      }
      
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Error redirecting task:', err);
      setTimeout(() => navigate('/design-engineer/tasks/projects'), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading task...</p>
      </div>
    </div>
  );
};

export default TaskDetailPage;
