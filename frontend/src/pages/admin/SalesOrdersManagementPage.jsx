import React, { useState } from 'react';
import SalesOrderForm from '../../components/admin/SalesOrderForm';
import SalesOrderList from '../../components/admin/SalesOrderList/SalesOrderList';

const SalesOrdersManagementPage = () => {
  const [mode, setMode] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setMode('view');
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setMode('edit');
  };

  const handleAssignOrder = (order) => {
    setSelectedOrder(order);
    setMode('assign');
  };

  const handleBackToList = () => {
    setMode('list');
    setSelectedOrder(null);
  };

  if (mode === 'create' || mode === 'view' || mode === 'edit' || mode === 'assign') {
    return (
      <SalesOrderForm
        mode={mode}
        initialData={selectedOrder}
        onSubmit={handleBackToList}
        onCancel={handleBackToList}
      />
    );
  }

  return (
    <SalesOrderList 
      onCreateNew={() => setMode('create')}
      onViewOrder={handleViewOrder}
      onEditOrder={handleEditOrder}
      onAssignOrder={handleAssignOrder}
    />
  );
};

export default SalesOrdersManagementPage;
