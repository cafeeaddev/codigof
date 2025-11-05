import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, FileText } from 'lucide-react';
import { useQuiz5 } from '../quiz5/useQuiz5';

export const Quiz5Control = () => {
  const { submissions, totalParticipants, totalPostits } = useQuiz5();

  const openProjectionScreen = () => {
    window.open('/quiz/mapa/screen', '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            Quiz 5: Mapa da Alfabetização Tecnológica
          </CardTitle>
          <CardDescription>
            Mural colaborativo com 3 colunas de post-its
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={openProjectionScreen}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Abrir Tela de Projeção
          </Button>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-sky-500" />
                  <div>
                    <p className="text-3xl font-bold">{totalParticipants}</p>
                    <p className="text-sm text-muted-foreground">Participantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-3xl font-bold">{totalPostits}</p>
                    <p className="text-sm text-muted-foreground">Post-its</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {submissions.length > 0 && (
            <div className="pt-4 space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Últimas 5 Submissões:
              </h4>
              <div className="space-y-2">
                {submissions.slice(0, 5).map((sub) => (
                  <Card key={sub.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{sub.participant_name}</p>
                          <p className="text-xs text-muted-foreground">{sub.initials}</p>
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
