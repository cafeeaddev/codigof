import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, User, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { useUserRole } from '@/hooks/useUserRole';
import { QuizDigital } from './QuizDigital';
import { MissaoDois } from './MissaoDois';
import { MissaoTres } from './MissaoTres';
import { MissaoQuatro } from './MissaoQuatro';
import MedalBadges from './MedalBadges';
import TutorialOverlay from './TutorialOverlay';
import { getDigitalProfile, getProfilePhrase } from '@/lib/digitalProfile';
import { ProfileHeroCard } from './EpicGameSummary/ProfileHeroCard';
import { FloatingMedals } from './EpicGameSummary/FloatingMedals';
import { AnimatedStats } from './EpicGameSummary/AnimatedStats';
import { CelebrationParticles } from './EpicGameSummary/CelebrationParticles';
import { ShareActions } from './EpicGameSummary/ShareActions';
interface WelcomeScreenProps {
  user: {
    nome: string;
    email: string;
    area?: string;
    cargo?: string;
  };
  userId: string; // Explicit userId prop to avoid context dependency
  onLogout: () => void;
}

export const WelcomeScreen = ({ user: userProfile, userId, onLogout }: WelcomeScreenProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [currentMission, setCurrentMission] = useState<1 | 2 | 3 | 4>(1);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState({ total_xp: 0, completedMissionsCount: 0 });
  const [justCompleted, setJustCompleted] = useState<1 | 2 | 3 | 4 | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [codyVideoUrl, setCodyVideoUrl] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);
  const [gameData, setGameData] = useState({
    nome: '',
    xp: 0,
    medals: { m1: false, m2: false, m3: false, m4: false },
    score: { mission1: 0, mission2: 0, mission3: 0, total: 0 }
  });
  const UNLOCK_DELAY = 1000; // ms
  useEffect(() => {
    const seen = localStorage.getItem('tutorialSeen');
    if (!seen) setShowTutorial(true);
  }, []);

  useEffect(() => {
    try {
      const url = localStorage.getItem('codyAvatarUrl');
      if (url) {
        setCodyVideoUrl(url);
      } else {
        setCodyVideoUrl('https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4');
      }
    } catch {
      setCodyVideoUrl('https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4');
    }
  }, []);

  console.log('[WelcomeScreen] Props received:', { 
    userProfile: userProfile.nome, 
    userId,
    userIdDefined: !!userId 
  });

  // Função para atualizar progresso localmente
  const updateProgress = (missionId: number) => {
    if (!completedMissions.has(missionId)) {
      setUserProgress(prev => ({
        total_xp: prev.total_xp + 25,
        completedMissionsCount: prev.completedMissionsCount + 1
      }));
    }
  };

  // Fluxo ao finalizar missão: mostra tela de concluída e libera a próxima após curto atraso
  const handleMissionComplete = (missionId: 1 | 2 | 3 | 4) => {
    updateProgress(missionId);
    setJustCompleted(missionId);
    setTimeout(() => {
      setCompletedMissions(prev => new Set([...prev, missionId]));
      if (missionId < 4) {
        setCurrentMission((missionId + 1) as 1 | 2 | 3 | 4);
        setJustCompleted(null);
      } else {
        // Após completar missão 4, limpar justCompleted e mostrar loading
        setJustCompleted(null);
        setIsLoadingProfile(true);
        setTimeout(() => {
          loadGameSummaryData();
        }, 2000);
      }
    }, UNLOCK_DELAY);
  };

  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        console.log('[WelcomeScreen] Loading progress for userId:', userId);
        if (userId) {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (progress) {
            setUserProgress({ 
              total_xp: progress.total_xp, 
              completedMissionsCount: [
                progress.missao_1_completed,
                progress.missao_2_completed,
                progress.missao_3_completed,
                progress.missao_4_completed
              ].filter(Boolean).length
            });
            
            // Set completed missions and determine current mission
            const completed = new Set<number>();
            if (progress.missao_1_completed) completed.add(1);
            if (progress.missao_2_completed) completed.add(2);
            if (progress.missao_3_completed) completed.add(3);
            if (progress.missao_4_completed) completed.add(4);
            setCompletedMissions(completed);
            
            // Determine current mission based on completion
            if (!progress.missao_1_completed) {
              setCurrentMission(1);
            } else if (!progress.missao_2_completed) {
              setCurrentMission(2);
            } else if (!progress.missao_3_completed) {
              setCurrentMission(3);
            } else if (!progress.missao_4_completed) {
              setCurrentMission(4);
            } else {
              setCurrentMission(4); // All completed, keep on mission 4 to show completion screen
            }
          }
        } else {
          console.log('[WelcomeScreen] No userId provided');
        }
      } catch (error) {
        console.error('[WelcomeScreen] Error loading user progress:', error);
      } finally {
        console.log('[WelcomeScreen] Loading complete, isLoading set to false');
        setTimeout(() => setIsLoading(false), 500); // Reduzir tempo para 500ms
      }
    };

    loadUserProgress();
  }, [userId]);

  const loadGameSummaryData = async () => {
    try {
      if (!userId) return;

      const [{ data: prog }, { data: prof }] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('profiles').select('nome').eq('user_id', userId).maybeSingle(),
      ]);

      const nome = prof?.nome || userProfile.nome || 'Você';
      let xp = 0;
      let medals = { m1: false, m2: false, m3: false, m4: false };

      if (prog) {
        xp = prog.total_xp || 0;
        medals = {
          m1: !!prog.missao_1_completed,
          m2: !!prog.missao_2_completed,
          m3: !!prog.missao_3_completed,
          m4: !!prog.missao_4_completed,
        };
      }

      // Carrega pontuações das missões
      const [r1, r2, r3] = await Promise.all([
        supabase.from('respostas').select('*').eq('user_id', userId).order('id', { ascending: false }),
        supabase.from('respostas_missao2').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('respostas_missao3').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      // Calcular pontuações
      let m1 = 0;
      (r1.data || []).forEach((row: any) => {
        const resp = row.respostas;
        if (Array.isArray(resp)) {
          m1 += resp.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
        } else if (resp && typeof resp === 'object') {
          const arr = (resp as any)?.data || (resp as any);
          if (Array.isArray(arr)) m1 += arr.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
        }
      });

      let m2 = 0;
      (r2.data || []).forEach((row: any) => {
        const arr = row.respostas?.data;
        if (Array.isArray(arr)) m2 += arr.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
      });

      let m3 = 0;
      (r3.data || []).forEach((row: any) => {
        const arr = row.respostas;
        if (Array.isArray(arr)) m3 += arr.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
      });

      const score = { mission1: m1, mission2: m2, mission3: m3, total: parseFloat((m1 + m2 + m3).toFixed(2)) };

      setGameData({ nome, xp, medals, score });
      setIsLoadingProfile(false);
      setShowGameSummary(true);
    } catch (error) {
      console.error('Error loading game summary:', error);
      setIsLoadingProfile(false);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu resumo final.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-8 shadow-neon">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-t-lg">
              <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
              <div className="w-3 h-3 bg-neon-purple rounded-full"></div>
              <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
              <span className="text-muted-foreground text-sm ml-2 font-mono">LOADING_SYSTEM_v2.0</span>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <Loader2 className="w-12 h-12 text-secondary animate-spin" />
              <div className="space-y-2 text-center">
                <h2 className="text-secondary text-xl font-bold tracking-wider">
                  CARREGANDO SISTEMA
                </h2>
                <p className="text-muted-foreground text-sm">
                  Preparando ambiente seguro...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      
      <div 
        className="fixed inset-0 bg-background z-[10] welcome-screen" 
        style={{ 
          height: '100vh', 
          width: '100vw',
          pointerEvents: 'auto',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-secondary/50 p-3 md:p-4 relative z-10" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-3 flex-1">
          </div>
          
          {/* Botão Admin (só aparece para admins) */}
          {isAdmin && (
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              size="sm"
              className="bg-transparent border-accent text-accent hover:bg-accent hover:text-accent-foreground mr-2"
            >
              <Shield className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">ADMIN</span>
            </Button>
          )}
          

          {/* Avatar + Nome/Área */}
          <div className="flex items-center gap-2 ml-8 mr-auto max-w-[50vw]">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/50">
              <User className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-secondary text-sm md:text-base font-bold tracking-wider truncate">{(userProfile.nome || 'Usuário').split(' ')[0]}</h1>
              <p className="text-muted-foreground text-xs md:text-sm truncate">{userProfile.cargo?.replace(/^\d+-\s*/, '').trim()}</p>
            </div>
          </div>

          {/* Estatísticas compactas no Header Desktop (à direita) */}
          <div className="hidden lg:flex items-center gap-4 mx-4">
            <div className="text-center">
              <div className="text-sm font-bold text-primary">{userProgress.total_xp}</div>
              <div className="text-muted-foreground text-xs">XP</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-accent">{userProgress.completedMissionsCount}/4</div>
              <div className="text-muted-foreground text-xs">Missões</div>
            </div>
            <MedalBadges
              completed={{
                m1: completedMissions.has(1),
                m2: completedMissions.has(2),
                m3: completedMissions.has(3),
                m4: completedMissions.has(4),
              }}
              size="md"
              className="pl-2 ml-2 border-l border-border/50"
              medalNames={[
                "Satélite",
                "Planeta",
                "Estrela",
                "Galáxia",
              ]}
            />
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground relative z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden md:inline">SAIR</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas Mobile compactas */}
      <div className="block lg:hidden bg-card/80 backdrop-blur-xl border-b border-secondary/30 px-4 py-2">
        <div className="flex items-center gap-4 px-3 overflow-x-auto whitespace-nowrap">
          <div className="text-center shrink-0">
            <div className="text-sm font-bold text-primary">{userProgress.total_xp}</div>
            <div className="text-muted-foreground text-xs">XP</div>
          </div>
          <div className="text-center shrink-0">
            <div className="text-sm font-bold text-accent">{userProgress.completedMissionsCount}/4</div>
            <div className="text-muted-foreground text-xs">Missões</div>
          </div>
          <MedalBadges
            completed={{
              m1: completedMissions.has(1),
              m2: completedMissions.has(2),
              m3: completedMissions.has(3),
              m4: completedMissions.has(4),
            }}
            size="sm"
            className="shrink-0"
            medalNames={[
              "Satélite",
              "Planeta", 
              "Estrela",
              "Galáxia",
            ]}
          />
        </div>
        </div>

      <div className="h-[calc(100svh-5.25rem)] md:h-[calc(100svh-4.5rem)] overflow-hidden p-2 md:p-4 relative z-10">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          
          {/* Layout Mobile: Apenas a missão ativa em tela cheia */}
          <div className="block md:hidden h-full">
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 shadow-neon h-full overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-accent text-sm font-bold tracking-wider">
                    MISSÃO {currentMission} ATIVADA
                  </span>
                </div>
                {/* Botão "Próxima Missão" removido no mobile conforme solicitação */}
              </div>

              <div className="flex-1 overflow-hidden min-h-0">
                {justCompleted !== null ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 p-4 animate-fade-in">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-primary mb-1">
                        Missão {justCompleted} concluída! +25 XP
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Liberando a próxima missão...
                      </p>
                    </div>
                  </div>
                ) : currentMission === 1 && !completedMissions.has(1) ? (
                  <QuizDigital 
                    userId={userId}
                    onClose={() => handleMissionComplete(1)} />
                ) : currentMission === 2 && !completedMissions.has(2) ? (
                  <MissaoDois 
                    userId={userId}
                    onComplete={() => handleMissionComplete(2)} />
                ) : currentMission === 3 && !completedMissions.has(3) ? (
                  <MissaoTres onComplete={() => handleMissionComplete(3)} />
                ) : currentMission === 4 && !completedMissions.has(4) ? (
                  <MissaoQuatro onComplete={() => handleMissionComplete(4)} />
                ) : isLoadingProfile ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-primary mb-1">
                        Carregando seu Perfil Digital...
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Preparando sua conquista épica!
                      </p>
                    </div>
                  </div>
                ) : showGameSummary || (completedMissions.size === 4 && gameData) ? (
                  <GameSummaryContent gameData={gameData} />
                ) : completedMissions.size === 4 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-primary mb-1">
                        Missões Completadas!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Aguarde novas missões em breve.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-primary mb-1">
                        Aguarde...
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Preparando próximas missões.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Área Principal das Perguntas */}
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 h-full flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
                <span className="text-accent text-sm font-bold tracking-wider">
                  {currentMission === 1 && "MISSÃO 1 – Como você encara o digital?"}
                  {currentMission === 2 && "MISSÃO 2 – O digital no seu dia a dia"}
                  {currentMission === 3 && "MISSÃO 3 – Quando o desafio é maior"}
                  {currentMission === 4 && ""}
                </span>
              </div>

              <ScrollArea className="flex-1">
                <div className="pr-3">
                  {justCompleted !== null ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-5 animate-fade-in">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-primary mb-1">
                          Missão {justCompleted} concluída! +25 XP
                        </h4>
                        <p className="text-sm text-muted-foreground">Liberando a próxima missão...</p>
                      </div>
                    </div>
                  ) : currentMission === 1 && !completedMissions.has(1) ? (
                    <QuizDigital 
                      userId={userId}
                      onClose={() => handleMissionComplete(1)} />
                  ) : currentMission === 2 && !completedMissions.has(2) ? (
                    <MissaoDois 
                      userId={userId}
                      onComplete={() => handleMissionComplete(2)} />
                  ) : currentMission === 3 && !completedMissions.has(3) ? (
                    <MissaoTres onComplete={() => handleMissionComplete(3)} />
                  ) : currentMission === 4 && !completedMissions.has(4) ? (
                    <MissaoQuatro onComplete={() => handleMissionComplete(4)} />
                  ) : isLoadingProfile ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-primary mb-1">
                          Carregando seu Perfil Digital...
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Preparando sua conquista épica!
                        </p>
                      </div>
                    </div>
                  ) : showGameSummary || (completedMissions.size === 4 && gameData) ? (
                    <GameSummaryContent gameData={gameData} />
                  ) : completedMissions.size === 4 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-primary mb-1">
                          Missões Completadas!
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Aguarde novas missões em breve.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-primary mb-1">
                          Aguarde...
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Preparando próximas missões.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Botão de Ajuda dentro do jogo */}
      <div className="fixed bottom-4 right-4 z-[90] flex items-center">
        <div className="mr-3 -ml-px w-12 h-12 rounded-full ring-2 ring-neon-cyan shadow-md overflow-hidden shrink-0">
          {codyVideoUrl ? (
            <video
              src={codyVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              aria-label="Cody, IA mentora"
            />
          ) : (
            <img
              src="/lovable-uploads/ead95ee7-bc88-4e43-88ad-3ae3499162d4.png"
              alt="Cody, assistente IA"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowTutorial(true)}
          className="px-0 h-auto text-secondary text-sm font-semibold -ml-2"
        >
          Precisa de ajuda?
        </Button>
      </div>

      {/* Tutorial somente in-game */}
      {showTutorial && (
        <TutorialOverlay
          stage="ingame"
          onClose={() => setShowTutorial(false)}
          onDontShowAgain={() => {
            localStorage.setItem('tutorialSeen','1');
            setShowTutorial(false);
          }}
        />
      )}

    </>
  );
};

