import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { VaporwaveBackground } from '@/components/VaporwaveBackground';
import { Calendar, Users, Trophy, Clock, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [gameStartDate, setGameStartDate] = useState('');
  const [currentGameDate, setCurrentGameDate] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    completedMissions: 0,
    totalXP: 0,
    averageTime: 0
  });

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      loadGameSettings();
    }
  }, [isAdmin]);

  const loadGameSettings = async () => {
    try {
      // For now, load from localStorage until migrations are complete
      const savedDate = localStorage.getItem('gameStartDate');
      if (savedDate) {
        setCurrentGameDate(savedDate);
      }
    } catch (error) {
      console.error('Error loading game settings:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load users with their progress - simplified query
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load user progress separately
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*');

      // Combine data
      const usersWithProgress = usersData?.map(user => ({
        ...user,
        user_progress: progressData?.filter(p => p.user_id === user.user_id) || []
      })) || [];

      // Calculate simplified stats
      const totalUsers = usersWithProgress.length;
      const completedMissions = usersWithProgress.reduce((acc, user) => {
        const progress = user.user_progress[0];
        if (!progress) return acc;
        
        let completed = 0;
        if (progress.missao_1_completed) completed++;
        if (progress.missao_2_completed) completed++;
        if (progress.missao_3_completed) completed++;
        if (progress.missao_4_completed) completed++;
        
        return acc + completed;
      }, 0);

      const totalXP = usersWithProgress.reduce((acc, user) => {
        const progress = user.user_progress[0];
        return acc + (progress?.total_xp || 0);
      }, 0);

      setUsers(usersWithProgress);
      setAttempts([]); // Will implement after migrations
      setStats({
        totalUsers,
        completedMissions,
        totalXP,
        averageTime: 0 // Will implement after migrations
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const saveGameStartDate = async () => {
    if (!gameStartDate) return;

    try {
      // For now, just save to localStorage until migrations are complete
      localStorage.setItem('gameStartDate', gameStartDate);
      setCurrentGameDate(gameStartDate);
      setGameStartDate('');
      
      toast({
        title: "Data configurada",
        description: "Data de início do jogo foi definida com sucesso",
      });

    } catch (error) {
      console.error('Error setting game start date:', error);
      toast({
        title: "Erro",
        description: "Não foi possível definir a data",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMissionStatus = (user: any) => {
    const progress = user.user_progress?.[0];
    if (!progress) return 0;
    
    let completed = 0;
    if (progress.missao_1_completed) completed++;
    if (progress.missao_2_completed) completed++;
    if (progress.missao_3_completed) completed++;
    if (progress.missao_4_completed) completed++;
    
    return completed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <VaporwaveBackground />
      
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard Administrativo
            </h1>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Voltar ao Jogo
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missões Concluídas</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedMissions}</div>
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">XP Total</CardTitle>
                <Badge variant="secondary" className="text-xs">XP</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalXP}</div>
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageTime}min</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard */}
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="attempts">Tentativas</TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações do Jogo
                  </CardTitle>
                  <CardDescription>
                    Configure a data de início do jogo para controlar os bônus de XP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentGameDate && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm font-medium">Data atual de início:</p>
                      <p className="text-lg font-bold">
                        {new Date(currentGameDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="start-date">Nova Data de Início</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={gameStartDate}
                        onChange={(e) => setGameStartDate(e.target.value)}
                      />
                    </div>
                    <Button onClick={saveGameStartDate} disabled={!gameStartDate}>
                      Definir Data
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Bônus de XP:</strong></p>
                    <p>• No dia do início: +150 XP</p>
                    <p>• 1 dia após o início: +100 XP</p>
                    <p>• 2 dias após o início: +100 XP</p>
                    <p>• Após 3 dias: sem bônus</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Usuários Cadastrados</CardTitle>
                  <CardDescription>
                    Lista de todos os usuários e seu progresso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Missões</TableHead>
                        <TableHead>XP Total</TableHead>
                        <TableHead>Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nome}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.cargo || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getMissionStatus(user)}/4
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.user_progress?.[0]?.total_xp || 0}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attempts">
              <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Tentativas de Missões</CardTitle>
                  <CardDescription>
                    Detalhes de todas as tentativas realizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Missão</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>XP Ganho</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Respostas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium">
                            {attempt.profiles?.nome}
                          </TableCell>
                          <TableCell>
                            <Badge>Missão {attempt.mission_number}</Badge>
                          </TableCell>
                          <TableCell>
                            {formatDuration(attempt.duration_seconds || 0)}
                          </TableCell>
                          <TableCell>{attempt.xp_earned} XP</TableCell>
                          <TableCell>
                            {new Date(attempt.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Show responses in a dialog/modal
                                console.log('Responses:', attempt.responses);
                              }}
                            >
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;