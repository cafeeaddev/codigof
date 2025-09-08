/**
 * Analytics específicos para detectar problemas nas missões
 */

import { supabase } from '@/integrations/supabase/client';

export interface MissionAnalyticsData {
  totalUsers: number;
  mission4Completed: number;
  stuckAtMission4: number;
  completionRate: number;
  averageTime: number;
  criticalIssues: string[];
}

export async function analyzeMission4Performance(): Promise<MissionAnalyticsData> {
  try {
    // Análise geral da Missão 4
    const { data: stats, error: statsError } = await supabase
      .from('user_progress')
      .select('missao_3_completed, missao_4_completed, total_play_time')
      .eq('missao_3_completed', true);

    if (statsError) throw statsError;

    const totalUsers = stats.length;
    const mission4Completed = stats.filter(s => s.missao_4_completed).length;
    const stuckAtMission4 = totalUsers - mission4Completed;
    const completionRate = totalUsers > 0 ? (mission4Completed / totalUsers) * 100 : 0;

    // Tempo médio de conclusão
    const completedUsers = stats.filter(s => s.missao_4_completed);
    const averageTime = completedUsers.length > 0 
      ? completedUsers.reduce((sum, u) => sum + (u.total_play_time || 0), 0) / completedUsers.length
      : 0;

    // Identificar problemas críticos
    const criticalIssues: string[] = [];
    
    if (completionRate < 80) {
      criticalIssues.push(`Taxa de conclusão baixa: ${completionRate.toFixed(1)}%`);
    }
    
    if (stuckAtMission4 > 3) {
      criticalIssues.push(`${stuckAtMission4} usuários travados na Missão 4`);
    }

    if (averageTime > 1800) { // mais de 30 minutos
      criticalIssues.push('Tempo médio muito alto para conclusão');
    }

    return {
      totalUsers,
      mission4Completed,
      stuckAtMission4,
      completionRate,
      averageTime,
      criticalIssues
    };

  } catch (error) {
    console.error('Error analyzing Mission 4:', error);
    return {
      totalUsers: 0,
      mission4Completed: 0,
      stuckAtMission4: 0,
      completionRate: 0,
      averageTime: 0,
      criticalIssues: ['Erro ao analisar dados']
    };
  }
}

export async function getMission4Responses() {
  try {
    const { data, error } = await supabase
      .from('respostas_missao4')
      .select(`
        user_id,
        respostas,
        created_at,
        profiles(nome)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching Mission 4 responses:', error);
    return [];
  }
}

export function generateMissionReport(data: MissionAnalyticsData): string {
  const report = [
    '📊 RELATÓRIO DA MISSÃO 4',
    '========================',
    `👥 Total de usuários elegíveis: ${data.totalUsers}`,
    `✅ Concluíram a Missão 4: ${data.mission4Completed}`,
    `⚠️ Travados na Missão 4: ${data.stuckAtMission4}`,
    `📈 Taxa de conclusão: ${data.completionRate.toFixed(1)}%`,
    `⏱️ Tempo médio: ${Math.round(data.averageTime/60)} minutos`,
    '',
    '🚨 PROBLEMAS CRÍTICOS:',
    ...data.criticalIssues.map(issue => `• ${issue}`),
    '',
    '💡 RECOMENDAÇÕES:',
    data.completionRate < 80 ? '• Revisar interface da Missão 4' : '',
    data.stuckAtMission4 > 3 ? '• Adicionar tutorial ou dicas visuais' : '',
    data.averageTime > 1800 ? '• Simplificar questões ou interface' : '',
    '• Monitorar logs de erro da Missão 4',
    '• Implementar sistema de feedback do usuário'
  ].filter(Boolean).join('\n');

  return report;
}