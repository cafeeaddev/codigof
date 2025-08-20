import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MissionQuestion {
  id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'star-rating';
  options?: any;
  points_mapping?: any;
  softwares?: string[];
  star_legends?: any;
  order_position: number;
}

export const useMissionQuestions = (missionNumber: number, userAreaId?: string | null) => {
  const [questions, setQuestions] = useState<MissionQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        console.log('useMissionQuestions - missionNumber:', missionNumber, 'userAreaId:', userAreaId);
        
        // Buscar perguntas universais para a missão específica
        const { data: universalQuestions, error: universalError } = await supabase
          .from('questions')
          .select('*')
          .eq('mission_number', missionNumber)
          .eq('is_active', true)
          .or('target_area_ids.is.null,target_area_ids.eq.{}')
          .order('order_position');

        if (universalError) throw universalError;
        
        console.log('universalQuestions:', universalQuestions);

        let specificQuestions: any[] = [];
        
        // Se há área do usuário e é missão 4, buscar perguntas específicas
        if (userAreaId && missionNumber === 4) {
          const { data: areaQuestions, error: areaError } = await supabase
            .from('questions')
            .select('*')
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
          options: q.options,
          points_mapping: q.points_mapping,
          softwares: q.softwares,
          star_legends: q.star_legends,
          order_position: q.order_position
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
  }, [missionNumber, userAreaId]);

  return {
    questions,
    isLoading,
    error
  };
};