import React, { useState } from 'react';
import { VaporwaveScene } from '@/components/VaporwaveScene';
import { HeroSection } from '@/components/HeroSection';
import { LinearLayout } from '@/components/LinearLayout';
import { useAuth } from '@/components/AuthContext';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const Index = () => {
  const { user } = useAuth();
  const [showGame, setShowGame] = useState(false);
  
  // Fixed camera position - no scroll dependency to avoid issues
  const cameraPosition: [number, number, number] = [0, 8, 30];

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
