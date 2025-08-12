import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import UserHeader from '@/components/UserHeader';
import { AchievementList } from '@/components/Achievements';
import { toast } from '@/hooks/use-toast';
import { getDigitalProfile, getProfilePhrase } from '@/lib/digitalProfile';
import { Link } from 'react-router-dom';

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
    "Explorador do digital",
    "Navegante do cotidiano digital",
    "Superador de desafios",
    "Conhecedor de ferramentas",
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
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Resumo Final</h1>
        </header>
        <p className="text-muted-foreground mb-6">Você precisa estar logado para ver seu resumo do jogo.</p>
        <Button asChild><Link to="/">Voltar ao início</Link></Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-24 pb-12">
      <header className="mb-6">
        <UserHeader name={nome} level={profile.profile as any} />
      </header>

      <AchievementList achievements={achievements} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <article className="lg:col-span-2">
          <Card className="shadow-neon">
            <CardHeader>
              <CardTitle className="text-lg">Frase para compartilhar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed">{phrase}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={handleCopy}>Copiar frase</Button>
                <Button onClick={handleShareLinkedIn}>Compartilhar no LinkedIn</Button>
              </div>
            </CardContent>
          </Card>
        </article>

        <aside className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Seu XP total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold tracking-tight">{xp}</p>
              <p className="text-muted-foreground mt-1">Parabéns por avançar na sua jornada!</p>
              <div className="mt-4">
                <Button asChild variant="outline"><Link to="/">Voltar ao início</Link></Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      {loading && (
        <div className="fixed inset-0 grid place-items-center bg-background/60">
          <div className="animate-pulse text-muted-foreground">Carregando seu resumo…</div>
        </div>
      )}
    </main>
  );
};

export default GameSummary;
