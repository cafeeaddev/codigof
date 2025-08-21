import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'star-rating';
  mission_number: number;
  target_area_ids: string[] | null;
  softwares: string[] | null;
  order_position: number;
  is_active: boolean;
  options: QuestionOption[];
}

interface QuestionOption {
  id: string;
  option_letter: string;
  option_text: string;
  points: number;
  order_position: number;
}

interface Area {
  id: string;
  name: string;
  code: string;
}

interface QuestionFormData {
  question_text: string;
  question_type: 'multiple-choice' | 'star-rating';
  mission_number: number;
  target_area_ids: string[];
  softwares: string[];
  order_position: number;
  options: {
    option_letter: string;
    option_text: string;
    points: number;
  }[];
}

export const QuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedMission, setSelectedMission] = useState<number>(1);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: '',
    question_type: 'multiple-choice',
    mission_number: 1,
    target_area_ids: [],
    softwares: [],
    order_position: 1,
    options: [
      { option_letter: 'A', option_text: '', points: 0 },
      { option_letter: 'B', option_text: '', points: 0 },
      { option_letter: 'C', option_text: '', points: 0 },
      { option_letter: 'D', option_text: '', points: 0 },
      { option_letter: 'E', option_text: '', points: 0 }
    ]
  });

  useEffect(() => {
    loadQuestions();
    loadAreas();
  }, [selectedMission]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
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
        .eq('mission_number', selectedMission)
        .order('order_position');

      if (error) throw error;

      const questionsWithOptions = (data || []).map(q => ({
        ...q,
        question_type: q.question_type as 'multiple-choice' | 'star-rating',
        options: (q.question_options || []).sort((a: any, b: any) => a.order_position - b.order_position)
      }));

      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar questões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const toggleQuestionExpansion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getAreaNames = (areaIds: string[] | null): string => {
    if (!areaIds || areaIds.length === 0) return '';
    console.log('getAreaNames - areaIds:', areaIds);
    console.log('getAreaNames - areas:', areas);
    return areaIds
      .map(id => areas.find(area => area.id === id)?.name || `ID: ${id}`)
      .join(', ');
  };

  const renderQuestionOptions = (question: Question) => {
    if (!question.options || question.options.length === 0) {
      return <p className="text-muted-foreground text-sm">Nenhuma opção configurada</p>;
    }

    return (
      <div className="space-y-2">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="font-medium text-sm">
              {option.option_letter}) {option.option_text}
            </span>
            <Badge variant="secondary" className="text-xs">
              {option.points} pts
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  const saveQuestion = async () => {
    try {
      setIsLoading(true);

      // Validar se todas as opções têm texto
      const hasEmptyOptions = formData.options.some(opt => !opt.option_text.trim());
      if (hasEmptyOptions) {
        toast({
          title: "Erro",
          description: "Todas as opções devem ter texto.",
          variant: "destructive"
        });
        return;
      }

      if (editingQuestion) {
        // Atualizar questão existente
        const { error: questionError } = await supabase
          .from('questions')
          .update({
            question_text: formData.question_text,
            question_type: formData.question_type,
            mission_number: formData.mission_number,
            target_area_ids: formData.target_area_ids.length > 0 ? formData.target_area_ids : null,
            softwares: formData.softwares.length > 0 ? formData.softwares : null,
            order_position: formData.order_position
          })
          .eq('id', editingQuestion.id);

        if (questionError) throw questionError;

        // Deletar opções antigas
        const { error: deleteError } = await supabase
          .from('question_options')
          .delete()
          .eq('question_id', editingQuestion.id);

        if (deleteError) throw deleteError;

        // Inserir novas opções
        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(
            formData.options.map((opt, index) => ({
              question_id: editingQuestion.id,
              option_letter: opt.option_letter,
              option_text: opt.option_text,
              points: opt.points,
              order_position: index + 1
            }))
          );

        if (optionsError) throw optionsError;

        toast({
          title: "Sucesso",
          description: "Questão atualizada com sucesso!"
        });
      } else {
        // Criar nova questão
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            question_text: formData.question_text,
            question_type: formData.question_type,
            mission_number: formData.mission_number,
            target_area_ids: formData.target_area_ids.length > 0 ? formData.target_area_ids : null,
            softwares: formData.softwares.length > 0 ? formData.softwares : null,
            order_position: formData.order_position,
            is_active: true
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Inserir opções
        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(
            formData.options.map((opt, index) => ({
              question_id: questionData.id,
              option_letter: opt.option_letter,
              option_text: opt.option_text,
              points: opt.points,
              order_position: index + 1
            }))
          );

        if (optionsError) throw optionsError;

        toast({
          title: "Sucesso",
          description: "Questão criada com sucesso!"
        });
      }

      // Reset form
      setEditingQuestion(null);
      setIsCreatingNew(false);
      setFormData({
        question_text: '',
        question_type: 'multiple-choice',
        mission_number: selectedMission,
        target_area_ids: [],
        softwares: [],
        order_position: 1,
        options: [
          { option_letter: 'A', option_text: '', points: 0 },
          { option_letter: 'B', option_text: '', points: 0 },
          { option_letter: 'C', option_text: '', points: 0 },
          { option_letter: 'D', option_text: '', points: 0 },
          { option_letter: 'E', option_text: '', points: 0 }
        ]
      });

      loadQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar questão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Questão deletada com sucesso!"
      });

      loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar questão.",
        variant: "destructive"
      });
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestion(question);
    setIsCreatingNew(false);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      mission_number: question.mission_number,
      target_area_ids: question.target_area_ids || [],
      softwares: question.softwares || [],
      order_position: question.order_position,
      options: question.options.length > 0 ? question.options.map(opt => ({
        option_letter: opt.option_letter,
        option_text: opt.option_text,
        points: opt.points
      })) : [
        { option_letter: 'A', option_text: '', points: 0 },
        { option_letter: 'B', option_text: '', points: 0 },
        { option_letter: 'C', option_text: '', points: 0 },
        { option_letter: 'D', option_text: '', points: 0 },
        { option_letter: 'E', option_text: '', points: 0 }
      ]
    });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setIsCreatingNew(false);
    setFormData({
      question_text: '',
      question_type: 'multiple-choice',
      mission_number: selectedMission,
      target_area_ids: [],
      softwares: [],
      order_position: 1,
      options: [
        { option_letter: 'A', option_text: '', points: 0 },
        { option_letter: 'B', option_text: '', points: 0 },
        { option_letter: 'C', option_text: '', points: 0 },
        { option_letter: 'D', option_text: '', points: 0 },
        { option_letter: 'E', option_text: '', points: 0 }
      ]
    });
  };

  const updateOptionText = (optionIndex: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, index) => 
        index === optionIndex ? { ...opt, option_text: text } : opt
      )
    }));
  };

  const updateOptionPoints = (optionIndex: number, points: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, index) => 
        index === optionIndex ? { ...opt, points } : opt
      )
    }));
  };

  if (isCreatingNew || editingQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingQuestion ? 'Editar Questão' : 'Nova Questão'}
          </h2>
          <Button variant="outline" onClick={cancelEditing}>
            Cancelar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Questão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question_text">Pergunta</Label>
              <Textarea
                id="question_text"
                value={formData.question_text}
                onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                placeholder="Digite a pergunta..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="question_type">Tipo</Label>
                <Select 
                  value={formData.question_type} 
                  onValueChange={(value: 'multiple-choice' | 'star-rating') => 
                    setFormData(prev => ({ ...prev, question_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                    <SelectItem value="star-rating">Avaliação por Estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mission_number">Missão</Label>
                <Select 
                  value={formData.mission_number.toString()} 
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, mission_number: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Missão 1</SelectItem>
                    <SelectItem value="2">Missão 2</SelectItem>
                    <SelectItem value="3">Missão 3</SelectItem>
                    <SelectItem value="4">Missão 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="order_position">Posição</Label>
                <Input
                  id="order_position"
                  type="number"
                  value={formData.order_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_position: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            {/* Seção de Áreas */}
            <div>
              <Label>Áreas (para questões específicas)</Label>
              <div className="space-y-2 mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.target_area_ids.map((areaId) => {
                    const area = areas.find(a => a.id === areaId);
                    return (
                      <div key={areaId} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                        <span className="text-sm">{area?.name || areaId}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-blue-200"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              target_area_ids: prev.target_area_ids.filter(id => id !== areaId)
                            }));
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Select onValueChange={(value) => {
                  if (!formData.target_area_ids.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      target_area_ids: [...prev.target_area_ids, value]
                    }));
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Adicionar área..." />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.filter(area => !formData.target_area_ids.includes(area.id)).map(area => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seção de Softwares */}
            <div>
              <Label>Softwares</Label>
              <div className="space-y-2 mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.softwares.map((software, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
                      <span className="text-sm">{software}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-gray-200"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            softwares: prev.softwares.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nome do software..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const software = input.value.trim();
                        if (software && !formData.softwares.includes(software)) {
                          setFormData(prev => ({
                            ...prev,
                            softwares: [...prev.softwares, software]
                          }));
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      const software = input?.value.trim();
                      if (software && !formData.softwares.includes(software)) {
                        setFormData(prev => ({
                          ...prev,
                          softwares: [...prev.softwares, software]
                        }));
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Opções de Resposta</Label>
              <div className="space-y-3 mt-2">
                {formData.options.map((option, index) => (
                  <div key={option.option_letter} className="flex items-center space-x-3">
                    <Label className="w-8 text-center font-medium">
                      {option.option_letter})
                    </Label>
                    <Input
                      value={option.option_text}
                      onChange={(e) => updateOptionText(index, e.target.value)}
                      placeholder={`Texto da opção ${option.option_letter}`}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={option.points}
                      onChange={(e) => updateOptionPoints(index, parseFloat(e.target.value) || 0)}
                      placeholder="Pontos"
                      className="w-24"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancelar
              </Button>
              <Button onClick={saveQuestion} disabled={isLoading}>
                {isLoading ? 'Salvando...' : editingQuestion ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Questões</h2>
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedMission.toString()} 
            onValueChange={(value) => setSelectedMission(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Missão 1</SelectItem>
              <SelectItem value="2">Missão 2</SelectItem>
              <SelectItem value="3">Missão 3</SelectItem>
              <SelectItem value="4">Missão 4</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreatingNew(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Questão
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">
                        Questão {question.order_position}
                      </Badge>
                      <Badge variant="secondary">
                        {question.question_type === 'multiple-choice' ? 'Múltipla Escolha' : 'Estrelas'}
                      </Badge>
                      {question.question_type === 'star-rating' && question.target_area_ids && question.target_area_ids.length > 0 && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {getAreaNames(question.target_area_ids)}
                        </Badge>
                      )}
                      {!question.is_active && (
                        <Badge variant="destructive">Inativa</Badge>
                      )}
                    </div>
                    <h3 className="font-medium">{question.question_text}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuestionExpansion(question.id)}
                    >
                      {expandedQuestions.has(question.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar esta questão? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteQuestion(question.id)}>
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {expandedQuestions.has(question.id) && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Opções:</Label>
                      <div className="mt-2">
                        {renderQuestionOptions(question)}
                      </div>
                    </div>
                    {question.target_area_ids && question.target_area_ids.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Áreas:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.target_area_ids.map((areaId, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {areas.find(area => area.id === areaId)?.name || areaId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {question.softwares && question.softwares.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Softwares:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.softwares.map((software, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {software}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};