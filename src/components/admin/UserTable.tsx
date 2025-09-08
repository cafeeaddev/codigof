import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Search, Users, Eye, ChevronDown, RotateCcw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserProgress, UserProfile, AdminFilters } from '@/types/admin';
import { ResetProgressDialog } from './ResetProgressDialog';

interface UserTableProps {
  filteredUsers: UserProgress[];
  progressData: {
    userProfiles: Map<string, UserProfile>;
  };
  filters: AdminFilters;
  updateFilter: (key: keyof AdminFilters, value: string) => void;
  filterOptions: { cargos: string[]; areas: string[] };
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
  fastTrackData: Map<string, { accepted: boolean; reason?: string }>;
  onUserAnalysis: (user: UserProgress, userProfile: UserProfile) => void;
  onDataRefresh: () => void;
}

export const UserTable = ({
  filteredUsers,
  progressData,
  filters,
  updateFilter,
  filterOptions,
  calculateUserTotalScore,
  getDigitalProfile,
  getProfileColor,
  allResponses,
  questions,
  fastTrackData,
  onUserAnalysis,
  onDataRefresh
}: UserTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserProgress | null>(null);
  const [selectedUserProfileForReset, setSelectedUserProfileForReset] = useState<UserProfile | null>(null);
  const itemsPerPage = 10;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any, bValue: any;

    switch (sortColumn) {
      case 'name':
        aValue = progressData.userProfiles?.get(a.user_id)?.nome || '';
        bValue = progressData.userProfiles?.get(b.user_id)?.nome || '';
        break;
      case 'score':
        aValue = calculateUserTotalScore(a.user_id);
        bValue = calculateUserTotalScore(b.user_id);
        break;
      case 'xp':
        aValue = a.total_xp || 0;
        bValue = b.total_xp || 0;
        break;
      case 'time':
        aValue = a.total_play_time || 0;
        bValue = b.total_play_time || 0;
        break;
      case 'created':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'ended':
        aValue = a.game_end_date ? new Date(a.game_end_date) : new Date(0);
        bValue = b.game_end_date ? new Date(b.game_end_date) : new Date(0);
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const formatCargo = (cargo: string | null | undefined) => {
    if (!cargo) return '';
    return cargo.replace(/^\d+-/, '').trim();
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortColumn === column && (
          <span className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  const ProfileLegend = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const profileRanges = [
      { name: 'Ninja Raiz™ 😎', range: '52-55', percentage: '95-100%', color: 'hsl(var(--profile-ninja))' },
      { name: 'Ninja Consolidação', range: '47-51', percentage: '85-93%', color: 'hsl(var(--profile-ninja))' },
      { name: 'Pro-Player Transição → Ninja', range: '38-46', percentage: '69-84%', color: 'hsl(var(--profile-pro-player))' },
      { name: 'Pro-Player Início/Consolidado', range: '34-37', percentage: '62-67%', color: 'hsl(var(--profile-pro-player))' },
      { name: 'Explorer Transição → Pro-Player', range: '28-33', percentage: '51-60%', color: 'hsl(var(--profile-explorer))' },
      { name: 'Explorer Início', range: '23-27', percentage: '42-49%', color: 'hsl(var(--profile-explorer))' },
      { name: 'Beginner + Transição → Explorer', range: '16-22', percentage: '29-40%', color: 'hsl(var(--profile-beginner-plus))' },
      { name: 'Beginner Início', range: '0-15', percentage: '0-27%', color: 'hsl(var(--profile-beginner))' }
    ];

    return (
      <Card className="mb-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Legenda de Perfis Digitais</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Pontuação máxima: 55 pontos
                  </Badge>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profileRanges.map((profile, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: profile.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{profile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {profile.range} pontos ({profile.percentage})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        <ProfileLegend />
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-48">
          <Select
            value={filters.cargoFilter}
            onValueChange={(value) => {
              updateFilter('cargoFilter', value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os cargos</SelectItem>
              {filterOptions.cargos.map((cargo) => (
                <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-48">
          <Select
            value={filters.areaFilter}
            onValueChange={(value) => {
              updateFilter('areaFilter', value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as áreas</SelectItem>
              {filterOptions.areas.map((area) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-48">
          <Select
            value={filters.profileFilter}
            onValueChange={(value) => {
              updateFilter('profileFilter', value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os perfis</SelectItem>
              <SelectItem value="Beginner">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-beginner))' }}></div>
                  Beginner
                </span>
              </SelectItem>
              <SelectItem value="Beginner +">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-beginner-plus))' }}></div>
                  Beginner +
                </span>
              </SelectItem>
              <SelectItem value="Explorer">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-explorer))' }}></div>
                  Explorer
                </span>
              </SelectItem>
              <SelectItem value="Pro-Player">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-pro-player))' }}></div>
                  Pro-Player
                </span>
              </SelectItem>
              <SelectItem value="Ninja">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--profile-ninja))' }}></div>
                  Ninja
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant="secondary" className="ml-auto">
          {filteredUsers.length} usuários encontrados
        </Badge>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="name">Usuário</SortableHeader>
              <TableHead>Cargo</TableHead>
              <TableHead>Área</TableHead>
              <SortableHeader column="created">Data de Início</SortableHeader>
              <SortableHeader column="ended">Data de Fim</SortableHeader>
              <SortableHeader column="score">Pontuação Total</SortableHeader>
              <TableHead>Perfil Digital</TableHead>
              <SortableHeader column="xp">XP Total</SortableHeader>
              <SortableHeader column="time">Tempo de Jogo</SortableHeader>
              <TableHead>Missão 1</TableHead>
              <TableHead>Missão 2</TableHead>
              <TableHead>Missão 3</TableHead>
              <TableHead>Missão 4</TableHead>
              <TableHead>Missão Extra</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((progress) => {
              const userProfile = progressData.userProfiles?.get(progress.user_id);
              const userName = userProfile?.nome || 'Usuário';
              const userCargo = formatCargo(userProfile?.cargo);
              const totalScore = calculateUserTotalScore(progress.user_id);
              
              // Verifica se completou todas as missões necessárias para definir perfil (1, 2, 3 e 4)
              const hasCompletedRequiredMissions = progress.missao_1_completed && 
                                                   progress.missao_2_completed && 
                                                   progress.missao_3_completed &&
                                                   progress.missao_4_completed;
              
              const profile = hasCompletedRequiredMissions 
                ? getDigitalProfile(totalScore)
                : { profile: "Não Concluído", sublevel: "" };
              
              const profileColor = hasCompletedRequiredMissions 
                ? getProfileColor(profile.profile)
                : 'hsl(var(--muted-foreground))';
              
              return (
                <TableRow key={progress.user_id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{userName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {userCargo || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {userProfile?.area || '-'}
                  </TableCell>
                  <TableCell>{new Date(progress.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {progress.game_end_date 
                      ? new Date(progress.game_end_date).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="font-medium" style={{ color: 'hsl(var(--profile-ninja))' }}>
                    {totalScore.toFixed(2)} pts
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span 
                        className="font-medium px-2 py-1 rounded text-xs w-fit"
                        style={{ 
                          backgroundColor: profileColor + '20', 
                          color: profileColor,
                          border: `1px solid ${profileColor}40`
                        }}
                      >
                        {profile.profile}
                      </span>
                      <span className="text-xs text-muted-foreground">{profile.sublevel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-primary font-medium">{progress.total_xp || 0} XP</TableCell>
                  <TableCell>
                    {(() => {
                      const totalSeconds = progress.total_play_time || 0;
                      const minutes = Math.floor(totalSeconds / 60);
                      if (minutes > 120) { // More than 2 hours, likely corrupted
                        console.warn(`[UserTable] Suspicious time for ${userProfile?.nome}: ${totalSeconds}s (${minutes}min)`);
                      }
                      return `${minutes}min`;
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {progress.missao_1_completed ? '✅' : '⏳'}
                      <span className="text-xs text-muted-foreground ml-1">
                        {progress.missao_1_completed ? 'Concluída' : `${progress.missao_1_current_question}/4`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {progress.missao_2_completed ? '✅' : '⏳'}
                      <span className="text-xs text-muted-foreground ml-1">
                        {progress.missao_2_completed ? 'Concluída' : `${progress.missao_2_current_question}/3`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {progress.missao_3_completed ? '✅' : '⏳'}
                      <span className="text-xs text-muted-foreground ml-1">
                        {progress.missao_3_completed ? 'Concluída' : `${progress.missao_3_current_question}/4`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {progress.missao_4_completed ? '✅' : '⏳'}
                      <span className="text-xs text-muted-foreground ml-1">
                        {progress.missao_4_completed ? 'Concluída' : `${progress.missao_4_current_question}/5`}
                      </span>
                    </div>
                  </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-1">
                       {(() => {
                         const fastTrackInfo = fastTrackData.get(progress.user_id);
                         if (fastTrackInfo?.accepted === true) {
                           return (
                             <>
                               <span className="text-green-500 font-medium">SIM</span>
                               <span className="text-xs text-muted-foreground ml-1">Aceitou</span>
                             </>
                           );
                         } else if (fastTrackInfo?.accepted === false) {
                           return (
                             <div className="flex items-center gap-1">
                               <span className="text-red-500 font-medium">NÃO</span>
                               <span className="text-xs text-muted-foreground ml-1">Recusou</span>
                               {fastTrackInfo.reason && (
                                 <Tooltip>
                                   <TooltipTrigger asChild>
                                     <Info className="h-3 w-3 text-muted-foreground cursor-help ml-1" />
                                   </TooltipTrigger>
                                   <TooltipContent side="top" className="max-w-xs">
                                     <p className="text-sm">{fastTrackInfo.reason}</p>
                                   </TooltipContent>
                                 </Tooltip>
                               )}
                             </div>
                           );
                         } else {
                           return (
                             <>
                               <span className="text-gray-500">-</span>
                               <span className="text-xs text-muted-foreground ml-1">Não respondeu</span>
                             </>
                           );
                         }
                       })()}
                     </div>
                   </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-1">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => onUserAnalysis(progress, userProfile)}
                         className="h-8 w-8 p-0"
                         title="Analisar usuário"
                       >
                         <Eye className="h-4 w-4" />
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setSelectedUserForReset(progress);
                           setSelectedUserProfileForReset(userProfile || null);
                           setResetDialogOpen(true);
                         }}
                         className="h-8 w-8 p-0 hover:bg-destructive/10 hover:border-destructive/20"
                         title="Resetar progresso"
                       >
                         <RotateCcw className="h-4 w-4 text-destructive" />
                       </Button>
                     </div>
                   </TableCell>
                </TableRow>
              );
            })}
            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de Reset */}
      <ResetProgressDialog
        isOpen={resetDialogOpen}
        onClose={() => {
          setResetDialogOpen(false);
          setSelectedUserForReset(null);
          setSelectedUserProfileForReset(null);
        }}
        user={selectedUserForReset}
        userProfile={selectedUserProfileForReset}
        onResetSuccess={() => {
          onDataRefresh();
        }}
      />
      </div>
    </TooltipProvider>
  );
};