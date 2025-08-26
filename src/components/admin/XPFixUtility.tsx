import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { fixAffectedUsersXP, checkUserXPStatus } from '@/utils/fixUserXP';
import { toast } from '@/hooks/use-toast';

export const XPFixUtility: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState('');
  const [userCheckResult, setUserCheckResult] = useState<any>(null);

  const handleFixAllUsers = async () => {
    setIsFixing(true);
    setFixResult(null);
    
    try {
      const result = await fixAffectedUsersXP();
      setFixResult(result);
      
      if (result.success) {
        toast({
          title: "Correção concluída",
          description: `${result.correctedUsers} usuários corrigidos com sucesso`,
        });
      } else {
        toast({
          title: "Erro na correção",
          description: "Houve um problema durante a correção",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao executar correção:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro inesperado durante a correção",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleCheckUser = async () => {
    if (!checkingUser.trim()) return;
    
    try {
      const result = await checkUserXPStatus(checkingUser.trim());
      setUserCheckResult(result);
      
      if (!result.success) {
        toast({
          title: "Erro ao verificar usuário",
          description: "Não foi possível verificar o status do usuário",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro inesperado ao verificar usuário",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Correção de XP - Bug das 25 XP Perdidas
          </CardTitle>
          <CardDescription>
            Ferramenta para corrigir usuários afetados pelo bug que causava perda de 25 XP durante a finalização do jogo.
            O problema ocorria quando o game_base_xp era definido incorretamente como total_xp ao invés do valor correto (100 XP para 4 missões).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta correção afeta apenas usuários que completaram as 4 missões mas têm game_base_xp ≠ 100.
              <br />
              <strong>Exemplo:</strong> João tinha 75 XP ao invés de 100 XP, resultando em 175 XP total ao invés de 200 XP.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={handleFixAllUsers} 
              disabled={isFixing}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isFixing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isFixing ? 'Corrigindo...' : 'Corrigir Todos os Usuários Afetados'}
            </Button>
          </div>

          {fixResult && (
            <div className="mt-4 p-4 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                {fixResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                Resultado da Correção
              </h4>
              
              {fixResult.success ? (
                <div className="space-y-2">
                  <p>
                    <Badge variant="outline" className="mr-2">Sucesso</Badge>
                    {fixResult.correctedUsers} de {fixResult.totalAffectedUsers} usuários corrigidos
                  </p>
                  
                  {fixResult.corrections && fixResult.corrections.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        Ver detalhes das correções
                      </summary>
                      <div className="mt-2 space-y-1 text-sm">
                        {fixResult.corrections.map((correction: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            {correction.success ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="font-mono text-xs">
                              {correction.user_id.substring(0, 8)}...
                            </span>
                            {correction.success ? (
                              <span className="text-green-600">
                                {correction.oldValue} → {correction.newValue} XP
                              </span>
                            ) : (
                              <span className="text-red-600">Erro na correção</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <p className="text-red-600">
                  <Badge variant="destructive" className="mr-2">Erro</Badge>
                  {fixResult.error?.message || 'Erro desconhecido'}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verificar Usuário Específico</CardTitle>
          <CardDescription>
            Verifique o status do XP de um usuário específico pelo ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ID do usuário (UUID)"
              value={checkingUser}
              onChange={(e) => setCheckingUser(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button onClick={handleCheckUser} disabled={!checkingUser.trim()}>
              Verificar
            </Button>
          </div>

          {userCheckResult && (
            <div className="mt-4 p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Status do Usuário</h4>
              
              {userCheckResult.success ? (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Missões Completadas:</strong> {userCheckResult.completedMissions}/4
                    </div>
                    <div>
                      <strong>XP Base Atual:</strong> {userCheckResult.currentGameBaseXP}
                    </div>
                    <div>
                      <strong>XP Base Esperado:</strong> {userCheckResult.expectedGameBaseXP}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <Badge 
                        variant={userCheckResult.isCorrect ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {userCheckResult.isCorrect ? 'Correto' : 'Incorreto'}
                      </Badge>
                    </div>
                  </div>
                  
                  {userCheckResult.needsCorrection && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Este usuário precisa de correção! Completou 4 missões mas tem XP base incorreto.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-red-600">
                  Erro ao verificar usuário: {userCheckResult.error?.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};