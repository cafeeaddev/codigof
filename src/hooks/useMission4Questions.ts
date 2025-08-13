import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Mission4Question {
  id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'star-rating';
  options?: any;
  softwares?: string[];
  star_legends?: any;
}

export const useMission4Questions = (userAreaId?: string | null) => {
  const [questions, setQuestions] = useState<Mission4Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        // Buscar perguntas universais (target_area_ids é null ou vazio)
        const { data: universalQuestions, error: universalError } = await supabase
          .from('mission4_questions')
          .select('*')
          .or('target_area_ids.is.null,target_area_ids.eq.{}')
          .order('id');

        if (universalError) throw universalError;

        let specificQuestions: any[] = [];
        
        // Se há área do usuário, buscar perguntas específicas
        if (userAreaId) {
          const { data: areaQuestions, error: areaError } = await supabase
            .from('mission4_questions')
            .select('*')
            .contains('target_area_ids', [userAreaId])
            .order('id');

          if (areaError) throw areaError;
          specificQuestions = areaQuestions || [];
        }

        // Combinar perguntas universais e específicas
        const allQuestions = [...(universalQuestions || []), ...specificQuestions];
        
        // Transformar para o formato esperado
        const formattedQuestions: Mission4Question[] = allQuestions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type as 'multiple-choice' | 'star-rating',
          options: q.options,
          softwares: q.softwares,
          star_legends: q.star_legends
        }));

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error('Error fetching Mission 4 questions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [userAreaId]);

  return {
    questions,
    isLoading,
    error
  };
};