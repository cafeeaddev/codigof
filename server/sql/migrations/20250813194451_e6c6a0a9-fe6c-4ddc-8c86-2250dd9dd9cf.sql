-- Criar tabela de áreas
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- Create policies for areas table
CREATE POLICY "Everyone can view areas" 
ON public.areas 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify areas" 
ON public.areas 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir todas as áreas existentes
INSERT INTO public.areas (name, code) VALUES
('Administração', 'administracao'),
('AUDITORIA', 'auditoria'),
('AUDITORIA- ADM', 'auditoria_adm'),
('BPO- ADM', 'bpo_adm'),
('BPO- CONTÁBIL', 'bpo_contabil'),
('BPO- CONTRATAÇÃO STAFF LOAN', 'bpo_contratacao_staff_loan'),
('BPO- FINANCEIRO', 'bpo_financeiro'),
('BPO- FISCAL DIRETOS', 'bpo_fiscal_diretos'),
('BPO- FISCAL INDIRETOS', 'bpo_fiscal_indiretos'),
('BPO- FOLHA DE PAGAMENTO', 'bpo_folha_pagamento'),
('BPO- IMPLANTAÇÃO NETCORP', 'bpo_implantacao_netcorp'),
('BPO- IMPLANTAÇÃO RM', 'bpo_implantacao_rm'),
('BPO- PQSE', 'bpo_pqse'),
('BPO- SERVIÇOS CORPORATIVOS', 'bpo_servicos_corporativos'),
('BUSINESS DEVELOPMENT', 'business_development'),
('COMEX', 'comex'),
('CONSULTORIA EMPRESARIAL- DIGITAL', 'consultoria_empresarial_digital'),
('CONSULTORIA EMPRESARIAL- RISK CONSULTING', 'consultoria_empresarial_risk_consulting'),
('CONTROLADORIA', 'controladoria'),
('FACILITIES', 'facilities'),
('FINANCIAL ADVISORY- ATIVO FIXO', 'financial_advisory_ativo_fixo'),
('FINANCIAL ADVISORY- DUE DILIGENCE', 'financial_advisory_due_diligence'),
('FINANCIAL ADVISORY- F.I.S', 'financial_advisory_fis'),
('FINANCIAL ADVISORY- VALUATION', 'financial_advisory_valuation'),
('GENTE&GESTÃO', 'gente_gestao'),
('GOVERNO', 'governo'),
('JURIDICO', 'juridico'),
('MARKETING', 'marketing'),
('RISK&QUALITY', 'risk_quality'),
('TALENT ACQUISITION', 'talent_acquisition'),
('TAX - CONSULTING', 'tax_consulting'),
('TAX- DUE DILIGENCE', 'tax_due_diligence'),
('TI', 'ti'),
('TI & TRANSFORMAÇÃO DIGITAL', 'ti_transformacao_digital'),
('TREINAMENTO&DESENVOLVIMENTO', 'treinamento_desenvolvimento');

-- Adicionar coluna area_id na tabela profiles
ALTER TABLE public.profiles ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Migrar dados existentes de area (string) para area_id (UUID)
UPDATE public.profiles 
SET area_id = areas.id 
FROM public.areas 
WHERE profiles.area = areas.name;

-- Atualizar trigger para timestamp
CREATE TRIGGER update_areas_updated_at
  BEFORE UPDATE ON public.areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar mission4_questions para usar array de UUIDs
ALTER TABLE public.mission4_questions ADD COLUMN target_area_ids UUID[];

-- Migrar dados de target_areas (strings) para target_area_ids (UUIDs)
UPDATE public.mission4_questions 
SET target_area_ids = ARRAY(
  SELECT areas.id 
  FROM public.areas 
  WHERE areas.name = ANY(mission4_questions.target_areas)
) 
WHERE target_areas IS NOT NULL;