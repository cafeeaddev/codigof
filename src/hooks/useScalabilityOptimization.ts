import { useEffect, useState, useCallback } from 'react';
import { scalabilityMonitor } from '@/utils/scalabilityMonitor';
import { useAuth } from '@/contexts/AuthContext';

interface OptimizationState {
  isOptimized: boolean;
  starCount: number;
  saveInterval: number;
  throttleEnabled: boolean;
  concurrentUsers: number;
  status: 'healthy' | 'warning' | 'critical';
}

export const useScalabilityOptimization = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OptimizationState>({
    isOptimized: false,
    starCount: 1000, // Pro plan - mais estrelas base
    saveInterval: 180000, // 3 minutes - Pro plan
    throttleEnabled: false,
    concurrentUsers: 0,
    status: 'healthy'
  });

  // Registrar usuário quando logado
  useEffect(() => {
    if (user?.id) {
      scalabilityMonitor.registerUser(user.id);
      
      return () => {
        scalabilityMonitor.unregisterUser(user.id);
      };
    }
  }, [user?.id]);

  // Escutar eventos de otimização
  useEffect(() => {
    const handleOptimization = (event: CustomEvent) => {
      const { type, concurrentUsers } = event.detail;
      
      setState(prev => {
        const newState = { ...prev, concurrentUsers };
        
        switch (type) {
          case 'reduce-stars':
            newState.starCount = concurrentUsers > 180 ? 600 : 800; // Pro plan - limiares maiores
            newState.isOptimized = true;
            break;
          case 'increase-save-interval':
            newState.saveInterval = concurrentUsers > 180 ? 360000 : 240000; // 6 ou 4 min - Pro
            newState.isOptimized = true;
            break;
          case 'enable-throttling':
            newState.throttleEnabled = true;
            newState.isOptimized = true;
            break;
        }
        
        return newState;
      });
    };

    const handleReset = () => {
      setState(prev => ({
        ...prev,
        isOptimized: false,
        starCount: 800,
        saveInterval: 300000,
        throttleEnabled: false
      }));
    };

    window.addEventListener('scalability-optimize', handleOptimization as EventListener);
    window.addEventListener('scalability-reset', handleReset as EventListener);

    return () => {
      window.removeEventListener('scalability-optimize', handleOptimization as EventListener);
      window.removeEventListener('scalability-reset', handleReset as EventListener);
    };
  }, []);

  // Atualizar status periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const status = scalabilityMonitor.getCurrentStatus();
      setState(prev => ({
        ...prev,
        concurrentUsers: status.concurrentUsers,
        status: status.status,
        isOptimized: status.isOptimized
      }));
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const forceOptimization = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOptimized: true,
      starCount: 400,
      saveInterval: 600000,
      throttleEnabled: true
    }));
  }, []);

  const getOptimizationRecommendations = useCallback(() => {
    return scalabilityMonitor.getCurrentStatus().recommendations;
  }, []);

  return {
    ...state,
    forceOptimization,
    getOptimizationRecommendations,
    scalabilityMonitor
  };
};