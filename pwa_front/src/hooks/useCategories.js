import { useState, useCallback } from 'react';
import { apiClient } from '../utils/api';

export function useCategories() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchManualTree = useCallback(async (year) => {
    if (!year) return [];
    
    setLoading(true);
    setError(null);
    try {
      // Production API endpoint for 3-tier manual data
      const locData = JSON.parse(localStorage.getItem('selected_loc') || '{}');
      const facilityId = locData.id;
      
      if (!facilityId) {
        return []; // If no facility is selected, return an empty array of categories
      }

      const response = await apiClient.get(`/getEquipmentTypesForEmissionSourceData/${facilityId}/${year}`, {
        params: { maxResults: 999 }
      });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '無法取得類別資料';
      setError(msg);
      throw err; // Re-throw so the component can handle it if needed
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchManualTree };
}
