import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { UserProgress, UserProfile } from '@/types/admin';

interface ResetProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProgress | null;
  userProfile: UserProfile | null;
  onResetSuccess: () => void;
}

export const ResetProgressDialog = ({ 
  isOpen, 
  onClose, 
  user, 
  userProfile,
  onResetSuccess
}: ResetProgressDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!user || confirmText !== 'RESET') {
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.rpc('reset_user_progress', {
        _target_user_id: user.user_id
      });

      if (error) {
        console.error('Reset error:', error);
        toast({
          title: "Erro ao resetar progresso",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Progresso resetado com sucesso",
        description: `O progresso de ${userProfile?.nome || 'usuário'} foi resetado completamente.`,
      });

      onResetSuccess();
      handleClose();
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao resetar progresso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setIsLoading(false);
    onClose();
  };

  const isConfirmValid = confirmText === 'RESET';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Resetar Progresso do Usuário
          </DialogTitle>
          <DialogDescription className="text-left">
            Esta ação irá <strong>resetar completamente</strong> o progresso de{' '}
            <strong>{userProfile?.nome || 'usuário'}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="font-medium text-destructive mb-2">⚠️ Atenção: Ação Irreversível</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Todas as missões serão marcadas como não concluídas</li>
              <li>• Respostas e progresso das questões serão apagados</li>
              <li>• XP e tempo de jogo serão zerados</li>
              <li>• Perfil digital será removido</li>
              <li>• Usuário voltará ao início do jogo</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Para confirmar, digite <strong>RESET</strong> no campo abaixo:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Digite RESET para confirmar"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={!isConfirmValid || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Resetando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Resetar Progresso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};