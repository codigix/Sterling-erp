import React from 'react';
import { useNavigate } from 'react-router-dom';
import RootCardList from '@/components/admin/RootCardList/RootCardList';

const RootCardsPage = () => {
  const navigate = useNavigate();

  const handleViewRootCard = (order) => {
    navigate(`/admin/root-cards/${order.id}?mode=view`);
  };

  const handleEditRootCard = (order) => {
    navigate(`/admin/root-cards/${order.id}?mode=edit`);
  };

  const handleAssignRootCard = (order) => {
    navigate(`/admin/root-cards/${order.id}/assign`);
  };

  return (
    <div className="w-full">
      <RootCardList
        onCreateNew={() => navigate('/admin/root-cards/new-root-card')}
        onViewRootCard={handleViewRootCard}
        onEditRootCard={handleEditRootCard}
        onAssignRootCard={handleAssignRootCard}
      />
    </div>
  );
};

export default RootCardsPage;
