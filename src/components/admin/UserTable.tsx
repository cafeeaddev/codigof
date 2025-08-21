import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { UserProgress, UserProfile, AdminFilters } from '@/types/admin';

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
}

export const UserTable = ({
  filteredUsers,
  progressData,
  filters,
  updateFilter,
  filterOptions,
  calculateUserTotalScore,
  getDigitalProfile,
  getProfileColor
}: UserTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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

  return (
    <div className="space-y-6 animate-fade-in">
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
              <SortableHeader column="score">Pontuação Total</SortableHeader>
              <TableHead>Perfil Digital</TableHead>
              <SortableHeader column="xp">XP Total</SortableHeader>
              <SortableHeader column="time">Tempo de Jogo</SortableHeader>
              <TableHead>Missão 1</TableHead>
              <TableHead>Missão 2</TableHead>
              <TableHead>Missão 3</TableHead>
              <TableHead>Missão 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((progress) => {
              const userProfile = progressData.userProfiles?.get(progress.user_id);
              const userName = userProfile?.nome || 'Usuário';
              const userCargo = formatCargo(userProfile?.cargo);
              const totalScore = calculateUserTotalScore(progress.user_id);
              
              // Verifica se completou as missões necessárias para definir perfil (1, 2 e 3)
              const hasCompletedRequiredMissions = progress.missao_1_completed && 
                                                   progress.missao_2_completed && 
                                                   progress.missao_3_completed;
              
              const profile = hasCompletedRequiredMissions 
                ? getDigitalProfile(totalScore)
                : { profile: 'Não Concluído', sublevel: 'Complete as missões 1, 2 e 3' };
              
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
                  <TableCell>{Math.floor((progress.total_play_time || 0) / 60)}min</TableCell>
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
                        {progress.missao_3_completed ? 'Concluída' : `${progress.missao_3_current_question}/5`}
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
                </TableRow>
              );
            })}
            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
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
    </div>
  );
};