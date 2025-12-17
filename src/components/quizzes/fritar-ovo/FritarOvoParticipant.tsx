import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, CheckCircle2, WifiOff } from 'lucide-react';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

export const FritarOvoParticipant = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [steps, setSteps] = useState<string[]>(Array(15).fill(''));
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'validating' | 'connecting' | 'sending' | 'retrying'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!groupName.trim()) {
      errors.push('Nome do grupo é obrigatório');
    }
    
    const filledSteps = steps.filter(s => s.trim()).length;
    if (filledSteps === 0) {
      errors.push('Preencha pelo menos 1 passo da receita');
    }
    
    return errors;
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fritar_ovo_submissions').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  };

  const submitWithRetry = useCallback(async (attempt: number = 1): Promise<boolean> => {
    console.log(`[FritarOvo] Tentativa ${attempt}/${MAX_RETRIES + 1} de envio`);
    
    try {
      const { error, data } = await supabase
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
        })
        .select();

      if (error) {
        console.error(`[FritarOvo] Erro na tentativa ${attempt}:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If we have retries left and it's a connection/timeout error
        if (attempt <= MAX_RETRIES && (error.code === 'PGRST301' || error.message?.includes('timeout') || error.message?.includes('network'))) {
          setSubmitStatus('retrying');
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return submitWithRetry(attempt + 1);
        }
        
        throw error;
      }

      console.log('[FritarOvo] Envio bem-sucedido:', data);
      return true;
    } catch (err) {
      console.error(`[FritarOvo] Exceção na tentativa ${attempt}:`, err);
      
      if (attempt <= MAX_RETRIES) {
        setSubmitStatus('retrying');
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return submitWithRetry(attempt + 1);
      }
      
      throw err;
    }
  }, [groupName, steps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    setSubmitStatus('validating');
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSubmitStatus('idle');
      toast({
        title: "Formulário incompleto",
        description: errors.join('. '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    // Check connection
    setSubmitStatus('connecting');
    console.log('[FritarOvo] Verificando conexão...');
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      console.error('[FritarOvo] Sem conexão com o servidor');
      setIsSubmitting(false);
      setSubmitStatus('idle');
      toast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    // Submit with retry
    setSubmitStatus('sending');
    console.log('[FritarOvo] Iniciando envio...', {
      groupName: groupName.trim(),
      filledSteps: steps.filter(s => s.trim()).length
    });

    try {
      const success = await submitWithRetry();
      
      if (success) {
        setIsSubmitted(true);
        toast({
          title: "Receita enviada! 🍳",
          description: "O robô vai tentar seguir suas instruções!",
        });
      }
    } catch (error: any) {
      console.error('[FritarOvo] Falha final após todas as tentativas:', error);
      
      let errorMessage = "Não foi possível enviar. ";
      
      if (error?.code === '23505') {
        errorMessage += "Este grupo já enviou uma receita.";
      } else if (error?.code === 'PGRST301' || error?.message?.includes('timeout')) {
        errorMessage += "Conexão lenta. Tente novamente em alguns segundos.";
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage += "Problema de conexão. Verifique sua internet.";
      } else {
        errorMessage += `Erro: ${error?.message || 'Desconhecido'}. Tente novamente.`;
      }
      
      toast({
        title: "Erro ao enviar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setSubmitStatus('idle');
    }
  };

  const getStatusMessage = () => {
    switch (submitStatus) {
      case 'validating':
        return 'Verificando dados...';
      case 'connecting':
        return 'Verificando conexão...';
      case 'sending':
        return 'Enviando receita...';
      case 'retrying':
        return 'Tentando novamente...';
      default:
        return null;
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

  const filledStepsCount = steps.filter(s => s.trim()).length;
  const statusMessage = getStatusMessage();

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
            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-200 text-sm">
                  {validationErrors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="group" className="text-orange-100 text-lg">👥 Nome do Grupo</Label>
                <Input
                  id="group"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    if (validationErrors.length > 0) setValidationErrors([]);
                  }}
                  placeholder="Ex: Equipe Master Chef"
                  maxLength={50}
                  disabled={isSubmitting}
                  className={`bg-slate-900/50 border-orange-500/30 text-orange-50 placeholder:text-orange-300/50 text-lg py-6 ${
                    validationErrors.some(e => e.includes('grupo')) ? 'border-red-500' : ''
                  }`}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-orange-100 text-lg">📝 Passos para Fritar um Ovo</Label>
                  <span className={`text-sm ${filledStepsCount > 0 ? 'text-green-400' : 'text-orange-300'}`}>
                    {filledStepsCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {filledStepsCount} de 15 preenchidos
                      </span>
                    ) : (
                      '0 de 15 preenchidos'
                    )}
                  </span>
                </div>
                
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
                        maxLength={300}
                        disabled={isSubmitting}
                        className="bg-slate-900/50 border-orange-500/30 text-orange-50 placeholder:text-orange-300/30 flex-1 disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button with Status */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-slate-900 font-bold text-lg py-6 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {statusMessage || 'Enviando...'}
                    </span>
                  ) : (
                    '🍳 Enviar Receita para o Robô'
                  )}
                </Button>

                {/* Status indicator below button */}
                {isSubmitting && submitStatus === 'retrying' && (
                  <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span>Conexão lenta, tentando novamente...</span>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
