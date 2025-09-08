import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSoftwareMapping } from '@/hooks/useSoftwareMapping';

interface TechnicalSkillsDisplayProps {
  userId: string;
}

interface SkillsByRating {
  [rating: number]: string[];
}

export const TechnicalSkillsDisplay = ({ userId }: TechnicalSkillsDisplayProps) => {
  const [skillsByRating, setSkillsByRating] = useState<SkillsByRating>({});
  const [isLoading, setIsLoading] = useState(true);
  const { getSoftwareForQuestion } = useSoftwareMapping();

  useEffect(() => {
    const loadTechnicalSkills = async () => {
      try {
        console.log('TechnicalSkillsDisplay: Loading data for userId:', userId);
        
        // Buscar respostas da missão 4
        const { data: mission4Response, error } = await supabase
          .from('respostas_missao4')
          .select('respostas')
          .eq('user_id', userId)
          .single();

        if (error || !mission4Response) {
          console.log('TechnicalSkillsDisplay: Usuário não completou a Missão 4 ainda', error);
          setIsLoading(false);
          return;
        }

        const responses = mission4Response.respostas as any;
        console.log('TechnicalSkillsDisplay: Raw responses:', responses);
        
        const ratings: SkillsByRating = { 5: [], 4: [], 3: [], 2: [], 1: [] };

        // Processar questões universais 1-9 (A=1, B=2, C=3, D=4, E=5 estrelas)
        if (responses?.answers) {
          Object.entries(responses.answers).forEach(([questionKey, answer]) => {
            const questionNumber = parseInt(questionKey.replace('question', ''));
            if (questionNumber >= 1 && questionNumber <= 9) {
              const software = getSoftwareForQuestion(questionNumber);
              
              // Converter letra para rating (A=1, B=2, C=3, D=4, E=5)
              const letterToRating: Record<string, number> = {
                'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5
              };
              
              const ratingValue = letterToRating[answer as string];
              if (ratingValue >= 1 && ratingValue <= 5) {
                ratings[ratingValue].push(software);
                console.log(`TechnicalSkillsDisplay: ${software} = ${ratingValue} estrelas`);
              }
            }
          });
        }

        // Processar avaliações específicas da área em starRatings
        if (responses?.starRatings) {
          Object.entries(responses.starRatings).forEach(([areaKey, softwares]) => {
            if (typeof softwares === 'object' && softwares !== null) {
              Object.entries(softwares as Record<string, any>).forEach(([softwareName, rating]) => {
                const ratingValue = parseInt(rating as string);
                if (ratingValue >= 1 && ratingValue <= 5) {
                  ratings[ratingValue].push(softwareName);
                  console.log(`TechnicalSkillsDisplay: ${softwareName} (área específica) = ${ratingValue} estrelas`);
                }
              });
            }
          });
        }

        console.log('TechnicalSkillsDisplay: Final ratings:', ratings);
        setSkillsByRating(ratings);
      } catch (error) {
        console.error('TechnicalSkillsDisplay: Erro ao carregar competências técnicas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadTechnicalSkills();
    }
  }, [userId]);

  if (isLoading) {
    return null;
  }

  // Verificar se há dados para mostrar
  const hasSkills = Object.values(skillsByRating).some(skills => skills.length > 0);
  if (!hasSkills) {
    return null;
  }

  const getRatingLabel = (rating: number) => {
    const labels = {
      5: 'Dominadas',
      4: 'Avançadas', 
      3: 'Intermediárias',
      2: 'Básicas',
      1: 'Iniciantes'
    };
    return labels[rating as keyof typeof labels];
  };

  const getRatingColor = (rating: number) => {
    const colors = {
      5: 'bg-gradient-to-r from-neon-purple to-primary text-white',
      4: 'bg-gradient-to-r from-primary to-accent text-white',
      3: 'bg-gradient-to-r from-accent to-secondary text-white',
      2: 'bg-gradient-to-r from-secondary to-neon-cyan text-white',
      1: 'bg-gradient-to-r from-neon-cyan to-secondary text-white'
    };
    return colors[rating as keyof typeof colors];
  };

  return (
    <Card className="w-full bg-background/80 backdrop-blur-md border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Conhecimento sobre ferramentas digitais de trabalho
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {[5, 4, 3, 2, 1].map(rating => {
          const skills = skillsByRating[rating];
          if (!skills || skills.length === 0) return null;

          return (
            <div key={rating} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index}
                    className={`${getRatingColor(rating)} px-3 py-1 text-sm font-medium`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};