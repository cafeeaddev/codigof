export interface UserProfile {
  nome: string;
  email: string;
  cargo?: string;
  area?: string;
  area_id?: string; // UUID reference to areas table
}

export interface Area {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  missao_1_completed: boolean;
  missao_2_completed: boolean;
  missao_3_completed: boolean;
  missao_4_completed: boolean;
  total_xp: number;
  created_at: string;
  updated_at: string;
  current_position: string;
  total_play_time: number;
  session_start_time: string;
  last_saved_at: string;
  missao_1_current_question: number;
  missao_1_answers: any;
  missao_2_current_question: number;
  missao_2_answers: any;
  missao_3_current_question: number;
  missao_3_answers: any;
  missao_4_current_question: number;
  missao_4_answers: any;
}

export interface ResponseData {
  id: string;
  nome: string;
  email: string;
  respostas: any;
  created_at: string;
  updated_at?: string;
}

export interface MissionStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface DigitalProfile {
  profile: 'Beginner' | 'Beginner +' | 'Explorer' | 'Pro-Player' | 'Ninja';
  sublevel: string;
}

export interface AdminFilters {
  searchTerm: string;
  cargoFilter: string;
  areaFilter: string;
  profileFilter: string;
}

export interface AdminStats {
  totalUsers: number;
  usersStarted: number;
  usersCompleted: number;
  completionRate: number;
  averageScore: number;
  mostCommonProfile: string;
  profileDistribution: Record<string, number>;
}