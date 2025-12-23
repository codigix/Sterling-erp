import React from 'react';
import { Clock, MessageSquare, Download } from 'lucide-react';

const PendingReviewsPage = () => {
  const reviews = [
    { id: 1, design: 'Assembly Drawing v2.0', submittedBy: 'John Doe', submittedDate: '2024-12-10', reviewer: 'Mike Johnson', daysWaiting: 3 },
    { id: 2, design: 'Electrical Schematic v1.5', submittedBy: 'Jane Smith', submittedDate: '2024-12-08', reviewer: 'Sarah Lee', daysWaiting: 5 },
    { id: 3, design: 'Mechanical Layout v3.0', submittedBy: 'John Doe', submittedDate: '2024-12-05', reviewer: 'Mike Johnson', daysWaiting: 8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pending Reviews</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Designs awaiting approval</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{review.design}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Submitted by: {review.submittedBy}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">Waiting for review by:</p>
                <p className="font-semibold text-slate-900 dark:text-white">{review.reviewer}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 mb-4 flex items-center text-xs gap-2">
              <Clock size={18} className="text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">Pending for {review.daysWaiting} days</span>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                <MessageSquare size={18} />
                View Comments
              </button>
              <button className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center text-xs justify-center gap-2">
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingReviewsPage;
