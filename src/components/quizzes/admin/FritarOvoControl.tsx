import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Users, Download, Eye } from 'lucide-react';
import { useFritarOvo } from '../fritar-ovo/useFritarOvo';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type Submission = Tables<'fritar_ovo_submissions'>;

export const FritarOvoControl = () => {
  const { submissions, totalGroups } = useFritarOvo();
  const [selectedRecipe, setSelectedRecipe] = useState<Submission | null>(null);

  const openProjectionScreen = () => {
    window.open('/quiz/fritar-ovo/screen', '_blank');
  };

  const getFilledStepsCount = (sub: Submission) => {
    const steps = [
      sub.step_1, sub.step_2, sub.step_3, sub.step_4, sub.step_5,
      sub.step_6, sub.step_7, sub.step_8, sub.step_9, sub.step_10,
      sub.step_11, sub.step_12, sub.step_13, sub.step_14, sub.step_15
    ];
    return steps.filter(s => s && s.trim()).length;
  };

  const getFilledSteps = (sub: Submission) => {
    const steps = [
      { num: 1, text: sub.step_1 }, { num: 2, text: sub.step_2 }, { num: 3, text: sub.step_3 },
      { num: 4, text: sub.step_4 }, { num: 5, text: sub.step_5 }, { num: 6, text: sub.step_6 },
      { num: 7, text: sub.step_7 }, { num: 8, text: sub.step_8 }, { num: 9, text: sub.step_9 },
      { num: 10, text: sub.step_10 }, { num: 11, text: sub.step_11 }, { num: 12, text: sub.step_12 },
      { num: 13, text: sub.step_13 }, { num: 14, text: sub.step_14 }, { num: 15, text: sub.step_15 }
    ];
    return steps.filter(s => s.text && s.text.trim());
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
                Todas as Receitas ({submissions.length}):
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.map((sub) => (
                  <Card 
                    key={sub.id} 
                    className="bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setSelectedRecipe(sub)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{sub.group_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            Passo 1: {sub.step_1 || '(vazio)'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                            {getFilledStepsCount(sub)} passos
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.created_at).toLocaleTimeString('pt-BR')}
                          </p>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalhes da receita */}
      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🍳 Receita do Grupo: {selectedRecipe?.group_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground border-b pb-3">
                <span>📅 {new Date(selectedRecipe.created_at).toLocaleString('pt-BR')}</span>
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                  ✅ {getFilledStepsCount(selectedRecipe)} passos preenchidos
                </span>
              </div>
              
              <div className="space-y-2">
                {getFilledSteps(selectedRecipe).map(({ num, text }) => (
                  <div key={num} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="font-bold text-orange-500 min-w-[24px]">{num}.</span>
                    <span className="text-foreground">{text}</span>
                  </div>
                ))}
                
                {getFilledStepsCount(selectedRecipe) === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum passo foi preenchido
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
