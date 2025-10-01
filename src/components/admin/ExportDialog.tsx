import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, FileText, Users } from 'lucide-react';
import { ResponseData, UserProgress, UserProfile } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

interface ExportDialogProps {
  responses1: ResponseData[];
  responses2: ResponseData[];
  responses3: ResponseData[];
  responses4: ResponseData[];
  responses5: ResponseData[];
  filteredUsers: UserProgress[];
  progressData: {
    userProfiles: Map<string, UserProfile>;
  };
  fastTrackResponses: Map<string, { interestLevel: string; timeCommitment: string; mainObjective: string; otherObjective?: string }>;
  calculateUserTotalScore: (userId: string) => number;
  getDigitalProfile: (score: number) => { profile: string; sublevel: string };
}

export const ExportDialog = ({
  responses1,
  responses2,
  responses3,
  responses4,
  responses5,
  filteredUsers,
  progressData,
  fastTrackResponses,
  calculateUserTotalScore,
  getDigitalProfile
}: ExportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há dados para exportar.",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header.toLowerCase().replace(/\s+/g, '_')] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportação concluída",
      description: `Arquivo ${filename}.csv baixado com sucesso.`,
    });
  };

  const exportUserProgress = () => {
    const headers = [
      'Nome', 'Email', 'Cargo', 'Área', 'Data de Início', 
      'Pontuação Total', 'Perfil Digital', 'Subnível', 'XP Total', 
      'Tempo de Jogo (min)', 'Missão 1', 'Missão 2', 'Missão 3', 'Missão 4'
    ];

    const data = filteredUsers.map(progress => {
      const userProfile = progressData.userProfiles?.get(progress.user_id);
      const totalScore = calculateUserTotalScore(progress.user_id);
      const profile = getDigitalProfile(totalScore);
      
      return {
        nome: userProfile?.nome || 'Usuário',
        email: userProfile?.email || '',
        cargo: userProfile?.cargo?.replace(/^\d+-/, '').trim() || '',
        área: userProfile?.area || '',
        data_de_início: new Date(progress.created_at).toLocaleDateString('pt-BR'),
        pontuação_total: totalScore.toFixed(2),
        perfil_digital: profile.profile,
        subnível: profile.sublevel,
        xp_total: progress.total_xp || 0,
        'tempo_de_jogo_(min)': Math.floor((progress.total_play_time || 0) / 60),
        missão_1: progress.missao_1_completed ? 'Concluída' : `${progress.missao_1_current_question}/4`,
        missão_2: progress.missao_2_completed ? 'Concluída' : `${progress.missao_2_current_question}/3`,
        missão_3: progress.missao_3_completed ? 'Concluída' : `${progress.missao_3_current_question}/4`,
        missão_4: progress.missao_4_completed ? 'Concluída' : `${progress.missao_4_current_question}/5`
      };
    });

    exportToCSV(data, 'progresso_usuarios', headers);
  };

  const exportMissionResponses = (responses: ResponseData[], missionName: string) => {
    const headers = ['Nome', 'Email', 'Data', 'Respostas'];
    
    const data = responses.map(response => ({
      nome: response.nome,
      email: response.email,
      data: new Date(response.created_at).toLocaleString('pt-BR'),
      respostas: JSON.stringify(response.respostas).replace(/"/g, '""')
    }));

    exportToCSV(data, missionName.toLowerCase().replace(/\s+/g, '_'), headers);
  };

  const exportFastTrackResponses = () => {
    const headers = ['Nome', 'Email', 'Nível de Interesse', 'Tempo Disponível', 'Objetivo Principal', 'Outro Objetivo'];
    
    const data: any[] = [];
    fastTrackResponses.forEach((details, userId) => {
      const userProfile = progressData.userProfiles?.get(userId);
      if (userProfile) {
        data.push({
          nome: userProfile.nome,
          email: userProfile.email,
          'nível_de_interesse': details.interestLevel,
          'tempo_disponível': details.timeCommitment,
          'objetivo_principal': details.mainObjective,
          'outro_objetivo': details.otherObjective || ''
        });
      }
    });

    exportToCSV(data, 'missao_5_fast_track', headers);
  };

  const exportSummaryReport = () => {
    const profileCounts = { 'Beginner': 0, 'Beginner +': 0, 'Explorer': 0, 'Pro-Player': 0, 'Ninja': 0 };
    
    filteredUsers.forEach(progress => {
      const totalScore = calculateUserTotalScore(progress.user_id);
      const profile = getDigitalProfile(totalScore);
      profileCounts[profile.profile as keyof typeof profileCounts]++;
    });

    const headers = ['Métrica', 'Valor'];
    const data = [
      { métrica: 'Total de Usuários', valor: filteredUsers.length },
      { métrica: 'Usuários que Completaram Missão 1', valor: filteredUsers.filter(p => p.missao_1_completed).length },
      { métrica: 'Usuários que Completaram Missão 2', valor: filteredUsers.filter(p => p.missao_2_completed).length },
      { métrica: 'Usuários que Completaram Missão 3', valor: filteredUsers.filter(p => p.missao_3_completed).length },
      { métrica: 'Usuários que Completaram Missão 4', valor: filteredUsers.filter(p => p.missao_4_completed).length },
      { métrica: 'Usuários que Completaram o Jogo', valor: filteredUsers.filter(p => p.missao_1_completed && p.missao_2_completed && p.missao_3_completed && p.missao_4_completed).length },
      { métrica: 'Perfil Beginner', valor: profileCounts.Beginner },
      { métrica: 'Perfil Beginner +', valor: profileCounts['Beginner +'] },
      { métrica: 'Perfil Explorer', valor: profileCounts.Explorer },
      { métrica: 'Perfil Pro-Player', valor: profileCounts['Pro-Player'] },
      { métrica: 'Perfil Ninja', valor: profileCounts.Ninja }
    ];

    exportToCSV(data, 'relatorio_resumo', headers);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Exportar Dados do Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Progresso dos Usuários */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Progresso dos Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Exporta dados completos de progresso de todos os usuários filtrados.
              </p>
              <Badge variant="secondary">
                {filteredUsers.length} usuários
              </Badge>
              <Button 
                onClick={exportUserProgress} 
                className="w-full"
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Progresso
              </Button>
            </CardContent>
          </Card>

          {/* Relatório Resumo */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Relatório Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Estatísticas gerais e distribuição de perfis digitais.
              </p>
              <Badge variant="secondary">
                Métricas gerais
              </Badge>
              <Button 
                onClick={exportSummaryReport} 
                className="w-full"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Exportar Resumo
              </Button>
            </CardContent>
          </Card>

          {/* Respostas por Missão */}
          {[
            { responses: responses1, name: 'Missão 1 - Quiz Digital', count: responses1.length },
            { responses: responses2, name: 'Missão 2 - Práticas Digitais', count: responses2.length },
            { responses: responses3, name: 'Missão 3 - Desafios', count: responses3.length },
            { responses: responses4, name: 'Missão 4 - Ferramentas', count: responses4.length }
          ].map((mission, index) => (
            <Card key={index} className="hover-scale">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  {mission.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Respostas detalhadas dos usuários nesta missão.
                </p>
                <Badge variant="secondary">
                  {mission.count} respostas
                </Badge>
                <Button 
                  onClick={() => exportMissionResponses(mission.responses, mission.name)} 
                  className="w-full"
                  variant="outline"
                  disabled={mission.count === 0}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar Respostas
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Missão 5 - Fast Track (tratamento especial) */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Missão 5 - Fast Track
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Respostas do formulário de inscrição Fast Track.
              </p>
              <Badge variant="secondary">
                {fastTrackResponses.size} respostas
              </Badge>
              <Button 
                onClick={exportFastTrackResponses} 
                className="w-full"
                variant="outline"
                disabled={fastTrackResponses.size === 0}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Respostas
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};