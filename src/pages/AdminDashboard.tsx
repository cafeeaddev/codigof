import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, FileText, Calendar, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResponseData {
  id: string;
  nome: string;
  email: string;
  respostas: any;
  created_at: string;
  updated_at?: string;
}

interface MissionStats {
  total: number;
  completed: number;
  percentage: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [responses1, setResponses1] = useState<ResponseData[]>([]);
  const [responses2, setResponses2] = useState<ResponseData[]>([]);
  const [responses3, setResponses3] = useState<ResponseData[]>([]);
  const [responses4, setResponses4] = useState<ResponseData[]>([]);
  const [stats, setStats] = useState<Record<string, MissionStats>>({});
  const [usersStarted, setUsersStarted] = useState(0);
  const [progressData, setProgressData] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (roleLoading) return;
    
    if (!isAdmin) {
      navigate('/');
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive"
      });
      return;
    }

    loadAllResponses();
  }, [isAdmin, roleLoading, navigate]);

  const loadAllResponses = async () => {
    try {
      setIsLoading(true);
      
      // Carregar respostas de todas as missões e dados gerais
      const [res1, res2, res3, res4, progressData, profilesData, adminUsers] = await Promise.all([
        // Filtrar apenas respostas reais da Missão 1 (excluir as migradas)
        supabase.from('respostas').select('*')
          .filter('respostas', 'not.like', '*"missao"*')  // Excluir respostas com campo "missao"
          .order('id', { ascending: false }),
        supabase.from('respostas_missao2').select('*').order('created_at', { ascending: false }),
        supabase.from('respostas_missao3').select('*').order('created_at', { ascending: false }),
        supabase.from('respostas_missao4').select('*').order('created_at', { ascending: false }),
        supabase.from('user_progress').select('*'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        // Buscar IDs dos admins
        supabase.from('user_roles').select('user_id').eq('role', 'admin')
      ]);

      if (res1.error) console.error('Error loading mission 1:', res1.error);
      if (res2.error) console.error('Error loading mission 2:', res2.error);
      if (res3.error) console.error('Error loading mission 3:', res3.error);
      if (res4.error) console.error('Error loading mission 4:', res4.error);
      if (progressData.error) console.error('Error loading progress:', progressData.error);

      // Transform the data to match the expected interface
      setResponses1((res1.data || []).map(item => ({
        id: item.id.toString(),
        nome: item.nome,
        email: item.email || '',
        respostas: typeof item.respostas === 'string' ? JSON.parse(item.respostas) : item.respostas,
        created_at: new Date().toISOString() // respostas table doesn't have created_at
      })));
      setResponses2((res2.data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
        respostas: item.respostas,
        created_at: item.created_at
      })));
      setResponses3((res3.data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
        respostas: item.respostas,
        created_at: item.created_at
      })));
      setResponses4((res4.data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
        respostas: item.respostas,
        created_at: item.created_at
      })));

      // Calcular estatísticas baseado na tabela user_progress (excluindo admins)
      const progress = progressData.data || [];
      const adminUserIds = new Set((adminUsers.data || []).map(admin => admin.user_id));
      
      // Filtrar progresso excluindo admins
      const nonAdminProgress = progress.filter(p => !adminUserIds.has(p.user_id));
      
      const totalProfiles = profilesData.count || 0; // Total de usuários cadastrados
      const totalNonAdminProfiles = totalProfiles - adminUserIds.size; // Excluir admins do total
      const usersStarted = nonAdminProgress.length; // Usuários não-admin que começaram o jogo
      
      console.log('Progress data loaded:', progress);
      console.log('Admin users:', adminUserIds);
      console.log('Total profiles:', totalProfiles, 'Non-admin profiles:', totalNonAdminProfiles, 'Users started:', usersStarted);
      
      const mission1Completed = nonAdminProgress.filter(p => p.missao_1_completed === true).length;
      const mission2Completed = nonAdminProgress.filter(p => p.missao_2_completed === true).length;
      const mission3Completed = nonAdminProgress.filter(p => p.missao_3_completed === true).length;
      const mission4Completed = nonAdminProgress.filter(p => p.missao_4_completed === true).length;
      
      console.log('Mission completion counts (excluding admins):', {
        totalNonAdminProfiles,
        usersStarted,
        mission1Completed,
        mission2Completed,
        mission3Completed,
        mission4Completed
      });
      
      setStats({
        mission1: {
          total: totalNonAdminProfiles,
          completed: mission1Completed,
          percentage: totalNonAdminProfiles > 0 ? Math.round((mission1Completed / totalNonAdminProfiles) * 100) : 0
        },
        mission2: {
          total: totalNonAdminProfiles,
          completed: mission2Completed,
          percentage: totalNonAdminProfiles > 0 ? Math.round((mission2Completed / totalNonAdminProfiles) * 100) : 0
        },
        mission3: {
          total: totalNonAdminProfiles,
          completed: mission3Completed,
          percentage: totalNonAdminProfiles > 0 ? Math.round((mission3Completed / totalNonAdminProfiles) * 100) : 0
        },
        mission4: {
          total: totalNonAdminProfiles,
          completed: mission4Completed,
          percentage: totalNonAdminProfiles > 0 ? Math.round((mission4Completed / totalNonAdminProfiles) * 100) : 0
        }
      });
      
      setUsersStarted(usersStarted);
      setProgressData(progressData);
      setAdminUsers(adminUsers);

    } catch (error) {
      console.error('Error loading responses:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar as respostas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = (data: ResponseData[], missionName: string) => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há dados para exportar.",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Nome', 'Email', 'Data', 'Respostas'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.nome}"`,
        `"${item.email}"`,
        `"${new Date(item.created_at).toLocaleString('pt-BR')}"`,
        `"${JSON.stringify(item.respostas).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${missionName}_respostas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const renderResponses = (data: ResponseData[], missionName: string) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">{missionName}</h3>
          <Badge variant="secondary">
            {data.length} {data.length === 1 ? 'resposta' : 'respostas'}
          </Badge>
        </div>
        <Button
          onClick={() => exportToCSV(data, missionName.toLowerCase().replace(/\s+/g, '_'))}
          variant="outline"
          size="sm"
          disabled={data.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {data.map((response) => (
            <Card key={response.id} className="border-secondary/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{response.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{response.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(response.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80">
                    Ver respostas
                  </summary>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap overflow-auto">
                      {JSON.stringify(response.respostas, null, 2)}
                    </pre>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma resposta encontrada para esta missão.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Visualize e exporte as respostas das missões</p>
          </div>
        </div>

        {/* Resumo Geral */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Resumo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.mission1?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{usersStarted}</p>
                <p className="text-sm text-muted-foreground">Usuários que Começaram</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(stats).reduce((acc, stat) => acc + stat.completed, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Missões Concluídas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{responses1.length + responses2.length + responses3.length + responses4.length}</p>
                <p className="text-sm text-muted-foreground">Total de Respostas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.mission1?.total > 0 ? Math.round((Object.values(stats).reduce((acc, stat) => acc + stat.completed, 0) / (stats.mission1.total * 4)) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas por Missão */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats).map(([key, stat]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {key === 'mission1' && 'Missão 1'}
                  {key === 'mission2' && 'Missão 2'}
                  {key === 'mission3' && 'Missão 3'}
                  {key === 'mission4' && 'Missão 4'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{stat.completed}</span>
                  <span className="text-sm text-muted-foreground">concluíram</span>
                </div>
                <div className="mt-2 w-full bg-secondary/20 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.completed} de {stat.total} usuários ({stat.percentage}%)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção: Usuários que Iniciaram o Sistema */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários que Iniciaram o Sistema
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Usuários que começaram a usar o sistema e status de suas missões
            </p>
          </CardHeader>
          <CardContent>
            {/* Busca */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {progressData.data?.filter(progress => {
                  const adminUserIds = new Set((adminUsers.data || []).map(admin => admin.user_id));
                  return !adminUserIds.has(progress.user_id);
                }).length || 0} usuários encontrados
              </Badge>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data de Início</TableHead>
                    <TableHead>XP Total</TableHead>
                    <TableHead>Tempo de Jogo</TableHead>
                    <TableHead>Missão 1</TableHead>
                    <TableHead>Missão 2</TableHead>
                    <TableHead>Missão 3</TableHead>
                    <TableHead>Missão 4</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const allUsers = progressData.data
                      ?.filter(progress => {
                        const adminUserIds = new Set((adminUsers.data || []).map(admin => admin.user_id));
                        return !adminUserIds.has(progress.user_id);
                      }) || [];
                    
                    // Filtrar por busca
                    const filteredUsers = allUsers.filter(progress => {
                      const userName = progress.user_id === '600d753e-641a-4b06-a430-bbc50cd654a2' ? 'Nawana De Oliveira Marques Dos Santos' :
                                     progress.user_id === '90b52ea5-a137-45b2-90b1-6c895581c99f' ? 'Raniel De Oliveira Souza' : 
                                     'Usuário';
                      return userName.toLowerCase().includes(searchTerm.toLowerCase());
                    });

                    // Paginação
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

                    return (
                      <>
                        {paginatedUsers.map((progress) => {
                          const userName = progress.user_id === '600d753e-641a-4b06-a430-bbc50cd654a2' ? 'Nawana De Oliveira Marques Dos Santos' :
                                         progress.user_id === '90b52ea5-a137-45b2-90b1-6c895581c99f' ? 'Raniel De Oliveira Souza' : 
                                         'Usuário';
                          
                          return (
                            <TableRow key={progress.user_id}>
                              <TableCell className="font-medium">{userName}</TableCell>
                              <TableCell>{new Date(progress.created_at).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell className="text-primary font-medium">{progress.total_xp || 0} XP</TableCell>
                              <TableCell>{Math.floor((progress.total_play_time || 0) / 60)}min</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {progress.missao_1_completed ? '✅' : '⏳'}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {progress.missao_1_completed ? 'Concluída' : `${progress.missao_1_current_question}/4`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {progress.missao_2_completed ? '✅' : '⏳'}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {progress.missao_2_completed ? 'Concluída' : `${progress.missao_2_current_question}/5`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {progress.missao_3_completed ? '✅' : '⏳'}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {progress.missao_3_completed ? 'Concluída' : `${progress.missao_3_current_question}/3`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {progress.missao_4_completed ? '✅' : '⏳'}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {progress.missao_4_completed ? 'Concluída' : `${progress.missao_4_current_question}/3`}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {paginatedUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Nenhum usuário encontrado.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })()}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {(() => {
              const allUsers = progressData.data
                ?.filter(progress => {
                  const adminUserIds = new Set((adminUsers.data || []).map(admin => admin.user_id));
                  return !adminUserIds.has(progress.user_id);
                }) || [];
              
              const filteredUsers = allUsers.filter(progress => {
                const userName = progress.user_id === '600d753e-641a-4b06-a430-bbc50cd654a2' ? 'Nawana De Oliveira Marques Dos Santos' :
                               progress.user_id === '90b52ea5-a137-45b2-90b1-6c895581c99f' ? 'Raniel De Oliveira Souza' : 
                               'Usuário';
                return userName.toLowerCase().includes(searchTerm.toLowerCase());
              });

              const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

              return totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({filteredUsers.length} usuários)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Tabs com Respostas */}
        <Tabs defaultValue="mission1" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mission1">Missão 1</TabsTrigger>
            <TabsTrigger value="mission2">Missão 2</TabsTrigger>
            <TabsTrigger value="mission3">Missão 3</TabsTrigger>
            <TabsTrigger value="mission4">Missão 4</TabsTrigger>
          </TabsList>

          <TabsContent value="mission1">
            <Card>
              <CardContent className="p-6">
                {renderResponses(responses1 || [], "Missão 1 - Como você encara o digital?")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mission2">
            <Card>
              <CardContent className="p-6">
                {renderResponses(responses2 || [], "Missão 2 - O digital no seu dia a dia")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mission3">
            <Card>
              <CardContent className="p-6">
                {renderResponses(responses3 || [], "Missão 3 - Quando o desafio é maior")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mission4">
            <Card>
              <CardContent className="p-6">
                {renderResponses(responses4 || [], "Missão 4 - Seu Radar de Ferramentas")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;