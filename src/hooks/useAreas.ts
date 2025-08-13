import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Area } from '@/types/admin';

export const useAreas = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setIsLoading(true);
        console.log('useAreas - fetching areas...');
        
        const { data, error } = await supabase
          .from('areas')
          .select('*')
          .order('name');

        if (error) throw error;
        
        console.log('useAreas - areas fetched:', data);
        setAreas(data || []);
      } catch (err) {
        console.error('Error fetching areas:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const getAreaById = (id: string | null | undefined): Area | null => {
    if (!id) return null;
    const area = areas.find(area => area.id === id) || null;
    console.log('getAreaById - id:', id, 'found area:', area);
    return area;
  };

  const getAreaByName = (name: string | null | undefined): Area | null => {
    if (!name) return null;
    return areas.find(area => area.name === name) || null;
  };

  return {
    areas,
    isLoading,
    error,
    getAreaById,
    getAreaByName
  };
};