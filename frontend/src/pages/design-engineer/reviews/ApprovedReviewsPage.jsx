import React from 'react';
import { CheckCircle, Download, Award } from 'lucide-react';

const ApprovedReviewsPage = () => {
  const reviews = [
    { id: 1, design: 'Assembly Drawing v1.0', approvedBy: 'Mike Johnson', approvedDate: '2024-12-01', signature: 'M.Johnson' },
    { id: 2, design: 'Electrical Schematic v1.0', approvedBy: 'Sarah Lee', approvedDate: '2024-11-28', signature: 'S.Lee' },
    { id: 3, design: 'Mechanical Layout v2.5', approvedBy: 'Mike Johnson', approvedDate: '2024-11-20', signature: 'M.Johnson' },
    { id: 4, design: 'Component Assembly v1.0', approvedBy: 'Sarah Lee', approvedDate: '2024-11-15', signature: 'S.Lee' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Approved Reviews</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Approved and finalized designs</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center text-xs gap-2 mb-2">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{review.design}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved by: <span className="font-medium">{review.approvedBy}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">{review.approvedDate}</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 mb-4 flex items-center text-xs gap-2">
              <Award size={18} className="text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">Officially approved and ready for production</span>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                <Award size={18} />
                View Approval
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

export default ApprovedReviewsPage;
