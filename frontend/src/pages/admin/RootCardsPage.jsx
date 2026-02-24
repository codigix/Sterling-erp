import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/utils/api';
import { showSuccess, showError } from '@/utils/toastUtils';
import RootCardList from '@/components/admin/RootCardList/RootCardList';

const RootCardsPage = () => {
  const navigate = useNavigate();

  const handleViewRootCard = (order) => {
    navigate(`/admin/root-cards/${order.id}?mode=view`);
  };

  const handleEditRootCard = (order) => {
    navigate(`/admin/root-cards/${order.id}?mode=edit`);
  };

  const handleSendToDesignEngineering = async (order) => {
    try {
      const response = await axios.post(`/root-cards/${order.id}/send-to-design-engineering`);
      showSuccess(`Root card sent to Design Engineering Department. Notifications sent to ${response.data.notificationsSent} design engineers.`);
    } catch (error) {
      console.error('Error sending to Design Engineering:', error);
      showError(error.response?.data?.message || 'Failed to send root card to Design Engineering');
    }
  };

  return (
    <div className="w-full">
      <RootCardList
        onCreateNew={() => navigate('/admin/root-cards/new-root-card')}
        onViewRootCard={handleViewRootCard}
        onEditRootCard={handleEditRootCard}
        onSendToDesignEngineering={handleSendToDesignEngineering}
      />
    </div>
  );
};

export default RootCardsPage;
