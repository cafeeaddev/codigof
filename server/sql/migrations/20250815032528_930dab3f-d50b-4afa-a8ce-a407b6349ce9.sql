-- Criar tabela para textos dos perfis digitais
CREATE TABLE public.profile_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_name TEXT NOT NULL,
  sublevel TEXT NOT NULL,
  text_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_name, sublevel)
);

-- Habilitar RLS
ALTER TABLE public.profile_texts ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Everyone can view profile texts" 
ON public.profile_texts 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify profile texts" 
ON public.profile_texts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profile_texts_updated_at
BEFORE UPDATE ON public.profile_texts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir os textos existentes
INSERT INTO public.profile_texts (profile_name, sublevel, text_content) VALUES
('Beginner', 'Início', '🟡 Nível 0 – Início da jornada • Você ainda não está familiarizado com o universo digital e prefere seguir com os métodos que conhece. As mudanças tecnológicas estão acontecendo — conte conosco para apoiar seus primeiros passos no aprimoramento de competências digitais.'),
('Beginner +', 'Transição → Explorer', '🟡 Nível 1 – Primeiros Passos • Você está começando sua relação com o universo digital. Observador(a) e reflexivo(a), constrói uma base sólida para evoluir. Conte conosco para apoiar seus primeiros passos no aprimoramento de competências digitais.'),
('Explorer', 'Início', '🟡 Nível 1 – Explorador iniciante • Você demonstra curiosidade real por tecnologia e já experimenta com frequência. Está transformando testes em rotina. Conte conosco para apoiar seus passos no aprimoramento de competências digitais.'),
('Explorer', 'Transição → Pro-Player', '🟠 Nível 2 – Transição para Pro-Player • Seu uso das ferramentas é cada vez mais natural e produtivo. Você aplica no dia a dia e começa a influenciar colegas. Conte conosco para apoiar seus passos no aprimoramento de competências digitais.'),
('Pro-Player', 'Início/Consolidado', '🟡 Nível 1 – Consolidação técnica • Você usa tecnologia com confiança e consistência. Resolve problemas, automatiza rotinas e entrega com eficiência. Perfil claro: aplica com propósito e gera impacto direto.'),
('Pro-Player', 'Transição → Ninja', '🟠 Nível 2 – Transição para Ninja • Seu domínio técnico vem acompanhado de visão de contexto. Você pensa no impacto coletivo e contribui para soluções além do seu escopo. Rumo ao protagonismo na transformação digital.'),
('Ninja', 'Consolidação', '🟡 Nível 1 – Consolidação de liderança digital • Você atua com fluidez entre pessoas, processos e ferramentas. Seu impacto é coletivo: transforma, integra e inspira.'),
('Ninja', 'Ninja Raiz™ 😎', '🔴 Nível 2 – Referência estratégica • Maturidade digital elevada. Você lidera mudanças com consciência, experimenta com responsabilidade e compartilha com generosidade.');