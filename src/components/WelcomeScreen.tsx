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
import { TechnicalSkillsDisplay } from './TechnicalSkillsDisplay';
import { ExtraMissionContent } from './ExtraMissionContent';
import { useExtraMissionState } from '@/hooks/useExtraMissionState';
import { MobileNavigation } from './MobileNavigation';
import { ProfileLoadingSkeleton, MissionLoadingSkeleton } from './ui/loading-skeleton';
import { AccessibilityEnhancer } from './AccessibilityEnhancer';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

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
  console.log('🚀 [WelcomeScreen] Component mounted with userId:', userId);
  const { measureAsyncOperation } = usePerformanceMonitor('WelcomeScreen');
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [currentMission, setCurrentMission] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState({ total_xp: 0, completedMissionsCount: 0 });
  const [justCompleted, setJustCompleted] = useState<1 | 2 | 3 | 4 | null>(null);
  const [showExtraMissionScreen, setShowExtraMissionScreen] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
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
    score: { mission1: 0, mission2: 0, mission3: 0, mission4: 0, total: 0 },
    finalScore: 0, // Score final salvo no banco de dados
    final_profile: null as string | null, // Perfil salvo no banco
    final_score: null as number | null, // Score salvo no banco
    isDataLoaded: false // Flag para identificar se dados reais foram carregados
  });
  const [extraMissionReleaseDate, setExtraMissionReleaseDate] = useState<string | null>(null);
  const [userDeclinedFastTrack, setUserDeclinedFastTrack] = useState(false);
  const [extraMissionRefreshTrigger, setExtraMissionRefreshTrigger] = useState(0);
  const UNLOCK_DELAY = 1000; // ms
  
  // Hook para estado da missão extra - usar dados reais do banco quando disponível
  const currentProfile = (gameData.final_profile && gameData.finalScore !== null) ? 
    gameData.final_profile : 
    (gameData.finalScore !== null ? getDigitalProfile(gameData.finalScore).profile : 'Unknown');
  
  console.log('🎯 [WelcomeScreen] Current profile for useExtraMissionState:', { 
    currentProfile, 
    finalProfile: gameData.final_profile,
    finalScore: gameData.finalScore, 
    hasRealData: gameData.final_profile && gameData.finalScore !== null,
    SOURCE: gameData.final_profile ? 'DATABASE' : 'CALCULATED'
  });
  const { state: extraMissionState, releaseDate: hookExtraMissionReleaseDate, refreshState } = useExtraMissionState(userId, currentProfile, extraMissionRefreshTrigger);
  // Tutorial control - verificar localStorage e banco de dados
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        console.log('🎯 [WelcomeScreen] Checking tutorial status for user:', userId);
        
        // Primeiro, verificar localStorage
        const localTutorialSeen = localStorage.getItem('tutorialSeen');
        console.log('🔍 [WelcomeScreen] LocalStorage tutorialSeen:', localTutorialSeen);
        
        if (localTutorialSeen === 'true') {
          console.log('✅ [WelcomeScreen] Tutorial already seen in localStorage - not showing');
          setShowTutorial(false);
          return;
        }
        
        // Verificar no banco de dados se usuário já viu tutorial
        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('current_position, missao_1_completed, missao_2_completed, missao_3_completed, missao_4_completed')
          .eq('user_id', userId)
          .maybeSingle();
          
        console.log('🔍 [WelcomeScreen] User progress for tutorial check:', userProgress);
        
        // Se usuário já tem progresso significativo, não mostrar tutorial
        if (userProgress && (
          userProgress.missao_1_completed || 
          userProgress.missao_2_completed || 
          userProgress.missao_3_completed || 
          userProgress.missao_4_completed ||
          userProgress.current_position !== 'inicio'
        )) {
          console.log('✅ [WelcomeScreen] User has progress - marking tutorial as seen');
          localStorage.setItem('tutorialSeen', 'true');
          setShowTutorial(false);
          return;
        }
        
        // Se é primeira vez mesmo, mostrar tutorial
        console.log('🎯 [WelcomeScreen] First time user - showing tutorial');
        setShowTutorial(true);
        
      } catch (error) {
        console.error('❌ [WelcomeScreen] Error checking tutorial status:', error);
        // Em caso de erro, usar apenas localStorage
        const localTutorialSeen = localStorage.getItem('tutorialSeen');
        setShowTutorial(localTutorialSeen !== 'true');
      }
    };
    
    checkTutorialStatus();
  }, [userId]);

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

  // 🚨 CRÍTICO: Carregar dados finais se o usuário já completou todas as missões
  useEffect(() => {
    const checkAndLoadFinalData = async () => {
      if (!userId) return;
      
      const completedCount = completedMissions.size;
      console.log('🔍 [Final Data Check] Checking if should load final data...', {
        userId: !!userId,
        completedCount,
        allCompleted: completedCount >= 4,
        hasGameData: !!gameData.final_profile
      });
      
      // Se completou todas as missões mas não tem dados finais carregados
      if (completedCount >= 4 && !gameData.final_profile) {
        console.log('✅ [Final Data Check] Loading final game data...');
        await loadGameSummaryData();
      }
    };
    
    checkAndLoadFinalData();
  }, [userId, completedMissions.size, gameData.final_profile]);

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
    console.log(`[WelcomeScreen] updateProgressOnMissionComplete iniciado para missão ${missionId}`);
    
    const newXp = userProgress.total_xp + 25;
    const newCompletedCount = userProgress.completedMissionsCount + 1;
    
    console.log(`[WelcomeScreen] Calculando novos valores: XP ${userProgress.total_xp} + 25 = ${newXp}, missões completadas: ${userProgress.completedMissionsCount} + 1 = ${newCompletedCount}`);
    
    // Atualizar estado local imediatamente
    setUserProgress(prev => {
      const updated = {
        total_xp: newXp,
        completedMissionsCount: newCompletedCount
      };
      console.log(`[WelcomeScreen] Estado local atualizado:`, updated);
      return updated;
    });

    // Salvar no banco de dados
    try {
      const missionColumn = `missao_${missionId}_completed`;
      console.log(`[WelcomeScreen] Salvando no banco: coluna ${missionColumn} = true, total_xp = ${newXp}`);
      
      const { error } = await supabase
        .from('user_progress')
        .update({
          [missionColumn]: true,
          total_xp: newXp,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error(`[WelcomeScreen] Erro ao salvar progresso da missão ${missionId}:`, error);
        // Reverter estado local em caso de erro
        setUserProgress(prev => ({
          total_xp: prev.total_xp - 25,
          completedMissionsCount: prev.completedMissionsCount - 1
        }));
        toast({
          title: "Erro ao salvar progresso",
          description: "Houve um problema ao salvar seu progresso. Tente novamente.",
          variant: "destructive"
        });
      } else {
        console.log(`[WelcomeScreen] ✅ Missão ${missionId} salva com sucesso! Novo XP: ${newXp}`);
      }
    } catch (error) {
      console.error(`[WelcomeScreen] Erro ao atualizar progresso da missão ${missionId}:`, error);
      // Reverter estado local em caso de erro
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

  // Fluxo ao finalizar missão: mostra tela de concluída e libera a próxima após curto atraso
  const handleMissionComplete = (missionId: 1 | 2 | 3 | 4) => {
    console.log(`[WelcomeScreen] Missão ${missionId} completada!`);
    
    // Só atualizar se a missão ainda não foi completada
    if (!completedMissions.has(missionId)) {
      console.log(`[WelcomeScreen] Atualizando progresso da missão ${missionId}`);
      updateProgressOnMissionComplete(missionId);
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
      
      if (missionId < 4) {
        const nextMission = (missionId + 1) as 1 | 2 | 3 | 4;
        console.log(`[WelcomeScreen] Mudando para missão ${nextMission}`);
        setCurrentMission(nextMission);
        setJustCompleted(null);
      } else {
        // Após completar missão 4, limpar justCompleted e mostrar loading
        console.log(`[WelcomeScreen] Todas as missões completadas, carregando resumo do jogo`);
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
          // Carregar progresso do usuário, configurações da missão extra e resposta do fast track
          const [{ data: progress }, { data: gameSettings }, { data: fastTrackResponse }] = await Promise.all([
            supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle(),
            supabase
              .from('game_settings')
              .select('extra_mission_release_date')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('fast_track_terms_responses')
              .select('want_to_participate')
              .eq('user_id', userId)
              .maybeSingle()
          ]);

          // Definir data de liberação da missão extra
          setExtraMissionReleaseDate(gameSettings?.extra_mission_release_date || null);
          
          // Verificar se o usuário recusou participar do fast track
          setUserDeclinedFastTrack(fastTrackResponse?.want_to_participate === false);

          if (progress) {
            // Recalcular total_xp baseado no número real de missões completadas
            // mas preservar o bônus de tempo se existir
            const completedMissionsCount = [
              progress.missao_1_completed,
              progress.missao_2_completed,
              progress.missao_3_completed,
              progress.missao_4_completed
            ].filter(Boolean).length;
            
            const expectedBaseXP = completedMissionsCount * 25;
            const timeBonus = progress.time_bonus_xp || 0;
            const expectedTotalXP = expectedBaseXP + timeBonus;
            
            console.log('[WelcomeScreen] XP Validation:', {
              dbTotalXP: progress.total_xp,
              completedMissions: completedMissionsCount,
              expectedBaseXP,
              timeBonus,
              expectedTotalXP,
              needsCorrection: progress.total_xp !== expectedTotalXP
            });
            
            // Se o XP no banco está incorreto (considerando bônus), corrigir
            if (progress.total_xp !== expectedTotalXP) {
              console.log(`[WelcomeScreen] 🔧 Corrigindo XP incorreto: ${progress.total_xp} → ${expectedTotalXP} (base: ${expectedBaseXP} + bônus: ${timeBonus})`);
              
              // Atualizar no banco de dados
              try {
                await supabase
                  .from('user_progress')
                  .update({ total_xp: expectedTotalXP })
                  .eq('user_id', userId);
                  
                console.log('[WelcomeScreen] ✅ XP corrigido no banco de dados');
              } catch (error) {
                console.error('[WelcomeScreen] ❌ Erro ao corrigir XP no banco:', error);
              }
            }
            
            setUserProgress({ 
              total_xp: expectedTotalXP, // Usar sempre o valor correto incluindo bônus
              completedMissionsCount
            });
            
            // Set completed missions and determine current mission
            const completed = new Set<number>();
            if (progress.missao_1_completed) completed.add(1);
            if (progress.missao_2_completed) completed.add(2);
            if (progress.missao_3_completed) completed.add(3);
            if (progress.missao_4_completed) completed.add(4);
            setCompletedMissions(completed);
            
            // Determine current mission based on completion
            // PRIORIDADE: Só redirecionar para missão extra se o usuário JÁ INTERAGIU com ela
            // Não apenas se tem acesso, mas se realmente começou a missão extra
            if ((progress.missao_5_current_question > 0) || 
                progress.missao_5_completed || 
                (progress.current_position && (
                  progress.current_position.includes('extra_mission_terms') || 
                  progress.current_position.includes('extra_mission_fasttrack') || 
                  progress.current_position.includes('extra_mission_completed') ||
                  progress.current_position.includes('extra_mission_declined')
                ))) {
              console.log('[WelcomeScreen] 🎯 Detectado progresso efetivo na missão extra, restaurando estado');
              setCurrentMission(5);
              setShowExtraMissionScreen(true);
            } else if (!progress.missao_1_completed) {
              setCurrentMission(1);
            } else if (!progress.missao_2_completed) {
              setCurrentMission(2);
            } else if (!progress.missao_3_completed) {
              setCurrentMission(3);
            } else if (!progress.missao_4_completed) {
              setCurrentMission(4);
            } else {
              setCurrentMission(4); // All completed, keep on mission 4 to show completion screen
              // Se todas as missões estão completas, carregar dados do resumo final
              console.log('[WelcomeScreen] All missions completed, loading game summary data on refresh');
              setTimeout(() => {
                loadGameSummaryData();
              }, 500);
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

  // Listen for extra mission event from GameSummaryContent
  useEffect(() => {
    const handleStartExtraMission = () => {
      setCurrentMission(5);
      setShowExtraMissionScreen(true);
    };

    window.addEventListener('startExtraMission', handleStartExtraMission);
    
    return () => {
      window.removeEventListener('startExtraMission', handleStartExtraMission);
    };
  }, []);

  const loadGameSummaryData = async () => {
    try {
      if (!userId) return;

      const [{ data: prog }, { data: prof }] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('profiles').select('nome').eq('user_id', userId).maybeSingle(),
      ]);

      const nome = prof?.nome || userProfile.nome || 'Você';
      console.log('🔍 [WelcomeScreen] Debug nome:', { 
        profNome: prof?.nome, 
        userProfileNome: userProfile.nome, 
        finalNome: nome,
        userId,
        gameDataNome: gameData?.nome
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
      const [r1, r2, r3, r4] = await Promise.all([
        supabase.from('respostas').select('*').eq('user_id', userId).order('id', { ascending: false }),
        supabase.from('respostas_missao2').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('respostas_missao3').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('respostas_missao4').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      // 🔍 DEBUG: Verificar dados brutos das respostas
      console.log('🔍 [RAW DATA DEBUG] Email do usuário:', userProfile.email);
      console.log('🔍 [RAW DATA DEBUG] Responses encontradas:', {
        r1_count: r1.data?.length || 0,
        r2_count: r2.data?.length || 0, 
        r3_count: r3.data?.length || 0,
        r4_count: r4.data?.length || 0,
        r1_data: r1.data,
        r2_data: r2.data,
        r3_data: r3.data
      });

      // Calcular pontuações
      let m1 = 0;
      (r1.data || []).forEach((row: any) => {
        console.log('🎯 [MISSION 1] Processando linha:', { email: row.email, respostas: row.respostas });
        const resp = row.respostas;
        if (Array.isArray(resp)) {
          const pontuacaoMissao1 = resp.reduce((s: number, it: any) => {
            console.log('M1 item:', it, 'pontuacao:', it?.pontuacao || 0);
            return s + (it?.pontuacao || 0);
          }, 0);
          m1 += pontuacaoMissao1;
          console.log('🎯 [MISSION 1] Subtotal:', pontuacaoMissao1);
        } else if (resp && typeof resp === 'object') {
          const arr = (resp as any)?.data || (resp as any);
          if (Array.isArray(arr)) {
            const pontuacaoMissao1 = arr.reduce((s: number, it: any) => {
              console.log('M1 item (objeto):', it, 'pontuacao:', it?.pontuacao || 0);
              return s + (it?.pontuacao || 0);
            }, 0);
            m1 += pontuacaoMissao1;
            console.log('🎯 [MISSION 1] Subtotal (objeto):', pontuacaoMissao1);
          }
        }
      });
      console.log('🎯 [MISSION 1 TOTAL]:', m1);

      let m2 = 0;
      (r2.data || []).forEach((row: any) => {
        console.log('🎯 [MISSION 2] Processando linha:', { email: row.email, respostas: row.respostas });
        const arr = row.respostas;
        if (Array.isArray(arr)) {
          const pontuacaoMissao2 = arr.reduce((s: number, it: any) => {
            console.log('M2 item:', it, 'points:', it?.points || 0);
            return s + (it?.points || 0);
          }, 0);
          m2 += pontuacaoMissao2;
          console.log('🎯 [MISSION 2] Subtotal:', pontuacaoMissao2);
        }
      });
      console.log('🎯 [MISSION 2 TOTAL]:', m2);

      let m3 = 0;
      (r3.data || []).forEach((row: any) => {
        console.log('🎯 [MISSION 3] Processando linha:', { email: row.email, respostas: row.respostas });
        const arr = row.respostas;
        if (Array.isArray(arr)) {
          const pontuacaoMissao3 = arr.reduce((s: number, it: any) => {
            console.log('M3 item:', it, 'points:', it?.points || 0);
            return s + (it?.points || 0);
          }, 0);
          m3 += pontuacaoMissao3;
          console.log('🎯 [MISSION 3] Subtotal:', pontuacaoMissao3);
        }
      });
      console.log('🎯 [MISSION 3 TOTAL]:', m3);

      let m4 = 0;
      (r4.data || []).forEach((row: any) => {
        const respostas = row.respostas;
        if (respostas && respostas.totalScore) {
          m4 += respostas.totalScore;
        }
      });
      console.log('🎯 [MISSION 4 TOTAL (não conta para perfil)]:', m4);

      const score = { mission1: m1, mission2: m2, mission3: m3, mission4: m4, total: parseFloat((m1 + m2 + m3).toFixed(2)) };

      console.log('🎯 [SCORE CALCULATION DEBUG]:', {
        m1, m2, m3, m4,
        totalScore: score.total,
        userId,
        rawResponses: { r1: r1.data?.length, r2: r2.data?.length, r3: r3.data?.length, r4: r4.data?.length },
        'CRITICAL': 'Mission 4 is EXCLUDED from profile calculation'
      });

      // Calcular e salvar perfil final - APENAS com missões 1-3
      const { profile } = getDigitalProfile(score.total);
      
      console.log('🚨 [PROFILE CALCULATION VERIFICATION]:', {
        totalScoreForProfile: score.total,
        calculatedProfile: profile,
        'EXPECTED_FOR_ADRIANO': 'Should be Ninja if score >= 47',
        'ACTUAL_THRESHOLDS': { ninja: 47, proplayer: 34, explorer: 23, beginnerplus: 16 }
      });
      
      console.log('🏅 [PROFILE CALCULATION DEBUG]:', {
        totalScore: score.total,
        calculatedProfile: profile,
        userId
      });
      
      // Buscar dados completos do usuário para calcular XP correto
      const { data: fullUserProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (progressError) {
        console.error('Erro ao buscar progresso completo:', progressError);
        return;
      }
      
      // Calcular game_base_xp corretamente baseado nas missões completadas
      const completedMissionsCount = [
        fullUserProgress.missao_1_completed,
        fullUserProgress.missao_2_completed, 
        fullUserProgress.missao_3_completed,
        fullUserProgress.missao_4_completed
      ].filter(Boolean).length;
      
      const correctGameBaseXP = completedMissionsCount * 25; // 25 XP por missão
      
      console.log('🔍 XP Calculation Debug:', {
        completedMissionsCount,
        correctGameBaseXP,
        currentTotalXP: fullUserProgress.total_xp,
        previousGameBaseXP: fullUserProgress.game_base_xp,
        userId
      });

      // Salvar perfil final e pontuação total na tabela user_progress
      try {
        const { data: updatedProgress, error } = await supabase
          .from('user_progress')
          .update({ 
            final_profile: profile,
            final_score: score.total,
            game_base_xp: correctGameBaseXP // Usar o valor correto ao invés de userProgress.total_xp
          })
          .eq('user_id', userId)
          .select('*')
          .single(); // Retorna o registro atualizado
          
        if (error) {
          console.error('Erro ao salvar perfil final e pontuação:', error);
        } else {
          console.log('✅ Game base XP atualizado para:', correctGameBaseXP);
          console.log('✅ Dados atualizados no banco:', updatedProgress);
          
          // 🚨 SOLUÇÃO DEFINITIVA: Usar dados REAIS do banco após atualização
          setGameData({ 
            nome, 
            xp, 
            medals, 
            score, 
            finalScore: updatedProgress.final_score,     // ← Dados do banco
            final_profile: updatedProgress.final_profile, // ← Dados do banco  
            final_score: updatedProgress.final_score,    // ← Dados do banco
            isDataLoaded: true 
          });
        }
      } catch (error) {
        console.error('Erro ao salvar perfil final e pontuação:', error);
        // Fallback: usar dados calculados se der erro
        setGameData({ 
          nome, 
          xp, 
          medals, 
          score, 
          finalScore: score.total,
          final_profile: profile,
          final_score: score.total,
          isDataLoaded: true 
        });
      }
      
      setIsLoadingProfile(false);
      setShowGameSummary(true);
      
      // 🔥 CRÍTICO: Forçar atualização do hook useExtraMissionState após carregar dados reais
      console.log('🔄 [TRIGGER REFRESH] Forçando refresh do useExtraMissionState com perfil:', profile);
      setExtraMissionRefreshTrigger(prev => prev + 1);
      
      // 🚨 DEBUG: Forçar refresh da página para testar logs
      console.log('🔄 [DEBUG] Profile calculation complete - dados atualizados');
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
                m5: extraMissionState === 'completed',
              }}
              size="md"
              className="pl-2 ml-2 border-l border-border/50"
              showTitle={true}
              medalNames={
                (showGameSummary || (completedMissions.size === 4 && gameData)) && gameData ? (
                  // Na tela final, sempre mostrar 5 medalhas se não for Beginner (incluindo quando declined)
                  getDigitalProfile(gameData.finalScore || 0).profile !== 'Beginner' 
                    ? ["Satélite", "Planeta", "Estrela", "Galáxia", "Universo"]
                    : ["Satélite", "Planeta", "Estrela", "Galáxia"]
                ) : ["Satélite", "Planeta", "Estrela", "Galáxia"]
              }
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
            aria-label="Sair do jogo"
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
                  m5: extraMissionState === 'completed',
                }}
                size="sm"
                className="flex justify-center"
                showTitle={true}
                medalNames={
                  (showGameSummary || (completedMissions.size === 4 && gameData)) && gameData ? (
                    // Na tela final, se perfil não for Beginner, mostrar 5 medalhas
                    getDigitalProfile(gameData.finalScore || 0).profile !== 'Beginner' 
                      ? ["Satélite", "Planeta", "Estrela", "Galáxia", "Universo"]
                      : ["Satélite", "Planeta", "Estrela", "Galáxia"]
                  ) : ["Satélite", "Planeta", "Estrela", "Galáxia"]
                }
              />
            </div>
          </div>
          
          {/* Assistente IA */}
          <div className="flex flex-col items-center">
            <Button
              onClick={() => setShowTutorial(true)}
              className="bg-transparent border-2 border-cyan-400 rounded-full p-1 shadow-none hover:opacity-95 hover:scale-105 hover:border-cyan-300 transition-all duration-300 w-[45px] h-[45px] flex items-center justify-center"
              aria-label="Abrir tutorial e assistente IA"
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
          
          {/* Layout Mobile: Navegação + missão ativa */}
          <div className="block md:hidden h-full flex flex-col">
            {/* Navegação de Missões Mobile */}
            <MobileNavigation
              completedMissions={completedMissions}
              currentMission={currentMission}
              extraMissionState={extraMissionState}
              onMissionSelect={(missionId) => {
                if (missionId === 5) {
                  setCurrentMission(5);
                  setShowExtraMissionScreen(true);
                } else {
                  setCurrentMission(missionId as 1 | 2 | 3 | 4);
                  setShowExtraMissionScreen(false);
                }
              }}
            />
            
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-4 shadow-neon flex-1 overflow-hidden flex flex-col min-h-0">

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
                ) : currentMission === 5 && showExtraMissionScreen ? (
                  <ExtraMissionContent 
                    userName={userProfile.nome}
                    onBack={() => {
                      setExtraMissionRefreshTrigger(prev => prev + 1);
                      setShowExtraMissionScreen(false);
                      setCurrentMission(4);
                    }}
                    onResponseSubmitted={() => {
                      setExtraMissionRefreshTrigger(prev => prev + 1);
                      setShowExtraMissionScreen(false);
                      // Força carregamento do game summary
                      loadGameSummaryData();
                    }}
                  />
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
                  <div className="h-full flex flex-col items-center justify-center space-y-6 p-4" role="status" aria-live="polite">
                    <ProfileLoadingSkeleton />
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" aria-hidden="true"></div>
                      <h4 className="text-lg font-bold text-primary mb-1" data-mission-title="Carregamento do Perfil">
                        Carregando seu Perfil Digital...
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Preparando sua conquista épica!
                      </p>
                    </div>
                  </div>
                ) : showGameSummary || (completedMissions.size === 4 && gameData) || (extraMissionState === 'completed') || (extraMissionState === 'declined') ? (
                      <GameSummaryContent gameData={gameData} userId={userId} onXpUpdate={handleXpUpdate} extraMissionRefreshTrigger={extraMissionRefreshTrigger} />
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
            <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-secondary/50 p-2 shadow-neon">
              {/* Desktop Mission Cards */}
              {(() => {
                // NOVA LÓGICA: Sempre mostrar missão extra se 4 missões completas E perfil não é Beginner
                // Usar o hook extraMissionState que já tem a lógica correta
                const shouldShowExtraMission = completedMissions.size === 4 && extraMissionState !== 'hidden';
                
                console.log('🔥 MISSÃO EXTRA DEBUG - NOVA LÓGICA:', {
                  completedMissions: completedMissions.size,
                  extraMissionState,
                  shouldShowExtraMission,
                  'WILL_SHOW_5_CARDS': shouldShowExtraMission,
                  'CARD_SHOULD_APPEAR': shouldShowExtraMission ? 'SIM - 5 CARDS' : 'NÃO - 4 CARDS'
                });
                
                const missions = shouldShowExtraMission ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
                const gridCols = shouldShowExtraMission ? 'grid-cols-5' : 'grid-cols-4';
                
                return (
                  <div className={`grid ${gridCols} gap-4`}>
                    {missions.map((missionId) => {
                  const isCompleted = completedMissions.has(missionId);
                  const isCurrent = currentMission === missionId;
                  const isExtraMission = missionId === 5;
                  const isExtraMissionAvailable = extraMissionState === 'available';
                  const isLocked = isExtraMission 
                    ? !isExtraMissionAvailable // Missão extra bloqueada se não disponível
                    : missionId !== currentMission; // Só permitir clique na missão atual
                  
                  return (
                     <div
                      key={missionId}
                         className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                          isExtraMission
                            ? (extraMissionState === 'declined'
                                ? 'bg-muted/20 border-muted-foreground/20 opacity-70 cursor-not-allowed' 
                                : isExtraMissionAvailable 
                                  ? 'bg-cyan-500/20 border-cyan-400 hover:border-cyan-300 shadow-lg shadow-cyan-400/30 animate-pulse hover:scale-105 cursor-pointer' 
                                  : 'bg-muted/30 border-muted-foreground/30 opacity-60 cursor-not-allowed')
                            : isCompleted
                           ? 'bg-primary/20 border-primary shadow-sm opacity-70 cursor-not-allowed'
                           : isCurrent
                           ? 'bg-accent/20 border-accent shadow-sm hover:border-accent/80 ring-2 ring-accent/30 cursor-pointer hover:scale-105'
                           : isLocked
                           ? 'bg-muted/30 border-muted-foreground/30 opacity-60 cursor-not-allowed'
                           : 'bg-card border-secondary/50 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => {
                        // Só permitir clique na missão atual ou missão extra disponível
                        if (isExtraMission && extraMissionState === 'available') {
                          setCurrentMission(5);
                          setShowExtraMissionScreen(true);
                        } else if (missionId === currentMission && !isExtraMission) {
                          // Só permite navegar para a missão atual
                          setCurrentMission(missionId as 1 | 2 | 3 | 4);
                        }
                        // Bloquear todos os outros cliques
                      }}
                    >
                       <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                           isExtraMission 
                            ? extraMissionState === 'declined'
                              ? 'bg-muted-foreground/30' // Estado 3: Fim de Jogo - mais cinza
                               : isExtraMissionAvailable 
                                 ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' // Estado 2: Liberada
                                 : extraMissionState === 'completed'
                                   ? 'bg-primary' // Estado 4: Completada
                                   : 'bg-blue-400/30' // Estado 1: Bloqueada
                            : isCompleted ? 'bg-primary' : isCurrent ? 'bg-accent' : isLocked ? 'bg-muted-foreground/50' : 'bg-muted'
                        }`}></div>
                        <div className={`text-sm font-bold tracking-wider mb-2 ${
                           isExtraMission 
                             ? extraMissionState === 'declined'
                               ? 'text-muted-foreground/50' // Estado 3: Fim de Jogo - mais cinza
                               : isExtraMissionAvailable 
                                 ? 'text-cyan-300' // Estado 2: Liberada
                                 : extraMissionState === 'completed'
                                   ? 'text-primary' // Estado 4: Completada
                                   : 'text-blue-300/60' // Estado 1: Bloqueada
                             : isCompleted ? 'text-primary' : isCurrent ? 'text-accent' : isLocked ? 'text-muted-foreground/70' : 'text-foreground'
                         }`}>
                           {/* Combinar nome e título da missão */}
                           {isExtraMission ? (
                             <span>
                               MISSÃO EXTRA: {extraMissionReleaseDate && (() => {
                                 if (extraMissionState === 'declined') {
                                   return "Fim de Jogo";
                                 }
                                 if (extraMissionState === 'completed') {
                                   return "Missão Finalizada com Sucesso";
                                 }
                                 if (extraMissionState === 'available') {
                                   return "Missão Liberada";
                                 }
                                 const releaseDate = new Date(extraMissionReleaseDate + 'T00:00:00');
                                 return `Missão Bloqueada Até: ${releaseDate.toLocaleDateString('pt-BR')}`;
                               })()}
                             </span>
                           ) : (
                             <span>
                               MISSÃO {missionId}: {
                                 missionId === 1 && "Como você encara o digital?"
                               }{
                                 missionId === 2 && "O digital no seu dia a dia"
                               }{
                                 missionId === 3 && "Quando o desafio é maior"
                               }{
                                 missionId === 4 && "Seu Radar de Ferramentas"
                               }
                             </span>
                           )}
                         </div>
                       </div>
                      
                       <div className={`text-xs mb-2 ${
                         isExtraMission 
                            ? extraMissionState === 'declined'
                              ? 'text-muted-foreground/40' // Estado 3: Fim de Jogo - mais cinza
                              : isExtraMissionAvailable 
                                ? 'text-cyan-200 font-semibold' // Estado 2: Liberada
                                : extraMissionState === 'completed'
                                  ? 'text-primary' // Estado 4: Completada
                                  : 'text-blue-300/50' // Estado 1: Bloqueada
                           : isCompleted ? 'text-primary' : isCurrent ? 'text-accent' : 'text-muted-foreground'
                       }`}>
                        {isExtraMission ? 'Aliança Digital' : 'Vale 25 XP'}
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="w-full bg-muted/30 rounded-full h-2">
                         <div
                           className={`h-2 rounded-full transition-all duration-500 ${
                             isExtraMission 
                               ? userDeclinedFastTrack 
                                 ? 'bg-muted-foreground/30 w-full' // Estado 3: Fim de Jogo
                                  : isExtraMissionAvailable 
                                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 w-full shadow-lg shadow-blue-400/50' // Estado 2: Liberada
                                    : extraMissionState === 'completed'
                                      ? 'bg-primary w-full' // Estado 4: Completada
                                      : 'bg-blue-400/30 w-0' // Estado 1: Bloqueada
                               : isCompleted ? 'bg-primary w-full' : isCurrent ? 'bg-accent w-1/2' : 'bg-muted w-0'
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
                       ) : (isLocked || (isExtraMission && extraMissionState === 'hidden')) ? (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-muted-foreground/50 rounded-full flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-muted-foreground/70" />
                        </div>
                       ) : isExtraMission && extraMissionState !== 'hidden' ? (
                        <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center shadow-lg ${
                           extraMissionState === 'declined'
                             ? 'bg-muted-foreground/50' // Estado 3: Fim de Jogo
                             : isExtraMissionAvailable 
                               ? 'bg-cyan-400 shadow-cyan-400/50 animate-pulse' // Estado 2: Liberada (com pulse)
                               : extraMissionState === 'completed'
                                 ? 'bg-primary shadow-primary/50' // Estado 4: Completada
                                 : 'bg-blue-400/30' // Estado 1: Bloqueada (sem pulse)
                        }`}>
                          {extraMissionState === 'declined' ? (
                            <svg className="w-2.5 h-2.5 text-muted-foreground/70" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          ) : isExtraMissionAvailable ? (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <Lock className="w-2.5 h-2.5 text-blue-300/70" />
                          )}
                        </div>
                       ) : null}
                    </div>
                  );
                })}
                  </div>
                );
              })()}
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
                            {justCompleted === 1 && "Missão 1 concluída! +25 XP"}
                            {justCompleted === 2 && "Missão 2 concluída! +25 XP"}
                            {justCompleted === 3 && "Missão 3 concluída! +25 XP"}
                            {justCompleted === 4 && "Missão 4 concluída! +25 XP"}
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
                      <div className="h-full flex flex-col items-center justify-center space-y-6 p-4" role="status" aria-live="polite">
                        <MissionLoadingSkeleton />
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" aria-hidden="true"></div>
                          <h4 className="text-lg font-bold text-primary mb-1" data-mission-title="Carregamento do Perfil">
                            Carregando seu Perfil Digital...
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Preparando sua conquista épica!
                          </p>
                        </div>
                      </div>
                 ) : showExtraMissionScreen && currentMission === 5 ? (
                      <ExtraMissionContent 
                        userName={userProfile.nome}
                      onBack={() => {
                        console.log('🔥 [WelcomeScreen] ExtraMissionContent onBack called');
                        setShowExtraMissionScreen(false);
                        setCurrentMission(1);
                      }}
                        onDeclineShown={(declined) => {
                          setIsGameEnded(declined);
                          setUserDeclinedFastTrack(declined);
                        }}
                        onResponseSubmitted={() => {
                          setExtraMissionRefreshTrigger(prev => prev + 1);
                        }}
                      />
                    ) : showGameSummary || (completedMissions.size === 4 && gameData) ? (
                       <GameSummaryContent gameData={gameData} userId={userId} onXpUpdate={handleXpUpdate} extraMissionRefreshTrigger={extraMissionRefreshTrigger} />
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
                   {currentMission === 1 && "MISSÃO 1: Como você encara o digital?"}
                   {currentMission === 2 && "MISSÃO 2: O digital no seu dia a dia"}
                   {currentMission === 3 && "MISSÃO 3: Quando o desafio é maior"}
                   {currentMission === 4 && "MISSÃO 4: Seu Radar de Ferramentas"}
                   {currentMission === 5 && "MISSÃO EXTRA: Aliança Digital"}
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
                          {justCompleted === 1 && "Missão 1 concluída! +25 XP"}
                          {justCompleted === 2 && "Missão 2 concluída! +25 XP"}
                          {justCompleted === 3 && "Missão 3 concluída! +25 XP"}
                          {justCompleted === 4 && "Missão 4 concluída! +25 XP"}
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
                   ) : showExtraMissionScreen && currentMission === 5 ? (
                    <ExtraMissionContent 
                      userName={userProfile.nome}
                      onBack={() => {
                        console.log('🔥 [WelcomeScreen] ExtraMissionContent onBack called');
                        setShowExtraMissionScreen(false);
                        setCurrentMission(1);
                      }}
                      onDeclineShown={(declined) => {
                        console.log('Setting userDeclinedFastTrack to:', declined);
                        setUserDeclinedFastTrack(declined);
                        setIsGameEnded(declined);
                      }}
                       onResponseSubmitted={() => {
                         setExtraMissionRefreshTrigger(prev => prev + 1);
                       }}
                    />
                  ) : isLoadingProfile ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 p-4" role="status" aria-live="polite">
                      <ProfileLoadingSkeleton />
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" aria-hidden="true"></div>
                        <h4 className="text-lg font-bold text-primary mb-1" data-mission-title="Carregamento do Perfil">
                          Carregando seu Perfil Digital...
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Preparando sua conquista épica!
                        </p>
                      </div>
                    </div>
                  ) : showGameSummary || (completedMissions.size === 4 && gameData) ? (
                    <GameSummaryContent gameData={gameData} userId={userId} onXpUpdate={handleXpUpdate} extraMissionRefreshTrigger={extraMissionRefreshTrigger} />
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
            console.log('✅ [WelcomeScreen] User clicked "Don\'t show again" - marking tutorial as seen');
            localStorage.setItem('tutorialSeen', 'true');
            setShowTutorial(false);
          }}
        />
      )}


    </>
  );
};

// Internal Game Summary Component with Bonus System
const GameSummaryContent = ({ gameData, userId, onXpUpdate, extraMissionRefreshTrigger }: { gameData: any; userId: string; onXpUpdate?: (newXp: number) => void; extraMissionRefreshTrigger?: number }) => {
  console.log('🔍 [GameSummaryContent] RAW gameData received:', {
    final_score: gameData.final_score,
    finalScore: gameData.finalScore,
    final_profile: gameData.final_profile
  });
  
  // 🚨 SOLUÇÃO: Usar dados já salvos no banco diretamente
  const finalScore = gameData.final_score || gameData.finalScore || 0;
  const finalProfile = gameData.final_profile;
  
  // Se temos perfil no banco, usar ele; senão calcular como fallback
  const profile = finalProfile ? 
    { profile: finalProfile, sublevel: getDigitalProfile(finalScore).sublevel } : 
    getDigitalProfile(finalScore);
    
  console.log('🎯 [GameSummaryContent] FINAL DECISION:', { 
    finalScore,
    finalProfile,
    profile_used: profile.profile,
    usingBankProfile: !!finalProfile,
    SOURCE: finalProfile ? 'DATABASE' : 'CALCULATED'
  });
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
  
  // Use extra mission hook with correct profile  
  const { state: gameSummaryExtraMissionState, releaseDate: extraMissionReleaseDate } = useExtraMissionState(userId, profile.profile, extraMissionRefreshTrigger);
  
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

      // CALCULATE CORRECT BONUS FOR COMPLETED USERS WITHOUT BONUS
      if (
        prog.missao_1_completed && 
        prog.missao_2_completed && 
        prog.missao_3_completed && 
        prog.missao_4_completed && 
        (!prog.time_bonus_xp || prog.time_bonus_xp === 0)
      ) {
        console.log('🎯 [GameSummaryContent] CALCULATING BONUS - All missions complete but no bonus applied!');
        
        // Import the bonus calculation function
        const { calculateTimeBonus } = await import('@/lib/bonusCalculation');
        const bonusResult = await calculateTimeBonus(prog.updated_at || prog.created_at);
        
        if (!bonusResult) {
          console.log('❌ [GameSummaryContent] Could not calculate bonus');
          return;
        }
        
        const bonus = bonusResult.expectedBonus;
        const baseXP = prog.game_base_xp || 0;
        const newTotalXp = baseXP + bonus;
        
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
        
        // Show final screen immediately with bonus applied
        setShowFinalScreen(true);
        console.log('✅ [GameSummaryContent] Bonus applied, showing final screen directly');
        
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
  
  // Check if extra mission should be shown (this component only renders in final screen)
  const shouldShowExtraMission = () => {
    return gameSummaryExtraMissionState !== 'hidden';
  };

  // Get mission display text based on state
  const getExtraMissionDisplay = () => {
    switch (gameSummaryExtraMissionState) {
      case 'completed':
        return { title: 'Missão Finalizada com Sucesso', icon: '🌟', isClickable: false, shouldPulse: false };
      case 'available':
        return { title: 'Missão Extra', icon: '🎯', isClickable: true, shouldPulse: true };
      case 'blocked':
        return { 
          title: `Missão Bloqueada até ${extraMissionReleaseDate ? new Date(extraMissionReleaseDate).toLocaleDateString('pt-BR') : ''}`, 
          icon: '🔒', 
          isClickable: false, 
          shouldPulse: false 
        };
      case 'declined':
        return { title: 'Missão Recusada', icon: '❌', isClickable: false, shouldPulse: false };
      default:
        return { title: 'Missão Extra', icon: '🎯', isClickable: false, shouldPulse: false };
    }
  };

  // Navigate to extra mission
  const handleExtraMissionClick = () => {
    // This will trigger the parent component to show the extra mission
    window.dispatchEvent(new CustomEvent('startExtraMission'));
  };
  
  console.log('🎯 [GameSummary] DEBUG - USING CORRECT FINAL SCORE:', { 
    finalScore: gameData.finalScore, 
    scoreTotal: gameData.score.total,
    profile: profile.profile, 
    sublevel: profile.sublevel, 
    phrase,
    currentXp,
    timeBonus,
    shouldShowExtra: shouldShowExtraMission(),
    extraMissionState: gameSummaryExtraMissionState,
    extraMissionReleaseDate,
    IMPORTANT: 'Profile calculated from finalScore, not score.total'
  });

  const achievementNames = ["Satélite", "Planeta", "Estrela", "Galáxia"];
  const achievements = [
    { id: 1, title: achievementNames[0], done: gameData.medals.m1 },
    { id: 2, title: achievementNames[1], done: gameData.medals.m2 },
    { id: 3, title: achievementNames[2], done: gameData.medals.m3 },
    { id: 4, title: achievementNames[3], done: gameData.medals.m4 },
  ];

  // Add extra medal for non-Beginner profiles - sempre mostrar como não conquistada quando declined
  const isNonBeginner = profile.profile !== 'Beginner';
  const achievementsWithExtra = isNonBeginner 
    ? [...achievements, { id: 5, title: "Universo", done: gameSummaryExtraMissionState === 'completed' }]
    : achievements;

  return (
    <>

      <ScrollArea className="h-full">
        {!showBonusScreen && showFinalScreen && (
          <div className="p-4 space-y-6">

            {/* Profile Card */}
            <ProfileHeroCard
              profile={profile.profile} 
              sublevel={profile.sublevel}
              phrase={phrase}
              userName={gameData.nome}
              medals={achievementsWithExtra}
              xp={currentXp}
              totalScore={gameData.finalScore}
              timeBonus={timeBonus}
              className="max-w-none"
              userId={userId}
              refreshTrigger={extraMissionRefreshTrigger}
            />

            {/* Spacer for better layout */}
            <div className="h-4"></div>

            {/* Technical Skills Section */}
            <TechnicalSkillsDisplay userId={userId} />

          </div>
        )}
      </ScrollArea>

    </>
  );
};
