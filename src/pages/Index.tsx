import { useEffect } from 'react';
import { LinearLayout } from '@/components/LinearLayout';

const Index = () => {
  useEffect(() => {
    document.title = 'Jogo Digital - Missões e XP | Guia Interativo';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Descubra seu perfil digital, cumpra 4 missões e ganhe XP e medalhas com a mentora IA.');
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Descubra seu perfil digital, cumpra 4 missões e ganhe XP e medalhas com a mentora IA.';
      document.head.appendChild(m);
    }
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const href = window.location.origin + '/';
    if (link) {
      link.href = href;
    } else {
      const l = document.createElement('link');
      l.rel = 'canonical';
      l.href = href;
      document.head.appendChild(l);
    }
  }, []);

  return <LinearLayout />;
};

export default Index;
