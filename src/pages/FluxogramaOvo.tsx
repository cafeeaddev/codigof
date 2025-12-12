import { ArrowDown, ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FluxogramaOvo = () => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          variant="ghost"
          onClick={toggleFullscreen}
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent mb-2">
          Fluxograma do Ovo
        </h1>
        <p className="text-gray-400 text-lg">Aplicando as 5 peças do fluxo em algo simples</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 border border-purple-400" />
          <span className="text-gray-300">Início/Fim</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded bg-cyan-900/50 border border-cyan-400" />
          <span className="text-gray-300">Ação</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rotate-45 bg-amber-900/50 border border-amber-400" />
          <span className="text-gray-300">Decisão</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded-xl bg-fuchsia-900/50 border border-fuchsia-400 flex items-center justify-center">
            <span className="text-[8px]">🔄</span>
          </div>
          <span className="text-gray-300">Loop/Repetição</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowDown className="w-5 h-5 text-cyan-400" />
          <span className="text-gray-300">Fluxo</span>
        </div>
      </div>

      {/* Flowchart */}
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
        
        {/* INÍCIO */}
        <FlowOval type="start">Quero fritar um ovo</FlowOval>
        <FlowArrow />

        {/* Passo 1 */}
        <FlowAction step={1}>Pegar frigideira limpa e colocar no fogão</FlowAction>
        <FlowArrow />

        {/* Passo 2 */}
        <FlowAction step={2}>Verificar se há gás disponível</FlowAction>
        <FlowArrow />

        {/* Decisão 1 - Gás */}
        <FlowDecision 
          question="Há gás disponível?" 
          loopAction="Resolver problema do gás"
        />
        <FlowArrow label="SIM" />

        {/* Passo 3 */}
        <FlowAction step={3}>Ligar o fogão em chama média</FlowAction>
        <FlowArrow />

        {/* Passo 4 */}
        <FlowAction step={4}>Colocar óleo ou manteiga na frigideira</FlowAction>
        <FlowArrow />

        {/* Decisão 2 - Óleo quente */}
        <FlowDecision 
          question="Óleo/manteiga quente?" 
          loopAction="Esperar aquecer"
        />
        <FlowArrow label="SIM" />

        {/* Passo 5 */}
        <FlowAction step={5}>Pegar um ovo com cuidado</FlowAction>
        <FlowArrow />

        {/* Passo 6 */}
        <FlowAction step={6}>Quebrar o ovo na frigideira (sem casca)</FlowAction>
        <FlowArrow />

        {/* Decisão 3 - Clara cozida */}
        <FlowDecision 
          question="Clara branca e firme?" 
          loopAction="Continuar fritando"
        />
        <FlowArrow label="SIM" />

        {/* Decisão 4 - Gema */}
        <FlowDecisionSimple question="Quer a gema mais dura?" />
        
        <div className="flex items-center gap-4 w-full max-w-2xl justify-center">
          <div className="flex flex-col items-center">
            <span className="text-amber-400 text-xs mb-1">SIM</span>
            <FlowArrow short />
            <FlowAction step={7} small>Esperar mais alguns segundos</FlowAction>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-400 text-xs mb-1">NÃO</span>
            <FlowArrow short />
          </div>
        </div>
        
        <div className="flex items-center justify-center w-full">
          <div className="h-8 border-l-2 border-dashed border-cyan-400/50" />
          <div className="h-8 border-l-2 border-dashed border-cyan-400/50 ml-32" />
        </div>

        {/* Convergência visual */}
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <FlowArrow />

        {/* Passo 8 */}
        <FlowAction step={8}>Desligar o fogo</FlowAction>
        <FlowArrow />

        {/* Passo 9 */}
        <FlowAction step={9}>Pegar um prato e uma espátula</FlowAction>
        <FlowArrow />

        {/* Passo 10 */}
        <FlowAction step={10}>Colocar o ovo no prato com a espátula</FlowAction>
        <FlowArrow />

        {/* FIM */}
        <FlowOval type="end">Ovo frito no prato! 🍳</FlowOval>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-gray-500 text-sm">
        <p>Se pra fritar um ovo a gente já precisa deixar tudo tão claro...</p>
        <p className="text-cyan-400">imagina pros processos de cliente!</p>
      </div>
    </div>
  );
};

// Componentes auxiliares do fluxograma

