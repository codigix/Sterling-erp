import React, { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from '../ui/Modal';
import SwipeButton from '../ui/SwipeButton';
import Badge from '../ui/Badge';
import { Clock, AlertCircle, X, CheckCircle2 } from 'lucide-react';

const TaskDetailModal = ({ task, isOpen, onClose, onTaskComplete, isUpdating }) => {

  if (!task) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === "critical" || priority === "high") return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const handleSwipeComplete = async () => {
    await onTaskComplete(task.id, 'completed');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={null} closeOnOverlayClick={false}>
      <div className="flex items-start justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{task.title}</h2>
          <div className="flex gap-2 flex-wrap">
            <Badge className={getStatusColor(task.status)}>
              {task.status === 'completed' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> COMPLETED
                </>
              ) : (
                task.status.replace("_", " ")
              )}
            </Badge>
            <Badge className={getPriorityColor(task.priority)} title={task.priority}>
              {getPriorityIcon(task.priority)} {task.priority}
            </Badge>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex-shrink-0 ml-4"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 p-6 bg-white dark:bg-slate-900">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Description</p>
          <p className="text-slate-900 dark:text-white">{task.description || 'No description provided'}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            {task.root_card_title && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Root Card</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{task.root_card_title}</p>
              </div>
            )}

            {task.stage_name && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Stage</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{task.stage_name}</p>
              </div>
            )}

            {task.project_name && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Project</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{task.project_name}</p>
              </div>
            )}

            {task.project_code && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Project Code</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{task.project_code}</p>
              </div>
            )}

            {task.po_number && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">PO Number</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{task.po_number}</p>
              </div>
            )}

            {task.due_date && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Due Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(task.due_date).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}

            {task.created_at && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Created Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(task.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}

            {task.started_at && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Started Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(task.started_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}

            {task.completed_at && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Completed Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(task.completed_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}

            {task.customer && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Customer</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{task.customer}</p>
              </div>
            )}

            {/* {task.notes && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Notes</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{task.notes}</p>
              </div>
            )} */}
          </div>
        </div>

        <div className="pt-2">
          <SwipeButton
            onSwipeComplete={handleSwipeComplete}
            isLoading={isUpdating}
            isCompleted={task.status === 'completed'}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
