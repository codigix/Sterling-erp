import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Calendar, User, Building2, Package } from 'lucide-react';
import axios from '../../utils/api';
import Card, { CardContent, CardTitle, CardHeader } from '../../components/ui/Card';

const RootCardDetailPage = () => {
  const { rootCardId } = useParams();
  const navigate = useNavigate();
  const [rootCard, setRootCard] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRootCardDetails();
  }, [rootCardId]);

  const fetchRootCardDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rcResponse, designsResponse, docsResponse] = await Promise.all([
        axios.get(`/root-cards/${rootCardId}`),
        axios.get(`/design-engineer/documents/raw-designs/${rootCardId}`),
        axios.get(`/design-engineer/documents/required-documents/${rootCardId}`)
      ]);

      setRootCard(rcResponse.data.rootCard);
      setDesigns(designsResponse.data.data.drawings || []);
      setDocuments(docsResponse.data.data.documents || []);
    } catch (err) {
      console.error('Error fetching root card details:', err);
      setError('Failed to load root card details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const fileName = file.name || file.title || file.file_name;
      const filePath = file.file_path || file.filePath || file.path;
      
      if (!filePath) {
        alert('File path not available');
        return;
      }

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
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading root card details...</p>
        </div>
      </div>
    );
  }

  if (error || !rootCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 p-8">
        <button
          onClick={() => navigate('/design-engineer/root-cards')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Root Cards
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error || 'Root card not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/design-engineer/root-cards')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Root Cards
        </button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Root Card Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-slate-600">PO Number</label>
                <p className="text-lg text-slate-900 mt-1">{rootCard.po_number}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Project Name</label>
                <p className="text-lg text-slate-900 mt-1">{rootCard.project_name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Customer</label>
                <p className="text-lg text-slate-900 mt-1">{rootCard.customer}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Status</label>
                <p className="text-lg text-slate-900 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rootCard.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    rootCard.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rootCard.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Priority</label>
                <p className="text-lg text-slate-900 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rootCard.priority === 'High' ? 'bg-red-100 text-red-800' :
                    rootCard.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rootCard.priority}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Order Date</label>
                <p className="text-lg text-slate-900 mt-1">{new Date(rootCard.order_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Due Date</label>
                <p className="text-lg text-slate-900 mt-1">{new Date(rootCard.due_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Raw Design Drawings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {designs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No design drawings uploaded</p>
              ) : (
                <div className="space-y-3">
                  {designs.map((design) => (
                    <div
                      key={design.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={18} className="text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{design.name || design.title}</p>
                          <p className="text-xs text-slate-500">
                            {design.created_at && new Date(design.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(design)}
                        className="ml-2 p-2 hover:bg-blue-100 rounded-lg transition"
                        title="Download"
                      >
                        <Download size={16} className="text-blue-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No required documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={18} className="text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{doc.name || doc.title}</p>
                          <p className="text-xs text-slate-500">
                            {doc.created_at && new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="ml-2 p-2 hover:bg-green-100 rounded-lg transition"
                        title="Download"
                      >
                        <Download size={16} className="text-green-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RootCardDetailPage;
