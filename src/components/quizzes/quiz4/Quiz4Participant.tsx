import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Target, Wrench, Heart, Users, Send, CheckCircle2 } from 'lucide-react';

export const Quiz4Participant = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    groupName: '',
    groupMembers: '',
    problem: '',
    solution: '',
    technology: '',
    humanImpact: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupName || !formData.problem || !formData.solution || 
        !formData.technology || !formData.humanImpact) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('quiz4_submissions')
      .insert({
        group_name: formData.groupName,
        group_members: formData.groupMembers || null,
        problem: formData.problem,
        solution: formData.solution,
        technology: formData.technology,
        human_impact: formData.humanImpact
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSubmitted(true);
      toast({
        title: "Canvas enviado com sucesso! 🎨",
        description: "Sua ideia foi registrada."
      });
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          groupName: '',
          groupMembers: '',
          problem: '',
          solution: '',
          technology: '',
          humanImpact: ''
        });
      }, 3000);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-lg border-2 border-green-400 p-12 text-center max-w-md">
          <CheckCircle2 className="w-24 h-24 text-green-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Canvas Registrado! 🎨
          </h2>
          <p className="text-xl text-gray-200">
            Sua ideia foi enviada com sucesso
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Lightbulb className="w-16 h-16 text-yellow-400" />
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              Canvas de Ideias
            </h1>
          </div>
          <p className="text-xl text-gray-200">
            Estruture sua solução em 4 perguntas
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificação */}
          <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Identificação do Grupo
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName" className="text-white text-lg">
                  Nome do Grupo *
                </Label>
                <Input
                  id="groupName"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  maxLength={50}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 text-lg"
                  placeholder="Ex: Inovadores FM"
                  required
                />
              </div>

              <div>
                <Label htmlFor="groupMembers" className="text-white text-lg">
                  Pessoas do Grupo (opcional)
                </Label>
                <Textarea
                  id="groupMembers"
                  value={formData.groupMembers}
                  onChange={(e) => setFormData({ ...formData, groupMembers: e.target.value })}
                  maxLength={350}
                  rows={3}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                  placeholder="Ex: Ana, João, Maria..."
                />
              </div>
            </div>
          </Card>

          {/* Pergunta 1: Problema */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-lg border-2 border-yellow-400/50 p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-yellow-400" />
              1. Qual é o problema?
            </h3>
            <Textarea
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              maxLength={500}
              rows={4}
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 text-lg"
              placeholder="Descreva o problema que precisa ser resolvido..."
              required
            />
            <p className="text-sm text-gray-200 mt-2">
              {formData.problem.length}/500 caracteres
            </p>
          </Card>

          {/* Pergunta 2: Solução */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg border-2 border-blue-400/50 p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-blue-400" />
              2. Qual é a solução?
            </h3>
            <Textarea
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              maxLength={500}
              rows={4}
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 text-lg"
              placeholder="Descreva sua proposta de solução..."
              required
            />
            <p className="text-sm text-gray-200 mt-2">
              {formData.solution.length}/500 caracteres
            </p>
          </Card>

          {/* Pergunta 3: Tecnologia */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg border-2 border-orange-400/50 p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-orange-400" />
              3. Que tecnologia apoia?
            </h3>
            <Textarea
              value={formData.technology}
              onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
              maxLength={300}
              rows={3}
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 text-lg"
              placeholder="Ex: planilha, automação, app..."
              required
            />
            <p className="text-sm text-gray-200 mt-2">
              {formData.technology.length}/300 caracteres
            </p>
          </Card>

          {/* Pergunta 4: Impacto Humano */}
          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-lg border-2 border-pink-400/50 p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-400" />
              4. Que impacto humano gera?
            </h3>
            <Textarea
              value={formData.humanImpact}
              onChange={(e) => setFormData({ ...formData, humanImpact: e.target.value })}
              maxLength={300}
              rows={3}
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 text-lg"
              placeholder="O que muda na prática para quem usa..."
              required
            />
            <p className="text-sm text-gray-200 mt-2">
              {formData.humanImpact.length}/300 caracteres
            </p>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-xl py-6 rounded-xl font-bold shadow-lg shadow-violet-500/50"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-6 h-6 mr-2" />
                Enviar Canvas
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
