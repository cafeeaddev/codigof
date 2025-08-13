import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ForgotPasswordDialog = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !newPassword) {
      toast({
        title: "Erro",
        description: "Email e nova senha são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          email: email,
          newPassword: newPassword
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Senha resetada com sucesso. Você pode fazer login com a nova senha.",
      });

      setNewPassword("");
      setEmail("");
      setIsOpen(false);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao resetar senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-secondary"
        >
          Esqueci minha senha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset de Senha</DialogTitle>
          <DialogDescription>
            Digite seu email e uma nova senha de 6 dígitos para resetar sua conta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reset-password">Nova Senha (6 dígitos)</Label>
            <Input
              id="reset-password"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 dígitos para a nova senha"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Resetando..." : "Resetar Senha"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};