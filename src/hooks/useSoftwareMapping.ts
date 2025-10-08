import { useMemo, useCallback } from 'react';
import { useMissionQuestions } from './useMissionQuestions';

// Mapeamento das questões 1-9 para softwares específicos
const QUESTION_SOFTWARE_MAP: Record<number, string> = {
  1: 'Word',
  2: 'PowerPoint', 
  3: 'Excel',
  4: 'Power BI',
  5: 'Power Automate',
  6: 'Power Apps',
  7: 'SharePoint',
  8: 'SQL / Banco de Dados',
  9: 'OneNote'
};

export const useSoftwareMapping = () => {
  const { questions, isLoading, error } = useMissionQuestions(4);

  const softwareQuestions = useMemo(() => {
    // Filtra apenas as questões 1-9 (questões universais)
    const universalQuestions = questions.filter(q => 
      q.order_position >= 1 && q.order_position <= 9
    );

    return universalQuestions.map(question => ({
      questionId: question.id,
      orderPosition: question.order_position,
      software: QUESTION_SOFTWARE_MAP[question.order_position] || `Questão ${question.order_position}`,
      category: getSoftwareCategory(QUESTION_SOFTWARE_MAP[question.order_position]),
      options: question.options.map(opt => ({
        letter: opt.option_letter,
        text: opt.option_text,
        points: opt.points
      }))
    }));
  }, [questions]);

  const getPointsForAnswer = useCallback((questionOrderPosition: number, answerLetter: string): number => {
    const question = softwareQuestions.find(q => q.orderPosition === questionOrderPosition);
    if (!question) return 0;
    
    const option = question.options.find(opt => opt.letter === answerLetter);
    return option ? option.points : 0;
  }, [softwareQuestions]);

  const getSoftwareForQuestion = useCallback((questionOrderPosition: number): string => {
    return QUESTION_SOFTWARE_MAP[questionOrderPosition] || `Questão ${questionOrderPosition}`;
  }, []);

  return {
    softwareQuestions,
    getPointsForAnswer,
    getSoftwareForQuestion,
    isLoading,
    error
  };
};

function getSoftwareCategory(software: string): string {
  const categories: Record<string, string> = {
    'Word': 'Microsoft Office',
    'PowerPoint': 'Microsoft Office', 
    'Excel': 'Microsoft Office',
    'Power BI': 'Power Platform',
    'Power Automate': 'Power Platform',
    'Power Apps': 'Power Platform',
    'SharePoint': 'Colaboração',
    'SQL / Banco de Dados': 'Dados e Análise',
    'OneNote': 'Produtividade'
  };
  
  return categories[software] || 'Outros';
}