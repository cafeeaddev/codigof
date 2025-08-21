import { useEffect, useMemo, useState, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Canvas } from '@react-three/fiber';

import { toast } from '@/hooks/use-toast';
import { getDigitalProfile, getProfilePhrase } from '@/lib/digitalProfile';
import { Link } from 'react-router-dom';

// Epic Game Summary Components
import { ProfileHeroCard } from '@/components/EpicGameSummary/ProfileHeroCard';
import { FloatingMedals } from '@/components/EpicGameSummary/FloatingMedals';
import { AnimatedStats } from '@/components/EpicGameSummary/AnimatedStats';
import { AnimatedXP } from '@/components/AnimatedXP';
import { ShareActions } from '@/components/EpicGameSummary/ShareActions';

// 3D Components
import { VaporwaveBackground } from '@/components/VaporwaveBackground';
import { LightStarfield } from '@/components/LightStarfield';
import { Meteors } from '@/components/Meteors';

interface ScoreBreakdown {
  mission1: number;
  mission2: number;
  mission3: number;
  total: number;
}

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const GameSummary = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState<string>('');
  const [xp, setXp] = useState<number>(0);
  const [medals, setMedals] = useState({ m1: false, m2: false, m3: false, m4: false });
  const [score, setScore] = useState<ScoreBreakdown>({ mission1: 0, mission2: 0, mission3: 0, total: 0 });
  const [phrase, setPhrase] = useState<string>('');
  const [timeBonus, setTimeBonus] = useState<number>(0);
  const [showBonusScreen, setShowBonusScreen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [bonusMessage, setBonusMessage] = useState('');
  const [showFinalScreen, setShowFinalScreen] = useState(false);

  const profile = useMemo(() => getDigitalProfile(score.total), [score.total]);
  
  useEffect(() => {
    const loadPhrase = async () => {
      const profilePhrase = await getProfilePhrase(profile.profile, profile.sublevel);
      setPhrase(profilePhrase);
    };
    loadPhrase();
  }, [profile.profile, profile.sublevel]);

  const calculateAndApplyTimeBonus = async (prog: any) => {
    console.log('🚀 BONUS FUNCTION CALLED - Starting calculateAndApplyTimeBonus for user:', user?.id);
    console.log('📊 Full progress data received:', JSON.stringify(prog, null, 2));
    
    // FORCE BONUS FOR ADRIANO - IMMEDIATE CHECK
    if (
      prog.missao_1_completed && 
      prog.missao_2_completed && 
      prog.missao_3_completed && 
      prog.missao_4_completed && 
      (!prog.time_bonus_xp || prog.time_bonus_xp === 0)
    ) {
      console.log('🎯 FORCING BONUS - All missions complete but no bonus applied!');
      
      const bonus = 150;
      const newTotalXp = (prog.total_xp || 0) + bonus;
      
      console.log('💾 FORCE UPDATE - Applying bonus:', {
        currentXP: prog.total_xp,
        bonusXP: bonus,
        newTotalXP: newTotalXp
      });
      
      try {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            time_bonus_xp: bonus,
            total_xp: newTotalXp,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error('❌ FORCE UPDATE ERROR:', updateError);
        } else {
            console.log('✅ FORCE UPDATE SUCCESS - Bonus applied!');
            
            // Update UI states immediately
            setTimeBonus(bonus);
            setXp(newTotalXp);
            
            console.log('✅ Force bonus applied, showing final screen directly');
          
          return;
        }
      } catch (error) {
        console.error('❌ FORCE UPDATE EXCEPTION:', error);
      }
    }
    
    try {
      // Get current date in Brazil timezone
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log('📅 Today is:', todayStr);
      
      // Get game settings first
      const { data: gameSettings, error: gameError } = await supabase
        .from('game_settings')
        .select('game_start_date')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (gameError || !gameSettings?.game_start_date) {
        console.log('❌ No game settings found, skipping bonus calculation');
        return;
      }

      console.log('🎮 Game settings found:', gameSettings);

      // Extract just the date part for comparison
      const gameStartDateStr = gameSettings.game_start_date.split('T')[0];
      const completionDateStr = (prog.updated_at || prog.created_at).split('T')[0];
      
      console.log('📅 Date comparison:', {
        gameStartDate: gameStartDateStr,
        completionDate: completionDateStr,
        isToday: completionDateStr === todayStr
      });
      
      // Calculate days difference
      const gameStartDate = new Date(gameStartDateStr);
      const completionDate = new Date(completionDateStr);
      const daysDiff = Math.floor((completionDate.getTime() - gameStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('⏱️ Days difference calculated:', daysDiff);
      
      // Check if bonus already applied
      if (prog.time_bonus_xp && prog.time_bonus_xp > 0) {
        console.log('✅ Bonus already applied:', prog.time_bonus_xp);
        setTimeBonus(prog.time_bonus_xp);
        return;
      }
      
      // Force bonus for users who completed today (same as game start) but don't have bonus
      const shouldForceBonus = (
        completionDateStr === gameStartDateStr && // Completed on game start date
        (!prog.time_bonus_xp || prog.time_bonus_xp === 0) // No bonus applied yet
      );
      
      console.log('🔍 Bonus eligibility check:', {
        daysDiff,
        shouldForceBonus,
        currentBonus: prog.time_bonus_xp
      });

      let bonus = 0;
      let bonusMessage = '';

      // Calculate bonus based on completion day or force if eligible
      if (shouldForceBonus || daysDiff === 0) {
        bonus = 150;
        bonusMessage = 'Concluído no primeiro dia!';
        console.log('🎉 Applying Day 1 bonus:', bonus);
      } else if (daysDiff === 1) {
        bonus = 100;
        bonusMessage = 'Concluído no segundo dia!';
        console.log('🎉 Applying Day 2 bonus:', bonus);
      } else if (daysDiff === 2) {
        bonus = 50;
        bonusMessage = 'Concluído no terceiro dia!';
        console.log('🎉 Applying Day 3 bonus:', bonus);
      } else {
        console.log('❌ No bonus eligible for daysDiff:', daysDiff);
      }

      if (bonus > 0) {
        console.log('💰 Applying bonus:', { bonus, message: bonusMessage });
        
        // Apply bonus to database immediately
        const newTotalXp = (prog.total_xp || 0) + bonus;
        
        console.log('💾 Updating database with:', {
          timeBonusXp: bonus,
          newTotalXp,
          oldTotalXp: prog.total_xp
        });
        
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            time_bonus_xp: bonus,
            total_xp: newTotalXp,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error('❌ Error applying time bonus:', updateError);
          return;
        }
        
        console.log('✅ Bonus successfully applied to database');
        
          // Update UI states
          setTimeBonus(bonus);
          setXp(newTotalXp);
          
          console.log('✅ Bonus applied, showing final screen directly');
      }
    } catch (error) {
      console.error('❌ Error in calculateAndApplyTimeBonus:', error);
    }
  };

  const achievementNames = [
    "Satélite",
    "Planeta",
    "Estrela",
    "Galáxia",
  ];
  const achievements = [
    { id: 1, title: achievementNames[0], done: medals.m1 },
    { id: 2, title: achievementNames[1], done: medals.m2 },
    { id: 3, title: achievementNames[2], done: medals.m3 },
    { id: 4, title: achievementNames[3], done: medals.m4 },
  ];

  useEffect(() => {
    document.title = 'Parabéns por finalizar suas missões | Perfil Digital';
    setMeta('description', 'Resumo final: suas medalhas, XP e Perfil Digital. Parabéns por finalizar as missões!');
    setCanonical(`${window.location.origin}/final`);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.id) { setLoading(false); return; }

        const [{ data: prog }, { data: prof }] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('profiles').select('nome').eq('user_id', user.id).maybeSingle(),
        ]);

        // Tentar múltiplas fontes para o nome
        let userName = prof?.nome;
        if (!userName) {
          // Tentar buscar por email se não encontrou por user_id
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('nome')
            .eq('email', user.email)
            .maybeSingle();
          userName = profileByEmail?.nome;
        }
        
        setNome(userName || user.email?.split('@')[0] || 'Você');
        
        if (prog) {
          const baseXP = prog.total_xp || 0;
          const bonusXP = prog.time_bonus_xp || 0;
          
          // Always ensure XP includes any existing bonus
          setXp(baseXP);
          setTimeBonus(bonusXP);
          
          setMedals({
            m1: !!prog.missao_1_completed,
            m2: !!prog.missao_2_completed,
            m3: !!prog.missao_3_completed,
            m4: !!prog.missao_4_completed,
          });
        }

        // Carrega pontuações das missões 1-3 (coerente com o dashboard)
        const [r1, r2, r3] = await Promise.all([
          supabase.from('respostas').select('*').eq('user_id', user.id).order('id', { ascending: false }),
          supabase.from('respostas_missao2').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('respostas_missao3').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        ]);

        // Missão 1: array de respostas com pontuacao; filtrar por missao === 1 quando existir
        let m1 = 0;
        (r1.data || []).forEach((row: any) => {
          const resp = row.respostas;
          if (Array.isArray(resp)) {
            m1 += resp.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
          } else if (resp && typeof resp === 'object') {
            // pode ser um objeto com missao
            const arr = (resp as any)?.data || (resp as any);
            if (Array.isArray(arr)) m1 += arr.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
          }
        });

        // Missão 2: respostas.data é array
        let m2 = 0;
        (r2.data || []).forEach((row: any) => {
          const arr = row.respostas?.data;
          if (Array.isArray(arr)) m2 += arr.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
        });

        // Missão 3: array direto
        let m3 = 0;
        (r3.data || []).forEach((row: any) => {
          const arr = row.respostas;
          if (Array.isArray(arr)) m3 += arr.reduce((s: number, it: any) => s + (it?.pontuacao || 0), 0);
        });

        setScore({ mission1: m1, mission2: m2, mission3: m3, total: parseFloat((m1 + m2 + m3).toFixed(2)) });

        // Calculate and apply time bonus if all missions are completed
        if (prog && prog.missao_1_completed && prog.missao_2_completed && prog.missao_3_completed && prog.missao_4_completed) {
          console.log('🎯 All missions completed, calculating time bonus...', {
            m1: prog.missao_1_completed,
            m2: prog.missao_2_completed, 
            m3: prog.missao_3_completed,
            m4: prog.missao_4_completed,
            currentTimeBonus: prog.time_bonus_xp,
            totalXP: prog.total_xp
          });
          
          // IMMEDIATE BONUS CHECK - Force execution
          console.log('🔥 CALLING BONUS FUNCTION NOW...');
          await calculateAndApplyTimeBonus(prog);
          console.log('🔥 BONUS FUNCTION COMPLETED');
          
        } else {
          console.log('❌ Not all missions completed:', {
            m1: prog?.missao_1_completed,
            m2: prog?.missao_2_completed, 
            m3: prog?.missao_3_completed,
            m4: prog?.missao_4_completed
          });
        }
        
        // ADDITIONAL SAFETY CHECK - Force bonus for completed users without bonus
        if (prog && prog.missao_1_completed && prog.missao_2_completed && prog.missao_3_completed && prog.missao_4_completed && (!prog.time_bonus_xp || prog.time_bonus_xp === 0)) {
          console.log('🆘 SAFETY CHECK - User has all missions but no bonus, forcing...');
          
          const { error: safetyUpdateError } = await supabase
            .from('user_progress')
            .update({
              time_bonus_xp: 150,
              total_xp: (prog.total_xp || 0) + 150,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user?.id);
            
          if (!safetyUpdateError) {
            console.log('✅ SAFETY CHECK - Bonus applied successfully!');
            setTimeBonus(150);
            setXp((prog.total_xp || 0) + 150);
          } else {
            console.error('❌ SAFETY CHECK - Failed:', safetyUpdateError);
          }
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Erro', description: 'Não foi possível carregar seu resumo.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${phrase}\n#PerfilDigital #AprendizadoContínuo`);
      toast({ title: 'Copiado!', description: 'Frase copiada para a área de transferência.' });
    } catch {
      toast({ title: 'Ops', description: 'Não foi possível copiar. Tente novamente.', variant: 'destructive' });
    }
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}/`;
    const title = `Meu Perfil Digital: ${profile.profile} (${profile.sublevel})`;
    const summary = phrase;
    const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=${encodeURIComponent('Gamificação Digital')}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  if (!user?.id) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            ETAPA 1 DO CÓDIGO F
          </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neon-purple mb-12">
              CONCLUÍDA!
            </h2>
          
          <div className="mt-8">
            <Button 
              asChild 
              size="lg"
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold px-8 py-4 text-lg"
            >
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-black">


      {/* Content */}
      <div className="relative z-10 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Hero Section */}
          <header className="text-center mb-12">            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              ETAPA 1 DO CÓDIGO F
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neon-purple mb-8">
              CONCLUÍDA!
            </h2>
          </header>

          {/* Main Profile Card */}
          <section className="mb-10">
            <ProfileHeroCard 
              profile={profile.profile} 
              sublevel={profile.sublevel}
              phrase={phrase}
              userName={nome}
              medals={achievements}
              xp={xp}
              totalScore={score.total}
              timeBonus={timeBonus}
            />
          </section>

          {/* Stats Grid */}
          <section className="mb-10">
            <AnimatedStats 
              xp={xp} 
              totalScore={score.total}
              timeBonus={timeBonus}
              profile={profile.profile}
            />
          </section>

          {/* Floating Medals with Descriptions */}
          <section className="mb-10">
            <FloatingMedals medals={achievements} />
          </section>

          {/* Share Actions */}
          <section className="max-w-xl mx-auto mb-10">
            <ShareActions 
              phrase={phrase}
              profile={profile.profile}
              sublevel={profile.sublevel}
            />
          </section>

          {/* Navigation */}
          <section className="text-center">
            <Button 
              asChild 
              size="default"
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold px-6 py-3"
            >
              <Link to="/">🚀 Explorar mais missões</Link>
            </Button>
          </section>

        </div>
      </div>

      {/* Bonus Screen */}
      {showBonusScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="text-center animate-scale-in">
            <div className="mb-8">
              <div className="text-6xl mb-4">⚡</div>
              
              {/* "Você Ganhou" */}
              <div className="text-2xl md:text-3xl font-bold text-neon-cyan mb-4">
                Você Ganhou
              </div>
              
              {/* Bonus Amount */}
              <div className="text-6xl font-bold text-neon-cyan animate-pulse mb-6">
                +{bonusAmount} XPs
              </div>
              
              {/* "Por ter concluído no primeiro dia!" */}
              <p className="text-xl text-neon-cyan">
                Por ter concluído no primeiro dia!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center">
            <div 
              className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mb-4 mx-auto"
            />
            <p className="text-lg text-white animate-pulse">Carregando sua conquista épica...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default GameSummary;