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
import { CelebrationParticles } from '@/components/EpicGameSummary/CelebrationParticles';
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

  const profile = useMemo(() => getDigitalProfile(score.total), [score.total]);
  
  useEffect(() => {
    const loadPhrase = async () => {
      const profilePhrase = await getProfilePhrase(profile.profile, profile.sublevel);
      setPhrase(profilePhrase);
    };
    loadPhrase();
  }, [profile.profile, profile.sublevel]);

  const calculateAndApplyTimeBonus = async (prog: any) => {
    try {
      // Check if bonus has already been applied
      if (prog.time_bonus_xp && prog.time_bonus_xp > 0) {
        setTimeBonus(prog.time_bonus_xp);
        return;
      }

      // Get game settings
      const { data: gameSettings, error: gameError } = await supabase
        .from('game_settings')
        .select('game_start_date')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (gameError || !gameSettings?.game_start_date) {
        console.log('No game settings found, skipping bonus calculation');
        return;
      }

      // Calculate days between game start and completion
      const gameStart = new Date(gameSettings.game_start_date);
      const completionDate = new Date(prog.updated_at || prog.created_at);
      const daysDiff = Math.floor((completionDate.getTime() - gameStart.getTime()) / (1000 * 60 * 60 * 24));

      let bonus = 0;
      let bonusMessage = '';

      // Calculate bonus based on completion day
      if (daysDiff === 0) {
        bonus = 150;
        bonusMessage = 'Concluído no primeiro dia!';
      } else if (daysDiff === 1) {
        bonus = 100;
        bonusMessage = 'Concluído no segundo dia!';
      } else if (daysDiff === 2) {
        bonus = 50;
        bonusMessage = 'Concluído no terceiro dia!';
      }

      if (bonus > 0) {
        // Apply bonus to user progress
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            time_bonus_xp: bonus,
            total_xp: (prog.total_xp || 0) + bonus,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error('Error applying time bonus:', updateError);
        } else {
          setTimeBonus(bonus);
          setXp((prev) => prev + bonus);
          toast({
            title: `🎉 Bônus de Tempo: ${bonus} XP!`,
            description: bonusMessage,
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error calculating time bonus:', error);
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
          setXp(prog.total_xp || 0);
          setTimeBonus(prog.time_bonus_xp || 0);
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
        if (prog && prog.missao_1_completed && prog.missao_2_completed && prog.missao_3_completed) {
          await calculateAndApplyTimeBonus(prog);
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