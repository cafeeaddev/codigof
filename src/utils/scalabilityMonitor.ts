/**
 * Monitor de escalabilidade para 891 participantes
 * Gerencia simultaneidade e otimiza recursos automaticamente
 */

interface PerformanceMetrics {
  concurrentUsers: number;
  memoryUsage: number;
  connectionCount: number;
  responseTime: number;
  errorRate: number;
  timestamp: number;
}

interface ScalabilityConfig {
  maxConcurrentUsers: number;
  warningThreshold: number;
  criticalThreshold: number;
  autoOptimize: boolean;
}

export class ScalabilityMonitor {
  private static instance: ScalabilityMonitor;
  private metrics: PerformanceMetrics[] = [];
  private config: ScalabilityConfig;
  private onlineUsers = new Set<string>();
  private connectionPool: number = 0;
  private isOptimized = false;

  constructor() {
    this.config = {
      maxConcurrentUsers: 400, // Pro plan - mais capacidade
      warningThreshold: 200,   // Pro plan - limiar maior
      criticalThreshold: 300,  // Pro plan - mais resiliente
      autoOptimize: true
    };
  }

  static getInstance(): ScalabilityMonitor {
    if (!ScalabilityMonitor.instance) {
      ScalabilityMonitor.instance = new ScalabilityMonitor();
    }
    return ScalabilityMonitor.instance;
  }

  // Registrar usuário online
  registerUser(userId: string): void {
    this.onlineUsers.add(userId);
    this.connectionPool++;
    this.recordMetrics();
    
    if (this.shouldOptimize()) {
      this.optimizePerformance();
    }
  }

  // Remover usuário
  unregisterUser(userId: string): void {
    this.onlineUsers.delete(userId);
    this.connectionPool = Math.max(0, this.connectionPool - 1);
    this.recordMetrics();
  }

  // Verificar se deve otimizar
  private shouldOptimize(): boolean {
    const currentUsers = this.onlineUsers.size;
    return (
      this.config.autoOptimize &&
      currentUsers >= this.config.warningThreshold &&
      !this.isOptimized
    );
  }

  // Otimizar performance automaticamente
  private optimizePerformance(): void {
    if (this.isOptimized) return;
    
    this.isOptimized = true;
    console.warn(`[ScalabilityMonitor] Otimizando para ${this.onlineUsers.size} usuários simultâneos`);
    
    // Disparar eventos de otimização
    this.dispatchOptimizationEvent('reduce-stars');
    this.dispatchOptimizationEvent('increase-save-interval');
    this.dispatchOptimizationEvent('enable-throttling');
  }

  // Disparar eventos de otimização
  private dispatchOptimizationEvent(type: string): void {
    window.dispatchEvent(new CustomEvent('scalability-optimize', {
      detail: { type, concurrentUsers: this.onlineUsers.size }
    }));
  }

  // Registrar métricas
  private recordMetrics(): void {
    const now = performance.now();
    const memory = (performance as any).memory;
    
    const metrics: PerformanceMetrics = {
      concurrentUsers: this.onlineUsers.size,
      memoryUsage: memory?.usedJSHeapSize || 0,
      connectionCount: this.connectionPool,
      responseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      timestamp: now
    };

    this.metrics.push(metrics);
    
    // Manter apenas últimas 100 métricas
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Log de alerta para níveis críticos
    if (metrics.concurrentUsers >= this.config.criticalThreshold) {
      console.error(`[ScalabilityMonitor] CRÍTICO: ${metrics.concurrentUsers} usuários simultâneos`);
    } else if (metrics.concurrentUsers >= this.config.warningThreshold) {
      console.warn(`[ScalabilityMonitor] ALERTA: ${metrics.concurrentUsers} usuários simultâneos`);
    }
  }

  // Calcular tempo de resposta médio
  private getAverageResponseTime(): number {
    const recent = this.metrics.slice(-10);
    if (recent.length === 0) return 0;
    return recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
  }

  // Calcular taxa de erro
  private getErrorRate(): number {
    // Simplificado - em produção seria baseado em métricas reais
    return this.onlineUsers.size > this.config.warningThreshold ? 0.5 : 0.1;
  }

  // Obter status atual
  getCurrentStatus(): {
    concurrentUsers: number;
    status: 'healthy' | 'warning' | 'critical';
    isOptimized: boolean;
    recommendations: string[];
  } {
    const users = this.onlineUsers.size;
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    if (users >= this.config.criticalThreshold) {
      status = 'critical';
      recommendations.push('Ativar modo de emergência');
      recommendations.push('Reduzir qualidade gráfica');
      recommendations.push('Implementar fila de acesso');
    } else if (users >= this.config.warningThreshold) {
      status = 'warning';
      recommendations.push('Monitorar closely');
      recommendations.push('Preparar otimizações');
    }

    return {
      concurrentUsers: users,
      status,
      isOptimized: this.isOptimized,
      recommendations
    };
  }

  // Resetar otimizações quando usuários diminuem
  resetOptimizations(): void {
    if (this.onlineUsers.size < this.config.warningThreshold) {
      this.isOptimized = false;
      window.dispatchEvent(new CustomEvent('scalability-reset'));
    }
  }

  // Obter métricas para dashboard
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Instância global
export const scalabilityMonitor = ScalabilityMonitor.getInstance();