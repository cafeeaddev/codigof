import { useState, useMemo } from 'react';
import { AdminFilters, UserProgress, UserProfile } from '@/types/admin';

interface UseFiltersProps {
  progressData: {
    data: UserProgress[];
    userProfiles: Map<string, UserProfile>;
  } | null;
  adminUsers: { data: any[] } | null;
  calculateUserTotalScore: (userId: string) => number;
  getDigitalProfile: (score: number) => { profile: string; sublevel: string };
}

export const useFilters = ({ 
  progressData, 
  adminUsers, 
  calculateUserTotalScore, 
  getDigitalProfile 
}: UseFiltersProps) => {
  const [filters, setFilters] = useState<AdminFilters>({
    searchTerm: '',
    cargoFilter: '',
    areaFilter: '',
    profileFilter: ''
  });

  const updateFilter = (key: keyof AdminFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredUsers = useMemo(() => {
    if (!progressData || !adminUsers) return [];

    const adminUserIds = new Set(adminUsers.data.map(admin => admin.user_id));
    const allUsers = progressData.data.filter(progress => !adminUserIds.has(progress.user_id));

    return allUsers.filter(progress => {
      const userProfile = progressData.userProfiles?.get(progress.user_id);
      const userName = userProfile?.nome || 'Usuário';
      
      // Filtro por busca
      const matchesSearch = userName.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Filtro por cargo
      let matchesCargo = true;
      if (filters.cargoFilter && filters.cargoFilter !== "todos") {
        const userCargo = userProfile?.cargo?.replace(/^\d+-/, '').trim() || '';
        matchesCargo = userCargo === filters.cargoFilter;
      }
      
      // Filtro por área
      let matchesArea = true;
      if (filters.areaFilter && filters.areaFilter !== "todos") {
        const userArea = userProfile?.area || '';
        matchesArea = userArea === filters.areaFilter;
      }
      
      // Filtro por perfil
      let matchesProfile = true;
      if (filters.profileFilter && filters.profileFilter !== "todos") {
        const totalScore = calculateUserTotalScore(progress.user_id);
        const digitalProfile = getDigitalProfile(totalScore);
        matchesProfile = digitalProfile.profile === filters.profileFilter;
      }
      
      return matchesSearch && matchesCargo && matchesArea && matchesProfile;
    });
  }, [progressData, adminUsers, filters, calculateUserTotalScore, getDigitalProfile]);

  // Obter opções únicas para os filtros
  const filterOptions = useMemo(() => {
    if (!progressData || !adminUsers) return { cargos: [], areas: [] };

    const adminUserIds = new Set(adminUsers.data.map(admin => admin.user_id));
    const allUsers = progressData.data.filter(progress => !adminUserIds.has(progress.user_id));
    
    const cargos = new Set<string>();
    const areas = new Set<string>();
    
    allUsers.forEach(progress => {
      const userProfile = progressData.userProfiles?.get(progress.user_id);
      if (userProfile?.cargo) {
        const cleanCargo = userProfile.cargo.replace(/^\d+-/, '').trim();
        if (cleanCargo) cargos.add(cleanCargo);
      }
      if (userProfile?.area) {
        areas.add(userProfile.area);
      }
    });
    
    return {
      cargos: Array.from(cargos).sort(),
      areas: Array.from(areas).sort()
    };
  }, [progressData, adminUsers]);

  return {
    filters,
    updateFilter,
    filteredUsers,
    filterOptions
  };
};