import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { UserProgress, UserProfile } from '@/types/admin';
import { Star, TrendingUp, Award, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface TechnicalCompetenciesProps {
  user: UserProgress;
  userProfile: UserProfile;
  allResponses: {
    missao1: any[];
    missao2: any[];
    missao3: any[];
    missao4: any[];
  };
  questions: any[];
}

export const TechnicalCompetencies = ({
  user,
  userProfile,
  allResponses,
  questions
}: TechnicalCompetenciesProps) => {
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  // Encontrar resposta da missão 4 do usuário
  const mission4Response = allResponses.missao4.find(
    r => r.user_id === user.user_id || r.email === userProfile.email
  );

  if (!mission4Response || !user.missao_4_completed) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Missão 4 (Competências Técnicas) ainda não foi concluída.
          </p>
        </CardContent>
      </Card>
    );
  }

  const responses = mission4Response.respostas || {};
  
  // Processar dados de competências
  const competencyData: Array<{
    software: string;
    rating: number;
    category: string;
  }> = [];

  // Extrair competências das respostas
  
  // Primeiro, processar respostas básicas (answers: 1-9)
  if (responses.answers) {
    const basicQuestions = [
      { id: '1', software: 'Microsoft Word', category: 'Ferramentas Básicas' },
      { id: '2', software: 'Microsoft PowerPoint', category: 'Ferramentas Básicas' },
      { id: '3', software: 'Microsoft Excel', category: 'Ferramentas Básicas' },
      { id: '4', software: 'Power BI', category: 'Análise de Dados' },
      { id: '5', software: 'Power Automate', category: 'Automação' },
      { id: '6', software: 'SharePoint', category: 'Colaboração' },
      { id: '7', software: 'Power Apps', category: 'Desenvolvimento' },
      { id: '8', software: 'Banco de Dados / SQL', category: 'Análise de Dados' },
      { id: '9', software: 'Inteligência Artificial', category: 'Tecnologias Emergentes' }
    ];

    basicQuestions.forEach(({ id, software, category }) => {
      const answer = responses.answers[id];
      if (answer) {
        // Converter resposta A-E para rating 1-5
        const ratingMap: { [key: string]: number } = {
          'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5
        };
        const rating = ratingMap[answer] || 0;
        
        if (rating > 0) {
          competencyData.push({
            software,
            rating,
            category
          });
        }
      }
    });
  }

  // Segundo, processar avaliações por estrelas (starRatings)
  if (responses.starRatings) {
    // Nova estrutura: starRatings: {"19": {"Atlas": 5, "Audit Report": 5}}
    Object.entries(responses.starRatings).forEach(([questionId, softwares]: [string, any]) => {
      if (typeof softwares === 'object' && softwares) {
        Object.entries(softwares).forEach(([software, rating]: [string, any]) => {
          if (rating > 0) {
            // Mapear categoria baseada no questionId ou software
            let category = 'Ferramentas de Área';
            if (software.toLowerCase().includes('excel') || software.toLowerCase().includes('power')) {
              category = 'Análise de Dados';
            } else if (software.toLowerCase().includes('atlas') || software.toLowerCase().includes('audit')) {
              category = 'Auditoria e Compliance';
            } else if (software.toLowerCase().includes('tableau') || software.toLowerCase().includes('qlik')) {
              category = 'Business Intelligence';
            } else if (software.toLowerCase().includes('word') || software.toLowerCase().includes('powerpoint')) {
              category = 'Ferramentas Básicas';
            }
            
            competencyData.push({
              software,
              rating: Number(rating),
              category
            });
          }
        });
      }
    });
  }
  
  // Estrutura antiga compatível (fallback)
  if (competencyData.length === 0) {
    Object.entries(responses).forEach(([questionId, answer]: [string, any]) => {
      const question = questions.find(q => q.id.toString() === questionId);
      if (question && question.softwares && typeof answer === 'object' && answer.ratings) {
        question.softwares.forEach((software: string, index: number) => {
          const rating = answer.ratings[index];
          if (rating > 0) {
            competencyData.push({
              software,
              rating,
              category: question.question_text || 'Geral'
            });
          }
        });
      }
    });
  }

  // Agrupar por categoria
  const categories = [...new Set(competencyData.map(item => item.category))];
  
  // Calcular estatísticas
  const totalEvaluations = competencyData.length;
  const averageRating = totalEvaluations > 0 
    ? competencyData.reduce((sum, item) => sum + item.rating, 0) / totalEvaluations 
    : 0;
  
  const ratingDistribution = {
    5: competencyData.filter(item => item.rating === 5).length,
    4: competencyData.filter(item => item.rating === 4).length,
    3: competencyData.filter(item => item.rating === 3).length,
    2: competencyData.filter(item => item.rating === 2).length,
    1: competencyData.filter(item => item.rating === 1).length,
  };

  const getRatingLabel = (rating: number): string => {
    const labels = {
      5: 'Especialista',
      4: 'Avançado',
      3: 'Intermediário',
      2: 'Básico',
      1: 'Iniciante'
    };
    return labels[rating as keyof typeof labels] || 'N/A';
  };

  const getRatingColor = (rating: number): string => {
    const colors = {
      5: 'hsl(var(--profile-ninja))',
      4: 'hsl(var(--profile-pro-player))',
      3: 'hsl(var(--profile-explorer))',
      2: 'hsl(var(--profile-beginner-plus))',
      1: 'hsl(var(--profile-beginner))'
    };
    return colors[rating as keyof typeof colors] || 'hsl(var(--muted-foreground))';
  };

  // Top competências
  const topCompetencies = competencyData
    .filter(item => item.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Áreas de melhoria
  const improvementAreas = competencyData
    .filter(item => item.rating <= 2)
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 5);

  // Calcular estatísticas por categoria
  const getCategoryStats = (category: string) => {
    const categoryItems = competencyData.filter(item => item.category === category);
    const totalItems = categoryItems.length;
    const averageRating = totalItems > 0 
      ? categoryItems.reduce((sum, item) => sum + item.rating, 0) / totalItems 
      : 0;
    
    const distribution = {
      5: categoryItems.filter(item => item.rating === 5).length,
      4: categoryItems.filter(item => item.rating === 4).length,
      3: categoryItems.filter(item => item.rating === 3).length,
      2: categoryItems.filter(item => item.rating === 2).length,
      1: categoryItems.filter(item => item.rating === 1).length,
    };

    const topSkills = categoryItems
      .filter(item => item.rating >= 4)
      .sort((a, b) => b.rating - a.rating);
    
    const improvementSkills = categoryItems
      .filter(item => item.rating <= 2)
      .sort((a, b) => a.rating - b.rating);

    return {
      totalItems,
      averageRating,
      distribution,
      topSkills,
      improvementSkills
    };
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-primary" />
              Avaliações Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEvaluations}</p>
            <p className="text-muted-foreground text-sm">softwares avaliados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= averageRating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">{getRatingLabel(Math.round(averageRating))}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-primary" />
              Especialidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ratingDistribution[5]}</p>
            <p className="text-muted-foreground text-sm">competências de especialista</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Competências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = totalEvaluations > 0 ? (count / totalEvaluations) * 100 : 0;
              
              return (
                <div key={rating} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{getRatingLabel(rating)}</span>
                    </div>
                    <Badge variant="secondary">{count} ({percentage.toFixed(0)}%)</Badge>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      backgroundColor: 'hsl(var(--muted))'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Competências */}
      {topCompetencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Principais Competências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {topCompetencies.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.software}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= item.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge 
                      style={{ 
                        backgroundColor: getRatingColor(item.rating) + '20',
                        color: getRatingColor(item.rating),
                        border: `1px solid ${getRatingColor(item.rating)}40`
                      }}
                    >
                      {getRatingLabel(item.rating)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Áreas de Melhoria */}
      {improvementAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Oportunidades de Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {improvementAreas.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.software}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= item.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: getRatingColor(item.rating) + '20',
                        color: getRatingColor(item.rating),
                        border: `1px solid ${getRatingColor(item.rating)}40`
                      }}
                    >
                      {getRatingLabel(item.rating)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todas as Competências por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Competências por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => {
              const categoryItems = competencyData.filter(item => item.category === category);
              const categoryStats = getCategoryStats(category);
              const isExpanded = expandedArea === category;
              
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-primary">{category}</h4>
                      <Badge variant="secondary">
                        {categoryStats.totalItems} softwares
                      </Badge>
                      <Badge variant="outline">
                        Média: {categoryStats.averageRating.toFixed(1)}⭐
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedArea(isExpanded ? null : category)}
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Detalhes
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Lista básica de softwares */}
                  <div className="grid gap-2">
                    {categoryItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                        <span className="text-sm">{item.software}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= item.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getRatingLabel(item.rating)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seção expandida com detalhes */}
                  {isExpanded && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/10 space-y-4">
                      <h5 className="font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Análise Detalhada - {category}
                      </h5>

                      {/* Estatísticas da categoria */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-background">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Star className="w-3 h-3" />
                              Softwares Avaliados
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xl font-bold">{categoryStats.totalItems}</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-background">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" />
                              Média da Categoria
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-bold">{categoryStats.averageRating.toFixed(1)}</p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= categoryStats.averageRating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-background">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Award className="w-3 h-3" />
                              Especialidades
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xl font-bold">{categoryStats.distribution[5]}</p>
                            <p className="text-xs text-muted-foreground">softwares nível especialista</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Distribuição de competências */}
                      <div>
                        <h6 className="font-medium mb-3">Distribuição de Competências</h6>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map(rating => {
                            const count = categoryStats.distribution[rating as keyof typeof categoryStats.distribution];
                            const percentage = categoryStats.totalItems > 0 ? (count / categoryStats.totalItems) * 100 : 0;
                            
                            return (
                              <div key={rating} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                          key={star}
                                          className={`w-3 h-3 ${
                                            star <= rating 
                                              ? 'fill-yellow-400 text-yellow-400' 
                                              : 'text-muted-foreground'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span>{getRatingLabel(rating)}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {count} ({percentage.toFixed(0)}%)
                                  </Badge>
                                </div>
                                <Progress value={percentage} className="h-1" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Destaques da categoria */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryStats.topSkills.length > 0 && (
                          <div>
                            <h6 className="font-medium mb-2 text-green-600 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Principais Competências
                            </h6>
                            <div className="space-y-1">
                              {categoryStats.topSkills.slice(0, 3).map((skill, idx) => (
                                <div key={idx} className="text-sm flex items-center justify-between py-1 px-2 bg-green-50 rounded">
                                  <span>{skill.software}</span>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= skill.rating 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {categoryStats.improvementSkills.length > 0 && (
                          <div>
                            <h6 className="font-medium mb-2 text-orange-600 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Oportunidades de Melhoria
                            </h6>
                            <div className="space-y-1">
                              {categoryStats.improvementSkills.slice(0, 3).map((skill, idx) => (
                                <div key={idx} className="text-sm flex items-center justify-between py-1 px-2 bg-orange-50 rounded">
                                  <span>{skill.software}</span>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= skill.rating 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};