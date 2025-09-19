import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Home } from 'lucide-react';
import { VaporwaveScene } from '@/components/VaporwaveScene';
import { narrator } from '@/utils/tutorialNarrator';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import codyNeonImage from '@/assets/cody-neon.png';
import { SpaceshipElements } from '@/components/visual-segments/SpaceshipElements';
import { TechEvolutionElements } from '@/components/visual-segments/TechEvolutionElements';
import { BPOToolsElements } from '@/components/visual-segments/BPOToolsElements';
import { CodigoFElements } from '@/components/visual-segments/CodigoFElements';
import { ForvisMazarsElements } from '@/components/visual-segments/ForvisMazarsElements';

const narrativeSegments = [
  {
    id: 1,
    title: "Boas-vindas à Spaceship",
    text: "Olá! Bem-vindos a bordo da Spaceship, nossa nave espacial rumo ao futuro! Eu sou a Cody, e hoje vou guiar vocês em uma jornada extraordinária de transformação. Assim como uma viagem espacial, nossa jornada é sobre explorar novos horizontes, superar desafios e alcançar destinos inexplorados. Convido cada um de vocês a embarcar nesta aventura conosco, onde cada etapa representa um passo em direção à inovação e ao crescimento.",
    highlight: "spaceship"
  },
  {
    id: 2,
    title: "Evolução Tecnológica",
    text: "A evolução tecnológica tem sido o motor de grandes transformações nos negócios ao longo das décadas. Desde a introdução dos primeiros computadores até o atual cenário dominado pela inteligência artificial, cada avanço tecnológico trouxe consigo uma revolução na forma como conduzimos negócios. Estas mudanças não apenas redefiniram processos empresariais, mas também transformaram fundamentalmente a maneira como tomamos decisões estratégicas e nos relacionamos com nossos clientes.",
    highlight: "tech-evolution"
  },
  {
    id: 3,
    title: "Ritmo da Mudança",
    text: "O ritmo da mudança tecnológica que experimentamos hoje é verdadeiramente sem precedentes. A velocidade com que novas tecnologias surgem e se desenvolvem está criando um ambiente de transformação contínua e acelerada. Este momento único na história nos desafia a sermos mais ágeis, adaptáveis e inovadores do que nunca, enquanto navegamos por um oceano de possibilidades tecnológicas.",
    highlight: "acceleration"
  },
  {
    id: 4,
    title: "Forvis Mazars",
    text: "Na Forvis Mazars, abraçamos completamente esta era de transformação digital. Nosso compromisso com a otimização de processos vai além da simples adoção de tecnologia - buscamos criar um impacto significativo em todas as nossas operações. Focamos em capacitar nossos colaboradores, fornecendo as ferramentas e conhecimentos necessários para exceder as expectativas dos nossos clientes, garantindo excelência em cada interação.",
    highlight: "forvis-mazars"
  },
  {
    id: 5,
    title: "BPO Digital",
    text: "Nossa divisão de BPO tem liderado o caminho na transformação digital com implementações revolucionárias. O CSC Digital, Integra, Portal Financeiro e Hubcount são exemplos concretos de como estamos revolucionando nossa gestão de clientes e processos internos. Estas ferramentas não são apenas sistemas, mas representam nossa visão de um futuro mais eficiente e conectado.",
    highlight: "bpo-tools"
  },
  {
    id: 6,
    title: "Auditoria & Consultoria",
    text: "Na área de Auditoria, implementamos ferramentas globais que elevaram nossos padrões de qualidade e eficiência. Nossa divisão de Consultoria continua evoluindo constantemente, abraçando inovações que nos permitem oferecer soluções cada vez mais ágeis e eficazes. Este compromisso com a melhoria contínua reflete nossa determinação em manter a excelência em todos os serviços que oferecemos.",
    highlight: "audit-consulting"
  },
  {
    id: 7,
    title: "Código F",
    text: "O programa Código F representa nossa iniciativa mais ambiciosa para impulsionar o desenvolvimento dos colaboradores e fomentar a inteligência coletiva. Este programa vai além do treinamento tradicional, promovendo colaboração entre departamentos e estimulando a inovação em todos os níveis da organização. É através dele que transformamos ideias em realidade e construímos juntos o futuro da nossa empresa.",
    highlight: "codigo-f"
  },
  {
    id: 8,
    title: "CEO Eduardo Cabrera",
    text: "E agora, tenho o prazer de apresentar nosso capitão nesta jornada de transformação, nosso CEO Eduardo Cabrera. Sob sua liderança visionária, continuamos navegando rumo a novos horizontes, sempre com o compromisso de inovar e evoluir. Eduardo tem sido fundamental em guiar nossa nave através deste período de transformação digital, mantendo nosso curso firme em direção ao futuro. Com vocês, Eduardo Cabrera.",
    highlight: "ceo"
  }
];

