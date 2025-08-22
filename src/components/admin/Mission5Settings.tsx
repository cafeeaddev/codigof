import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Calendar, Settings, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Mission5SettingsData {
  id: string;
  release_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Mission5Settings: React.FC = () => {
  const [settings, setSettings] = useState<Mission5SettingsData | null>(null);
  const [releaseDate, setReleaseDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('mission5_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações da Missão 5",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setSettings(data);
        setReleaseDate(data.release_date);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      if (settings) {
        // Atualizar configurações existentes
        const { error } = await supabase
          .from('mission5_settings')
          .update({
            release_date: releaseDate,
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Criar novas configurações
        const { error } = await supabase
          .from('mission5_settings')
          .insert({
            release_date: releaseDate,
            is_active: isActive
          });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações da Missão 5 salvas com sucesso!"
      });

      // Recarregar configurações
      await loadSettings();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações da Missão 5",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isDateInFuture = () => {
    return new Date(releaseDate) > new Date();
  };

  const isDateToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return releaseDate === today;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Configurações da Missão 5</h3>
            <p className="text-sm text-muted-foreground">
              Controle quando a Missão 5 (Fast Track) será liberada para os usuários
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-3">
            <Label htmlFor="release-date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Liberação
            </Label>
            <Input
              id="release-date"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full"
            />
            {releaseDate && (
              <div className="flex gap-2">
                {isDateToday() && (
                  <Badge variant="default">Hoje</Badge>
                )}
                {isDateInFuture() && (
                  <Badge variant="secondary">Futuro</Badge>
                )}
                {!isDateInFuture() && !isDateToday() && (
                  <Badge variant="outline">Passado</Badge>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="is-active" className="flex items-center gap-2">
                Missão 5 Ativa
              </Label>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Quando ativa, a Missão 5 aparecerá para usuários elegíveis (perfil ≠ Beginner) 
              que completaram as 4 missões anteriores e a data de liberação foi atingida.
            </p>
          </div>

          {!isActive && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Missão 5 Desativada
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  A Missão 5 não aparecerá para nenhum usuário enquanto estiver desativada.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={isSaving || !releaseDate}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>

        {settings && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date(settings.updated_at).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Mission5Settings;