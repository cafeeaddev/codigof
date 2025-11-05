import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const generateInitials = (fullName: string): string => {
  const names = fullName.trim().split(' ').filter(n => n.length > 0);
  if (names.length === 0) return '??';
  if (names.length === 1) return names[0][0].toUpperCase();
  
  const first = names[0][0].toUpperCase();
  const last = names[names.length - 1][0].toUpperCase();
  return `${first}.${last}.`;
};

export const Quiz5Participant = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    participantName: '',
    mindsetChange: '',
    digitalIdea: '',
    digitalHabit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.participantName.trim() || !formData.mindsetChange.trim() || 
        !formData.digitalIdea.trim() || !formData.digitalHabit.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const initials = generateInitials(formData.participantName);

      const { error } = await supabase
        .from('quiz5_submissions')
        .insert({
          participant_name: formData.participantName.trim(),
          initials,
          mindset_change: formData.mindsetChange.trim(),
          digital_idea: formData.digitalIdea.trim(),
          digital_habit: formData.digitalHabit.trim()
        });

      if (error) throw error;

      toast({
        title: "Post-its adicionados! 🎉",
        description: "Suas contribuições estão agora no mural digital.",
      });

      // Reset form
      setFormData({
        participantName: '',
        mindsetChange: '',
        digitalIdea: '',
        digitalHabit: ''
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-sky-950/50 border-sky-500/30 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="text-6xl mb-4">🧭</div>
          <CardTitle className="text-3xl text-sky-100">
            Mapa da Alfabetização Tecnológica
          </CardTitle>
          <CardDescription className="text-sky-200 text-lg">
            Adicione seus 3 post-its ao mural colaborativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sky-100">Nome Completo</Label>
              <Input
                id="name"
                value={formData.participantName}
                onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                placeholder="Digite seu nome completo"
                maxLength={100}
                className="bg-slate-900/50 border-sky-500/30 text-sky-50 placeholder:text-sky-300/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mindset" className="text-sky-100 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Mentalidade que mudei
              </Label>
              <Textarea
                id="mindset"
                value={formData.mindsetChange}
                onChange={(e) => setFormData({ ...formData, mindsetChange: e.target.value })}
                placeholder="Ex: 'Parei de esperar o curso, comecei a testar.'"
                maxLength={200}
                rows={3}
                className="bg-slate-900/50 border-sky-500/30 text-sky-50 placeholder:text-sky-300/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea" className="text-green-100 flex items-center gap-2">
                <span className="text-2xl">🔧</span>
                Ideia digital que quero experimentar
              </Label>
              <Textarea
                id="idea"
                value={formData.digitalIdea}
                onChange={(e) => setFormData({ ...formData, digitalIdea: e.target.value })}
                placeholder="Ex: 'Criar um fluxo automatizado', 'Usar IA pra organizar tarefas.'"
                maxLength={200}
                rows={3}
                className="bg-slate-900/50 border-green-500/30 text-green-50 placeholder:text-green-300/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habit" className="text-yellow-100 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Hábito digital que vou adotar
              </Label>
              <Textarea
                id="habit"
                value={formData.digitalHabit}
                onChange={(e) => setFormData({ ...formData, digitalHabit: e.target.value })}
                placeholder="Ex: 'Ler sobre IA 10 min por semana', 'Padronizar arquivos na nuvem'"
                maxLength={200}
                rows={3}
                className="bg-slate-900/50 border-yellow-500/30 text-yellow-50 placeholder:text-yellow-300/50"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white text-lg py-6"
            >
              {isSubmitting ? 'Adicionando...' : '📝 Adicionar meus 3 Post-its'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
