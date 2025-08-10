import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Trophy, TrendingUp, Award, Brain } from 'lucide-react';
import { AdminStats, MissionStats } from '@/types/admin';

interface StatsCardsProps {
  adminStats: AdminStats;
  missionStats: Record<string, MissionStats>;
}

export const StatsCards = ({ adminStats, missionStats }: StatsCardsProps) => {
  return (
    <>
      {/* Resumo Geral */}
      <Card className="mb-6 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="hover-scale">
              <p className="text-2xl font-bold text-primary">{adminStats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total de Colaboradores</p>
            </div>
            <div className="hover-scale">
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--profile-beginner-plus))' }}>
                {adminStats.usersStarted}
              </p>
              <p className="text-sm text-muted-foreground">Usuários que Começaram</p>
            </div>
            <div className="hover-scale">
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--profile-explorer))' }}>
                {adminStats.usersCompleted}
              </p>
              <p className="text-sm text-muted-foreground">Usuários que Finalizaram</p>
            </div>
            <div className="hover-scale">
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--profile-pro-player))' }}>
                {adminStats.completionRate}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Conclusão Geral</p>
            </div>
            <div className="hover-scale">
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--profile-ninja))' }}>
                {adminStats.averageScore}
              </p>
              <p className="text-sm text-muted-foreground">Pontuação Média dos Participantes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Missão */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(missionStats)
          .filter(([key]) => key !== 'general')
          .map(([key, stat], index) => {
            const icons = [Target, Brain, Trophy, Award];
            const Icon = icons[index] || Target;
            const colors = [
              'hsl(var(--profile-beginner))',
              'hsl(var(--profile-explorer))',
              'hsl(var(--profile-pro-player))',
              'hsl(var(--profile-ninja))'
            ];
            
            return (
              <Card key={key} className="hover-scale transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: colors[index] }} />
                    {key === 'mission1' && 'Missão 1 - Quiz Digital'}
                    {key === 'mission2' && 'Missão 2 - Práticas'}
                    {key === 'mission3' && 'Missão 3 - Desafios'}
                    {key === 'mission4' && 'Missão 4 - Ferramentas'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Concluídas:</span>
                      <span className="font-medium" style={{ color: colors[index] }}>
                        {stat.completed}/{stat.total}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${stat.percentage}%`,
                          backgroundColor: colors[index]
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-bold" style={{ color: colors[index] }}>
                        {stat.percentage}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </>
  );
};