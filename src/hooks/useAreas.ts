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
        const { data, error } = await supabase
          .from('areas')
          .select('*')
          .order('name');

        if (error) throw error;
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
    return areas.find(area => area.id === id) || null;
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