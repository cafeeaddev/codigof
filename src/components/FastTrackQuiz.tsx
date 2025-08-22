import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Clock, Target, Lightbulb, Loader2 } from 'lucide-react';

interface FastTrackQuizProps {
  onComplete: (responses: any) => void;
  isLoading: boolean;
}

const FastTrackQuiz: React.FC<FastTrackQuizProps> = ({ onComplete, isLoading }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({
    interest: '',
    timeCommitment: '',
    mainObjective: '',
    otherObjective: ''
  });

  const questions = [
    {
      id: 'interest',
      title: 'Interesse no Programa',
      question: 'Você tem interesse em participar do programa FastTrack Digital (programa de aceleração digital)?',
      icon: Target,
      options: [
        { value: 'muito-interessado', label: 'Sim, muito interessado(a)' },
        { value: 'interessado-sem-tempo', label: 'Gostaria, mas devido as minhas demandas atuais não vou conseguir participar' },
        { value: 'sem-interesse', label: 'Não tenho interesse no momento' }
      ]
    },
    {
      id: 'timeCommitment',
      title: 'Disponibilidade de Tempo',
      question: 'Quanto tempo por semana você acredita que pode dedicar ao programa FastTrack?',
      icon: Clock,
      options: [
        { value: 'menos-1h', label: 'Menos de 1 hora' },
        { value: '1-2h', label: '1 a 2 horas' },
        { value: '3-4h', label: '3 a 4 horas' },
        { value: 'mais-4h', label: 'Mais de 4 horas' }
      ]
    },
    {
      id: 'mainObjective',
      title: 'Objetivo Principal',
      question: 'Qual seu principal objetivo ao participar do FastTrack Digital?',
      icon: Lightbulb,
      options: [
        { value: 'habilidades-tecnicas', label: 'Melhorar minhas habilidades técnicas' },
        { value: 'acelerar-carreira', label: 'Acelerar minha carreira na empresa' },
        { value: 'inovacao-trabalho', label: 'Aplicar inovação e tecnologia no meu trabalho' },
        { value: 'novas-ferramentas', label: 'Conhecer novas ferramentas digitais' },
        { value: 'outro', label: 'Outro (especifique)' }
      ],
      hasTextInput: true
    }
  ];

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleOptionChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestionData.id]: value
    }));
  };

  const handleTextChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      otherObjective: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(responses);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isCurrentAnswerValid = () => {
    const currentResponse = responses[currentQuestionData.id as keyof typeof responses];
    return currentResponse !== '';
  };

  const Icon = currentQuestionData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl"
    >
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Inscrição FastTrack Digital</h2>
                  <p className="text-sm text-muted-foreground">{currentQuestionData.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{currentQuestion + 1} de {questions.length}</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold leading-relaxed">
              {currentQuestionData.question}
            </h3>

            <RadioGroup
              value={responses[currentQuestionData.id as keyof typeof responses]}
              onValueChange={handleOptionChange}
              className="space-y-3"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={option.value} className="cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {currentQuestionData.hasTextInput && 
             responses[currentQuestionData.id as keyof typeof responses] === 'outro' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <Label htmlFor="other-objective" className="block text-sm font-medium mb-2">
                  Por favor, especifique:
                </Label>
                <Textarea
                  id="other-objective"
                  placeholder="Descreva seu objetivo específico..."
                  value={responses.otherObjective}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="min-h-[100px]"
                />
              </motion.div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentQuestion === 0 || isLoading}
            >
              Voltar
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isCurrentAnswerValid() || isLoading}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : currentQuestion === questions.length - 1 ? (
                'Finalizar Inscrição'
              ) : (
                'Próxima'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FastTrackQuiz;