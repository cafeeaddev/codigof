import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuiz4 } from '../quiz4/useQuiz4';
import { ExternalLink, Users, Layers } from 'lucide-react';

export const Quiz4Control = () => {
  const { submissions, uniqueGroupsCount } = useQuiz4();

  const openProjectionScreen = () => {
    window.open('/quiz/canvas/screen', '_blank');
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Canvas Colaborativo
          </h3>
          <p className="text-gray-600">
            Gerenciar canvas de ideias
          </p>
        </div>
        <Button
          onClick={openProjectionScreen}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir Tela de Projeção
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-white border-violet-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-600" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{uniqueGroupsCount}</p>
              <p className="text-sm text-gray-600">Grupos Únicos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-fuchsia-200">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-fuchsia-600" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
              <p className="text-sm text-gray-600">Canvas Criados</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">Últimas Submissões:</h4>
        {submissions.slice(0, 5).map((submission) => (
          <div
            key={submission.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div>
              <p className="font-medium text-gray-900">{submission.group_name}</p>
              {submission.group_members && (
                <p className="text-sm text-gray-500">{submission.group_members}</p>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(submission.created_at).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        ))}
        {submissions.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Nenhum canvas enviado ainda
          </p>
        )}
      </div>
    </Card>
  );
};
