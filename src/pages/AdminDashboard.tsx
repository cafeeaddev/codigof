import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, User, Lock, Calendar, LogOut, Award, GraduationCap } from 'lucide-react';
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
import { UserAnalysisDialog } from '@/components/admin/UserAnalysisDialog';
import { TimeDataManager } from '@/components/admin/TimeDataManager';
import { XPFixUtility } from '@/components/admin/XPFixUtility';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useFilters } from '@/hooks/useFilters';
import { ResponseData, UserProgress, UserProfile } from '@/types/admin';
import { QuizCard } from '@/components/quizzes/admin/QuizCard';
import { Quiz1Control } from '@/components/quizzes/admin/Quiz1Control';
import { Quiz2Control } from '@/components/quizzes/admin/Quiz2Control';
import { Quiz3Control } from '@/components/quizzes/admin/Quiz3Control';
import { useQuiz1 } from '@/components/quizzes/quiz1/useQuiz1';
import { useQuiz2 } from '@/components/quizzes/quiz2/useQuiz2';
import { useQuiz3 } from '@/components/quizzes/quiz3/useQuiz3';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { signOut } = useAuth();
  
  const [email, setEmail] = useState('cafeead@cafeead.com.br');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<'quiz1' | 'quiz2' | 'quiz3' | null>(null);

  // Quiz hooks
  const quiz1 = useQuiz1();
  const quiz2 = useQuiz2();
  const quiz3 = useQuiz3();

  const {
    responses1,
    responses2,
    responses3,
    responses4,
    responses5,
    progressData,
    adminUsers,
    allProfiles,
    totalProfiles,
    isLoading: dashboardLoading,
    stats,
    calculateUserTotalScore,
    getDigitalProfile,
    getProfileColor,
    questions,
    fastTrackData,
    fastTrackResponses,
    manualXPAdjustments
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
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro",
        description: "Erro durante logout",
        variant: "destructive",
      });
    }
  };

  const handleUserAnalysis = (user: UserProgress, userProfile: UserProfile | undefined) => {
    if (userProfile) {
      setSelectedUser(user);
      setSelectedUserProfile(userProfile);
      setIsAnalysisDialogOpen(true);
    }
  };

  const handleResetQuiz1 = async () => {
    try {
      // Delete all participants
      await supabase.from('codigo_f_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Delete all answers
      await supabase.from('codigo_f_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Reset session state
      const { data: existingSession } = await supabase
        .from('codigo_f_session_state')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        await supabase
          .from('codigo_f_session_state')
          .update({
            current_phase: 'waiting',
            current_question_id: null,
            question_started_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      }

      toast({
        title: "Quiz resetado",
        description: "O Quiz 1 (Mito ou Verdade) foi resetado com sucesso!",
      });

      // Refresh quiz data
      window.location.reload();
    } catch (error) {
      console.error('Error resetting quiz 1:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar o quiz",
        variant: "destructive",
      });
    }
  };

  const handleResetQuiz2 = async () => {
    try {
      // Delete all submissions
      await supabase.from('quiz2_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      toast({
        title: "Quiz resetado",
        description: "O Quiz 2 (Nuvem de Tags) foi resetado com sucesso!",
      });

      // Refresh quiz data
      window.location.reload();
    } catch (error) {
      console.error('Error resetting quiz 2:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar o quiz",
        variant: "destructive",
      });
    }
  };

  const handleResetQuiz3 = async () => {
    try {
      // Delete all participants
      await supabase.from('quiz3_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Delete all answers
      await supabase.from('quiz3_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Reset session state
      const { data: existingSession } = await supabase
        .from('quiz3_session_state')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        await supabase
          .from('quiz3_session_state')
          .update({
            current_phase: 'waiting',
            current_question_id: null,
            question_started_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      }

      toast({
        title: "Quiz resetado",
        description: "O Quiz 3 (Soluções Digitais) foi resetado com sucesso!",
      });

      // Refresh quiz data
      window.location.reload();
    } catch (error) {
      console.error('Error resetting quiz 3:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar o quiz",
        variant: "destructive",
      });
    }
  };


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
                  responses5={responses5}
                  filteredUsers={filteredUsers}
                  progressData={progressData}
                  fastTrackResponses={fastTrackResponses}
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
              <TabsTrigger value="treinamento" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Treinamento
              </TabsTrigger>
              <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Configurações
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
                       allResponses={{
                         missao1: responses1,
                         missao2: responses2,
                         missao3: responses3,
                         missao4: responses4
                       }}
                        questions={questions || []}
                        fastTrackData={fastTrackData}
                        fastTrackResponses={fastTrackResponses}
                        manualXPAdjustments={manualXPAdjustments}
                        onUserAnalysis={handleUserAnalysis}
                       onDataRefresh={() => {
                         // Força recarregamento dos dados
                         window.location.reload();
                       }}
                     />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competências Tab */}
            <TabsContent value="competencias" className="space-y-8">
              <StarRatingsAnalytics 
                responses={responses4 || []} 
                questions={questions || []} 
                profiles={allProfiles || []} 
              />
            </TabsContent>

            {/* Configurações Tab */}
            <TabsContent value="configuracoes" className="space-y-8">
              {/* Game Settings */}
              <GameSettings className="animate-fade-in" />

              {/* XP Fix Utility */}
              <XPFixUtility />

              {/* Time Data Manager */}
              <TimeDataManager />

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

            {/* Treinamento Tab */}
            <TabsContent value="treinamento" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quiz 1 Card */}
                <QuizCard
                  title="Mito ou Verdade"
                  description="Transformação Digital em 30 segundos"
                  icon="⚡"
                  status={quiz1.sessionState?.current_phase === 'question' ? 'active' : 'ready'}
                  participantCount={quiz1.participantCount}
                  questionCount={quiz1.questions.length}
                  participantLink="/quiz/mito-verdade"
                  onManage={() => setActiveQuiz('quiz1')}
                  onReset={handleResetQuiz1}
                  isActive={activeQuiz === 'quiz1'}
                />

                {/* Quiz 2 Card */}
                <QuizCard
                  title="Nuvem de Tags"
                  description="Desafios reais do cotidiano"
                  icon="☁️"
                  status="collecting"
                  submissionCount={quiz2.submissions.length}
                  participantLink="/quiz/nuvem-tags"
                  onManage={() => setActiveQuiz('quiz2')}
                  onReset={handleResetQuiz2}
                  isActive={activeQuiz === 'quiz2'}
                />

                {/* Quiz 3 Card */}
                <QuizCard
                  title="Soluções Digitais"
                  description="Identifique a solução certa"
                  icon="🎯"
                  status={quiz3.sessionState?.current_phase === 'question' ? 'active' : 'ready'}
                  participantCount={quiz3.participantCount}
                  questionCount={quiz3.questions.length}
                  participantLink="/quiz/solucoes-digitais"
                  onManage={() => setActiveQuiz('quiz3')}
                  onReset={handleResetQuiz3}
                  isActive={activeQuiz === 'quiz3'}
                />
              </div>

              {/* Quiz Controls */}
              {activeQuiz === 'quiz1' && <Quiz1Control />}
              {activeQuiz === 'quiz2' && <Quiz2Control />}
              {activeQuiz === 'quiz3' && <Quiz3Control />}

              {!activeQuiz && (
                <Card className="p-8 text-center">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    Selecione um quiz para gerenciar
                  </h3>
                  <p className="text-muted-foreground">
                    Clique em "Gerenciar" em qualquer quiz acima para ver os controles e estatísticas
                  </p>
                </Card>
              )}
            </TabsContent>

          </Tabs>

          {/* Modal de Análise Individual */}
          <UserAnalysisDialog
            user={selectedUser}
            userProfile={selectedUserProfile}
            isOpen={isAnalysisDialogOpen}
            onClose={() => {
              setIsAnalysisDialogOpen(false);
              setSelectedUser(null);
              setSelectedUserProfile(null);
            }}
            calculateUserTotalScore={calculateUserTotalScore}
            getDigitalProfile={getDigitalProfile}
            getProfileColor={getProfileColor}
            allResponses={{
              missao1: responses1,
              missao2: responses2,
              missao3: responses3,
              missao4: responses4
            }}
            questions={questions || []}
          />
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