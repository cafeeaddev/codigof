import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple-choice' | 'star-rating';
  mission_number: number;
  options?: any;
  points_mapping?: any;
  softwares?: string[];
  star_legends?: any;
  target_area_ids?: string[];
  order_position: number;
  is_active: boolean;
}

interface Area {
  id: string;
  name: string;
  code: string;
}

export const QuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMission, setSelectedMission] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const newQuestion: Omit<Question, 'id'> = {
    question_text: '',
    question_type: 'multiple-choice',
    mission_number: selectedMission,
    options: {},
    points_mapping: {},
    softwares: [],
    star_legends: {},
    target_area_ids: [],
    order_position: 1,
    is_active: true
  };

  useEffect(() => {
    loadQuestions();
    loadAreas();
  }, [selectedMission]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('mission_number', selectedMission)
        .order('order_position');

      if (error) throw error;
      setQuestions((data || []).map(q => ({
        ...q,
        question_type: q.question_type as 'multiple-choice' | 'star-rating'
      })));
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perguntas",
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

  const saveQuestion = async (question: Omit<Question, 'id'> | Question) => {
    try {
      if ('id' in question) {
        // Update existing
        const { error } = await supabase
          .from('questions')
          .update(question)
          .eq('id', question.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Pergunta atualizada com sucesso"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('questions')
          .insert(question);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Pergunta criada com sucesso"
        });
      }

      setEditingQuestion(null);
      setIsCreating(false);
      loadQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar pergunta",
        variant: "destructive"
      });
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Pergunta excluída com sucesso"
      });
      loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir pergunta",
        variant: "destructive"
      });
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

  const renderQuestionOptions = (question: Question) => {
    if (question.question_type === 'multiple-choice' && question.options) {
      return (
        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Opções:</h4>
          <div className="grid gap-2">
            {Object.entries(question.options).map(([letter, option]: [string, any]) => (
              <div key={letter} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                    {letter}
                  </Badge>
                  <span>{option?.text || 'Sem texto'}</span>
                </span>
                <Badge variant="secondary" className="text-xs">
                  {option?.points !== undefined ? `${option.points} pts` : '0 pts'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (question.question_type === 'star-rating' && question.star_legends) {
      return (
        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Legendas das Estrelas:</h4>
          <div className="grid gap-2">
            {Object.entries(question.star_legends).map(([star, legend]: [string, any]) => (
              <div key={star} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {star} ⭐
                  </Badge>
                  <span>{legend || 'Sem legenda'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const QuestionForm = ({ question, onSave, onCancel }: {
    question: Omit<Question, 'id'> | Question;
    onSave: (q: Omit<Question, 'id'> | Question) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(question);

    const updateOptions = (index: string, field: 'text' | 'points', value: string | number) => {
      setFormData(prev => ({
        ...prev,
        options: {
          ...prev.options,
          [index]: {
            ...prev.options?.[index],
            [field]: value
          }
        }
      }));
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{'id' in question ? 'Editar Pergunta' : 'Nova Pergunta'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question_text">Texto da Pergunta</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              placeholder="Digite o texto da pergunta..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="order_position">Posição</Label>
              <Input
                id="order_position"
                type="number"
                value={formData.order_position}
                onChange={(e) => setFormData(prev => ({ ...prev, order_position: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {formData.question_type === 'multiple-choice' && (
            <div>
              <Label>Opções</Label>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D', 'E'].map(letter => (
                  <div key={letter} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder={`Opção ${letter}`}
                      value={formData.options?.[letter]?.text || ''}
                      onChange={(e) => updateOptions(letter, 'text', e.target.value)}
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Pontos"
                      value={formData.options?.[letter]?.points || ''}
                      onChange={(e) => updateOptions(letter, 'points', parseFloat(e.target.value))}
                    />
                    <span className="flex items-center text-sm text-muted-foreground">
                      {letter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gerenciar Perguntas</h2>
          <Select value={selectedMission.toString()} onValueChange={(value) => setSelectedMission(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Missão 1 - Quiz Digital</SelectItem>
              <SelectItem value="2">Missão 2 - Práticas Digitais</SelectItem>
              <SelectItem value="3">Missão 3 - Desafios e Inovação</SelectItem>
              <SelectItem value="4">Missão 4 - Ferramentas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Pergunta
        </Button>
      </div>

      {isCreating && (
        <QuestionForm
          question={{ ...newQuestion, mission_number: selectedMission }}
          onSave={saveQuestion}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingQuestion && (
        <QuestionForm
          question={editingQuestion}
          onSave={saveQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}

      {isLoading ? (
        <div className="text-center py-8">Carregando perguntas...</div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => {
            const isExpanded = expandedQuestions.has(question.id);
            const hasOptions = (question.question_type === 'multiple-choice' && question.options) ||
                              (question.question_type === 'star-rating' && question.star_legends);
            
            return (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{question.order_position}</Badge>
                        <Badge variant={question.question_type === 'multiple-choice' ? 'default' : 'secondary'}>
                          {question.question_type === 'multiple-choice' ? 'Múltipla Escolha' : 'Estrelas'}
                        </Badge>
                        {!question.is_active && <Badge variant="destructive">Inativa</Badge>}
                        {hasOptions && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleQuestionExpansion(question.id)}
                            className="h-6 px-2"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            <span className="ml-1 text-xs">
                              {isExpanded ? 'Ocultar' : 'Ver'} opções
                            </span>
                          </Button>
                        )}
                      </div>
                      <p className="text-sm font-medium">{question.question_text}</p>
                      {question.target_area_ids && question.target_area_ids.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Áreas específicas: </span>
                          {question.target_area_ids.map(areaId => {
                            const area = areas.find(a => a.id === areaId);
                            return area ? (
                              <Badge key={areaId} variant="outline" className="ml-1 text-xs">
                                {area.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                      
                      {isExpanded && renderQuestionOptions(question)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};