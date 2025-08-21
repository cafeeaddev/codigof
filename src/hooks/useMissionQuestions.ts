import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QuestionOption {
  id: string;
  option_letter: string;
  option_text: string;
  points: number;
  order_position: number;
}

export interface MissionQuestion {
  id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'star-rating';
  softwares?: string[];
  order_position: number;
  options: QuestionOption[];
}

export const useMissionQuestions = (missionNumber: number, userAreaId?: string | null) => {
  const [questions, setQuestions] = useState<MissionQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('useMissionQuestions - missionNumber:', missionNumber, 'userAreaId:', userAreaId);
        
        // Buscar perguntas universais para a missão específica
        const { data: universalQuestions, error: universalError } = await supabase
          .from('questions')
          .select(`
            *,
            question_options (
              id,
              option_letter,
              option_text,
              points,
              order_position
            )
          `)
          .eq('mission_number', missionNumber)
          .eq('is_active', true)
          .or('target_area_ids.is.null,target_area_ids.eq.{}')
          .order('order_position');

        if (universalError) {
          console.error('Error fetching universal questions:', universalError);
          throw universalError;
        }
        
        console.log('universalQuestions fetched:', universalQuestions?.length || 0, 'questions');
        console.log('First question data:', universalQuestions?.[0]);

        let specificQuestions: any[] = [];
        
        // Se há área do usuário e é missão 4, buscar perguntas específicas
        if (userAreaId && missionNumber === 4) {
          const { data: areaQuestions, error: areaError } = await supabase
            .from('questions')
            .select(`
              *,
              question_options (
                id,
                option_letter,
                option_text,
                points,
                order_position
              )
            `)
            .eq('mission_number', missionNumber)
            .eq('is_active', true)
            .contains('target_area_ids', [userAreaId])
            .order('order_position');

          if (areaError) throw areaError;
          specificQuestions = areaQuestions || [];
          
          console.log('specificQuestions for area', userAreaId, ':', specificQuestions);
        }

        // Combinar perguntas universais e específicas
        const allQuestions = [...(universalQuestions || []), ...specificQuestions];
        
        console.log('allQuestions combined:', allQuestions);
        
        // Transformar para o formato esperado
        const formattedQuestions: MissionQuestion[] = allQuestions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type as 'multiple-choice' | 'star-rating',
          softwares: q.softwares,
          order_position: q.order_position,
          options: (q.question_options || [])
            .sort((a: any, b: any) => a.order_position - b.order_position)
            .map((opt: any) => ({
              id: opt.id,
              option_letter: opt.option_letter,
              option_text: opt.option_text,
              points: opt.points,
              order_position: opt.order_position
            }))
        }));

        // Ordenar por order_position
        formattedQuestions.sort((a, b) => a.order_position - b.order_position);

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error('Error fetching Mission questions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();

    // Implementar real-time subscription para atualizações automáticas
    const questionsChannel = supabase
      .channel('questions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `mission_number=eq.${missionNumber}`
        },
        () => {
          console.log('Questions table changed, refetching...');
          fetchQuestions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_options'
        },
        () => {
          console.log('Question options table changed, refetching...');
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsChannel);
    };
  }, [missionNumber, userAreaId]);

  return {
    questions,
    isLoading,
    error
  };
};