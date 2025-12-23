import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SalesOrderForm from '@/components/admin/SalesOrderForm';

const NewSalesOrderPage = () => {
  const navigate = useNavigate();

  const handleBackToList = () => {
    navigate('/admin/sales-orders');
  };

  const handleCreateSuccess = () => {
    navigate('/admin/sales-orders');
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sales Orders
        </button>
      </div>
      <SalesOrderForm 
        mode="create" 
        onSubmit={handleCreateSuccess}
        onCancel={handleBackToList}
      />
    </div>
  );
};

export default NewSalesOrderPage;
