import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Save, Clock, Trophy, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GameSettingsProps {
  className?: string;
}

export const GameSettings: React.FC<GameSettingsProps> = ({ className }) => {
  const [gameStartDate, setGameStartDate] = useState<string>('');
  const [extraMissionReleaseDate, setExtraMissionReleaseDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadGameSettings();
  }, []);

  const loadGameSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('game_start_date, extra_mission_release_date')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data?.game_start_date) {
        setGameStartDate(data.game_start_date);
      } else {
        // Set default to today if no settings exist
        setGameStartDate(new Date().toISOString().split('T')[0]);
      }
      
      if (data?.extra_mission_release_date) {
        setExtraMissionReleaseDate(data.extra_mission_release_date);
      }
    } catch (error) {
      console.error('Error loading game settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do jogo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveGameSettings = async () => {
    if (!gameStartDate) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data de início",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // First, check if settings already exist
      const { data: existing } = await supabase
        .from('game_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('game_settings')
          .update({ 
            game_start_date: gameStartDate,
            extra_mission_release_date: extraMissionReleaseDate || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('game_settings')
          .insert({ 
            game_start_date: gameStartDate,
            extra_mission_release_date: extraMissionReleaseDate || null,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "Configurações do jogo atualizadas com sucesso!"
      });
    } catch (error) {
      console.error('Error saving game settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getBonusInfo = () => {
    if (!gameStartDate) return null;

    const startDate = new Date(gameStartDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysDiff,
      status: daysDiff < 0 ? 'future' : daysDiff === 0 ? 'today' : daysDiff === 1 ? 'day2' : daysDiff === 2 ? 'day3' : 'no-bonus'
    };
  };

  const bonusInfo = getBonusInfo();

  const getBonusText = () => {
    if (!bonusInfo) return '';
    
    switch (bonusInfo.status) {
      case 'future':
        return `O jogo ainda não começou (em ${Math.abs(bonusInfo.daysDiff)} dias)`;
      case 'today':
        return 'HOJE: Bônus de 150 XP para conclusões';
      case 'day2':
        return 'Dia 2: Bônus de 100 XP para conclusões';
      case 'day3':
        return 'Dia 3: Bônus de 50 XP para conclusões';
      default:
        return 'Período de bônus expirado (sem bônus adicional)';
    }
  };

  const getBonusColor = () => {
    if (!bonusInfo) return 'text-muted-foreground';
    
    switch (bonusInfo.status) {
      case 'today':
        return 'text-green-500';
      case 'day2':
        return 'text-yellow-500';
      case 'day3':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getExtraMissionInfo = () => {
    if (!extraMissionReleaseDate) return null;

    const releaseDate = new Date(extraMissionReleaseDate);
    const today = new Date();
    
    // Zerar horas para comparação apenas de datas
    releaseDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysDiff,
      isReleased: daysDiff <= 0, // Liberada quando daysDiff é 0 ou negativo
      status: daysDiff > 0 ? 'future' : daysDiff === 0 ? 'today' : 'released'
    };
  };

  const extraMissionInfo = getExtraMissionInfo();

  const getExtraMissionText = () => {
    if (!extraMissionInfo) return 'Nenhuma data configurada';
    
    switch (extraMissionInfo.status) {
      case 'future':
        return `Missão Extra será liberada em ${extraMissionInfo.daysDiff} dias`;
      case 'today':
        return 'HOJE: Missão Extra foi liberada!';
      case 'released':
        return `Missão Extra liberada há ${Math.abs(extraMissionInfo.daysDiff)} dias`;
      default:
        return 'Status desconhecido';
    }
  };

  const getExtraMissionColor = () => {
    if (!extraMissionInfo) return 'text-muted-foreground';
    
    switch (extraMissionInfo.status) {
      case 'today':
        return 'text-green-500';
      case 'released':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Configurações do Jogo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Configurações do Jogo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data de Início */}
        <div className="space-y-3">
          <Label htmlFor="game-start-date" className="text-sm font-medium">
            Data de Início do Jogo
          </Label>
          <Input
            id="game-start-date"
            type="date"
            value={gameStartDate}
            onChange={(e) => setGameStartDate(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Define quando o sistema de bônus por tempo começou a valer
          </p>
        </div>

        {/* Status do Bônus */}
        {bonusInfo && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">Status Atual do Bônus</span>
            </div>
            <p className={`text-sm font-medium ${getBonusColor()}`}>
              {getBonusText()}
            </p>
            
            {/* Bonus Schedule */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium">Sistema de Bônus:</p>
              <div className="grid grid-cols-2 gap-2 pl-2">
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-green-500" />
                  <span>Dia 1: +150 XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span>Dia 2: +100 XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-orange-500" />
                  <span>Dia 3: +50 XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-muted-foreground" />
                  <span>Após: +0 XP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data de Liberação da Missão Extra */}
        <div className="space-y-3">
          <Label htmlFor="extra-mission-date" className="text-sm font-medium">
            Data de Liberação da Missão Extra
          </Label>
          <Input
            id="extra-mission-date"
            type="date"
            value={extraMissionReleaseDate}
            onChange={(e) => setExtraMissionReleaseDate(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Define quando a Missão Extra ficará disponível para usuários avançados (opcional)
          </p>
        </div>

        {/* Status da Missão Extra */}
        {extraMissionReleaseDate && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="font-medium text-sm">Status da Missão Extra</span>
            </div>
            <p className={`text-sm font-medium ${getExtraMissionColor()}`}>
              {getExtraMissionText()}
            </p>
            
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium">Regras de Liberação:</p>
              <div className="pl-2 space-y-1">
                <p>• Disponível apenas para usuários não-Beginner</p>
                <p>• Liberada automaticamente na data configurada</p>
                <p>• Se não configurada, a missão não aparece</p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={saveGameSettings}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};