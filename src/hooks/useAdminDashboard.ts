import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProgress, UserProfile, ResponseData, MissionStats, AdminStats } from '@/types/admin';

export const useAdminDashboard = () => {
  const [responses1, setResponses1] = useState<ResponseData[]>([]);
  const [responses2, setResponses2] = useState<ResponseData[]>([]);
  const [responses3, setResponses3] = useState<ResponseData[]>([]);
  const [responses4, setResponses4] = useState<ResponseData[]>([]);
  const [progressData, setProgressData] = useState<{ data: UserProgress[], userProfiles: Map<string, UserProfile>, userProfilesByEmail: Map<string, UserProfile> } | null>(null);
  const [adminUsers, setAdminUsers] = useState<{ data: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para calcular pontuação total de um usuário (apenas missões 1, 2 e 3)
  const calculateUserTotalScore = useMemo(() => {
    return (userId: string) => {
      if (!progressData) return 0;
      
      let totalScore = 0;

      // Pontuação da Missão 1 (4 perguntas, máximo 5 pontos cada = 20 pontos)
      const mission1Response = responses1.find(r => r.email === progressData.userProfiles?.get(userId)?.email);
      if (mission1Response && Array.isArray(mission1Response.respostas)) {
        totalScore += mission1Response.respostas.reduce((sum: number, resp: any) => sum + (resp.pontuacao || 0), 0);
      }

      // Pontuação da Missão 2 (3 perguntas, máximo 5 pontos cada = 15 pontos)
      const mission2Response = responses2.find(r => r.email === progressData.userProfiles?.get(userId)?.email);
      if (mission2Response) {
        if (mission2Response.respostas?.data && Array.isArray(mission2Response.respostas.data)) {
          totalScore += mission2Response.respostas.data.reduce((sum: number, resp: any) => sum + (resp.pontuacao || 0), 0);
        }
      }

      // Pontuação da Missão 3 (5 perguntas, máximo 5 pontos cada = 25 pontos)
      const mission3Response = responses3.find(r => r.email === progressData.userProfiles?.get(userId)?.email);
      if (mission3Response && Array.isArray(mission3Response.respostas)) {
        totalScore += mission3Response.respostas.reduce((sum: number, resp: any) => sum + (resp.pontuacao || 0), 0);
      }

      return parseFloat(totalScore.toFixed(2));
    };
  }, [progressData, responses1, responses2, responses3]);

  // Função para classificar o perfil digital baseado na pontuação das missões 1, 2 e 3
  const getDigitalProfile = (totalScore: number) => {
    if (totalScore >= 57) return { profile: 'Ninja' as const, sublevel: 'Ninja Raiz™ 😎' };
    if (totalScore >= 52) return { profile: 'Ninja' as const, sublevel: 'Consolidação' };
    if (totalScore >= 42) return { profile: 'Pro-Player' as const, sublevel: 'Transição → Ninja' };
    if (totalScore >= 37) return { profile: 'Pro-Player' as const, sublevel: 'Início/Consolidado' };
    if (totalScore >= 31) return { profile: 'Explorer' as const, sublevel: 'Transição → Pro-Player' };
    if (totalScore >= 25) return { profile: 'Explorer' as const, sublevel: 'Início' };
    if (totalScore >= 18) return { profile: 'Beginner +' as const, sublevel: 'Transição → Explorer' };
    return { profile: 'Beginner' as const, sublevel: 'Início' };
  };

  // Função para obter a cor do perfil digital
  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'Beginner': return 'hsl(var(--profile-beginner))';
      case 'Beginner +': return 'hsl(var(--profile-beginner-plus))';
      case 'Explorer': return 'hsl(var(--profile-explorer))';
      case 'Pro-Player': return 'hsl(var(--profile-pro-player))';
      case 'Ninja': return 'hsl(var(--profile-ninja))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  // Estatísticas computadas
  const stats = useMemo((): { missionStats: Record<string, MissionStats>, adminStats: AdminStats } => {
    if (!progressData || !adminUsers) {
      return {
        missionStats: {},
        adminStats: {
          totalUsers: 0,
          usersStarted: 0,
          usersCompleted: 0,
          completionRate: 0,
          averageScore: 0,
          mostCommonProfile: 'N/A',
          profileDistribution: {}
        }
      };
    }

    const adminUserIds = new Set(adminUsers.data.map(admin => admin.user_id));
    const nonAdminUsers = progressData.data.filter(p => !adminUserIds.has(p.user_id));
    
    const mission1Completed = nonAdminUsers.filter(p => p.missao_1_completed === true).length;
    const mission2Completed = nonAdminUsers.filter(p => p.missao_2_completed === true).length;
    const mission3Completed = nonAdminUsers.filter(p => p.missao_3_completed === true).length;
    const mission4Completed = nonAdminUsers.filter(p => p.missao_4_completed === true).length;
    
    const gameCompleted = nonAdminUsers.filter(p => 
      p.missao_1_completed && p.missao_2_completed && p.missao_3_completed && p.missao_4_completed
    ).length;

    // Calcular distribuição de perfis
    const profileCounts = { 'Beginner': 0, 'Beginner +': 0, 'Explorer': 0, 'Pro-Player': 0, 'Ninja': 0 };
    const totalScores = nonAdminUsers.map(progress => {
      const score = calculateUserTotalScore(progress.user_id);
      const profile = getDigitalProfile(score);
      profileCounts[profile.profile as keyof typeof profileCounts]++;
      return score;
    });

    const averageScore = totalScores.length > 0 ? totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length : 0;
    const mostCommonProfile = Object.entries(profileCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      missionStats: {
        mission1: {
          total: nonAdminUsers.length,
          completed: mission1Completed,
          percentage: nonAdminUsers.length > 0 ? Math.round((mission1Completed / nonAdminUsers.length) * 100) : 0
        },
        mission2: {
          total: nonAdminUsers.length,
          completed: mission2Completed,
          percentage: nonAdminUsers.length > 0 ? Math.round((mission2Completed / nonAdminUsers.length) * 100) : 0
        },
        mission3: {
          total: nonAdminUsers.length,
          completed: mission3Completed,
          percentage: nonAdminUsers.length > 0 ? Math.round((mission3Completed / nonAdminUsers.length) * 100) : 0
        },
        mission4: {
          total: nonAdminUsers.length,
          completed: mission4Completed,
          percentage: nonAdminUsers.length > 0 ? Math.round((mission4Completed / nonAdminUsers.length) * 100) : 0
        },
        general: {
          total: nonAdminUsers.length,
          completed: gameCompleted,
          percentage: nonAdminUsers.length > 0 ? parseFloat(((gameCompleted / nonAdminUsers.length) * 100).toFixed(2)) : 0
        }
      },
      adminStats: {
        totalUsers: nonAdminUsers.length,
        usersStarted: nonAdminUsers.length,
        usersCompleted: gameCompleted,
        completionRate: nonAdminUsers.length > 0 ? parseFloat(((gameCompleted / nonAdminUsers.length) * 100).toFixed(2)) : 0,
        averageScore: parseFloat(averageScore.toFixed(2)),
        mostCommonProfile,
        profileDistribution: profileCounts
      }
    };
  }, [progressData, adminUsers, calculateUserTotalScore]);

  const loadAllResponses = async () => {
    try {
      setIsLoading(true);
      
      const [res1, res2, res3, res4, progressData, profilesData, adminUsers, allProfiles] = await Promise.all([
        supabase.from('respostas').select('*').order('id', { ascending: false }),
        supabase.from('respostas_missao2').select('*').order('created_at', { ascending: false }),
        supabase.from('respostas_missao3').select('*').order('created_at', { ascending: false }),
        supabase.from('respostas_missao4').select('*').order('created_at', { ascending: false }),
        supabase.from('user_progress').select('*'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('user_id').eq('role', 'admin'),
        supabase.from('profiles').select('user_id, nome, email, cargo, area')
      ]);

      if (res1.error) console.error('Error loading mission 1:', res1.error);
      if (res2.error) console.error('Error loading mission 2:', res2.error);
      if (res3.error) console.error('Error loading mission 3:', res3.error);
      if (res4.error) console.error('Error loading mission 4:', res4.error);
      if (progressData.error) console.error('Error loading progress:', progressData.error);

      const userProfilesByEmail = new Map((allProfiles.data || []).map(profile => [
        profile.email, 
        { nome: profile.nome || 'Usuário', email: profile.email || '', cargo: profile.cargo, area: profile.area }
      ]));

      const userProfiles = new Map((allProfiles.data || []).map(profile => [
        profile.user_id, 
        { nome: profile.nome || 'Usuário', email: profile.email || '', cargo: profile.cargo, area: profile.area }
      ]));

      // Processar respostas
      setResponses1((res1.data || [])
        .filter(item => {
          if (typeof item.respostas === 'string') {
            try {
              const parsed = JSON.parse(item.respostas);
              return !parsed.missao || parsed.missao === 1;
            } catch {
              return true;
            }
          }
          if (item.respostas && typeof item.respostas === 'object') {
            const respostas = item.respostas as any;
            return !respostas.missao || respostas.missao === 1;
          }
          return true;
        })
        .map(item => {
          const userProfile = userProfilesByEmail.get(item.email);
          return {
            id: item.id.toString(),
            nome: userProfile?.nome || item.nome,
            email: item.email || '',
            respostas: typeof item.respostas === 'string' ? JSON.parse(item.respostas) : item.respostas,
            created_at: new Date().toISOString()
          };
        }));
        
      setResponses2((res2.data || [])
        .filter(item => {
          if (item.respostas && typeof item.respostas === 'object') {
            const respostas = item.respostas as any;
            return !respostas.missao || respostas.missao === 2;
          }
          return true;
        })
        .map(item => {
          const userProfile = userProfilesByEmail.get(item.email);
          return {
            id: item.id,
            nome: userProfile?.nome || item.nome,
            email: item.email,
            respostas: item.respostas,
            created_at: item.created_at
          };
        }));
        
      setResponses3((res3.data || []).map(item => {
        const userProfile = userProfilesByEmail.get(item.email);
        return {
          id: item.id,
          nome: userProfile?.nome || item.nome,
          email: item.email,
          respostas: item.respostas,
          created_at: item.created_at
        };
      }));
      
      setResponses4((res4.data || []).map(item => {
        const userProfile = userProfilesByEmail.get(item.email);
        return {
          id: item.id,
          nome: userProfile?.nome || item.nome,
          email: item.email,
          respostas: item.respostas,
          created_at: item.created_at
        };
      }));

      setProgressData({ 
        data: progressData.data || [], 
        userProfiles, 
        userProfilesByEmail 
      });
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

  useEffect(() => {
    loadAllResponses();
  }, []);

  return {
    responses1,
    responses2,
    responses3,
    responses4,
    progressData,
    adminUsers,
    isLoading,
    stats,
    calculateUserTotalScore,
    getDigitalProfile,
    getProfileColor,
    loadAllResponses
  };
};