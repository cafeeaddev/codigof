import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const CreateAdminUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    cpf: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: formData
      });

      if (error) {
        console.error('Function error:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao criar usuário admin",
          variant: "destructive"
        });
        return;
      }

      console.log('Success:', data);
      toast({
        title: "Sucesso!",
        description: `Usuário admin criado: ${formData.email}`,
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        nome: '',
        cpf: ''
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar usuário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Criar Usuário Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="admin@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF (últimos 4 dígitos)</Label>
            <Input
              id="cpf"
              type="text"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              placeholder="1234"
              maxLength={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Senha forte"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Criando...' : 'Criar Admin'}
          </Button>
        </form>

        <div className="mt-6 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">ℹ️ Instruções:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Este usuário terá permissões de administrador</li>
            <li>• Poderá acessar o dashboard admin (/admin)</li>
            <li>• Use uma senha forte para segurança</li>
            <li>• CPF deve ter apenas os últimos 4 dígitos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAdminUser;