import { useState } from 'react';
import { MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const RequestHistoryPage = () => {
  const [requestHistory, setRequestHistory] = useState([
    {
      id: 1,
      title: 'Need Additional Resources for Task #5',
      description: 'The quality check task requires additional testing equipment that is currently unavailable',
      type: 'resource-request',
      status: 'pending',
      priority: 'high',
      createdDate: '2025-12-15',
      dueDate: '2025-12-18',
      response: null,
      responseDate: null,
    },
    {
      id: 2,
      title: 'Request Task Extension',
      description: 'Machine Calibration task needs 2 more days due to equipment malfunction',
      type: 'extension-request',
      status: 'approved',
      priority: 'high',
      createdDate: '2025-12-14',
      dueDate: '2025-12-30',
      response: 'Approved. New deadline: 2025-12-27. Please ensure completion by the new date.',
      responseDate: '2025-12-14',
    },
    {
      id: 3,
      title: 'Clarification on Weekly Report Requirements',
      description: 'Need clarification on the format and specific metrics required for weekly quality report',
      type: 'clarification',
      status: 'responded',
      priority: 'medium',
      createdDate: '2025-12-12',
      dueDate: '2025-12-19',
      response: 'Please follow the template provided in the shared folder. Contact QC manager for specific metrics. Required metrics: Defect rate, Production capacity, Quality score.',
      responseDate: '2025-12-12',
    },
    {
      id: 4,
      title: 'Task Reassignment Request',
      description: 'Request to reassign equipment maintenance task to another team member due to schedule conflict',
      type: 'reassignment',
      status: 'rejected',
      priority: 'medium',
      createdDate: '2025-12-10',
      dueDate: '2025-12-15',
      response: 'Cannot reassign at this moment. The task is critical for the current production schedule. Please adjust your schedule accordingly. Speak to the manager if you need help.',
      responseDate: '2025-12-10',
    },
    {
      id: 5,
      title: 'Request for Additional Training',
      description: 'Need training on new quality control equipment before starting the next project',
      type: 'training-request',
      status: 'approved',
      priority: 'low',
      createdDate: '2025-12-08',
      dueDate: '2025-12-15',
      response: 'Training scheduled for 2025-12-18 at 2:00 PM. The QC team lead will conduct the session.',
      responseDate: '2025-12-08',
    },
    {
      id: 6,
      title: 'Equipment Issue Report',
      description: 'Grinding machine at Station 3 is producing unusual vibrations and noise',
      type: 'urgent',
      status: 'approved',
      priority: 'high',
      createdDate: '2025-12-07',
      dueDate: '2025-12-07',
      response: 'Maintenance team has been alerted. Equipment has been taken for inspection. Alternative station assigned.',
      responseDate: '2025-12-07',
    },
    {
      id: 7,
      title: 'Resource Availability Check',
      description: 'Checking if 500 units of raw material type X are available for next week\'s production',
      type: 'clarification',
      status: 'responded',
      priority: 'low',
      createdDate: '2025-12-05',
      dueDate: '2025-12-08',
      response: 'Currently we have 350 units in stock. Additional 200 units are expected by 2025-12-12. You can proceed with 350 units now.',
      responseDate: '2025-12-05',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredRequests = requestHistory.filter(req => {
    const statusMatch = filterStatus === 'all' || req.status === filterStatus;
    const typeMatch = filterType === 'all' || req.type === filterType;
    return statusMatch && typeMatch;
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
      'training-request': 'Training Request',
      'urgent': 'Urgent Request',
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'responded':
        return <MessageCircle size={16} className="text-blue-600" />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  const stats = [
    { label: 'Total Requests', value: requestHistory.length, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900' },
    { label: 'Approved', value: requestHistory.filter(r => r.status === 'approved').length, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900' },
    { label: 'Pending', value: requestHistory.filter(r => r.status === 'pending').length, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900' },
    { label: 'Responded', value: requestHistory.filter(r => ['approved', 'rejected', 'responded'].includes(r.status)).length, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Request History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View all your past requests and manager responses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-6 border border-slate-200 dark:border-slate-700`}
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="responded">Responded</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="resource-request">Resource Request</option>
              <option value="extension-request">Extension Request</option>
              <option value="clarification">Clarification</option>
              <option value="reassignment">Reassignment</option>
              <option value="training-request">Training Request</option>
              <option value="urgent">Urgent Request</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={40} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
            >
              <div
                className="cursor-pointer"
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center text-xs gap-2 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="font-bold text-slate-900 dark:text-white">{request.title}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-slate-600 dark:text-slate-400">
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
                      <div>
                        {request.responseDate && (
                          <>
                            <span className="font-semibold">Responded:</span> {request.responseDate}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold flex-shrink-0 ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>

              {expandedId === request.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Request Details</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{request.description}</p>
                  </div>

                  {request.response && (
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Manager Response</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{request.response}</p>
                    </div>
                  )}

                  {request.status === 'pending' && !request.response && (
                    <div className="flex items-center text-xs gap-2 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                      <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-300">
                        Waiting for manager response...
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestHistoryPage;
