import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipBack, SkipForward, Home, Volume2 } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    narrator.init();
    return () => {
      narrator.stop();
    };
  }, []);

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
      }
    });
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      narrator.stop();
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      playSegment(currentSegment);
    }
  };

  const nextSegment = () => {
    if (currentSegment < narrativeSegments.length - 1) {
      playSegment(currentSegment + 1);
    }
  };

  const previousSegment = () => {
    if (currentSegment > 0) {
      playSegment(currentSegment - 1);
    }
  };

  const startPresentation = () => {
    playSegment(0);
  };

  const calculateProgress = () => {
    return ((currentSegment + (isPlaying ? 0.5 : 0)) / narrativeSegments.length) * 100;
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

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col lg:flex-row">
          {/* Left Side - Cody Video/Image */}
          <div className="lg:w-1/2 flex items-center justify-center p-6">
            <div className="relative max-w-md w-full">
              {/* Video Player */}
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  loop
                  muted
                  playsInline
                  poster={codyNeonImage}
                >
                  <source src="https://meta.cafeeadhost.com.br/Cody/hero-animation.mp4" type="video/mp4" />
                  <img src={codyNeonImage} alt="Cody - AI Assistant" className="w-full h-auto" />
                </video>
                
                {/* Glow effect */}
                <div className="absolute inset-0 -z-10 bg-primary/20 blur-2xl rounded-xl transform scale-110" />
              </div>
              
              {/* Cody Info */}
              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-primary">Cody</h2>
                <p className="text-foreground/80">Sua Guia Digital</p>
              </div>
            </div>
          </div>

          {/* Right Side - Content and Controls */}
          <div className="lg:w-1/2 flex flex-col justify-end p-6 space-y-6">
            {/* Welcome Card */}
            {!hasStarted && (
              <Card className="p-8 bg-background/90 backdrop-blur-sm border border-primary/20">
                <h1 className="text-3xl font-bold text-primary mb-4">Bem-vindos à Spaceship! 🚀</h1>
                <p className="text-foreground/80 mb-6">
                  Embarque conosco em uma jornada extraordinária de transformação digital na Forvis Mazars.
                </p>
                <Button onClick={startPresentation} size="lg" className="w-full">
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Apresentação
                </Button>
              </Card>
            )}

            {/* Progress */}
            {hasStarted && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-foreground/80">
                  <span>Segmento {currentSegment + 1} de {narrativeSegments.length}</span>
                  <span>{narrativeSegments[currentSegment].title}</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
            )}

            {/* Controls */}
            {hasStarted && (
              <Card className="p-4 bg-background/80 backdrop-blur-sm border border-border">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousSegment}
                    disabled={currentSegment === 0}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlayPause}
                    className="w-12 h-12"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSegment}
                    disabled={currentSegment === narrativeSegments.length - 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center text-foreground/80">
                    <Volume2 className="w-4 h-4 mr-1" />
                    <span className="text-xs">Audio ativo</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}