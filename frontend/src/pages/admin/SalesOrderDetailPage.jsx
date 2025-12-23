import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/api';
import SalesOrderForm from '../../components/admin/SalesOrderForm';
import { Loader2 } from 'lucide-react';

const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [salesOrder, setSalesOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAssignRoute = location.pathname.includes('/assign');
  const mode = isAssignRoute ? 'assign' : (searchParams.get('mode') || 'view');

  useEffect(() => {
    const fetchSalesOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/sales/orders/${id}`, {
          params: { includeSteps: true }
        });
        setSalesOrder(response.data.order || response.data);
      } catch (err) {
        console.error('Error fetching sales order:', err);
        setError(err.response?.data?.message || 'Failed to load sales order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSalesOrder();
    }
  }, [id]);

  const handleSubmit = () => {
    navigate('/admin/sales-orders');
  };

  const handleCancel = () => {
    navigate('/admin/sales-orders');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading sales order...</p>
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
            onClick={() => navigate('/admin/sales-orders')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Sales Orders
          </button>
        </div>
      </div>
    );
  }

  if (!salesOrder) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-700 dark:text-yellow-300">Sales order not found</p>
          <button
            onClick={() => navigate('/admin/sales-orders')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Back to Sales Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <SalesOrderForm
      mode={mode}
      initialData={salesOrder}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default SalesOrderDetailPage;
