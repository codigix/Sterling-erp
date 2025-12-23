import { useState } from 'react';
import { Send, Plus, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

const RequestToManagerPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'Need Additional Resources for Task #5',
      description: 'The quality check task requires additional testing equipment that is currently unavailable',
      type: 'resource-request',
      status: 'pending',
      createdDate: '2025-12-15',
      dueDate: '2025-12-18',
      priority: 'high',
      response: null,
    },
    {
      id: 2,
      title: 'Request Task Extension',
      description: 'Machine Calibration task needs 2 more days due to equipment malfunction',
      type: 'extension-request',
      status: 'approved',
      createdDate: '2025-12-14',
      dueDate: '2025-12-30',
      priority: 'high',
      response: 'Approved. New deadline: 2025-12-27',
    },
    {
      id: 3,
      title: 'Clarification on Weekly Report Requirements',
      description: 'Need clarification on the format and specific metrics required for weekly quality report',
      type: 'clarification',
      status: 'responded',
      createdDate: '2025-12-12',
      dueDate: '2025-12-19',
      priority: 'medium',
      response: 'Please follow the template provided in the shared folder. Contact QC manager for specific metrics.',
    },
    {
      id: 4,
      title: 'Task Reassignment Request',
      description: 'Request to reassign equipment maintenance task to another team member due to schedule conflict',
      type: 'reassignment',
      status: 'rejected',
      createdDate: '2025-12-10',
      dueDate: '2025-12-15',
      priority: 'medium',
      response: 'Cannot reassign. Please adjust your schedule accordingly.',
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'resource-request',
    priority: 'medium',
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'resource-request': 'Resource Request',
      'extension-request': 'Extension Request',
      'clarification': 'Clarification',
      'reassignment': 'Reassignment',
      'urgent': 'Urgent Request',
    };
    return labels[type] || type;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      const newRequest = {
        id: requests.length + 1,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: '2025-12-20',
        priority: formData.priority,
        response: null,
      };
      setRequests([newRequest, ...requests]);
      setFormData({ title: '', description: '', type: 'resource-request', priority: 'medium' });
      setShowForm(false);
      alert('Request sent successfully to Production Manager');
    }
  };

  const requestStats = [
    { label: 'Total Requests', value: requests.length, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900' },
    { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900' },
    { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900' },
    { label: 'Responded', value: requests.filter(r => r.status === 'responded').length, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Request to Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Send requests and get responses from Production Manager</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {requestStats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-6 border border-slate-200 dark:border-slate-700`}
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Request</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Request Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter request title"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Request Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="resource-request">Resource Request</option>
                <option value="extension-request">Extension Request</option>
                <option value="clarification">Clarification</option>
                <option value="reassignment">Reassignment</option>
                <option value="urgent">Urgent Request</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed description of your request"
                rows="4"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-slate-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Send size={16} />
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Request History</h2>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={40} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600 dark:text-slate-400">No requests yet</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center text-xs gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{request.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{request.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-semibold">Type:</span> {getTypeLabel(request.type)}
                      </div>
                      <div>
                        <span className="font-semibold">Priority:</span>
                        <span className={`ml-1 ${getPriorityColor(request.priority)}`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Created:</span> {request.createdDate}
                      </div>
                      <div>
                        <span className="font-semibold">Due:</span> {request.dueDate}
                      </div>
                    </div>
                  </div>
                </div>

                {request.response && (
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Manager Response:</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{request.response}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex items-center text-xs gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                    <Clock size={14} />
                    Waiting for manager response...
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestToManagerPage;
