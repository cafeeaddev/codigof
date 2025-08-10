import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ResponseViewerProps {
  respostas: any;
  missionType?: 'mission1' | 'mission2' | 'mission3' | 'mission4';
}

const ResponseViewer = ({ respostas, missionType }: ResponseViewerProps) => {
  if (!respostas) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Nenhuma resposta disponível
      </div>
    );
  }

  // Para Missão 1 (quiz de múltipla escolha)
  if (missionType === 'mission1' || (!missionType && typeof respostas === 'object' && respostas.pergunta1)) {
    return (
      <div className="space-y-3">
        {Object.entries(respostas).map(([key, value]) => {
          if (key === 'totalScore' || key === 'missao') return null;
          
          const questionNumber = key.replace('pergunta', '');
          return (
            <Card key={key} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Pergunta {questionNumber}
                  </span>
                  {key === 'totalScore' && (
                    <Badge variant="secondary">
                      Score: {value as string}
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{value as string}</p>
              </CardContent>
            </Card>
          );
        })}
        {respostas.totalScore && (
          <div className="flex justify-end">
            <Badge variant="outline">
              Score Total: {respostas.totalScore}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  // Para Missão 2 (quiz com pontuação)
  if (missionType === 'mission2' || (!missionType && Array.isArray(respostas))) {
    return (
      <div className="space-y-3">
        {respostas.map((resposta: any, index: number) => (
          <Card key={index} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Questão {index + 1}
                </span>
                {resposta.pontos && (
                  <Badge variant="secondary">
                    {resposta.pontos} {resposta.pontos === 1 ? 'ponto' : 'pontos'}
                  </Badge>
                )}
              </div>
              <p className="text-sm mb-2">
                <strong>Pergunta:</strong> {resposta.pergunta}
              </p>
              <p className="text-sm">
                <strong>Resposta:</strong> {resposta.resposta}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Para Missão 3 e 4 (estrutura similar)
  if (missionType === 'mission3' || missionType === 'mission4' || 
      (!missionType && typeof respostas === 'object' && !Array.isArray(respostas))) {
    
    // Se é um objeto com perguntas numeradas
    if (Object.keys(respostas).some(key => key.includes('pergunta') || key.includes('questao'))) {
      return (
        <div className="space-y-3">
          {Object.entries(respostas).map(([key, value]) => {
            if (key === 'totalScore' || key === 'missao' || key === 'pontuacaoTotal') return null;
            
            const questionNumber = key.replace(/pergunta|questao/, '').replace(/[^0-9]/g, '');
            return (
              <Card key={key} className="border-border/40">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {questionNumber ? `Questão ${questionNumber}` : key}
                    </span>
                  </div>
                  <p className="text-sm">{value as string}</p>
                </CardContent>
              </Card>
            );
          })}
          {(respostas.totalScore || respostas.pontuacaoTotal) && (
            <div className="flex justify-end">
              <Badge variant="outline">
                Score Total: {respostas.totalScore || respostas.pontuacaoTotal}
              </Badge>
            </div>
          )}
        </div>
      );
    }

    // Para outros tipos de objeto estruturado
    return (
      <div className="space-y-2">
        {Object.entries(respostas).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
            <div className="p-2 bg-muted/30 rounded text-sm">
              {typeof value === 'object' ? (
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <span>{value as string}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback para JSON bruto (com melhor formatação)
  return (
    <Card className="border-border/40">
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground mb-2">Dados brutos:</div>
        <pre className="text-xs whitespace-pre-wrap bg-muted/30 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(respostas, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default ResponseViewer;