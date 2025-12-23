import React from 'react';
import { AlertCircle, Download, MessageSquare, Edit } from 'lucide-react';

const RejectedReviewsPage = () => {
  const reviews = [
    { id: 1, design: 'Assembly Drawing v1.5', rejectedBy: 'Mike Johnson', rejectedDate: '2024-12-06', reason: 'Tolerance specifications not met' },
    { id: 2, design: 'Electrical Schematic v1.2', rejectedBy: 'Sarah Lee', rejectedDate: '2024-12-03', reason: 'Missing safety certifications' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rejected Reviews</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Designs that need revisions</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center text-xs gap-2 mb-2">
                  <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{review.design}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rejected by: <span className="font-medium">{review.rejectedBy}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">Rejected Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">{review.rejectedDate}</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded p-3 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">Reason:</span> {review.reason}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                <MessageSquare size={18} />
                View Feedback
              </button>
              <button className="flex-1 px-4 py-2 bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex items-center text-xs justify-center gap-2">
                <Edit size={18} />
                Create Revision
              </button>
              <button className="px-4 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RejectedReviewsPage;
