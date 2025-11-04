import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Submission {
  id: string;
  group_name: string;
  keyword: string;
  created_at: string;
}

interface WordCloudData {
  text: string;
  value: number;
  size: number;
}

export const useQuiz2 = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial submissions
  useEffect(() => {
    const loadSubmissions = async () => {
      const { data } = await supabase
        .from('quiz2_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setSubmissions(data);
      }
      setIsLoading(false);
    };

    loadSubmissions();

    // Subscribe to new submissions
    const channel = supabase
      .channel('quiz2-submissions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz2_submissions'
      }, (payload) => {
        setSubmissions(prev => [payload.new as Submission, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Process word cloud data
  const wordCloudData = useMemo(() => {
    const wordCounts = submissions.reduce((acc, submission) => {
      const word = submission.keyword.toLowerCase().trim();
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCounts)
      .map(([text, value]) => ({
        text,
        value,
        size: Math.sqrt(value) * 25
      }))
      .sort((a, b) => b.value - a.value);
  }, [submissions]);

  const topWords = useMemo(() => {
    return wordCloudData.slice(0, 5);
  }, [wordCloudData]);

  const uniqueGroupsCount = useMemo(() => {
    return new Set(submissions.map(s => s.group_name.toLowerCase())).size;
  }, [submissions]);

  return {
    submissions,
    wordCloudData,
    topWords,
    uniqueGroupsCount,
    uniqueWordsCount: wordCloudData.length,
    isLoading
  };
};
