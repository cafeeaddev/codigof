import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FastTrackDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  details: {
    interestLevel: string;
    timeCommitment: string;
    mainObjective: string;
    otherObjective?: string;
  } | null;
}

export const FastTrackDetailsDialog = ({
  open,
  onOpenChange,
  userName,
  details
}: FastTrackDetailsDialogProps) => {
  if (!details) return null;

  const getInterestLevelBadge = (level: string) => {
    const variants = {
      'muito_alto': { variant: 'default' as const, label: 'Muito Alto' },
      'alto': { variant: 'secondary' as const, label: 'Alto' },
      'medio': { variant: 'outline' as const, label: 'Médio' },
      'baixo': { variant: 'destructive' as const, label: 'Baixo' }
    };
    
    const config = variants[level as keyof typeof variants] || { variant: 'outline' as const, label: level };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTimeCommitmentLabel = (time: string) => {
    const labels = {
      '1-2_horas': '1-2 horas por semana',
      '3-5_horas': '3-5 horas por semana',
      '6-10_horas': '6-10 horas por semana',
      'mais_10_horas': 'Mais de 10 horas por semana'
    };
    
    return labels[time as keyof typeof labels] || time;
  };

  const getObjectiveLabel = (objective: string) => {
    const labels = {
      'aprender_novas_tecnologias': 'Aprender novas tecnologias',
      'melhorar_habilidades_atuais': 'Melhorar habilidades atuais',
      'explorar_areas_diferentes': 'Explorar áreas diferentes',
      'desenvolver_projetos_pessoais': 'Desenvolver projetos pessoais',
      'crescimento_profissional': 'Crescimento profissional',
      'outro': 'Outro'
    };
    
    return labels[objective as keyof typeof labels] || objective;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Fast Track - {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nível de Interesse
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {getInterestLevelBadge(details.interestLevel)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo de Comprometimento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{getTimeCommitmentLabel(details.timeCommitment)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Objetivo Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{getObjectiveLabel(details.mainObjective)}</p>
            </CardContent>
          </Card>

          {details.otherObjective && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Objetivo Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">{details.otherObjective}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};