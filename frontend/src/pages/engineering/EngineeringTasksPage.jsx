import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Upload, Download, CheckCircle, Clock, AlertCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const EngineeringTasksPage = () => {
  const navigate = useNavigate();
  const [rootCards, setRootCards] = useState([]);
  const [selectedRootCard, setSelectedRootCard] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    documentType: 'qap',
    documentName: '',
    file: null
  });

  const fetchRootCards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/root-cards', { 
        params: { assignedOnly: true },
        __sessionGuard: true 
      });
      setRootCards(response.data.rootCards || []);
      if (response.data.rootCards && response.data.rootCards.length > 0) {
        setSelectedRootCard(response.data.rootCards[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load root cards');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!selectedRootCard) return;
    try {
      const response = await axios.get('/engineering/documents', {
        params: { rootCardId: selectedRootCard },
        __sessionGuard: true
      });
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, [selectedRootCard]);

  const fetchBOMs = useCallback(async () => {
    if (!selectedRootCard) return;
    try {
      const response = await axios.get(`/engineering/bom/comprehensive/root-card/${selectedRootCard}/all`, {
        __sessionGuard: true
      });
      setBoms(response.data || []);
    } catch (err) {
      console.error('Failed to fetch BOMs:', err);
    }
  }, [selectedRootCard]);

  useEffect(() => {
    fetchRootCards();
  }, [fetchRootCards]);

  useEffect(() => {
    fetchDocuments();
    fetchBOMs();
  }, [selectedRootCard, fetchDocuments, fetchBOMs]);

  const handleUploadChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setUploadForm(prev => ({ ...prev, file: e.target.files[0] }));
    } else {
      setUploadForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('rootCardId', selectedRootCard);
    formData.append('documentType', uploadForm.documentType);
    formData.append('documentName', uploadForm.documentName || uploadForm.file.name);
    formData.append('document', uploadForm.file);

    try {
      await axios.post('/engineering/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        __sessionGuard: true
      });
      setUploadForm({ documentType: 'qap', documentName: '', file: null });
      setShowUploadForm(false);
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleCreateBOMRedirect = () => {
    if (!selectedRootCard) return;
    const rc = rootCards.find(r => r.id === selectedRootCard);
    navigate(`/design-engineer/bom/create?rootCardId=${selectedRootCard}&projectId=${rc?.project_id || ''}`);
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      qap: 'QAP/ATP',
      pd: 'PD Document',
      drawing: 'Drawing',
      fea: 'FEA Analysis',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
      case 'pending_approval':
        return <Clock size={16} />;
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="task-page-container">
        <div className="text-center py-12">Loading engineering tasks...</div>
      </div>
    );
  }

  return (
    <div className="task-page-container">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-600 hover:text-red-700">×</button>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium  dark: mb-2">
          Select Root Card
        </label>
        <select
          value={selectedRootCard || ''}
          onChange={(e) => setSelectedRootCard(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
        >
          {rootCards.map(order => (
            <option key={order.id} value={order.id}>
              RC-{String(order.id).padStart(4, '0')} - {order.customer}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('documents')}
          className={`p-2 font-medium border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('bom')}
          className={`p-2 font-medium border-b-2 transition-colors ${
            activeTab === 'bom'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:'
          }`}
        >
          Bill of Materials
        </button>
      </div>

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {!showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Upload size={18} />
              Upload Document
            </button>
          )}

          {showUploadForm && (
            <Card className="mb-6 p-6">
              <h3 className="text-lg font-bold  dark: mb-4">Upload Engineering Document</h3>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Type
                    </label>
                    <select
                      name="documentType"
                      value={uploadForm.documentType}
                      onChange={handleUploadChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    >
                      <option value="qap">QAP/ATP</option>
                      <option value="pd">PD Document</option>
                      <option value="drawing">Drawing</option>
                      <option value="fea">FEA Analysis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      name="documentName"
                      value={uploadForm.documentName}
                      onChange={handleUploadChange}
                      placeholder="Optional - defaults to filename"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleUploadChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-4 py-2 rounded-lg  dark:bg-slate-600  dark: hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Document Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-6 text-center text-sm text-slate-500">
                        No documents uploaded for this root card
                      </td>
                    </tr>
                  )}
                  {documents.map(doc => (
                    <tr key={doc.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors">
                      <td className="p-1 text-sm font-medium  dark:">{doc.documentName}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{getDocumentTypeLabel(doc.documentType)}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{doc.uploadedByName}</td>
                      <td className="p-1">
                        <Badge className={`flex items-center text-xs gap-1 w-fit ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                          {doc.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-1">
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
                            <Download size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'bom' && (
        <div className="space-y-6">
          <button
            onClick={handleCreateBOMRedirect}
            className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Create Comprehensive BOM
          </button>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Item Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Revision</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boms.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-6 text-center text-sm text-slate-500">
                        No BOMs found for this root card
                      </td>
                    </tr>
                  )}
                  {boms.map(bom => (
                    <tr key={bom.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors">
                      <td className="p-1 text-sm font-medium  dark:">{bom.productName}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{bom.itemCode}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">Rev {bom.revision}</td>
                      <td className="p-1">
                        <Badge className={`flex items-center text-xs gap-1 w-fit ${getStatusColor(bom.status)}`}>
                          {bom.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-1">
                        <div className="flex gap-2">
                          <Link 
                            to={`/design-engineer/bom/view?bomId=${bom.id}`}
                            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EngineeringTasksPage;
