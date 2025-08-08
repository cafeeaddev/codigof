import React, { useState } from 'react';
import { VaporwaveScene } from '@/components/VaporwaveScene';
import { HeroSection } from '@/components/HeroSection';
import { LinearLayout } from '@/components/LinearLayout';
import { useAuth } from '@/components/AuthContext';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [showGame, setShowGame] = useState(false);
  const scrollProgress = useScrollProgress();

  // Calculate camera position based on scroll
  const basePosition: [number, number, number] = [0, 8, 30];
  const scrollOffset = scrollProgress * 20;
  const cameraPosition: [number, number, number] = [
    basePosition[0],
    basePosition[1] - scrollOffset * 0.5,
    basePosition[2] - scrollOffset
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and wants to access the game
  if (user && showGame) {
    return <LinearLayout />;
  }

  const handleLogin = (userData: any) => {
    setShowGame(true);
  };

  // Show the original vaporwave home page
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Vaporwave Scene */}
      <div className="fixed inset-0 z-0">
        <VaporwaveScene 
          cameraPosition={cameraPosition}
          cameraFov={75}
        />
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10">
        <HeroSection onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default Index;
