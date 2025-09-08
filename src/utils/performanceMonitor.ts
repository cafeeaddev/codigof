/**
 * Monitor de performance para detectar problemas de abandono nas missões
 */

interface MissionAnalytics {
  missionId: number;
  questionId?: number;
  action: 'start' | 'answer' | 'complete' | 'abandon';
  timestamp: number;
  userId?: string;
  timeSpent?: number;
}

export class MissionPerformanceMonitor {
  private static analytics: MissionAnalytics[] = [];
  private static startTimes: Map<string, number> = new Map();

  static trackMissionStart(missionId: number, userId?: string): void {
    const key = `${missionId}-${userId}`;
    this.startTimes.set(key, Date.now());
    
    this.analytics.push({
      missionId,
      action: 'start',
      timestamp: Date.now(),
      userId
    });
  }

  static trackQuestionAnswer(missionId: number, questionId: number, userId?: string): void {
    this.analytics.push({
      missionId,
      questionId,
      action: 'answer',
      timestamp: Date.now(),
      userId
    });
  }

  static trackMissionComplete(missionId: number, userId?: string): void {
    const key = `${missionId}-${userId}`;
    const startTime = this.startTimes.get(key);
    const timeSpent = startTime ? Date.now() - startTime : undefined;
    
    this.analytics.push({
      missionId,
      action: 'complete',
      timestamp: Date.now(),
      userId,
      timeSpent
    });
    
    this.startTimes.delete(key);
  }

  static trackMissionAbandon(missionId: number, userId?: string): void {
    const key = `${missionId}-${userId}`;
    const startTime = this.startTimes.get(key);
    const timeSpent = startTime ? Date.now() - startTime : undefined;
    
    this.analytics.push({
      missionId,
      action: 'abandon',
      timestamp: Date.now(),
      userId,
      timeSpent
    });
    
    this.startTimes.delete(key);
  }

  static getAbandonmentRate(missionId: number): number {
    const starts = this.analytics.filter(a => a.missionId === missionId && a.action === 'start').length;
    const completions = this.analytics.filter(a => a.missionId === missionId && a.action === 'complete').length;
    
    if (starts === 0) return 0;
    return ((starts - completions) / starts) * 100;
  }

  static getAverageCompletionTime(missionId: number): number {
    const completions = this.analytics.filter(a => 
      a.missionId === missionId && 
      a.action === 'complete' && 
      a.timeSpent
    );
    
    if (completions.length === 0) return 0;
    
    const totalTime = completions.reduce((sum, c) => sum + (c.timeSpent || 0), 0);
    return totalTime / completions.length;
  }

  static generateReport(): {
    missionMetrics: Array<{
      missionId: number;
      abandontmentRate: number;
      averageTime: number;
      completions: number;
    }>;
  } {
    const missions = [1, 2, 3, 4, 5];
    
    return {
      missionMetrics: missions.map(missionId => ({
        missionId,
        abandontmentRate: this.getAbandonmentRate(missionId),
        averageTime: this.getAverageCompletionTime(missionId),
        completions: this.analytics.filter(a => a.missionId === missionId && a.action === 'complete').length
      }))
    };
  }
}