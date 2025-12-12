import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePseudoCodigo } from '../pseudo-codigo/usePseudoCodigo';
import { useToast } from '@/hooks/use-toast';
import { Code, ExternalLink, Trash2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const PseudoCodigoControl = () => {
  const { submissions, isLoading, resetSubmissions } = usePseudoCodigo();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleOpenScreen = () => {
    window.open('/quiz/pseudo-codigo/screen', '_blank');
  };

  const handleReset = async () => {
    const { error } = await resetSubmissions();
    if (error) {
      toast({
        title: "Erro ao limpar",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Dados limpos! 🗑️",
        description: "Todas as submissões foram removidas.",
      });
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há submissões para exportar.",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Grupo', 'Pseudo-código', 'Data/Hora'];
    const rows = submissions.map(s => [
      s.group_name,
      s.pseudo_code.replace(/\n/g, ' | '),
      new Date(s.created_at).toLocaleString('pt-BR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pseudo-codigo-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "CSV exportado! 📊",
      description: `${submissions.length} submissões exportadas.`,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border-violet-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-violet-200">Pseudo-código</CardTitle>
              <CardDescription className="text-violet-400">
                Mini Missão – Do Fluxo ao Código
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-violet-500 text-violet-300 text-lg px-3 py-1">
            {submissions.length} grupos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleOpenScreen}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Tela
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-violet-500/50 text-violet-300 hover:bg-violet-600/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-600/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Limpar todas as submissões?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Esta ação não pode ser desfeita. Todas as submissões de pseudo-código serão removidas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-4 text-violet-400">Carregando...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-4 text-violet-400/60">
            Nenhuma submissão ainda
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {submissions.map((sub, index) => (
              <div
                key={sub.id}
                className="bg-slate-900/50 rounded-lg border border-violet-500/20"
              >
                <button
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-violet-600/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-violet-600/50 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-violet-200 font-medium">{sub.group_name}</span>
                  </div>
                  {expandedId === sub.id ? (
                    <ChevronUp className="w-4 h-4 text-violet-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-violet-400" />
                  )}
                </button>
                {expandedId === sub.id && (
                  <div className="px-3 pb-3">
                    <pre className="bg-slate-800/80 rounded p-3 font-mono text-sm text-violet-200 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                      {sub.pseudo_code}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
