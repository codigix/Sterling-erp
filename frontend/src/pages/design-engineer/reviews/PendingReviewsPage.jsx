import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, MessageSquare, Download, CheckCircle, Loader2 } from "lucide-react";
import axios from "../../../utils/api";

const PendingReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const rootCardId = searchParams.get("rootCardId");
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/production/designs");
      const designs = Array.isArray(response.data) ? response.data : response.data?.designs || [];
      
      // Filter for designs in review
      let pendingDesigns = designs.filter(d => 
        d.status === "Under Review" || d.status === "in_review"
      );

      // Filter by rootCardId if present
      if (rootCardId) {
        pendingDesigns = pendingDesigns.filter(d => String(d.rootCardId) === String(rootCardId));
      }

      pendingDesigns = pendingDesigns.map(d => ({
        id: d.id,
        design: d.title || "Untitled Design",
        submittedBy: d.author || "Design Engineer",
        submittedDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : "N/A",
        reviewer: "Lead Engineer",
        daysWaiting: Math.floor((new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24)) || 0,
        projectName: d.projectName,
        customerName: d.customerName
      }));
      
      setReviews(pendingDesigns);
    } catch (err) {
      console.error("Failed to fetch pending reviews:", err);
      setError("Failed to load pending reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (designId) => {
    try {
      setActionLoading(designId);
      await axios.patch(`/production/designs/${designId}/status`, {
        status: "completed",
      });

      if (taskId) {
        try {
          await axios.patch(`/department/portal/tasks/${taskId}`, {
            status: "completed",
          });
        } catch (taskErr) {
          console.error("Error marking task as completed:", taskErr);
        }
      }

      alert("Design approved successfully!");
      await fetchPendingReviews();
    } catch (err) {
      console.error("Failed to approve design:", err);
      alert("Failed to approve design. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
          Pending Reviews
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
          Designs awaiting approval
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {review.design}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-xs">
                    Project: {review.projectName} | Client: {review.customerName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-xs">
                    Submitted by: {review.submittedBy} on {review.submittedDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Waiting for review by:
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {review.reviewer}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 mb-4 flex items-center text-xs gap-2">
                <Clock
                  size={18}
                  className="text-yellow-600 dark:text-yellow-400"
                />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Pending for {review.daysWaiting} days
                </span>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                  <MessageSquare size={18} />
                  View Comments
                </button>
                <button 
                  onClick={() => handleApprove(review.id)}
                  disabled={actionLoading === review.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center text-xs justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === review.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve Design
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Clock size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No designs pending review</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingReviewsPage;
