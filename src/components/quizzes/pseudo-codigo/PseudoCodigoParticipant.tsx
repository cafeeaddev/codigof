import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePseudoCodigo } from './usePseudoCodigo';
import { useToast } from '@/hooks/use-toast';
import { Code, Send, CheckCircle, Loader2 } from 'lucide-react';

const PLACEHOLDER_CODE = `INÍCIO
  (Descreva os passos aqui...)
  SE condição ENTÃO
    ação
  SENÃO
    outra ação
  FIM SE
FIM`;

export const PseudoCodigoParticipant = () => {
  const [groupName, setGroupName] = useState('');
  const [pseudoCode, setPseudoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { submitPseudoCodigo } = usePseudoCodigo();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Nome do grupo obrigatório",
        description: "Por favor, informe o nome do grupo.",
        variant: "destructive"
      });
      return;
    }

    if (!pseudoCode.trim()) {
      toast({
        title: "Pseudo-código obrigatório",
        description: "Por favor, escreva o pseudo-código.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await submitPseudoCodigo(groupName.trim(), pseudoCode.trim());

    if (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    } else {
      setIsSubmitted(true);
      toast({
        title: "Enviado com sucesso! 🎉",
        description: "Seu pseudo-código foi registrado.",
      });
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
              className="bg-slate-900/60 border-violet-500/40 text-white placeholder:text-violet-400/50 focus:border-violet-400"
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
              className="bg-slate-900/60 border-violet-500/40 text-white placeholder:text-violet-400/40 focus:border-violet-400 font-mono text-sm min-h-[280px] resize-y"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
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
