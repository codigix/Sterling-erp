import React, { useState } from 'react';
import { ProductionTab } from './AdminDashboard';

const ProductionPage = () => {
  const [production] = useState({
    rootCards: [],
  });

  return <ProductionTab production={production} />;
};

export default ProductionPage;
