import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Eye } from 'lucide-react';

const SalesDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    in_progress: 0,
    completed: 0
  });

  useEffect(() => {
    fetchAssignedOrders();
  }, [user]);

  const fetchAssignedOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sales/orders/assigned');
      setOrders(response.data.orders || []);
      
      const stats = {
        total: response.data.orders?.length || 0,
        pending: response.data.orders?.filter(o => o.status === 'pending').length || 0,
        approved: response.data.orders?.filter(o => o.status === 'approved').length || 0,
        in_progress: response.data.orders?.filter(o => o.status === 'in_progress').length || 0,
        completed: response.data.orders?.filter(o => o.status === 'completed').length || 0
      };
      setStats(stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      delivered: 'bg-slate-100 text-slate-800 dark:/30 dark:text-slate-300'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold  text-lefttext-white">Sales Orders</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.approved}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.in_progress}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Sales Orders</CardTitle>
        </CardHeader>

        <CardContent>
          {error && <div className="text-red-600 p-4">{error}</div>}

          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No orders</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">PO Number</th>
                    <th className="text-left py-3 px-4">Client</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="py-3 px-4">{order.poNumber}</td>
                      <td className="py-3 px-4">{order.clientName}</td>
                      <td className="py-3 px-4">{order.currency} {parseFloat(order.total).toFixed(2)}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboard;
