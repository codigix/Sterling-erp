import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/api';
import RootCardForm from '../../components/admin/RootCardForm';
import { Loader2 } from 'lucide-react';

const RootCardDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rootCard, setRootCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAssignRoute = location.pathname.includes('/assign');
  const mode = isAssignRoute ? 'assign' : (searchParams.get('mode') || 'view');

  useEffect(() => {
    const fetchRootCard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/root-cards/${id}`, {
          params: { includeSteps: true }
        });
        setRootCard(response.data.rootCard || response.data);
      } catch (err) {
        console.error('Error fetching root card:', err);
        setError(err.response?.data?.message || 'Failed to load root card');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRootCard();
    }
  }, [id]);

  const handleSubmit = () => {
    navigate('/admin/root-cards');
  };

  const handleCancel = () => {
    navigate('/admin/root-cards');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading root card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => navigate('/admin/root-cards')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Root Cards
          </button>
        </div>
      </div>
    );
  }

  if (!rootCard) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:yellow-700 rounded-lg p-4">
          <p className="text-yellow-700 dark:text-yellow-300">Root card not found</p>
          <button
            onClick={() => navigate('/admin/root-cards')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Back to Root Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <RootCardForm
      mode={mode}
      initialData={rootCard}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default RootCardDetailPage;
