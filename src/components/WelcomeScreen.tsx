import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, User, Loader2, Shield, Lock, HelpCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useUserRole } from '@/hooks/useUserRole';
import { QuizDigital } from './QuizDigital';
import { MissaoDois } from './MissaoDois';
import { MissaoTres } from './MissaoTres';
import { MissaoQuatro } from './MissaoQuatro';
import MissaoCinco from './MissaoCinco';
import MedalBadges from './MedalBadges';
import TutorialOverlay from './TutorialOverlay';
import { getDigitalProfile, getProfilePhrase } from '@/lib/digitalProfile';
import { ProfileHeroCard } from './EpicGameSummary/ProfileHeroCard';
import { FloatingMedals } from './EpicGameSummary/FloatingMedals';
import { AnimatedStats } from './EpicGameSummary/AnimatedStats';
import { AnimatedXP } from './AnimatedXP';
import { ShareActions } from './EpicGameSummary/ShareActions';
import { TechnicalSkillsDisplay } from './TechnicalSkillsDisplay';
import { useMission5Eligibility } from '@/hooks/useMission5Eligibility';
import MissionProgress from './MissionProgress';

interface WelcomeScreenProps {
  user: {
    nome: string;
    email: string;
    area?: string;
    cargo?: string;
  };
  userId: string;
  onLogout: () => void;
}

