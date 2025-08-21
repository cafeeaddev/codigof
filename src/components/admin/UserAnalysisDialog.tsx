import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProgress, UserProfile } from '@/types/admin';
import { ProfileOverview } from './UserAnalysis/ProfileOverview';
import { MissionAnalysis } from './UserAnalysis/MissionAnalysis';
import { TechnicalCompetencies } from './UserAnalysis/TechnicalCompetencies';
import { InsightsPanel } from './UserAnalysis/InsightsPanel';

interface UserAnalysisDialogProps {
  user: UserProgress | null;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  calculateUserTotalScore: (userId: string) => number;
  getDigitalProfile: (score: number) => { profile: string; sublevel: string };
  getProfileColor: (profile: string) => string;
  allResponses: {
    missao1: any[];
    missao2: any[];
    missao3: any[];
    missao4: any[];
  };
  questions: any[];
}

export const UserAnalysisDialog = ({
  user,
  userProfile,
  isOpen,
  onClose,
  calculateUserTotalScore,
  getDigitalProfile,
  getProfileColor,
  allResponses,
  questions
}: UserAnalysisDialogProps) => {
  if (!user || !userProfile) return null;

  const totalScore = calculateUserTotalScore(user.user_id);
  const profile = getDigitalProfile(totalScore);
  const profileColor = getProfileColor(profile.profile);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Análise Detalhada: {userProfile.nome}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {userProfile.cargo} • {userProfile.area}
              </p>
            </div>
            <Badge 
              className="px-3 py-1"
              style={{ 
                backgroundColor: profileColor + '20', 
                color: profileColor,
                border: `1px solid ${profileColor}40`
              }}
            >
              {profile.profile}
            </Badge>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="missions">Análise por Missão</TabsTrigger>
              <TabsTrigger value="technical">Competências Técnicas</TabsTrigger>
              <TabsTrigger value="insights">Insights & Recomendações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ProfileOverview
                user={user}
                userProfile={userProfile}
                totalScore={totalScore}
                profile={profile}
                profileColor={profileColor}
              />
            </TabsContent>

            <TabsContent value="missions" className="space-y-6">
              <MissionAnalysis
                user={user}
                userProfile={userProfile}
                allResponses={allResponses}
                totalScore={totalScore}
              />
            </TabsContent>

            <TabsContent value="technical" className="space-y-6">
              <TechnicalCompetencies
                user={user}
                userProfile={userProfile}
                allResponses={allResponses}
                questions={questions}
              />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <InsightsPanel
                user={user}
                userProfile={userProfile}
                totalScore={totalScore}
                profile={profile}
                allResponses={allResponses}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};