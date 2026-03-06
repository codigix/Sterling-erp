import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../utils/api';
import { Download, FileText, FileCode, Calendar, User, Trash2, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';

const DocumentSelector = ({ documentType, title, description }) => {
  const [searchParams] = useSearchParams();
  const rootCardIdFromUrl = searchParams.get('rootCardId');
  const taskIdFromUrl = searchParams.get('taskId');
  const taskTitleFromUrl = searchParams.get('taskTitle');

  const [rootCards, setRootCards] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedRootCard, setSelectedRootCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalDocId, setModalDocId] = useState(null);
  const [modalComments, setModalComments] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const [viewerDocId, setViewerDocId] = useState(null);

  useEffect(() => {
    fetchAssignedRootCards();
  }, []);

  // Handle auto-selection when rootCards are loaded or URL changes
  useEffect(() => {
    if (rootCardIdFromUrl && rootCards.length > 0) {
      const isAlreadySelected = selectedRootCard && String(selectedRootCard.id) === String(rootCardIdFromUrl);
      
      if (!isAlreadySelected) {
        const card = rootCards.find(c => String(c.id) === String(rootCardIdFromUrl));
        if (card) {
          console.log(`[DocumentSelector] Auto-selecting root card from URL: ${rootCardIdFromUrl}`);
          handleRootCardSelect(rootCardIdFromUrl);
        } else {
          console.warn(`[DocumentSelector] Root card ${rootCardIdFromUrl} from URL not found in list`);
        }
      }
    }
  }, [rootCardIdFromUrl, rootCards, selectedRootCard]);

  const fetchAssignedRootCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/design-engineer/documents/root-cards');
      setRootCards(response.data.data || []);
    } catch (err) {
      console.error('Error fetching root cards:', err);
      setError('Failed to load root cards');
    } finally {
      setLoading(false);
    }
  };

  const handleRootCardSelect = async (rootCardId) => {
    if (!rootCardId) {
      setSelectedRootCard(null);
      setDocuments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Try the design-engineer specific endpoint first
      const endpoint = documentType === 'raw-designs' 
        ? `/design-engineer/documents/raw-designs/${rootCardId}`
        : `/design-engineer/documents/required-documents/${rootCardId}`;
      
      console.log(`[handleRootCardSelect] Fetching from: ${endpoint} for type: ${documentType}`);
      const response = await axios.get(endpoint);
      console.log(`[handleRootCardSelect] Full response:`, response.data);
      
      if (response.data?.success || response.data?.status === 'success') {
        const responseData = response.data.data;
        
        // Handle the case where the backend returns an object with rootCard and documents/drawings
        if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
          setSelectedRootCard(responseData.rootCard || { id: rootCardId });
          
          let docs = [];
          if (documentType === 'raw-designs') {
            docs = responseData.drawings || responseData.drawings3D || responseData.rawDesigns || [];
          } else {
            docs = responseData.documents || responseData.requiredDocuments || [];
          }
          
          console.log(`[handleRootCardSelect] Extracted ${docs.length} docs from object response`);
          setDocuments(docs);
        } 
        // Handle the case where the backend returns the array directly in data
        else if (Array.isArray(responseData)) {
          console.log(`[handleRootCardSelect] Response data is direct array of length ${responseData.length}`);
          setDocuments(responseData);
          // If we don't have rootCard info, try to find it in the list
          const foundCard = rootCards.find(c => String(c.id) === String(rootCardId));
          if (foundCard) {
            setSelectedRootCard({
              id: foundCard.id,
              poNumber: foundCard.po_number,
              projectName: foundCard.project_name
            });
          }
        }
      } else {
        console.warn(`[handleRootCardSelect] Backend reported failure:`, response.data?.message);
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    const fileName = doc.name || doc.title || doc.file_name;
    const filePath = doc.path || doc.file_path || doc.filePath;
    
    if (!filePath) {
      alert('⚠️ File path not available\n\nThis file was uploaded before the path storage was implemented. Please re-upload the file to enable downloads.');
      return;
    }

    try {
      const encodedPath = encodeURIComponent(filePath);
      const downloadUrl = `/files/download?path=${encodedPath}&name=${encodeURIComponent(fileName)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again or re-upload the file.');
    }
  };

  const handleApproveClick = (docId) => {
    setModalDocId(docId);
    setModalAction('approve');
    setModalComments('');
    setModalOpen(true);
  };

  const handleRejectClick = (docId) => {
    setModalDocId(docId);
    setModalAction('reject');
    setModalComments('');
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRootCard || !modalDocId) return;

    try {
      setActioningId(modalDocId);
      const endpoint = documentType === 'raw-designs' 
        ? `/root-cards/steps/${selectedRootCard.id}/design-engineering/raw-designs/${modalDocId}/${modalAction}`
        : `/root-cards/steps/${selectedRootCard.id}/design-engineering/documents/${modalDocId}/${modalAction}`;

      console.log(`[handleConfirmAction] Document action: ${modalAction}, Endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, {
        comments: modalComments
      });

      console.log(`[handleConfirmAction] Action response:`, response.data);

      if (response.data?.success || response.data?.status === 'success') {
        const updatedDoc = response.data.data;
        const updatedDocs = documents.map(doc => 
          String(doc.id) === String(modalDocId) 
            ? { ...doc, ...updatedDoc, status: modalAction === 'approve' ? 'approved' : 'rejected' }
            : doc
        );
        setDocuments(updatedDocs);
        setModalOpen(false);
        setActioningId(null);
        alert(`Document ${modalAction}ed successfully!`);

        // If this was an approval, check if ALL documents are now approved
        if (modalAction === 'approve' && taskIdFromUrl) {
          const allApproved = updatedDocs.every(doc => doc.status === 'approved');
          if (allApproved && updatedDocs.length > 0) {
            console.log(`[handleConfirmAction] All documents approved! Completing task: ${taskIdFromUrl}`);
            try {
              await axios.patch(`/department/portal/tasks/${taskIdFromUrl}`, {
                status: 'completed'
              });
              alert(`Task "${taskTitleFromUrl || 'Approve Documents'}" completed automatically as all documents are approved!`);
            } catch (taskErr) {
              console.error('Error completing task:', taskErr);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error ${modalAction}ing document:`, err);
      alert(`Failed to ${modalAction} document`);
      setActioningId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const statusClass = status === 'approved' 
      ? 'bg-green-100 text-green-800' 
      : status === 'rejected'
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800';
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewFile = async (doc) => {
    const fileName = doc.name || doc.title || doc.file_name;
    const fileExt = fileName?.split('.').pop()?.toLowerCase();
    const filePath = doc.path || doc.filePath || doc.file_path;
    
    console.log(`[handleViewFile] File: ${fileName}, Extension: ${fileExt}, Path: ${filePath}`);
    
    let viewUrl = null;
    if (filePath) {
      try {
        console.log(`[handleViewFile] Fetching file: ${filePath}`);
        const response = await axios.get(`/files/download?path=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName)}`, {
          responseType: 'blob'
        });
        
        // Ensure the blob has the correct type if the backend returned generic octet-stream
        let blob = response.data;
        if (blob.type === 'application/octet-stream' || !blob.type) {
          console.log(`[handleViewFile] Overriding generic MIME type for extension: ${fileExt}`);
          const mimeTypes = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'txt': 'text/plain'
          };
          if (mimeTypes[fileExt]) {
            blob = new Blob([response.data], { type: mimeTypes[fileExt] });
          }
        }

        console.log(`[handleViewFile] Final Blob:`, {
          size: blob.size,
          type: blob.type
        });
        viewUrl = URL.createObjectURL(blob);
        console.log(`[handleViewFile] Created blob URL:`, viewUrl);
      } catch (err) {
        console.error('Error loading file:', err);
        viewUrl = null;
      }
    }
    
    console.log(`[handleViewFile] Setting viewer with: extension=${fileExt}, url=${!!viewUrl}`);
    
    setViewerFile({
      name: fileName,
      extension: fileExt || 'unknown',
      path: filePath,
      size: doc.size,
      url: viewUrl,
      status: doc.status
    });
    setViewerDocId(doc.id);
    setViewerOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (typeof bytes === 'string') return bytes;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const cleanupBlob = () => {
    if (viewerFile?.url && viewerFile.url.startsWith('blob:')) {
      URL.revokeObjectURL(viewerFile.url);
    }
    setViewerOpen(false);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Root Card *
        </label>
        <select
          value={selectedRootCard?.id || ''}
          onChange={(e) => handleRootCardSelect(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">-- Choose a Root Card --</option>
          {rootCards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.po_number} - {card.project_name} ({card.customer})
            </option>
          ))}
        </select>
        {loading && <p className="text-sm text-blue-600 mt-2">Loading...</p>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {selectedRootCard && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Selected Root Card:</strong> {selectedRootCard.poNumber} - {selectedRootCard.projectName}
          </p>
        </div>
      )}

      {selectedRootCard && documents.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              {documentType === 'raw-designs' ? 'Raw Design Drawings' : 'Required Documents'} ({documents.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Format</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => {
                  const fileName = doc.name || doc.title || doc.file_name;
                  const fileFormat = doc.format || doc.fileName?.split('.').pop() || 'Unknown';
                  
                  return (
                    <tr key={doc.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 break-words">{fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {fileFormat}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(doc.created_at || doc.uploadedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                          title="Download file"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                        <button
                          onClick={() => handleViewFile(doc)}
                          className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs"
                          title="View file"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedRootCard && documents.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700">
            No {documentType === 'raw-designs' ? 'design drawings' : 'documents'} found for this root card.
          </p>
        </div>
      ) : !selectedRootCard && rootCards.length > 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-700">
            Select a root card to view {documentType === 'raw-designs' ? 'design drawings' : 'documents'}.
          </p>
        </div>
      ) : !loading && rootCards.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800">
            No root cards assigned to you yet.
          </p>
        </div>
      ) : null}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalAction === 'approve' ? '✓ Approve' : '✗ Reject'} Document
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={modalComments}
                onChange={(e) => setModalComments(e.target.value)}
                placeholder="Enter any comments about this action..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actioningId === modalDocId}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actioningId === modalDocId ? 'Processing...' : (modalAction === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerOpen && viewerFile && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{viewerFile.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Format: {viewerFile.extension?.toUpperCase() || 'Unknown'} | Size: {formatFileSize(viewerFile.size)}</p>
              </div>
              <button
                onClick={cleanupBlob}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="h-[70vh] overflow-auto bg-gray-100 rounded mb-4">
              {!viewerFile.url ? (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold mb-2">File Information Not Available</p>
                    <p className="text-sm text-gray-600 mb-4">This file was uploaded before the path storage was implemented.</p>
                    <p className="text-sm text-gray-600">Please re-upload the file to view it or download from your original upload.</p>
                  </div>
                </div>
              ) : ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(viewerFile.extension) ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={viewerFile.url} 
                    alt={viewerFile.name}
                    className="max-w-full max-h-full object-contain"
                    onError={() => console.log('Image failed to load')}
                  />
                </div>
              ) : ['pdf'].includes(viewerFile.extension) ? (
                viewerFile.url ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 relative overflow-hidden rounded bg-white">
                      <object
                        data={viewerFile.url}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <iframe
                          src={viewerFile.url}
                          className="w-full h-full border-0"
                          title="PDF Viewer"
                        >
                          <div className="p-8 text-center">
                            <p>This browser does not support inline PDFs.</p>
                            <a 
                              href={viewerFile.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              Download PDF to view
                            </a>
                          </div>
                        </iframe>
                      </object>
                    </div>
                    <div className="mt-2 text-center">
                      <a 
                        href={viewerFile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center justify-center gap-1"
                      >
                        <Eye size={12} />
                        Open in new tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Unable to load PDF</p>
                      <p className="text-sm text-gray-500">Click Download to open the PDF file</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Preview not available for {viewerFile.extension?.toUpperCase()} files</p>
                    <p className="text-sm text-gray-500 mb-4">File type: {viewerFile.extension?.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">Use the Download button to open with your default application</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={cleanupBlob}
                className="flex-1 min-w-max px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(viewerFile);
                  cleanupBlob();
                }}
                className="flex-1 min-w-max px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              {viewerFile?.url && viewerFile?.status !== 'approved' && (
                <button
                  onClick={() => {
                    handleApproveClick(viewerDocId);
                    cleanupBlob();
                  }}
                  className="flex-1 min-w-max px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              )}
              {viewerFile?.url && viewerFile?.status !== 'rejected' && (
                <button
                  onClick={() => {
                    handleRejectClick(viewerDocId);
                    cleanupBlob();
                  }}
                  className="flex-1 min-w-max px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSelector;
