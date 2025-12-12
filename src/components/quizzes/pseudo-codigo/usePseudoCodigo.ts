import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PseudoCodigoSubmission {
  id: string;
  group_name: string;
  pseudo_code: string;
  created_at: string;
}

export const usePseudoCodigo = () => {
  const [submissions, setSubmissions] = useState<PseudoCodigoSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('pseudo_codigo_submissions')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setSubmissions(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();

    const channel = supabase
      .channel('pseudo-codigo-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pseudo_codigo_submissions'
        },
        () => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const submitPseudoCodigo = async (groupName: string, pseudoCode: string) => {
    const { error } = await supabase
      .from('pseudo_codigo_submissions')
      .insert({ group_name: groupName, pseudo_code: pseudoCode });

    return { error };
  };

  const resetSubmissions = async () => {
    const { error } = await supabase
      .from('pseudo_codigo_submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (!error) {
      setSubmissions([]);
    }
    return { error };
  };

  return {
    submissions,
    isLoading,
    submitPseudoCodigo,
    resetSubmissions,
    refetch: fetchSubmissions
  };
};
