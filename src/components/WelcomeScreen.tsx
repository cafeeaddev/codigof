import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, User, Loader2, Shield, Lock, HelpCircle } from 'lucide-react';
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
import { AnimatedXP } from './AnimatedXP';
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
  const [xpBeforeBonus, setXpBeforeBonus] = useState(0);
  const [shouldAnimateXP, setShouldAnimateXP] = useState(false);
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

  // Função para atualizar XP quando o bônus for aplicado
  const handleXpUpdate = (newXp: number) => {
    setUserProgress(prev => ({
      ...prev,
      total_xp: newXp
    }));
  };

  // Função para atualizar progresso ao completar missão
  const updateProgressOnMissionComplete = async (missionId: number) => {
    const newXp = userProgress.total_xp + 25;
    const newCompletedCount = userProgress.completedMissionsCount + 1;
    
    // Atualizar estado local imediatamente
    setUserProgress(prev => ({
      total_xp: newXp,
      completedMissionsCount: newCompletedCount
    }));

    // Salvar no banco de dados
    try {
      const missionColumn = `missao_${missionId}_completed`;
      const { error } = await supabase
        .from('user_progress')
        .update({
          [missionColumn]: true,
          total_xp: newXp,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao salvar progresso da missão:', error);
      } else {
        console.log(`✅ Missão ${missionId} salva com sucesso! Novo XP: ${newXp}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  // Fluxo ao finalizar missão: mostra tela de concluída e libera a próxima após curto atraso
  const handleMissionComplete = (missionId: 1 | 2 | 3 | 4) => {
    // Só atualizar se a missão ainda não foi completada
    if (!completedMissions.has(missionId)) {
      updateProgressOnMissionComplete(missionId);
    }
    
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
        setIsLoading(false); // Remover timeout - definir imediatamente
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
      console.log('🔍 Debug nome:', { 
        profNome: prof?.nome, 
        userProfileNome: userProfile.nome, 
        finalNome: nome 
      });
      let xp = 0;
      let medals = { m1: false, m2: false, m3: false, m4: false };

      console.log('🎖️ Debug prog data:', prog);
      
      if (prog) {
        xp = prog.total_xp || 0;
        medals = {
          m1: !!prog.missao_1_completed,
          m2: !!prog.missao_2_completed,
          m3: !!prog.missao_3_completed,
          m4: !!prog.missao_4_completed,
        };
      }
      
      console.log('🏆 Debug medals:', medals);

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

      // Calcular e salvar perfil final
      const { profile } = getDigitalProfile(score.total);
      
      // Salvar perfil final e pontuação total na tabela user_progress
      try {
        await supabase
          .from('user_progress')
          .update({ 
            final_profile: profile,
            final_score: score.total 
          })
          .eq('user_id', userId);
      } catch (error) {
        console.error('Erro ao salvar perfil final e pontuação:', error);
      }

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
          <div className="flex items-center gap-2 ml-2 md:ml-8 mr-auto max-w-[25vw] sm:max-w-[20vw] md:max-w-[30vw]">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/50">
              <User className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            </div>
            <div className="min-w-0 mr-6 sm:mr-12 md:mr-20 lg:mr-0 flex-1">
              <h1 className="text-secondary text-xs sm:text-sm md:text-base font-bold tracking-wider truncate">{userProfile.nome || "Usuário"}</h1>
              <p className="text-muted-foreground text-xs md:text-sm truncate">{userProfile.cargo?.replace(/^\d+-\s*/, "").trim()}</p>
            </div>
          </div>

          {/* Estatísticas compactas no Header Desktop (à direita) */}
          <div className="hidden lg:flex items-center gap-4 mx-4">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-lg px-4 py-2 shadow-lg">
                <AnimatedXP 
                  startValue={xpBeforeBonus || userProgress.total_xp}
                  endValue={userProgress.total_xp}
                  triggerAnimation={shouldAnimateXP}
                  onAnimationComplete={() => setShouldAnimateXP(false)}
                  className="text-lg font-bold text-primary"
                />
                <div className="text-primary/80 text-xs font-medium">XP</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 rounded-lg px-4 py-2 shadow-lg">
                <div className="text-lg font-bold text-accent">{userProgress.completedMissionsCount}/4</div>
                <div className="text-accent/80 text-xs font-medium">Missões</div>
              </div>
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
              showTitle={true}
              medalNames={[
                "Satélite",
                "Planeta",
                "Estrela",
                "Galáxia",
              ]}
            />
            
            {/* Assistente IA integrado */}
            <div className="flex flex-col items-center ml-3">
              <Button
                onClick={() => setShowTutorial(true)}
                className="bg-transparent border-2 border-cyan-400 rounded-full p-1 shadow-none hover:opacity-95 hover:scale-105 hover:border-cyan-300 transition-all duration-300 w-14 h-14 flex items-center justify-center"
              >
                {codyVideoUrl && (
                  <video
                    src={codyVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              </Button>
              <div className="text-secondary/90 text-xs mt-1 text-center leading-none font-medium">
                Precisa de<br/>Ajuda?
              </div>
            </div>
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

      {/* Estatísticas Mobile/Tablet - Layout otimizado */}
      <div className="block lg:hidden bg-card/95 backdrop-blur-xl border-b border-secondary/30 px-1.5 py-2.5">
        <div className="flex items-center justify-between gap-1.5 w-full">
          
          {/* XP Card */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-primary/25 to-primary/15 border border-primary/40 rounded-lg px-2 py-1.5 shadow-lg w-[50px] h-[50px] flex flex-col items-center justify-center text-center">
              <AnimatedXP 
                startValue={xpBeforeBonus || userProgress.total_xp}
                endValue={userProgress.total_xp}
                triggerAnimation={shouldAnimateXP}
                onAnimationComplete={() => setShouldAnimateXP(false)}
                className="text-sm font-bold text-primary leading-none"
              />
              <div className="text-primary/90 text-xs leading-none mt-0.5 font-semibold">XP</div>
            </div>
          </div>
          
          {/* Missões Card */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-accent/25 to-accent/15 border border-accent/40 rounded-lg px-2 py-1.5 shadow-lg w-[50px] h-[50px] flex flex-col items-center justify-center text-center">
              <div className="text-sm font-bold text-accent leading-none">{userProgress.completedMissionsCount}/4</div>
              <div className="text-accent/90 text-xs leading-none mt-0.5 font-semibold">Missões</div>
            </div>
          </div>
          
          {/* Medalhas Section */}
          <div className="flex-1 flex justify-center px-1">
            <div className="bg-card/40 border border-secondary/20 rounded-lg px-1.5 py-1 shadow-sm">
              <MedalBadges
                completed={{
                  m1: completedMissions.has(1),
                  m2: completedMissions.has(2),
                  m3: completedMissions.has(3),
                  m4: completedMissions.has(4),
                }}
                size="sm"
                className="flex justify-center"
                showTitle={true}
                medalNames={[
                  "Satélite",
                  "Planeta", 
                  "Estrela",
                  "Galáxia",
                ]}
              />
            </div>
          </div>
          
          {/* Assistente IA */}
          <div className="flex flex-col items-center">
            <Button
              onClick={() => setShowTutorial(true)}
              className="bg-transparent border-2 border-cyan-400 rounded-full p-1 shadow-none hover:opacity-95 hover:scale-105 hover:border-cyan-300 transition-all duration-300 w-[45px] h-[45px] flex items-center justify-center"
            >
              {codyVideoUrl && (
                <video
                  src={codyVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </Button>
            <div className="text-secondary/90 text-xs mt-0.5 text-center leading-none font-medium">
              Ajuda?
            </div>
          </div>
          
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
                  <GameSummaryContent gameData={gameData} userId={userId} onXpUpdate={handleXpUpdate} />
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

          {/* Layout Desktop: Grade com barra de missões no topo */}
          <div className="hidden md:flex flex-col h-full gap-4">
            {/* Barra Horizontal das Missões - Desktop */}
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 shadow-neon">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((missionId) => {
                  const isCompleted = completedMissions.has(missionId);
                  const isCurrent = currentMission === missionId;
                  const isLocked = missionId > currentMission && !isCompleted;
                  
                  return (
                     <div
                      key={missionId}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-primary/20 border-primary shadow-sm'
                          : isCurrent
                          ? 'bg-accent/20 border-accent shadow-sm'
                          : isLocked
                          ? 'bg-muted/30 border-muted-foreground/30 opacity-60'
                          : 'bg-card border-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          isCompleted ? 'bg-primary' : isCurrent ? 'bg-accent' : isLocked ? 'bg-muted-foreground/50' : 'bg-muted'
                        }`}></div>
                        <span className={`text-sm font-bold tracking-wider ${
                          isCompleted ? 'text-primary' : isCurrent ? 'text-accent' : isLocked ? 'text-muted-foreground/70' : 'text-foreground'
                        }`}>
                          MISSÃO {missionId}
                        </span>
                      </div>
                      
                      <div className={`text-xs mb-2 font-medium ${
                        isCompleted ? 'text-primary/80' : isCurrent ? 'text-accent/80' : isLocked ? 'text-muted-foreground/60' : 'text-foreground/70'
                      }`}>
                        {missionId === 1 && "Como você encara o digital?"}
                        {missionId === 2 && "O digital no seu dia a dia"}
                        {missionId === 3 && "Quando o desafio é maior"}
                        {missionId === 4 && "Seu Radar de Ferramentas"}
                      </div>
                      
                      <div className={`text-xs mb-2 ${
                        isCompleted ? 'text-primary' : isCurrent ? 'text-accent' : 'text-muted-foreground'
                      }`}>
                        Vale 25 XP
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-primary w-full' : isCurrent ? 'bg-accent w-1/2' : 'bg-muted w-0'
                          }`}
                        ></div>
                      </div>
                      
                      {/* Ícone de Check para missões completadas ou Lock para bloqueadas */}
                      {isCompleted ? (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : isLocked ? (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-muted-foreground/50 rounded-full flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-muted-foreground/70" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo da missão no desktop */}
            <div className="flex-1 overflow-hidden min-h-0">
              <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 h-full flex flex-col overflow-hidden min-h-0">
                {/* Desktop mission content - more space without help button */}

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
                      <GameSummaryContent gameData={gameData} userId={userId} onXpUpdate={handleXpUpdate} />
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

          {/* Área Principal das Perguntas (mobile apenas) */}
          <div className="md:hidden flex-1 overflow-hidden min-h-0">
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 h-full flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
                <span className="text-accent text-sm font-bold tracking-wider">
                  {currentMission === 1 && "MISSÃO 1 – Como você encara o digital?"}
                  {currentMission === 2 && "MISSÃO 2 – O digital no seu dia a dia"}
                  {currentMission === 3 && "MISSÃO 3 – Quando o desafio é maior"}
                  {currentMission === 4 && "MISSÃO 4 – Seu Radar de Ferramentas"}
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
                    <GameSummaryContent gameData={gameData} userId={userId} onXpUpdate={handleXpUpdate} />
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

// Internal Game Summary Component with Bonus System
const GameSummaryContent = ({ gameData, userId, onXpUpdate }: { gameData: any; userId: string; onXpUpdate?: (newXp: number) => void }) => {
  const profile = getDigitalProfile(gameData.score.total);
  const [phrase, setPhrase] = useState<string>('');
  
  // Bonus system states
  const [timeBonus, setTimeBonus] = useState(0);
  const [showBonusScreen, setShowBonusScreen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [bonusMessage, setBonusMessage] = useState('');
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [xpBeforeBonus, setXpBeforeBonus] = useState(0);
  const [shouldAnimateXP, setShouldAnimateXP] = useState(false);
  const [currentXp, setCurrentXp] = useState(gameData.xp);
  
  useEffect(() => {
    const loadPhrase = async () => {
      const profilePhrase = await getProfilePhrase(profile.profile, profile.sublevel);
      setPhrase(profilePhrase);
    };
    loadPhrase();
  }, [profile.profile, profile.sublevel]);

  // Bonus calculation and application function
  const calculateAndApplyTimeBonus = async (userId: string) => {
    console.log('🚀 [GameSummaryContent] Starting bonus calculation for user:', userId);
    
    try {
      // Fetch user progress
      const { data: prog, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ [GameSummaryContent] Error fetching progress:', error);
        return;
      }

      console.log('📊 [GameSummaryContent] Progress data:', JSON.stringify(prog, null, 2));

      // FORCE BONUS FOR COMPLETED USERS WITHOUT BONUS
      if (
        prog.missao_1_completed && 
        prog.missao_2_completed && 
        prog.missao_3_completed && 
        prog.missao_4_completed && 
        (!prog.time_bonus_xp || prog.time_bonus_xp === 0)
      ) {
        console.log('🎯 [GameSummaryContent] FORCING BONUS - All missions complete but no bonus applied!');
        
        const bonus = 150;
        const newTotalXp = (prog.total_xp || 0) + bonus;
        
        console.log('💾 [GameSummaryContent] APPLYING BONUS:', {
          currentXP: prog.total_xp,
          bonusXP: bonus,
          newTotalXP: newTotalXp
        });
        
        // Update database
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            time_bonus_xp: bonus,
            total_xp: newTotalXp,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ [GameSummaryContent] Update error:', updateError);
          return;
        }

        console.log('✅ [GameSummaryContent] Bonus applied successfully!');
        
        // Update UI states
        setTimeBonus(bonus);
        setCurrentXp(newTotalXp);
        
        // Update parent component XP (for header display)
        if (onXpUpdate) {
          onXpUpdate(newTotalXp);
        }
        
        // Show bonus screen
        setBonusAmount(bonus);
        setBonusMessage('Concluído no primeiro dia!');
        setShowBonusScreen(true);

        // Hide bonus screen after animation
        setTimeout(() => {
          setShowBonusScreen(false);
          console.log('🎬 [GameSummaryContent] Bonus screen hidden');
        }, 5000);
        
        return;
      } else if (prog.time_bonus_xp > 0) {
        console.log('🎁 [GameSummaryContent] User already has bonus:', prog.time_bonus_xp);
        setTimeBonus(prog.time_bonus_xp);
        setCurrentXp(prog.total_xp);
        // Show final screen immediately since bonus was already applied
        setShowFinalScreen(true);
      } else {
        console.log('⏳ [GameSummaryContent] User not eligible for bonus yet');
        // Show final screen immediately since no bonus will be applied
        setShowFinalScreen(true);
      }
      
    } catch (error) {
      console.error('❌ [GameSummaryContent] Exception in bonus calculation:', error);
    }
  };

  // Execute bonus check on component mount
  useEffect(() => {
    if (userId) {
      console.log('🔥 [GameSummaryContent] Executing bonus check for userId:', userId);
      calculateAndApplyTimeBonus(userId);
    }
  }, [userId]);
  
  console.log('DEBUG GameSummary:', { 
    score: gameData.score.total, 
    profile: profile.profile, 
    sublevel: profile.sublevel, 
    phrase,
    currentXp,
    timeBonus
  });

  const achievementNames = ["Satélite", "Planeta", "Estrela", "Galáxia"];
  const achievements = [
    { id: 1, title: achievementNames[0], done: gameData.medals.m1 },
    { id: 2, title: achievementNames[1], done: gameData.medals.m2 },
    { id: 3, title: achievementNames[2], done: gameData.medals.m3 },
    { id: 4, title: achievementNames[3], done: gameData.medals.m4 },
  ];

  return (
    <>
      {/* Bonus Screen Overlay - Clean Style */}
      {showBonusScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="text-center transform animate-epic-entry">            
            {/* Neon Lightning Icon */}
            <div className="text-8xl mb-6 filter drop-shadow-lg" style={{ 
              color: 'hsl(var(--neon-cyan))',
              textShadow: `0 0 20px hsl(var(--neon-cyan)), 0 0 40px hsl(var(--neon-cyan))`
            }}>
              ⚡
            </div>
            
            {/* "Você Ganhou" */}
            <div 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                color: 'hsl(var(--neon-cyan))',
                textShadow: `0 0 20px hsl(var(--neon-cyan))`
              }}
            >
              Você Ganhou
            </div>
            
            {/* Bonus Amount */}
            <div 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                color: 'hsl(var(--neon-cyan))',
                filter: 'drop-shadow(0 0 8px hsl(var(--neon-cyan)))',
                textShadow: `0 0 20px hsl(var(--neon-cyan))`
              }}
            >
              +{bonusAmount} XPs
            </div>
            
            {/* "Por ter concluído no primeiro dia!" */}
            <div 
              className="text-lg md:text-xl font-semibold tracking-wider"
              style={{ 
                color: 'hsl(var(--neon-cyan))',
                textShadow: '0 0 10px hsl(var(--neon-cyan))'
              }}
            >
              Por ter concluído no primeiro dia!
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="h-full">
        {!showBonusScreen && showFinalScreen && (
          <div className="p-4 space-y-6">

            {/* Profile Card */}
            <ProfileHeroCard
              profile={profile.profile} 
              sublevel={profile.sublevel}
              phrase={phrase}
              userName={gameData.nome}
              medals={achievements}
              xp={currentXp}
              totalScore={gameData.score.total}
              className="max-w-none"
            />

          </div>
        )}
      </ScrollArea>

    </>
  );
};