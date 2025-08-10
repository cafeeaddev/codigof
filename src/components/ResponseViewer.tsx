import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getQuestionById, getOptionText } from '@/data/questions';

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

  // Handle Mission 2 with nested data structure: {data: [...], missao: 2}
  if (missionType === 'mission2' && typeof respostas === 'object' && respostas.data && Array.isArray(respostas.data)) {
    return (
      <div className="space-y-3">
        {respostas.data.map((resposta: any, index: number) => {
          const question = getQuestionById('mission2', resposta.pergunta);
          const optionText = getOptionText('mission2', resposta.pergunta, resposta.resposta);
          
          return (
            <Card key={index} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Questão {resposta.pergunta}
                  </span>
                  {resposta.pontuacao !== undefined && (
                    <Badge variant="secondary">
                      {Number(resposta.pontuacao)} {Number(resposta.pontuacao) === 1 ? 'ponto' : 'pontos'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm mb-2">
                  <strong>Pergunta:</strong> {question?.question || `Pergunta ${resposta.pergunta}`}
                </p>
                <p className="text-sm">
                  <strong>Resposta {resposta.resposta}:</strong> {optionText}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }


  // Handle all missions with array format: [{pergunta, resposta, pontuacao}]
  if (Array.isArray(respostas)) {
    return (
      <div className="space-y-3">
        {respostas.map((resposta: any, index: number) => {
          if (typeof resposta === 'object' && resposta.pergunta !== undefined) {
            const question = getQuestionById(missionType || 'mission1', resposta.pergunta);
            const optionText = getOptionText(missionType || 'mission1', resposta.pergunta, resposta.resposta);
            
            return (
              <Card key={index} className="border-border/40">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Questão {resposta.pergunta}
                    </span>
                    {resposta.pontuacao !== undefined && (
                      <Badge variant="secondary">
                        {Number(resposta.pontuacao)} {Number(resposta.pontuacao) === 1 ? 'ponto' : 'pontos'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mb-2">
                    <strong>Pergunta:</strong> {question?.question || `Pergunta ${resposta.pergunta}`}
                  </p>
                  <p className="text-sm">
                    <strong>Resposta {resposta.resposta}:</strong> {optionText}
                  </p>
                </CardContent>
              </Card>
            );
          }
          
          // Fallback for other structures
          return (
            <Card key={index} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Questão {index + 1}
                  </span>
                </div>
                <p className="text-sm">
                  {typeof resposta === 'object' ? JSON.stringify(resposta) : String(resposta || 'N/A')}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }


  // Handle Mission 4 format: {answers: {1:"a", 2:"b"...}, totalScore: 24.4}
  if (missionType === 'mission4' && typeof respostas === 'object' && respostas.answers) {
    return (
      <div className="space-y-3">
        {Object.entries(respostas.answers).map(([questionId, answer]) => {
          const question = getQuestionById('mission4', parseInt(questionId));
          const optionText = getOptionText('mission4', parseInt(questionId), String(answer).toUpperCase());
          
          // Calculate individual points for this answer
          let individualPoints = 0;
          if (question && question.options) {
            const answerKey = String(answer).toUpperCase() as keyof typeof question.options;
            if (question.options[answerKey]) {
              individualPoints = question.options[answerKey].points;
            }
          }
          
          return (
            <Card key={questionId} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Questão {questionId}
                  </span>
                  <Badge variant="secondary">
                    {individualPoints} {individualPoints === 1 ? 'ponto' : 'pontos'}
                  </Badge>
                </div>
                <p className="text-sm mb-2">
                  <strong>Pergunta:</strong> {question?.question || `Pergunta ${questionId}`}
                </p>
                <p className="text-sm">
                  <strong>Resposta {String(answer).toUpperCase()}:</strong> {optionText}
                </p>
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

  // Handle legacy object formats (Mission 1, 3, 4 with different structures)
  if (typeof respostas === 'object' && !Array.isArray(respostas)) {
    // Check if it's a Mission 1 format (pergunta1, pergunta2, etc.)
    if (Object.keys(respostas).some(key => key.includes('pergunta'))) {
      return (
        <div className="space-y-3">
          {Object.entries(respostas).map(([key, value]) => {
            if (key === 'totalScore' || key === 'missao' || key === 'pontuacaoTotal') return null;
            
            const questionNumber = key.replace(/pergunta/, '').replace(/[^0-9]/g, '');
            const questionId = parseInt(questionNumber);
            
            if (questionId && missionType) {
              const question = getQuestionById(missionType, questionId);
              const optionText = getOptionText(missionType, questionId, String(value));
              
              return (
                <Card key={key} className="border-border/40">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Questão {questionId}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      <strong>Pergunta:</strong> {question?.question || `Pergunta ${questionId}`}
                    </p>
                    <p className="text-sm">
                      <strong>Resposta {String(value)}:</strong> {optionText}
                    </p>
                  </CardContent>
                </Card>
              );
            }
            
            return (
              <Card key={key} className="border-border/40">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {questionNumber ? `Questão ${questionNumber}` : key}
                    </span>
                  </div>
                  <p className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A')}</p>
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

    // Generic object handler
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
                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A')}</span>
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