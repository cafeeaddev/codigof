import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Quiz5Submission {
  id: string;
  participant_name: string;
  initials: string;
  mindset_change: string;
  digital_idea: string;
  digital_habit: string;
  created_at: string;
}

export const useQuiz5 = () => {
  const [submissions, setSubmissions] = useState<Quiz5Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch inicial
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz5_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      } catch (error) {
        console.error('Error fetching quiz5 submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();

    // Real-time subscription
    const channel = supabase
      .channel('quiz5-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz5_submissions'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSubmissions(prev => [payload.new as Quiz5Submission, ...prev]);
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
    totalParticipants: submissions.length,
    totalPostits: submissions.length * 3,
    isLoading
  };
};
