import { useState, useCallback } from 'react';
import axios from 'axios';

// Fallback data, remove when production
const FALLBACK_SCHEMA = [
  { id: 'date', label: '日期', type: 'date', required: true },
  { id: 'usage', label: '使用量', type: 'number', required: true }
];

export function useEquipmentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchema = useCallback(async (equipmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/manual/fields', {
        params: { equipId: equipmentId }
      });
      return response.data;
    } catch (err) {
      console.warn('API failed (likely on GitHub Pages). Falling back to local mock schema.', err.message);
      
      // Simulated wait for Github Pages POC
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return FALLBACK_SCHEMA;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchSchema };
}
