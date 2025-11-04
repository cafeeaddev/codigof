import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileQuestion, Cloud, ExternalLink, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
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
} from '@/components/ui/alert-dialog';

interface QuizCardProps {
  title: string;
  description: string;
  icon: '⚡' | '☁️' | '🎯';
  status: 'ready' | 'collecting' | 'active';
  participantCount?: number;
  questionCount?: number;
  submissionCount?: number;
  participantLink?: string;
  onManage: () => void;
  onReset?: () => Promise<void>;
  isActive?: boolean;
}

export const QuizCard = ({
  title,
  description,
  icon,
  status,
  participantCount,
  questionCount,
  submissionCount,
  participantLink,
  onManage,
  onReset,
  isActive
}: QuizCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'collecting': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'collecting': return 'Coletando';
      default: return 'Pronto';
    }
  };

  return (
    <Card className={cn(
      'p-6 transition-all hover:shadow-lg',
      isActive && 'ring-2 ring-primary'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{icon}</div>
        <Badge className={cn('text-white', getStatusColor())}>
          {getStatusText()}
        </Badge>
      </div>

      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>

      <div className="space-y-2 mb-4">
        {participantCount !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>{participantCount} participantes</span>
          </div>
        )}
        
        {questionCount !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <FileQuestion className="w-4 h-4" />
            <span>{questionCount} perguntas</span>
          </div>
        )}

        {submissionCount !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="w-4 h-4" />
            <span>{submissionCount} contribuições</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {participantLink && (
          <Button
            variant="outline"
            onClick={() => window.open(participantLink, '_blank')}
            className="flex-1 gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Quiz
          </Button>
        )}
        <Button 
          onClick={onManage}
          className="flex-1"
          variant={isActive ? "default" : "outline"}
        >
          {isActive ? 'Gerenciando...' : 'Gerenciar'}
        </Button>
      </div>

      {onReset && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              size="sm"
              className="w-full mt-2 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar Quiz
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá remover todos os participantes, respostas e reiniciar a sessão do quiz "{title}". Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sim, resetar quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
};
