import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuestionOption {
  id: string;
  question_id: number;
  option_letter: string;
  option_text: string;
  points: number;
  order_position: number;
}

interface Question {
  id: number;
  question_text: string;
  mission_number: number;
  options: QuestionOption[];
}

export const useQuestionOptions = (missionNumbers: number[] = [1, 2, 3]) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionsAndOptions = async () => {
      try {
        setIsLoading(true);
        
        // Buscar perguntas das missões especificadas
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('id, question_text, mission_number')
          .in('mission_number', missionNumbers)
          .eq('is_active', true)
          .order('mission_number', { ascending: true })
          .order('order_position', { ascending: true });

        if (questionsError) {
          throw questionsError;
        }

        if (!questionsData || questionsData.length === 0) {
          setQuestions([]);
          return;
        }

        // Buscar opções para todas as perguntas
        const questionIds = questionsData.map(q => q.id);
        const { data: optionsData, error: optionsError } = await supabase
          .from('question_options')
          .select('*')
          .in('question_id', questionIds)
          .order('question_id', { ascending: true })
          .order('order_position', { ascending: true });

        if (optionsError) {
          throw optionsError;
        }

        // Agrupar opções por pergunta
        const questionsWithOptions: Question[] = questionsData.map(question => ({
          ...question,
          options: optionsData?.filter(option => option.question_id === question.id) || []
        }));

        setQuestions(questionsWithOptions);
      } catch (err) {
        console.error('Erro ao buscar perguntas e opções:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionsAndOptions();
  }, [missionNumbers]);

  // Função helper para buscar texto da opção
  const getOptionText = (questionId: number, optionLetter: string): string => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return `Opção ${optionLetter}`;
    
    const option = question.options.find(opt => opt.option_letter === optionLetter);
    return option ? option.option_text : `Opção ${optionLetter}`;
  };

  // Função helper para buscar pontos da opção
  const getOptionPoints = (questionId: number, optionLetter: string): number => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return 0;
    
    const option = question.options.find(opt => opt.option_letter === optionLetter);
    return option ? option.points : 0;
  };

  return {
    questions,
    isLoading,
    error,
    getOptionText,
    getOptionPoints
  };
};