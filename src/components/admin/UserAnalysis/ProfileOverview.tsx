import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserProgress, UserProfile } from '@/types/admin';
import { Trophy, Clock, Zap, Target } from 'lucide-react';

interface ProfileOverviewProps {
  user: UserProgress;
  userProfile: UserProfile;
  totalScore: number;
  profile: { profile: string; sublevel: string };
  profileColor: string;
}

export const ProfileOverview = ({
  user,
  userProfile,
  totalScore,
  profile,
  profileColor
}: ProfileOverviewProps) => {
  const completedMissions = [
    user.missao_1_completed,
    user.missao_2_completed,
    user.missao_3_completed,
    user.missao_4_completed
  ].filter(Boolean).length;

  const playTimeHours = Math.floor((user.total_play_time || 0) / 3600);
  const playTimeMinutes = Math.floor(((user.total_play_time || 0) % 3600) / 60);

  const getScoreColor = (score: number) => {
    if (score >= 25) return 'hsl(var(--profile-ninja))';
    if (score >= 21) return 'hsl(var(--profile-pro-player))';
    if (score >= 18) return 'hsl(var(--profile-explorer))';
    if (score >= 14) return 'hsl(var(--profile-beginner-plus))';
    return 'hsl(var(--profile-beginner))';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Perfil Digital */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: profileColor }} />
            Perfil Digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div>
              <h3 
                className="text-2xl font-bold"
                style={{ color: profileColor }}
              >
                {profile.profile}
              </h3>
              <p className="text-muted-foreground">{profile.sublevel}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pontuação Total</span>
                <span className="font-medium" style={{ color: getScoreColor(totalScore) }}>
                  {totalScore.toFixed(1)}/30 pts
                </span>
              </div>
              <Progress 
                value={(totalScore / 30) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Missões</span>
              <Badge variant="secondary">
                {completedMissions}/4
              </Badge>
            </div>
            <div className="space-y-1">
              {['Mindset Digital', 'Comportamento', 'Aplicação Prática', 'Competências Técnicas'].map((mission, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${
                    [user.missao_1_completed, user.missao_2_completed, user.missao_3_completed, user.missao_4_completed][idx]
                      ? 'bg-green-500' 
                      : 'bg-muted'
                  }`} />
                  <span className="text-muted-foreground">{mission}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP e Tempo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Experiência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">XP Total</span>
              <span className="font-medium text-primary">
                {user.total_xp || 0} XP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tempo de Jogo</span>
              <span className="font-medium">
                {playTimeHours > 0 ? `${playTimeHours}h ` : ''}{playTimeMinutes}min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Início</span>
              <span className="text-xs">
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar das Missões */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Pontuação por Missão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-8">
            {[
              { name: 'Mindset Digital', score: user.missao_1_completed ? totalScore * 0.33 : 0, max: 10 },
              { name: 'Comportamento', score: user.missao_2_completed ? totalScore * 0.25 : 0, max: 7.5 },
              { name: 'Aplicação Prática', score: user.missao_3_completed ? totalScore * 0.42 : 0, max: 12.5 }
            ].map((mission, idx) => (
              <div key={idx} className="text-center space-y-2">
                <h4 className="font-medium text-sm">{mission.name}</h4>
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke={getScoreColor(mission.score)}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(mission.score / mission.max) * 188.5} 188.5`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {mission.score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  de {mission.max} pts
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};