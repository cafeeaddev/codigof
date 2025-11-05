import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Quiz4Submission {
  id: string;
  group_name: string;
  group_members: string | null;
  problem: string;
  solution: string;
  technology: string;
  human_impact: string;
  created_at: string;
}

export const useQuiz4 = () => {
  const [submissions, setSubmissions] = useState<Quiz4Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubmissions = async () => {
    const { data, error } = await supabase
      .from('quiz4_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSubmissions();

    const channel = supabase
      .channel('quiz4-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz4_submissions'
        },
        () => {
          loadSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const uniqueGroupsCount = new Set(submissions.map(s => s.group_name.toLowerCase())).size;

  return {
    submissions,
    uniqueGroupsCount,
    isLoading
  };
};