const FlowOval = ({ children, type }: { children: React.ReactNode; type: "start" | "end" }) => (
  <div className={`
    px-8 py-4 rounded-full text-center font-semibold text-lg
    border-2 shadow-lg
    ${type === "start" 
      ? "bg-gradient-to-r from-purple-900/80 to-fuchsia-900/80 border-purple-400 shadow-purple-500/30" 
      : "bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-green-400 shadow-green-500/30"
    }
    animate-pulse
  `}>
    <span className={type === "start" ? "text-purple-200" : "text-green-200"}>
      {type === "start" ? "🚀 INÍCIO: " : "✅ FIM: "}
    </span>
    {children}
  </div>
);

const FlowAction = ({ children, step, small = false }: { children: React.ReactNode; step: number; small?: boolean }) => (
  <div className={`
    ${small ? "px-4 py-2 text-sm max-w-48" : "px-6 py-3 max-w-md"}
    bg-cyan-950/50 border border-cyan-400/70 rounded-lg
    shadow-lg shadow-cyan-500/20
    flex items-center gap-3
    hover:border-cyan-300 hover:shadow-cyan-400/30 transition-all
  `}>
    <span className="bg-cyan-400 text-black font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0">
      {step}
    </span>
    <span className="text-gray-100">{children}</span>
  </div>
);

const FlowArrow = ({ label, short = false }: { label?: string; short?: boolean }) => (
  <div className={`flex flex-col items-center ${short ? "h-6" : "h-8"}`}>
    {label && <span className="text-green-400 text-xs font-semibold mb-1">{label}</span>}
    <div className={`w-0.5 ${short ? "h-4" : "h-6"} bg-gradient-to-b from-cyan-400 to-cyan-600`} />
    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-cyan-600" />
  </div>
);

const FlowLoop = ({ action, returnTo }: { action: string; returnTo: string }) => (
  <div className="
    px-4 py-2 
    bg-gradient-to-r from-fuchsia-950/70 to-purple-950/70
    border-2 border-fuchsia-400/80 rounded-xl
    shadow-lg shadow-fuchsia-500/30
    flex items-center gap-3
    animate-pulse
  ">
    <span className="text-2xl">🔄</span>
    <div className="flex flex-col">
      <span className="text-fuchsia-200 font-medium">{action}</span>
      <span className="text-fuchsia-400/70 text-xs">
        ↺ Volta para: {returnTo}
      </span>
    </div>
  </div>
);

const FlowDecision = ({ question, loopAction }: { question: string; loopAction: string }) => (
  <div className="flex items-center gap-4">
    {/* Loop à esquerda - AGORA COM COMPONENTE VISUAL DESTACADO */}
    <div className="flex items-center gap-2">
      <FlowLoop action={loopAction} returnTo="verificar novamente" />
      <div className="flex items-center">
        <div className="w-6 h-0.5 bg-fuchsia-400/60" />
        <span className="text-fuchsia-400 text-xs font-semibold px-1 bg-fuchsia-950/50 rounded">NÃO</span>
        <div className="w-4 h-0.5 bg-fuchsia-400/60" />
      </div>
      {/* Seta curva subindo */}
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-6 bg-fuchsia-400/60" />
        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-fuchsia-400/60" />
      </div>
    </div>
    
    {/* Losango */}
    <div className="relative">
      <div className="
        w-36 h-36 rotate-45
        bg-gradient-to-br from-amber-900/60 to-orange-900/60
        border-2 border-amber-400
        shadow-lg shadow-amber-500/30
        flex items-center justify-center
      ">
        <span className="
          -rotate-45 text-center text-sm font-medium text-amber-100
          px-2 leading-tight
        ">
          {question}
        </span>
      </div>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-amber-400 text-lg">🔶</div>
    </div>
  </div>
);

const FlowDecisionSimple = ({ question }: { question: string }) => (
  <div className="relative my-2">
    <div className="
      w-36 h-36 rotate-45
      bg-gradient-to-br from-amber-900/60 to-orange-900/60
      border-2 border-amber-400
      shadow-lg shadow-amber-500/30
      flex items-center justify-center
    ">
      <span className="
        -rotate-45 text-center text-sm font-medium text-amber-100
        px-2 leading-tight
      ">
        {question}
      </span>
    </div>
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-amber-400 text-lg">🔶</div>
  </div>
);

export default FluxogramaOvo;
