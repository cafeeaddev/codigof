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

  const profile = useMemo(() => getDigitalProfile(score.total), [score.total]);
  const phrase = useMemo(() => getProfilePhrase(profile.profile, profile.sublevel), [profile]);

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

        setNome(prof?.nome || 'Você');
        if (prog) {
          setXp(prog.total_xp || 0);
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
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <VaporwaveBackground />
            <LightStarfield count={300} />
            <ambientLight intensity={0.3} />
          </Canvas>
        </div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-6 animate-holographic">Resumo Final</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Você precisa estar logado para ver seu resumo do jogo.
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-primary hover:bg-primary/80 text-primary-foreground animate-pulse-glow"
          >
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D Vaporwave Background */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 2, 8], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <VaporwaveBackground />
            <LightStarfield count={500} />
            <Meteors count={8} spawnRate={0.02} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
          </Suspense>
        </Canvas>
      </div>

      {/* Celebration Particles */}
      <CelebrationParticles />

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          
          {/* Hero Section with User Name */}
          <header className="text-center mb-12">
            <h1 
              className="text-6xl md:text-8xl font-bold mb-4 animate-holographic"
              style={{ 
                background: 'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {nome}
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground animate-epic-entry">
              Missões Completas! 🎉
            </p>
          </header>

          {/* Floating Medals */}
          <section className="mb-16">
            <FloatingMedals medals={achievements} />
          </section>

          {/* Main Profile Card */}
          <section className="mb-12">
            <ProfileHeroCard 
              profile={profile.profile} 
              sublevel={profile.sublevel}
              phrase={phrase}
            />
          </section>

          {/* Stats Grid */}
          <section className="mb-12">
            <AnimatedStats 
              xp={xp} 
              totalScore={score.total}
              profile={profile.profile}
            />
          </section>

          {/* Share Actions */}
          <section className="max-w-2xl mx-auto mb-12">
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
              variant="outline" 
              size="lg"
              className="animate-epic-entry border-2 border-primary/50 hover:border-primary hover:bg-primary/10"
              style={{ animationDelay: '1.5s' }}
            >
              <Link to="/">🚀 Explorar mais missões</Link>
            </Button>
          </section>

        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <div 
              className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4 mx-auto"
            />
            <p className="text-lg animate-pulse">Carregando sua conquista épica...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default GameSummary;
