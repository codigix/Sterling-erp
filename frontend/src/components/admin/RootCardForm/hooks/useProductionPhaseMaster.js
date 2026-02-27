import { useState, useEffect, useCallback } from 'react';
import axios from '../../../../utils/api';

export const useProductionPhaseMaster = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPhases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/production/phases-master');
      if (response.data.success) {
        setPhases(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching production phases:', err);
      setError(err.response?.data?.message || 'Failed to fetch production phases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const addPhase = (newPhase) => {
    setPhases(prev => [...prev, newPhase].sort((a, b) => a.name.localeCompare(b.name)));
  };

  return { phases, loading, error, fetchPhases, addPhase };
};
