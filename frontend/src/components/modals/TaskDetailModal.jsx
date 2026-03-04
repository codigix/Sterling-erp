import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalBody, ModalHeader } from '../ui/Modal';
import SwipeButton from '../ui/SwipeButton';
import Badge from '../ui/Badge';
import { Clock, AlertCircle, X, CheckCircle2, Play, Zap, Box, MessageSquare } from 'lucide-react';

const TaskDetailModal = ({ task, isOpen, onClose, onTaskComplete, isUpdating }) => {
  const navigate = useNavigate();
  const [producedQty, setProducedQty] = useState('');
  const [rejectedQty, setRejectedQty] = useState('');
  const [scrapQty, setScrapQty] = useState('');
  const [notes, setNotes] = useState('');

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
    // Reset form and close
    setProducedQty('');
    setRejectedQty('');
    setScrapQty('');
    setNotes('');
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
              {getPriorityIcon(task.priority)} {task.priority?.toUpperCase()}
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

      <div className="space-y-6 p-6 bg-white dark:bg-slate-900 overflow-y-auto max-h-[70vh]">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Description</p>
          <p className="text-slate-900 dark:text-white">{task.description || 'No description provided'}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            {task.job_card_no && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-1">Job Card Number</p>
                <p className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-tight">{task.job_card_no}</p>
              </div>
            )}

            {task.root_card_code && (
              <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg border border-violet-100 dark:border-violet-900/30">
                <p className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase mb-1">Root Card #</p>
                <p className="text-sm font-black text-violet-700 dark:text-violet-300 uppercase tracking-tight">{task.root_card_code}</p>
              </div>
            )}

            {task.root_card_name && (
              <div className="col-span-2 bg-violet-50/50 dark:bg-violet-900/10 p-3 rounded-lg border border-violet-100/50 dark:border-violet-900/20">
                <p className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase mb-1">Root Card Name</p>
                <p className="text-sm font-black text-violet-700 dark:text-violet-300 uppercase">{task.root_card_name}</p>
              </div>
            )}

            {task.work_order_no && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase mb-1">Work Order #</p>
                <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 uppercase">{task.work_order_no}</p>
              </div>
            )}

            {task.item_name && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase mb-1">Item Name</p>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 uppercase">{task.item_name}</p>
              </div>
            )}

            {task.po_number && (
              <div className="bg-slate-50 dark:bg-slate-900/20 p-3 rounded-lg border border-slate-100 dark:border-slate-900/30">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">PO Number</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase">{task.po_number}</p>
              </div>
            )}

            {task.started_at && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Started Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(task.started_at).toLocaleDateString('en-IN')} {new Date(task.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          {task.status === 'pending' ? (
            <div className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl font-bold border border-amber-100 dark:border-amber-900/30 shadow-sm uppercase">
              <Clock className="w-5 h-5 animate-pulse" />
              Waiting for Production to Start Task
            </div>
          ) : (
            <div>
              <SwipeButton
                onSwipeComplete={handleSwipeComplete}
                isLoading={isUpdating}
                isCompleted={task.status === 'completed'}
                text={task.status === 'in_progress' ? "Swipe to Complete Task" : "Task Completed"}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
