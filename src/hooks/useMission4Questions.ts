// Este arquivo agora está obsoleto - use useMissionQuestions para todas as missões
// Mantido temporariamente para compatibilidade

import { useMissionQuestions } from './useMissionQuestions';

export interface Mission4Question {
  id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'star-rating';
  options?: any;
  softwares?: string[];
  star_legends?: any;
}

export const useMission4Questions = (userAreaId?: string | null) => {
  // Usar o hook genérico para missão 4
  const result = useMissionQuestions(4, userAreaId);
  
  return {
    questions: result.questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options.reduce((acc, opt) => {
        acc[opt.option_letter] = opt.option_text;
        return acc;
      }, {} as any),
      softwares: q.softwares,
      star_legends: q.options
        .filter(opt => q.question_type === 'star-rating')
        .reduce((acc, opt) => {
          acc[opt.option_letter] = opt.option_text;
          return acc;
        }, {} as any)
    })),
    isLoading: result.isLoading,
    error: result.error
  };
};