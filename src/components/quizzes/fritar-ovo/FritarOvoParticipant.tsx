import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const FritarOvoParticipant = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [steps, setSteps] = useState<string[]>(Array(15).fill(''));

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast({
        title: "Nome do grupo obrigatório",
        description: "Por favor, digite o nome do grupo.",
        variant: "destructive"
      });
      return;
    }

    const emptySteps = steps.filter(s => !s.trim()).length;
    if (emptySteps > 0) {
      toast({
        title: "Passos incompletos",
        description: `Ainda faltam ${emptySteps} passos para preencher.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('fritar_ovo_submissions')
        .insert({
          group_name: groupName.trim(),
          step_1: steps[0].trim(),
          step_2: steps[1].trim(),
          step_3: steps[2].trim(),
          step_4: steps[3].trim(),
          step_5: steps[4].trim(),
          step_6: steps[5].trim(),
          step_7: steps[6].trim(),
          step_8: steps[7].trim(),
          step_9: steps[8].trim(),
          step_10: steps[9].trim(),
          step_11: steps[10].trim(),
          step_12: steps[11].trim(),
          step_13: steps[12].trim(),
          step_14: steps[13].trim(),
          step_15: steps[14].trim(),
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Receita enviada! 🍳",
        description: "O robô vai tentar seguir suas instruções!",
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/50 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-orange-950/50 border-orange-500/30 backdrop-blur text-center">
          <CardContent className="p-12">
            <div className="text-8xl mb-6">🤖</div>
            <h2 className="text-3xl font-bold text-orange-100 mb-4">
              Receita Recebida!
            </h2>
            <p className="text-orange-200 text-lg">
              Agora vamos ver se o robô consegue fritar um ovo seguindo suas instruções...
            </p>
            <div className="mt-6 text-6xl animate-bounce">🍳</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/50 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-orange-950/50 border-orange-500/30 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <div className="text-6xl mb-2">🍳</div>
            <CardTitle className="text-3xl bg-gradient-to-r from-orange-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
              Missão: Fritar um OVO
            </CardTitle>
            <CardDescription className="text-orange-200 text-lg">
              Vocês estão explicando para um robô que <span className="font-bold text-yellow-300">nunca viu uma cozinha</span>.
            </CardDescription>
            <div className="bg-orange-900/50 rounded-lg p-4 mt-4 border border-orange-500/30">
              <p className="text-orange-100 font-medium">
                🤖 O robô faz <span className="text-yellow-300 font-bold">EXATAMENTE</span> o que está escrito.
              </p>
              <p className="text-orange-300 text-sm mt-2">
                Seja específico! "Pegue o ovo" não funciona se ele não souber onde está.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="group" className="text-orange-100 text-lg">👥 Nome do Grupo</Label>
                <Input
                  id="group"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Equipe Master Chef"
                  maxLength={50}
                  className="bg-slate-900/50 border-orange-500/30 text-orange-50 placeholder:text-orange-300/50 text-lg py-6"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-orange-100 text-lg block">📝 15 Passos para Fritar um Ovo</Label>
                
                <div className="grid gap-3">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-orange-400 font-bold w-8 text-right">
                        {index + 1}.
                      </span>
                      <Input
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        placeholder={`Passo ${index + 1}...`}
                        maxLength={200}
                        className="bg-slate-900/50 border-orange-500/30 text-orange-50 placeholder:text-orange-300/30 flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-slate-900 font-bold text-lg py-6"
              >
                {isSubmitting ? '🤖 Enviando...' : '🍳 Enviar Receita para o Robô'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
