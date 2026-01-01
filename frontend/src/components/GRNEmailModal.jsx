import React from "react";
import { X, AlertTriangle, Truck } from "lucide-react";

const GRNEmailModal = ({
  emailModal,
  setEmailModal,
  handleSendEmailAndAdd,
}) => {
  if (!emailModal.show) return null;

  const grnNo = emailModal.data?.grnNo || `GRN-${emailModal.data?.grnId}`;
  const poNo = emailModal.data?.poNo || "N/A";
  const vendor = emailModal.data?.vendor || "Vendor";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs flex items-center gap-3">
            <AlertTriangle className="text-orange-500" size={24} />
            Email Preview - GRN Discrepancy Report
          </h2>
          <button
            onClick={() => setEmailModal({ show: false, type: "", data: null })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Status Alert */}
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Discrepancy Status:</strong>{" "}
              <span className="uppercase font-bold text-orange-600 dark:text-orange-400 text-lg ml-2">
                {emailModal.type}
              </span>
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              This email will be sent to vendor: <strong>{vendor}</strong>
            </p>
          </div>

          {/* Email Preview Box */}
          <div className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-700 dark:to-slate-800 border-2 border-blue-300 dark:border-blue-900 rounded-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white p-6">
              <h3 className="text-2xl font-bold mb-2">
                📦 Goods Received Note Discrepancy Report
              </h3>
              <p className="text-blue-100">
                Action Required: Please review the following discrepancies in
                your shipment
              </p>
            </div>

            {/* Email Content */}
            <div className="p-6 space-y-6">
              {/* Key Information Section */}
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Vendor
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {vendor}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Purchase Order
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 break-all">
                      {poNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      GRN Number
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 break-all">
                      {grnNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Discrepancy Type
                    </p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1 uppercase">
                      {emailModal.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded">
                <h5 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                  ⚠️ Important Notice
                </h5>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Our receiving team has identified discrepancies between your
                  invoice, ordered quantities, and actual received quantities.
                  Please review the table below and contact us at your earliest
                  convenience to resolve these issues.
                </p>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                <h5 className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-200 dark:border-blue-800">
                  Detailed Item Comparison
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                          Description
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                          Ordered Qty
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                          Invoiced Qty
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                          Received Qty
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                          Status & Variance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailModal.data?.items?.map((item, idx) => {
                        const ordered =
                          Number(item.ordered_quantity) ||
                          Number(item.quantity) ||
                          0;
                        const invoiced = Number(item.invoice_quantity) || 0;
                        const received = Number(item.received_quantity) || 0;
                        const diff = received - ordered;
                        const status =
                          diff < 0 ? "SHORTAGE" : diff > 0 ? "OVERAGE" : "OK";
                        const statusColor =
                          diff < 0
                            ? "bg-red-500 text-white"
                            : diff > 0
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white";

                        return (
                          <tr
                            key={idx}
                            className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                              {item.description || item.item_name || "-"}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">
                              {ordered}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">
                              {invoiced}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">
                              {received}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}
                              >
                                {status}{" "}
                                {diff !== 0 &&
                                  `(${diff > 0 ? "+" : ""}${diff})`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                  Required Action:
                </h5>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>
                      Review the discrepancies listed in the table above
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>
                      Confirm whether items were shipped or if there are quality
                      issues
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>
                      Respond with a resolution plan (replacement, credit note,
                      adjustment, etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      •
                    </span>
                    <span>Please reply within 48 hours</span>
                  </li>
                </ul>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-600">
                <p className="font-semibold mb-1">
                  This is an automated notification from Sterling ERP System
                </p>
                <p>
                  Please do not reply to this email. Contact your account
                  manager for assistance.
                </p>
                <p className="mt-2">
                  Generated on: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 sticky bottom-0 z-10">
          <button
            onClick={() => setEmailModal({ show: false, type: "", data: null })}
            className="px-6 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmailAndAdd}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <Truck size={18} />
            Send Email & Add to Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default GRNEmailModal;
