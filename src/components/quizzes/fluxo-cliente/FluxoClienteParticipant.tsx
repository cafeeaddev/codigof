import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, ArrowDown, Diamond, RotateCcw, Play, Square, MoveUp, MoveDown } from 'lucide-react';
import { FlowElement } from './useFluxoCliente';

type ElementType = 'step' | 'decision' | 'loop';

export const FluxoClienteParticipant = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [elements, setElements] = useState<FlowElement[]>([
    { id: 'start', type: 'start', text: 'INÍCIO' },
    { id: 'end', type: 'end', text: 'FIM' }
  ]);

  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addElement = (type: ElementType) => {
    const newElement: FlowElement = {
      id: generateId(),
      type,
      text: type === 'step' ? '' : type === 'decision' ? '' : '',
      ...(type === 'decision' && { yesTarget: '', noTarget: '' }),
      ...(type === 'loop' && { loopTarget: '' })
    };

    // Insert before the END element
    const endIndex = elements.findIndex(el => el.type === 'end');
    const newElements = [...elements];
    newElements.splice(endIndex, 0, newElement);
    setElements(newElements);
  };

  const updateElement = (id: string, updates: Partial<FlowElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const removeElement = (id: string) => {
    if (id === 'start' || id === 'end') return;
    setElements(elements.filter(el => el.id !== id));
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const el = elements[index];
    if (el.type === 'start' || el.type === 'end') return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex <= 0 || newIndex >= elements.length - 1) return;
    
    const newElements = [...elements];
    [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
    setElements(newElements);
  };

  const getEditableElements = () => elements.filter(el => el.type !== 'start' && el.type !== 'end');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flowName.trim()) {
      toast({
        title: "Nome do fluxo obrigatório",
        description: "Por favor, digite o nome do fluxo que está mapeando.",
        variant: "destructive"
      });
      return;
    }

    if (!groupName.trim()) {
      toast({
        title: "Nome do grupo obrigatório",
        description: "Por favor, digite o nome do grupo.",
        variant: "destructive"
      });
      return;
    }

    const editableElements = getEditableElements();
    if (editableElements.length === 0) {
      toast({
        title: "Adicione elementos",
        description: "Adicione pelo menos um passo, decisão ou loop ao fluxograma.",
        variant: "destructive"
      });
      return;
    }

    const emptySteps = editableElements.filter(el => !el.text.trim());
    if (emptySteps.length > 0) {
      toast({
        title: "Preencha todos os campos",
        description: "Todos os elementos precisam ter uma descrição.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('fluxo_cliente_submissions' as any)
        .insert({
          group_name: groupName.trim(),
          group_members: groupMembers.trim() || null,
          flowchart_data: {
            flowName: flowName.trim(),
            elements: elements
          }
        } as any);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Fluxograma enviado! 📊",
        description: `Seu mapeamento "${flowName.trim()}" foi registrado com sucesso!`,
      });
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submittedFlowName = flowName.trim();

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-blue-950/50 border-blue-500/30 backdrop-blur text-center">
          <CardContent className="p-12">
            <div className="text-8xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-blue-100 mb-4">
              Fluxograma Enviado!
            </h2>
            <p className="text-blue-200 text-lg mb-2">
              Seu mapeamento foi registrado com sucesso!
            </p>
            <p className="text-cyan-300 text-xl font-semibold">
              "{submittedFlowName}"
            </p>
            <div className="mt-6 text-6xl animate-bounce">✅</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-blue-950/50 border-blue-500/30 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <div className="text-6xl mb-2">📊</div>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Fluxo do Cliente
            </CardTitle>
            <CardDescription className="text-blue-200 text-lg">
              Mapeie o processo do cliente passo a passo
            </CardDescription>
            <div className="bg-blue-900/50 rounded-lg p-4 mt-4 border border-blue-500/30">
              <p className="text-blue-100 font-medium">
                🎯 Construa o fluxograma adicionando <span className="text-cyan-300">passos</span>, <span className="text-yellow-300">decisões</span> e <span className="text-purple-300">loops</span>
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Flow Name */}
              <div className="space-y-2">
                <Label htmlFor="flowName" className="text-blue-100 text-lg">📋 Nome do Fluxo</Label>
                <Input
                  id="flowName"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  placeholder="Ex: Fluxo de Atendimento ao Cliente, Processo de Vendas..."
                  maxLength={100}
                  className="bg-slate-900/50 border-cyan-500/50 text-blue-50 placeholder:text-blue-300/50 text-lg py-3"
                />
                <p className="text-blue-300/70 text-xs">Escolha um nome que represente o processo que você está mapeando</p>
              </div>

              {/* Group Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group" className="text-blue-100">👥 Nome do Grupo</Label>
                  <Input
                    id="group"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ex: Equipe Inovação"
                    maxLength={50}
                    className="bg-slate-900/50 border-blue-500/30 text-blue-50 placeholder:text-blue-300/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="members" className="text-blue-100">👤 Integrantes (opcional)</Label>
                  <Input
                    id="members"
                    value={groupMembers}
                    onChange={(e) => setGroupMembers(e.target.value)}
                    placeholder="Ana, Carlos, Maria..."
                    maxLength={200}
                    className="bg-slate-900/50 border-blue-500/30 text-blue-50 placeholder:text-blue-300/50"
                  />
                </div>
              </div>

              {/* Add Element Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  onClick={() => addElement('step')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <Square className="w-4 h-4 mr-1" />
                  Passo
                </Button>
                <Button
                  type="button"
                  onClick={() => addElement('decision')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <Diamond className="w-4 h-4 mr-1" />
                  Decisão
                </Button>
                <Button
                  type="button"
                  onClick={() => addElement('loop')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Loop
                </Button>
              </div>

              {/* Flowchart Elements */}
              <div className="space-y-3">
                {elements.map((element, index) => (
                  <div key={element.id}>
                    {/* Start Element */}
                    {element.type === 'start' && (
                      <div className="flex justify-center">
                        <div className="bg-green-600/80 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2">
                          <Play className="w-5 h-5" />
                          INÍCIO
                        </div>
                      </div>
                    )}

                    {/* Step Element */}
                    {element.type === 'step' && (
                      <div className="bg-cyan-900/50 border-2 border-cyan-500/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveElement(index, 'up')}
                              className="h-6 w-6 p-0 text-cyan-300 hover:text-cyan-100"
                              disabled={index <= 1}
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <GripVertical className="w-4 h-4 text-cyan-400" />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveElement(index, 'down')}
                              className="h-6 w-6 p-0 text-cyan-300 hover:text-cyan-100"
                              disabled={index >= elements.length - 2}
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex-1">
                            <Label className="text-cyan-200 text-xs flex items-center gap-1 mb-2">
                              <Square className="w-3 h-3" /> PASSO {index}
                            </Label>
                            <Input
                              value={element.text}
                              onChange={(e) => updateElement(element.id, { text: e.target.value })}
                              placeholder="Descreva a ação..."
                              maxLength={150}
                              className="bg-slate-900/50 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-300/30"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeElement(element.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Decision Element */}
                    {element.type === 'decision' && (
                      <div className="bg-yellow-900/50 border-2 border-yellow-500/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveElement(index, 'up')}
                              className="h-6 w-6 p-0 text-yellow-300 hover:text-yellow-100"
                              disabled={index <= 1}
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <GripVertical className="w-4 h-4 text-yellow-400" />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveElement(index, 'down')}
                              className="h-6 w-6 p-0 text-yellow-300 hover:text-yellow-100"
                              disabled={index >= elements.length - 2}
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex-1 space-y-3">
                            <Label className="text-yellow-200 text-xs flex items-center gap-1">
                              <Diamond className="w-3 h-3" /> DECISÃO
                            </Label>
                            <Input
                              value={element.text}
                              onChange={(e) => updateElement(element.id, { text: e.target.value })}
                              placeholder="Pergunta da decisão? (Ex: Cliente aprovou?)"
                              maxLength={150}
                              className="bg-slate-900/50 border-yellow-500/30 text-yellow-50 placeholder:text-yellow-300/30"
                            />
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-green-900/30 p-2 rounded border border-green-500/30">
                                <span className="text-green-300 font-bold">SIM →</span>
                                <span className="text-green-200 ml-2">continua</span>
                              </div>
                              <div className="bg-red-900/30 p-2 rounded border border-red-500/30">
                                <span className="text-red-300 font-bold">NÃO →</span>
                                <Input
                                  value={element.noTarget || ''}
                                  onChange={(e) => updateElement(element.id, { noTarget: e.target.value })}
                                  placeholder="Ação alternativa..."
                                  maxLength={80}
                                  className="mt-1 bg-slate-900/50 border-red-500/30 text-red-50 placeholder:text-red-300/30 text-xs h-7"
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeElement(element.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Loop Element */}
                    {element.type === 'loop' && (
                      <div className="bg-purple-900/50 border-2 border-purple-500/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveElement(index, 'up')}
                              className="h-6 w-6 p-0 text-purple-300 hover:text-purple-100"
                              disabled={index <= 1}
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <GripVertical className="w-4 h-4 text-purple-400" />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveElement(index, 'down')}
                              className="h-6 w-6 p-0 text-purple-300 hover:text-purple-100"
                              disabled={index >= elements.length - 2}
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex-1 space-y-3">
                            <Label className="text-purple-200 text-xs flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" /> LOOP (repetição)
                            </Label>
                            <Input
                              value={element.text}
                              onChange={(e) => updateElement(element.id, { text: e.target.value })}
                              placeholder="Condição do loop (Ex: Enquanto não aprovado...)"
                              maxLength={150}
                              className="bg-slate-900/50 border-purple-500/30 text-purple-50 placeholder:text-purple-300/30"
                            />
                            <div className="bg-purple-800/30 p-2 rounded border border-purple-500/30 text-sm">
                              <span className="text-purple-300">↩️ Volta para:</span>
                              <Input
                                value={element.loopTarget || ''}
                                onChange={(e) => updateElement(element.id, { loopTarget: e.target.value })}
                                placeholder="Qual passo? (Ex: Passo 2)"
                                maxLength={50}
                                className="mt-1 bg-slate-900/50 border-purple-500/30 text-purple-50 placeholder:text-purple-300/30 text-xs h-7"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeElement(element.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* End Element */}
                    {element.type === 'end' && (
                      <div className="flex justify-center">
                        <div className="bg-red-600/80 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2">
                          <Square className="w-5 h-5" />
                          FIM
                        </div>
                      </div>
                    )}

                    {/* Arrow between elements */}
                    {index < elements.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-cyan-900/50 px-3 py-1 rounded text-cyan-200">
                  {elements.filter(e => e.type === 'step').length} passos
                </span>
                <span className="bg-yellow-900/50 px-3 py-1 rounded text-yellow-200">
                  {elements.filter(e => e.type === 'decision').length} decisões
                </span>
                <span className="bg-purple-900/50 px-3 py-1 rounded text-purple-200">
                  {elements.filter(e => e.type === 'loop').length} loops
                </span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg py-6"
              >
                {isSubmitting ? '📊 Enviando...' : '📊 Enviar Fluxograma'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
