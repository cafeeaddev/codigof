import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FlowElement {
  id: string;
  type: 'start' | 'step' | 'decision' | 'loop' | 'end';
  text: string;
  // For decision elements
  yesTarget?: string;
  noTarget?: string;
  // For loop elements
  loopTarget?: string;
}

export interface FluxoClienteSubmission {
  id: string;
  group_name: string;
  group_members: string | null;
  flowchart_data: FlowElement[];
  created_at: string;
}

export const useFluxoCliente = () => {
  const [submissions, setSubmissions] = useState<FluxoClienteSubmission[]>([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    
    const channel = supabase
      .channel('fluxo_cliente_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fluxo_cliente_submissions'
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

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('fluxo_cliente_submissions' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsed = ((data as any[]) || []).map(item => ({
        ...item,
        flowchart_data: (item.flowchart_data as FlowElement[]) || []
      }));

      setSubmissions(parsed);
      setTotalGroups(parsed.length);
    } catch (error) {
      console.error('Error fetching fluxo cliente submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submissions,
    totalGroups,
    isLoading,
    refetch: fetchSubmissions
  };
};
