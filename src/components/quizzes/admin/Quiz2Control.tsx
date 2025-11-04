import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuiz2 } from '../quiz2/useQuiz2';
import { ExternalLink, Flame } from 'lucide-react';

export const Quiz2Control = () => {
  const { topWords, uniqueGroupsCount, uniqueWordsCount, submissions } = useQuiz2();
  const screenUrl = `${window.location.origin}/quiz/nuvem-tags/screen`;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">☁️ Nuvem de Tags</h2>
          <p className="text-muted-foreground">Desafios reais do cotidiano</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open(screenUrl, '_blank')}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir Nuvem de Tags
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Status</div>
          <Badge className="bg-blue-500 text-white">
            🟢 Coleta ativa
          </Badge>
          <div className="text-xs text-muted-foreground mt-2">
            Sempre aberto para contribuições
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Grupos</div>
          <div className="text-3xl font-bold">{uniqueGroupsCount}</div>
          <div className="text-xs text-muted-foreground">contribuíram</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Palavras Únicas</div>
          <div className="text-3xl font-bold">{uniqueWordsCount}</div>
          <div className="text-xs text-muted-foreground">identificadas</div>
        </Card>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold">Top 5 Palavras Mais Citadas:</span>
        </div>
        
        {topWords.length > 0 ? (
          <div className="space-y-3">
            {topWords.map((word, index) => (
              <div key={word.text} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {index + 1}.
                  </span>
                  <span className="text-lg font-semibold uppercase">
                    {word.text}
                  </span>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {word.value} {word.value === 1 ? 'menção' : 'menções'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Aguardando primeiras contribuições...
          </div>
        )}
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
        <div className="text-sm text-muted-foreground mb-2">
          💡 Sobre este quiz
        </div>
        <p className="text-sm">
          Este quiz está sempre aberto para coletar contribuições dos grupos. 
          Não há controles de início/pausa - as palavras aparecem na nuvem em tempo real.
          Total de {submissions.length} contribuições recebidas.
        </p>
      </Card>
    </Card>
  );
};
