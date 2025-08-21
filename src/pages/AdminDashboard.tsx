import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, User, Lock, FileText, Calendar, LogOut, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import ResponseViewer from '@/components/ResponseViewer';
import { StatsCards } from '@/components/admin/StatsCards';
import { ProfileChart } from '@/components/admin/ProfileChart';
import { UserTable } from '@/components/admin/UserTable';
import { ExportDialog } from '@/components/admin/ExportDialog';
import { GameSettings } from '@/components/admin/GameSettings';
import { QuestionManager } from '@/components/admin/QuestionManager';
import { StarRatingsAnalytics } from '@/components/admin/StarRatingsAnalytics';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useFilters } from '@/hooks/useFilters';
import { ResponseData } from '@/types/admin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  
  const [email, setEmail] = useState('cafeead@cafeead.com.br');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    responses1,
    responses2,
    responses3,
    responses4,
    progressData,
    adminUsers,
    isLoading: dashboardLoading,
    stats,
    calculateUserTotalScore,
    getDigitalProfile,
    getProfileColor
  } = useAdminDashboard();

  const {
    filters,
    updateFilter,
    filteredUsers,
    filterOptions
  } = useFilters({
    progressData,
    adminUsers,
    calculateUserTotalScore,
    getDigitalProfile
  });

  // Redirect if not admin
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting admin login with email:', email);
      
      // Use direct Supabase auth for admin login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Erro de autenticação",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      } else {
        console.log('Login successful:', data);
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao painel administrativo!",
        });
        // Reload to update admin status
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Erro ao sair",
          description: error.message || "Erro durante logout",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso",
        });
        // Reload to update auth status
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro",
        description: "Erro durante logout",
        variant: "destructive",
      });
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">{missionName}</h3>
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            {data.length} {data.length === 1 ? 'resposta' : 'respostas'}
          </span>
        </div>
        <Button
          onClick={() => exportToCSV(data, missionName.toLowerCase().replace(/\s+/g, '_'))}
          variant="outline"
          size="sm"
          disabled={data.length === 0}
          className="hover-scale"
        >
          <FileText className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {data.map((response) => (
            <Card key={response.id} className="border-secondary/20 hover:border-primary/30 transition-colors">
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
                  <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Ver respostas detalhadas
                  </summary>
                  <div className="mt-2 animate-accordion-down">
                    <ResponseViewer 
                      respostas={response.respostas}
                      missionType={
                        missionName.includes('Missão 1') ? 'mission1' :
                        missionName.includes('Missão 2') ? 'mission2' :
                        missionName.includes('Missão 3') ? 'mission3' :
                        missionName.includes('Missão 4') ? 'mission4' :
                        undefined
                      }
                    />
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

  if (isAdmin) {
    if (dashboardLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                Dashboard Administrativo do Código F
              </h1>
              <p className="text-muted-foreground">
                Visualize métricas, analise perfis e exporte dados das missões
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hover-scale"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              {progressData && (
                <ExportDialog
                  responses1={responses1}
                  responses2={responses2}
                  responses3={responses3}
                  responses4={responses4}
                  filteredUsers={filteredUsers}
                  progressData={progressData}
                  calculateUserTotalScore={calculateUserTotalScore}
                  getDigitalProfile={getDigitalProfile}
                />
              )}
            </div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="competencias" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Competências
              </TabsTrigger>
              <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-8">
              {/* Stats Cards */}
              <StatsCards 
                adminStats={stats.adminStats}
                missionStats={stats.missionStats}
              />

              {/* Profile Charts */}
              <ProfileChart adminStats={stats.adminStats} />

              {/* Progresso Detalhado dos Usuários */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Progresso Detalhado dos Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  {progressData && (
                    <UserTable
                      filteredUsers={filteredUsers}
                      progressData={progressData}
                      filters={filters}
                      updateFilter={updateFilter}
                      filterOptions={filterOptions}
                      calculateUserTotalScore={calculateUserTotalScore}
                      getDigitalProfile={getDigitalProfile}
                      getProfileColor={getProfileColor}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competências Tab */}
            <TabsContent value="competencias" className="space-y-8">
              <StarRatingsAnalytics 
                responses={responses4 || []} 
                questions={[]} 
                profiles={adminUsers?.data || []} 
              />
            </TabsContent>

            {/* Configurações Tab */}
            <TabsContent value="configuracoes" className="space-y-8">
              {/* Game Settings */}
              <GameSettings className="animate-fade-in" />

              {/* Question Manager */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Gerenciar Questões</CardTitle>
                  <p className="text-muted-foreground">
                    Adicione, edite ou remova questões das missões
                  </p>
                </CardHeader>
                <CardContent>
                  <QuestionManager />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Relatórios Tab */}
            <TabsContent value="relatorios" className="space-y-8">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Respostas das Missões</CardTitle>
                  <p className="text-muted-foreground">
                    Visualize e exporte as respostas de cada missão
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="mission1" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="mission1" className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-beginner))' }}></span>
                        Missão 1
                      </TabsTrigger>
                      <TabsTrigger value="mission2" className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-explorer))' }}></span>
                        Missão 2
                      </TabsTrigger>
                      <TabsTrigger value="mission3" className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-pro-player))' }}></span>
                        Missão 3
                      </TabsTrigger>
                      <TabsTrigger value="mission4" className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-ninja))' }}></span>
                        Missão 4
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="mission1" className="mt-6">
                      {renderResponses(responses1, 'Missão 1 - Quiz Digital')}
                    </TabsContent>
                    <TabsContent value="mission2" className="mt-6">
                      {renderResponses(responses2, 'Missão 2 - Práticas Digitais')}
                    </TabsContent>
                    <TabsContent value="mission3" className="mt-6">
                      {renderResponses(responses3, 'Missão 3 - Desafios e Inovação')}
                    </TabsContent>
                    <TabsContent value="mission4" className="mt-6">
                      {renderResponses(responses4, 'Missão 4 - Ferramentas Digitais')}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              Acesso Administrativo
            </CardTitle>
            <p className="text-muted-foreground">
              Digite suas credenciais para acessar o painel
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-secondary" />
                  <Label htmlFor="admin-email" className="text-secondary text-sm font-medium">
                    Email Administrativo
                  </Label>
                </div>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-secondary/50 rounded-lg"
                  required
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-secondary" />
                  <Label htmlFor="admin-password" className="text-secondary text-sm font-medium">
                    Senha (6 dígitos)
                  </Label>
                </div>
                <Input
                  id="admin-password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Digite sua senha de 6 dígitos"
                  autoComplete="current-password"
                  className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-secondary focus:ring-secondary/50 rounded-lg"
                  required
                />
              </div>

              {/* Login button */}
              <Button 
                type="submit"
                disabled={isLoading || password.length !== 6}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'AUTENTICANDO...' : 'ACESSAR PAINEL'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;