import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FritarOvoSubmission {
  id: string;
  group_name: string;
  step_1: string;
  step_2: string;
  step_3: string;
  step_4: string;
  step_5: string;
  step_6: string;
  step_7: string;
  step_8: string;
  step_9: string;
  step_10: string;
  step_11: string;
  step_12: string;
  step_13: string;
  step_14: string;
  step_15: string;
  created_at: string;
}

export const useFritarOvo = () => {
  const [submissions, setSubmissions] = useState<FritarOvoSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('fritar_ovo_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions((data as FritarOvoSubmission[]) || []);
      } catch (error) {
        console.error('Error fetching fritar_ovo submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();

    // Real-time subscription
    const channel = supabase
      .channel('fritar-ovo-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fritar_ovo_submissions'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSubmissions(prev => [payload.new as FritarOvoSubmission, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setSubmissions(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    submissions,
    totalGroups: submissions.length,
    isLoading
  };
};