// Internal Game Summary Component
const GameSummaryContent = ({ gameData }: { gameData: any }) => {
  const profile = getDigitalProfile(gameData.score.total);
  const phrase = getProfilePhrase(profile.profile, profile.sublevel);

  const achievementNames = ["Satélite", "Planeta", "Estrela", "Galáxia"];
  const achievements = [
    { id: 1, title: achievementNames[0], done: gameData.medals.m1 },
    { id: 2, title: achievementNames[1], done: gameData.medals.m2 },
    { id: 3, title: achievementNames[2], done: gameData.medals.m3 },
    { id: 4, title: achievementNames[3], done: gameData.medals.m4 },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Celebration Particles */}
        <CelebrationParticles />
        
        {/* Hero Section */}

        {/* Profile Card */}
        <div className="mb-6">
          <ProfileHeroCard 
            profile={profile.profile} 
            sublevel={profile.sublevel}
            phrase={phrase}
            userName={gameData.nome}
            medals={achievements}
            xp={gameData.xp}
            totalScore={gameData.score.total}
            className="max-w-none"
          />
        </div>

        {/* Level Description */}
        <div className="mb-6">
          <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4">
            <div className="text-sm text-muted-foreground leading-relaxed">
              {phrase ? (() => {
                // Remove the level number and dot (e.g., "🟡 Nível 1 – " or "🟠 Nível 2 – ")
                return phrase.replace(/^[🟡🟠🔴]\s*Nível\s+\d+\s*[–-]\s*/, '');
              })() : 'Carregando descrição do perfil...'}
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="mb-6">
          <ShareActions 
            phrase={phrase}
            profile={profile.profile}
            sublevel={profile.sublevel}
          />
        </div>

        {/* Continue Button */}
        <div className="text-center pt-4">
          <Button 
            onClick={() => window.location.reload()}
            size="lg"
            className="bg-accent hover:bg-accent/80 text-accent-foreground font-bold px-8 py-4"
          >
            🚀 Explorar mais missões
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};