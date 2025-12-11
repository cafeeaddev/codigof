import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Download } from 'lucide-react';
import { useFritarOvo } from '../fritar-ovo/useFritarOvo';
import { toast } from 'sonner';

export const FritarOvoControl = () => {
  const { submissions, totalGroups } = useFritarOvo();

  const openProjectionScreen = () => {
    window.open('/quiz/fritar-ovo/screen', '_blank');
  };

  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast.error('Não há receitas para exportar');
      return;
    }

    const headers = [
      'Nome do Grupo',
      'Passo 1', 'Passo 2', 'Passo 3', 'Passo 4', 'Passo 5',
      'Passo 6', 'Passo 7', 'Passo 8', 'Passo 9', 'Passo 10',
      'Passo 11', 'Passo 12', 'Passo 13', 'Passo 14', 'Passo 15',
      'Data/Hora'
    ];
    
    const rows = submissions.map(sub => [
      sub.group_name,
      sub.step_1, sub.step_2, sub.step_3, sub.step_4, sub.step_5,
      sub.step_6, sub.step_7, sub.step_8, sub.step_9, sub.step_10,
      sub.step_11, sub.step_12, sub.step_13, sub.step_14, sub.step_15,
      new Date(sub.created_at).toLocaleString('pt-BR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fritar_ovo_receitas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Receitas exportadas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            Missão Fritar um OVO
          </CardTitle>
          <CardDescription>
            Atividade de instruções precisas para um robô
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={openProjectionScreen}
              className="flex-1"
              size="lg"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Abrir Tela de Projeção
            </Button>
            <Button 
              onClick={exportToCSV}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <Download className="mr-2 h-5 w-5" />
              Baixar Receitas
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-3xl font-bold">{totalGroups}</p>
                    <p className="text-sm text-muted-foreground">Grupos Participantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {submissions.length > 0 && (
            <div className="pt-4 space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Últimas 5 Receitas:
              </h4>
              <div className="space-y-2">
                {submissions.slice(0, 5).map((sub) => (
                  <Card key={sub.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{sub.group_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            Passo 1: {sub.step_1}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sub.created_at).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
