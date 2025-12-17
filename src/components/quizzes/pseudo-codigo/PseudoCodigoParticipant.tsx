import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePseudoCodigo } from './usePseudoCodigo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Code, Send, CheckCircle, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const PLACEHOLDER_CODE = `INÍCIO
  (Descreva os passos aqui...)
  SE condição ENTÃO
    ação
  SENÃO
    outra ação
  FIM SE
FIM`;

type SubmitStatus = 'idle' | 'validating' | 'connecting' | 'sending' | 'retrying' | 'success' | 'error';

export const PseudoCodigoParticipant = () => {
  const [groupName, setGroupName] = useState('');
  const [pseudoCode, setPseudoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { submitPseudoCodigo } = usePseudoCodigo();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    console.log('[PseudoCodigo] Validando formulário...');
    const errors: string[] = [];
    
    if (!groupName.trim()) {
      errors.push('Nome do grupo é obrigatório');
    }
    
    if (!pseudoCode.trim()) {
      errors.push('Pseudo-código é obrigatório');
    } else if (pseudoCode.trim().length < 10) {
      errors.push('Pseudo-código muito curto (mínimo 10 caracteres)');
    }
    
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      console.log('[PseudoCodigo] Erros de validação:', errors);
    } else {
      console.log('[PseudoCodigo] Validação OK');
    }
    
    return errors.length === 0;
  };

  const checkConnection = async (): Promise<boolean> => {
    console.log('[PseudoCodigo] Verificando conexão com Supabase...');
    try {
      const { error } = await supabase.from('pseudo_codigo_submissions').select('id').limit(1);
      if (error) {
        console.error('[PseudoCodigo] Erro na verificação de conexão:', error);
        return false;
      }
      console.log('[PseudoCodigo] Conexão OK');
      return true;
    } catch (err) {
      console.error('[PseudoCodigo] Falha na verificação de conexão:', err);
      return false;
    }
  };

  const submitWithRetry = async (attempt: number = 1): Promise<{ success: boolean; error?: any }> => {
    const maxRetries = 3;
    console.log(`[PseudoCodigo] Tentativa de envio ${attempt}/${maxRetries}`);
    
    try {
      const { error } = await submitPseudoCodigo(groupName.trim(), pseudoCode.trim());
      
      if (error) {
        console.error(`[PseudoCodigo] Erro na tentativa ${attempt}:`, error);
        
        if (attempt < maxRetries) {
          console.log(`[PseudoCodigo] Aguardando 1s antes de tentar novamente...`);
          setSubmitStatus('retrying');
          setRetryCount(attempt);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return submitWithRetry(attempt + 1);
        }
        
        return { success: false, error };
      }
      
      console.log('[PseudoCodigo] Envio bem-sucedido!');
      return { success: true };
    } catch (err) {
      console.error(`[PseudoCodigo] Exceção na tentativa ${attempt}:`, err);
      
      if (attempt < maxRetries) {
        console.log(`[PseudoCodigo] Aguardando 1s antes de tentar novamente...`);
        setSubmitStatus('retrying');
        setRetryCount(attempt);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return submitWithRetry(attempt + 1);
      }
      
      return { success: false, error: err };
    }
  };

  const getErrorMessage = (error: any): string => {
    if (!error) return 'Erro desconhecido';
    
    const errorMessage = error?.message || error?.toString() || '';
    const errorCode = error?.code || '';
    
    console.log('[PseudoCodigo] Analisando erro:', { message: errorMessage, code: errorCode });
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorCode === 'NETWORK_ERROR') {
      return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
    }
    
    if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
      return 'Conexão lenta. O servidor demorou para responder.';
    }
    
    if (errorMessage.includes('duplicate') || errorCode === '23505') {
      return 'Este grupo já enviou uma resposta.';
    }
    
    if (errorMessage.includes('violates') || errorMessage.includes('constraint')) {
      return 'Dados inválidos. Verifique os campos preenchidos.';
    }
    
    return `Erro ao enviar: ${errorMessage || 'Tente novamente'}`;
  };

  const handleSubmit = async () => {
    console.log('[PseudoCodigo] ========== INÍCIO DO ENVIO ==========');
    console.log('[PseudoCodigo] Dados:', { groupName, pseudoCodeLength: pseudoCode.length });
    
    // Validação
    setSubmitStatus('validating');
    if (!validateForm()) {
      toast({
        title: "Campos incompletos",
        description: validationErrors.join('. '),
        variant: "destructive"
      });
      setSubmitStatus('idle');
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);
    
    // Verificar conexão
    setSubmitStatus('connecting');
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      console.error('[PseudoCodigo] Sem conexão com o servidor');
      toast({
        title: "Sem conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua internet.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      setSubmitStatus('error');
      return;
    }

    // Enviar com retry
    setSubmitStatus('sending');
    const result = await submitWithRetry();

    if (result.success) {
      console.log('[PseudoCodigo] ========== ENVIO CONCLUÍDO COM SUCESSO ==========');
      setSubmitStatus('success');
      setIsSubmitted(true);
      toast({
        title: "Enviado com sucesso! 🎉",
        description: "Seu pseudo-código foi registrado.",
      });
    } else {
      console.error('[PseudoCodigo] ========== FALHA NO ENVIO ==========');
      console.error('[PseudoCodigo] Erro final:', result.error);
      setSubmitStatus('error');
      
      const errorMessage = getErrorMessage(result.error);
      toast({
        title: "Erro ao enviar",
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
    setRetryCount(0);
  };

  const getStatusMessage = (): string => {
    switch (submitStatus) {
      case 'validating': return 'Validando dados...';
      case 'connecting': return 'Verificando conexão...';
      case 'sending': return 'Enviando pseudo-código...';
      case 'retrying': return `Tentando novamente... (tentativa ${retryCount + 1} de 3)`;
      default: return '';
    }
  };

  const getStatusIcon = () => {
    switch (submitStatus) {
      case 'connecting':
        return <Wifi className="w-5 h-5 mr-2 animate-pulse" />;
      case 'error':
        return <WifiOff className="w-5 h-5 mr-2" />;
      default:
        return <Loader2 className="w-5 h-5 mr-2 animate-spin" />;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-black/40 border-violet-500/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Pseudo-código Enviado!
            </CardTitle>
            <CardDescription className="text-violet-300 text-lg">
              Grupo: {groupName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900/80 rounded-lg p-4 border border-violet-500/30">
              <pre className="font-mono text-sm text-violet-200 whitespace-pre-wrap overflow-x-auto">
                {pseudoCode}
              </pre>
            </div>
            <p className="text-center text-violet-300/80 text-sm">
              📺 Acompanhe na tela de projeção
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/40 border-violet-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center mb-3">
            <Code className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Mini Missão – Pseudo-código
          </CardTitle>
          <CardDescription className="text-violet-300">
            Transforme uma decisão do fluxo em pseudo-código estruturado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Errors Alert */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="bg-red-900/30 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-violet-200">
              Nome do Grupo
            </Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Equipe Alpha"
              maxLength={100}
              className={`bg-slate-900/60 border-violet-500/40 text-white placeholder:text-violet-400/50 focus:border-violet-400 ${
                validationErrors.some(e => e.includes('grupo')) ? 'border-red-500' : ''
              }`}
              disabled={isSubmitting}
            />
          </div>

          {/* Pseudo-code */}
          <div className="space-y-2">
            <Label htmlFor="pseudoCode" className="text-violet-200">
              Pseudo-código
            </Label>
            <div className="text-xs text-violet-400/70 mb-2">
              Use: INÍCIO / FIM • SE / ENTÃO / SENÃO • ENQUANTO (opcional)
            </div>
            <Textarea
              id="pseudoCode"
              value={pseudoCode}
              onChange={(e) => setPseudoCode(e.target.value)}
              placeholder={PLACEHOLDER_CODE}
              className={`bg-slate-900/60 border-violet-500/40 text-white placeholder:text-violet-400/40 focus:border-violet-400 font-mono text-sm min-h-[280px] resize-y ${
                validationErrors.some(e => e.includes('Pseudo')) ? 'border-red-500' : ''
              }`}
              disabled={isSubmitting}
            />
          </div>

          {/* Status Message */}
          {isSubmitting && submitStatus !== 'idle' && (
            <div className="flex items-center justify-center text-violet-300 text-sm py-2">
              {getStatusIcon()}
              <span>{getStatusMessage()}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                {getStatusIcon()}
                {getStatusMessage() || 'Enviando...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Pseudo-código
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
