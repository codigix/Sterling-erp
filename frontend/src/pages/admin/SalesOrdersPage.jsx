import React from 'react';
import { useNavigate } from 'react-router-dom';
import SalesOrderList from '@/components/admin/SalesOrderList/SalesOrderList';

const SalesOrdersPage = () => {
  const navigate = useNavigate();

  const handleViewOrder = (order) => {
    navigate(`/admin/sales-orders/${order.id}?mode=view`);
  };

  const handleEditOrder = (order) => {
    navigate(`/admin/sales-orders/${order.id}?mode=edit`);
  };

  const handleAssignOrder = (order) => {
    navigate(`/admin/sales-orders/${order.id}/assign`);
  };

  return (
    <div className="w-full">
      <SalesOrderList
        onCreateNew={() => navigate('/admin/sales-orders/new-order')}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
        onAssignOrder={handleAssignOrder}
      />
    </div>
  );
};

export default SalesOrdersPage;
