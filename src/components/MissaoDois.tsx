import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Play, Clock, Star } from 'lucide-react';

interface MissaoDoisProps {
  onComplete: () => void;
}

export const MissaoDois = ({ onComplete }: MissaoDoisProps) => {
  const [taskCompleted, setTaskCompleted] = useState<Record<string, boolean>>({});

  const handleTaskToggle = (taskId: string) => {
    setTaskCompleted(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const tasks = [
    {
      id: 'video1',
      title: 'Assista: "IA no trabalho: casos práticos"',
      description: 'Vídeo de 5 minutos sobre aplicações reais',
      xp: 50,
      icon: Play
    },
    {
      id: 'reflection',
      title: 'Reflita: Como você usa o digital hoje?',
      description: 'Pense em 3 ferramentas que você usa diariamente',
      xp: 30,
      icon: Clock
    },
    {
      id: 'action',
      title: 'Ação: Teste uma nova ferramenta',
      description: 'Experimente algo que ainda não usou',
      xp: 100,
      icon: Star
    }
  ];

  const completedCount = Object.values(taskCompleted).filter(Boolean).length;
  const allCompleted = completedCount === tasks.length;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground mb-1">O digital no seu dia a dia</h3>
        <p className="text-sm text-muted-foreground">Segunda missão ativada</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">
            Atividades {completedCount} de {tasks.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round((completedCount / tasks.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.map((task) => {
          const IconComponent = task.icon;
          const isCompleted = taskCompleted[task.id];
          
          return (
            <Card key={task.id} className={`cursor-pointer transition-all ${
              isCompleted ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-secondary/30'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleTaskToggle(task.id)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-secondary hover:border-primary'
                    }`}
                  >
                    {isCompleted && <CheckCircle className="w-3 h-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <h4 className={`text-sm font-medium ${
                        isCompleted ? 'text-primary' : 'text-foreground'
                      }`}>
                        {task.title}
                      </h4>
                      <span className="text-xs text-accent font-bold">+{task.xp} XP</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allCompleted && (
        <div className="mt-4 pt-4 border-t border-secondary/30">
          <Button
            onClick={onComplete}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Concluir Missão 2
          </Button>
        </div>
      )}
    </div>
  );
};