import React, { useState } from 'react';
import { VaporwaveScene } from '@/components/VaporwaveScene';
import { HeroSection } from '@/components/HeroSection';
import { FeatureSection } from '@/components/FeatureSection';
import { LinearLayout } from '@/components/LinearLayout';
import { useAuth } from '@/components/AuthContext';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const Index = () => {
  const { user } = useAuth();
  const [showGame, setShowGame] = useState(false);
  
  // Camera position that responds to scroll
  const basePosition: [number, number, number] = [0, 8, 30];
  const scrollProgress = useScrollProgress();
  const scrollOffset = scrollProgress * 15;
  const cameraPosition: [number, number, number] = [
    basePosition[0],
    basePosition[1] - scrollOffset * 0.3,
    basePosition[2] - scrollOffset * 0.8
  ];

  // If user is logged in and wants to access the game
  if (user && showGame) {
    return <LinearLayout />;
  }

  const handleLogin = (userData: any) => {
    setShowGame(true);
  };

  // Show the complete original vaporwave experience
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed Vaporwave Background Scene */}
      <div className="fixed inset-0 z-0">
        <VaporwaveScene 
          cameraPosition={cameraPosition}
          cameraFov={75}
        />
      </div>
      
      {/* Scrollable Content */}
      <div 
        data-internal-scroll="true"
        className="relative z-10 h-screen overflow-y-auto scroll-smooth"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
      >
        {/* Hero Section */}
        <HeroSection 
          onLogin={handleLogin}
        />
        
        {/* Feature Section with Cody */}
        <FeatureSection 
          id="features"
          title="Sistema de Gamificação"
          subtitle="Sua jornada digital"
          description="Descubra seu estilo digital e desbloqueie a trilha feita para você."
          image="/lovable-uploads/cf9a3150-03f7-41ec-904d-30ea543a8f35.png"
          index={1}
        />
      </div>
    </div>
  );
};

export default Index;