export default function CodyPresentation() {
  const navigate = useNavigate();
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [codyVideoUrl, setCodyVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    narrator.init();
    return () => {
      narrator.stop();
    };
  }, []);

  // Carregar vídeo da Cody dinamicamente (igual ao game)
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

  // Auto-start presentation
  useEffect(() => {
    if (codyVideoUrl && !hasStarted) {
      const timer = setTimeout(() => {
        startPresentation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [codyVideoUrl, hasStarted]);

  const playSegment = async (segmentIndex: number) => {
    if (narrator.isSpeaking()) {
      narrator.stop();
    }

    setCurrentSegment(segmentIndex);
    setIsPlaying(true);
    setHasStarted(true);

    if (videoRef.current) {
      videoRef.current.play();
    }

    const segment = narrativeSegments[segmentIndex];
    
    await narrator.speak(segment.text, () => {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      // Auto-advance to next segment
      if (segmentIndex < narrativeSegments.length - 1) {
        setTimeout(() => {
          playSegment(segmentIndex + 1);
        }, 1000);
      } else {
        // Restart presentation after completion
        setTimeout(() => {
          setHasStarted(false);
          setCurrentSegment(0);
          setIsPlaying(false);
        }, 3000);
      }
    });
  };


  const startPresentation = () => {
    playSegment(0);
  };

  const calculateProgress = () => {
    return ((currentSegment + 1) / narrativeSegments.length) * 100;
  };

  const getVisualElements = () => {
    if (!hasStarted) return null;
    
    const segment = narrativeSegments[currentSegment];
    
    switch (segment.highlight) {
      case "spaceship":
        return <SpaceshipElements key="spaceship" />;
      case "tech-evolution":
        return <TechEvolutionElements key="tech-evolution" />;
      case "bpo-tools":
        return <BPOToolsElements key="bpo-tools" />;
      case "codigo-f":
        return <CodigoFElements key="codigo-f" />;
      case "forvis-mazars":
        return <ForvisMazarsElements key="forvis-mazars" />;
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-primary mb-4 animate-fade-in">
                {segment.title}
              </h2>
              <div className="flex items-center justify-center space-x-2 text-2xl animate-pulse">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <div className="w-3 h-3 bg-accent rounded-full" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 bg-secondary rounded-full" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <SEOHead 
        title="Cody - Apresentação Digital | Forvis Mazars"
        description="Conheça a Cody, nossa guia digital na jornada de transformação tecnológica da Forvis Mazars"
      />
      <div className="relative w-full h-screen overflow-hidden">
        {/* Vaporwave Background */}
        <div className="absolute inset-0 z-0">
          <VaporwaveScene cameraPosition={[0, 2, 8]} cameraFov={75} />
        </div>

        {/* Visual Elements Layer */}
        <div className="absolute inset-0 z-5">
          {getVisualElements()}
        </div>

        {/* Cody Video - Centralizado */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative max-w-lg w-full mx-8">
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl">
              {codyVideoUrl && (
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={codyNeonImage}
                >
                  <source src={codyVideoUrl} type="video/mp4" />
                  <img src={codyNeonImage} alt="Cody - AI Assistant" className="w-full h-auto" />
                </video>
              )}
              <div className="absolute inset-0 -z-10 bg-primary/20 blur-2xl rounded-xl transform scale-110" />
            </div>
            
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-primary">Cody</h2>
              <p className="text-foreground/80">Sua Guia Digital</p>
            </div>
          </div>
        </div>

        {/* Progress Bar - Topo */}
        {hasStarted && (
          <div className="absolute top-0 left-0 right-0 z-20 p-6">
            <div className="max-w-md mx-auto space-y-2">
              <div className="text-center text-sm text-foreground/80">
                <span>{narrativeSegments[currentSegment].title}</span>
              </div>
              <Progress value={calculateProgress()} className="h-1 bg-background/50" />
            </div>
          </div>
        )}

        {/* Botão Voltar - Canto inferior direito */}
        <div className="absolute bottom-6 right-6 z-20">
          <Button variant="outline" onClick={() => navigate('/')} className="bg-background/80 backdrop-blur-sm">
            <Home className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </>
  );
}