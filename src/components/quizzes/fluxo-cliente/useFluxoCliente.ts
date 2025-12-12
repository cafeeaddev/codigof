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

export interface FlowchartData {
  flowName?: string;
  elements: FlowElement[];
}

export interface FluxoClienteSubmission {
  id: string;
  group_name: string;
  group_members: string | null;
  flowchart_data: FlowchartData;
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

      const parsed = ((data as any[]) || []).map(item => {
        // Handle both old format (array) and new format (object with flowName)
        const rawData = item.flowchart_data;
        const flowchartData: FlowchartData = Array.isArray(rawData) 
          ? { flowName: '', elements: rawData }
          : { flowName: rawData?.flowName || '', elements: rawData?.elements || [] };
        
        return {
          ...item,
          flowchart_data: flowchartData
        };
      });

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