export const WelcomeScreen = ({ user: userProfile, userId, onLogout }: WelcomeScreenProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { isEligible: isMission5Eligible, isLoading: mission5Loading } = useMission5Eligibility();
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('[WelcomeScreen] Loading states - mission5:', mission5Loading, 'main:', isLoading);
  const [currentMission, setCurrentMission] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState({ total_xp: 0, completedMissionsCount: 0 });
  const [justCompleted, setJustCompleted] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [codyVideoUrl, setCodyVideoUrl] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);
  const [showMission5, setShowMission5] = useState(false);
  const [xpBeforeBonus, setXpBeforeBonus] = useState(0);
  const [shouldAnimateXP, setShouldAnimateXP] = useState(false);
  const [gameData, setGameData] = useState({
    nome: '',
    xp: 0,
    medals: { m1: false, m2: false, m3: false, m4: false, m5: false },
    profile: '',
    sublevel: '',
    playTime: '',
    completionDate: '',
    technicalSkills: {} as Record<number, string[]>,
    areas: [] as string[],
    score: { mission1: 0, mission2: 0, mission3: 0, total: 0 }
  });

  const UNLOCK_DELAY = 1000;

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

  const handleXpUpdate = (newXp: number) => {
    setUserProgress(prev => ({
      ...prev,
      total_xp: newXp
    }));
  };

  const updateProgressOnMissionComplete = async (missionId: number) => {
    const newXp = userProgress.total_xp + 25;
    const newCompletedCount = userProgress.completedMissionsCount + 1;
    
    setUserProgress(prev => ({
      total_xp: newXp,
      completedMissionsCount: newCompletedCount
    }));

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
        console.error(`Erro ao salvar progresso da missão ${missionId}:`, error);
        setUserProgress(prev => ({
          total_xp: prev.total_xp - 25,
          completedMissionsCount: prev.completedMissionsCount - 1
        }));
        toast({
          title: "Erro ao salvar progresso",
          description: "Houve um problema ao salvar seu progresso. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Erro ao atualizar progresso da missão ${missionId}:`, error);
      setUserProgress(prev => ({
        total_xp: prev.total_xp - 25,
        completedMissionsCount: prev.completedMissionsCount - 1
      }));
      toast({
        title: "Erro ao salvar progresso",
        description: "Houve um problema ao salvar seu progresso. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleMissionComplete = (missionId: 1 | 2 | 3 | 4 | 5) => {
    console.log(`[WelcomeScreen] Missão ${missionId} completada!`);
    
    if (!completedMissions.has(missionId)) {
      console.log(`[WelcomeScreen] Atualizando progresso da missão ${missionId}`);
      if (missionId <= 4) {
        updateProgressOnMissionComplete(missionId as 1 | 2 | 3 | 4);
      }
    } else {
      console.log(`[WelcomeScreen] Missão ${missionId} já estava completada`);
    }

    setJustCompleted(missionId);
    console.log(`[WelcomeScreen] Definindo justCompleted como ${missionId}`);
    
    setTimeout(() => {
      console.log(`[WelcomeScreen] Timeout executado para missão ${missionId}`);
      setCompletedMissions(prev => {
        const newCompleted = new Set([...prev, missionId]);
        console.log(`[WelcomeScreen] Missões completadas atualizadas:`, Array.from(newCompleted));
        return newCompleted;
      });
      setJustCompleted(null);
      
      if (missionId < 4) {
        const nextMission = (missionId + 1) as 1 | 2 | 3 | 4 | 5;
        console.log(`[WelcomeScreen] Mudando para missão ${nextMission}`);
        setCurrentMission(nextMission);
      } else if (missionId === 4) {
        // Após completar missão 4, verificar se pode mostrar Missão 5
        console.log(`[WelcomeScreen] Missão 4 completada, verificando elegibilidade para Missão 5`);
        if (isMission5Eligible) {
          console.log(`[WelcomeScreen] Usuário elegível para Missão 5, mostrando...`);
          setShowMission5(true);
        } else {
          console.log(`[WelcomeScreen] Usuário não elegível para Missão 5, carregando resumo do jogo`);
          setJustCompleted(null);
          setIsLoadingProfile(true);
          setTimeout(() => loadGameSummary(), 1000);
        }
      } else if (missionId === 5) {
        // Após completar missão 5, mostrar resumo final
        console.log(`[WelcomeScreen] Missão 5 completada, carregando resumo do jogo`);
        setShowMission5(false);
        setJustCompleted(null);
        setIsLoadingProfile(true);
        setTimeout(() => loadGameSummary(), 1000);
      }
    }, 2000);
  };

  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        console.log('[WelcomeScreen] Loading progress for userId:', userId);
        if (userId) {
          const { data } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);

          if (data && data.length > 0) {
            const progress = data[0];
            const allMissionsCompleted = progress.missao_1_completed && progress.missao_2_completed && progress.missao_3_completed && progress.missao_4_completed;
            const mission5Completed = progress.missao_5_completed;
            
            const completed = new Set<number>();
            if (progress.missao_1_completed) completed.add(1);
            if (progress.missao_2_completed) completed.add(2);
            if (progress.missao_3_completed) completed.add(3);
            if (progress.missao_4_completed) completed.add(4);
            if (progress.missao_5_completed) completed.add(5);
            
            setCompletedMissions(completed);
            setUserProgress({ total_xp: progress.total_xp || 0, completedMissionsCount: completed.size });

            // Determinar próxima missão ou estado
            if (mission5Completed || (allMissionsCompleted && !isMission5Eligible)) {
              // Se completou Missão 5 OU completou 4 missões mas não é elegível para 5
              console.log('[WelcomeScreen] All missions completed, loading game summary data on refresh');
              setTimeout(() => {
                loadGameSummary();
              }, 500);
            } else if (allMissionsCompleted && isMission5Eligible) {
              // Se completou 4 missões e é elegível para 5, mostrar Missão 5
              console.log('[WelcomeScreen] User eligible for Mission 5, showing it');
              setShowMission5(true);
            } else {
              // Definir próxima missão baseada no progresso
              let nextMission: 1 | 2 | 3 | 4 | 5 = 1;
              if (progress.missao_4_completed) nextMission = 5;
              else if (progress.missao_3_completed) nextMission = 4;
              else if (progress.missao_2_completed) nextMission = 3;
              else if (progress.missao_1_completed) nextMission = 2;
              
              setCurrentMission(nextMission);
            }
          }
        } else {
          console.log('[WelcomeScreen] No userId provided');
        }
      } catch (error) {
        console.error('[WelcomeScreen] Error loading user progress:', error);
      } finally {
        console.log('[WelcomeScreen] Loading complete, isLoading set to false');
        setIsLoading(false);
      }
    };

    loadUserProgress();
  }, [userId, isMission5Eligible]);

  const loadGameSummary = async () => {
    try {
      if (!userId) return;

      const [{ data: prog }, { data: prof }] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('profiles').select('nome').eq('user_id', userId).maybeSingle(),
      ]);

      const nome = prof?.nome || userProfile.nome || 'Você';
      let xp = 0;
      let medals = { m1: false, m2: false, m3: false, m4: false, m5: false };

      if (prog) {
        xp = prog.total_xp || 0;
        medals = {
          m1: !!prog.missao_1_completed,
          m2: !!prog.missao_2_completed,
          m3: !!prog.missao_3_completed,
          m4: !!prog.missao_4_completed,
          m5: !!prog.missao_5_completed
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
        const arr = row.respostas;
        if (Array.isArray(arr)) m2 += arr.reduce((s: number, it: any) => s + (it?.points || 0), 0);
      });

      let m3 = 0;
      (r3.data || []).forEach((row: any) => {
        const arr = row.respostas;
        if (Array.isArray(arr)) m3 += arr.reduce((s: number, it: any) => s + (it?.points || 0), 0);
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

      setGameData({ ...gameData, nome, xp, medals, score });
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
      {showMission5 && (
        <MissaoCinco
          isVisible={showMission5}
          onComplete={() => {
            setShowMission5(false);
            handleMissionComplete(5);
          }}
        />
      )}

      {!isLoading && !showGameSummary && !showMission5 && (
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
              
              {/* Avatar + Nome/Área */}
              <div className="flex items-center gap-2 ml-0 md:ml-8 mr-auto max-w-[35vw] sm:max-w-[25vw] md:max-w-[30vw]">
                <div className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 bg-secondary/20 rounded-full items-center justify-center border border-secondary/50">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                </div>
                <div className="min-w-0 mr-6 sm:mr-12 md:mr-20 lg:mr-0 flex-1">
                  <h1 className="text-secondary text-xs sm:text-sm md:text-base font-bold tracking-wider truncate">{userProfile.nome || "Usuário"}</h1>
                  <p className="text-muted-foreground text-xs md:text-sm truncate">{userProfile.cargo?.replace(/^\d+-\s*/, "").trim()}</p>
                </div>
              </div>

              {/* Progress das Missões */}
              <div className="hidden xl:block mx-4">
                <MissionProgress
                  completedMissions={completedMissions}
                  currentMission={currentMission}
                  isMission5Eligible={isMission5Eligible}
                  showMission5={showMission5}
                  className="grid-cols-5 gap-2"
                />
              </div>

              {/* Estatísticas compactas no Header Mobile/Tablet */}
              <div className="flex xl:hidden items-center gap-4 mx-4">
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
                    <div className="text-lg font-bold text-accent">{userProgress.completedMissionsCount}/{isMission5Eligible ? 5 : 4}</div>
                    <div className="text-accent/80 text-xs font-medium">Missões</div>
                  </div>
                </div>
                <MedalBadges 
                  completed={gameData.medals}
                  showMission5={isMission5Eligible && completedMissions.size >= 4}
                  className="mb-6" 
                  showNames={true}
                />
                
                {/* Assistente IA integrado - ocultar na tela final */}
                {!(showGameSummary || (completedMissions.size === 4 && gameData)) && (
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
                )}
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

          <div className="h-[calc(100svh-5.25rem)] md:h-[calc(100svh-4.5rem)] overflow-hidden p-2 md:p-4 relative z-10">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              
              {/* Progress das Missões - Mobile/Tablet */}
              <div className="xl:hidden mb-4">
                <MissionProgress
                  completedMissions={completedMissions}
                  currentMission={currentMission}
                  isMission5Eligible={isMission5Eligible}
                  showMission5={showMission5}
                  className="grid-cols-2 sm:grid-cols-4 gap-3"
                />
              </div>
              
              {/* Content for missions */}
              <div className="flex-1 overflow-hidden min-h-0">
                <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 h-full flex flex-col overflow-hidden min-h-0">
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
                      ) : showGameSummary || (completedMissions.size >= 4 && gameData) ? (
                        <GameSummaryContent gameData={gameData} userId={userId} onXpUpdate={handleXpUpdate} />
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
      )}

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
  const { isEligible: isMission5Eligible } = useMission5Eligibility();
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
    try {
      const { data: prog, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      if (
        prog.missao_1_completed && 
        prog.missao_2_completed && 
        prog.missao_3_completed && 
        prog.missao_4_completed && 
        (!prog.time_bonus_xp || prog.time_bonus_xp === 0)
      ) {
        const { calculateTimeBonus } = await import('@/lib/bonusCalculation');
        const bonusResult = await calculateTimeBonus(prog.updated_at || prog.created_at);
        
        if (!bonusResult) {
          console.log('Could not calculate bonus');
          return;
        }
        
        const bonus = bonusResult.expectedBonus;
        const baseXP = prog.game_base_xp || 0;
        const newTotalXp = baseXP + bonus;
        
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            time_bonus_xp: bonus,
            total_xp: newTotalXp,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Update error:', updateError);
          return;
        }
        
        setTimeBonus(bonus);
        setCurrentXp(newTotalXp);
        
        if (onXpUpdate) {
          onXpUpdate(newTotalXp);
        }
        
        setShowFinalScreen(true);
        return;
      } else if (prog.time_bonus_xp > 0) {
        setTimeBonus(prog.time_bonus_xp);
        setCurrentXp(prog.total_xp);
        setShowFinalScreen(true);
      } else {
        setShowFinalScreen(true);
      }
      
    } catch (error) {
      console.error('Exception in bonus calculation:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      calculateAndApplyTimeBonus(userId);
    }
  }, [userId]);

  const achievementNames = ["Satélite", "Planeta", "Estrela", "Galáxia", "Universo"];
  const achievements = [
    { id: 1, title: achievementNames[0], done: gameData.medals.m1 },
    { id: 2, title: achievementNames[1], done: gameData.medals.m2 },
    { id: 3, title: achievementNames[2], done: gameData.medals.m3 },
    { id: 4, title: achievementNames[3], done: gameData.medals.m4 },
    { id: 5, title: achievementNames[4], done: gameData.medals.m5 },
  ];

  return (
    <>
      <ScrollArea className="h-full">
        {!showBonusScreen && showFinalScreen && (
          <div className="p-4 space-y-6">
            <MedalBadges
              completed={{
                m1: gameData.medals.m1,
                m2: gameData.medals.m2,
                m3: gameData.medals.m3,
                m4: gameData.medals.m4,
                m5: gameData.medals.m5 || false
              }}
              size="md"
              showNames={true}
              showTitle={true}
              showMission5={true}
              className="mb-8"
            />
            
            <ProfileHeroCard
              profile={profile.profile} 
              sublevel={profile.sublevel}
              phrase={phrase}
              userName={gameData.nome}
              medals={achievements.filter(a => a.done)}
              xp={currentXp}
              totalScore={gameData.score.total}
              timeBonus={timeBonus}
              className="max-w-none"
            />

            <TechnicalSkillsDisplay userId={userId} />
          </div>
        )}
      </ScrollArea>
    </>
  );
};