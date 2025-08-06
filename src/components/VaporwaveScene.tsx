import { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { VaporwaveBackground } from './VaporwaveBackground';

// Theme configurations
const themes = [
  {
    name: 'Classic Pink',
    colors: {
      primary: '#ff00ff',
      secondary: '#ff0080',
      emissive: '#440044',
      background: ['#ff00ff', '#000033'],
      light: '#00ffff'
    }
  },
  {
    name: 'Electric Cyan',
    colors: {
      primary: '#00ffff',
      secondary: '#0080ff',
      emissive: '#004444',
      background: ['#00ffff', '#001133'],
      light: '#ff00ff'
    }
  },
  {
    name: 'Neon Green',
    colors: {
      primary: '#00ff00',
      secondary: '#80ff00',
      emissive: '#004400',
      background: ['#00ff80', '#003300'],
      light: '#ff0080'
    }
  },
  {
    name: 'Purple Dream',
    colors: {
      primary: '#8000ff',
      secondary: '#4000ff',
      emissive: '#220044',
      background: ['#8000ff', '#110022'],
      light: '#00ff80'
    }
  },
  {
    name: 'Golden Sunset',
    colors: {
      primary: '#ffaa00',
      secondary: '#ff8000',
      emissive: '#442200',
      background: ['#ffaa00', '#331100'],
      light: '#00aaff'
    }
  }
];

export const VaporwaveScene = () => {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleScroll = useCallback((e: WheelEvent) => {
    if (isTransitioning) return;
    
    e.preventDefault();
    setIsTransitioning(true);
    
    if (e.deltaY > 0) {
      // Scroll down - next theme
      setCurrentTheme((prev) => (prev + 1) % themes.length);
    } else {
      // Scroll up - previous theme
      setCurrentTheme((prev) => (prev - 1 + themes.length) % themes.length);
    }
    
    // Reset transition flag after animation
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  useEffect(() => {
    const sceneElement = document.getElementById('vaporwave-scene');
    if (sceneElement) {
      sceneElement.addEventListener('wheel', handleScroll, { passive: false });
      return () => sceneElement.removeEventListener('wheel', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div 
      id="vaporwave-scene" 
      className="w-full h-screen relative overflow-hidden transition-all duration-700"
      style={{
        background: `linear-gradient(180deg, ${themes[currentTheme].colors.background[0]}20, ${themes[currentTheme].colors.background[1]}80)`
      }}
    >
      <Canvas
        camera={{
          position: [0, 0.06, 1.1],
          fov: 75,
          near: 0.01,
          far: 20,
        }}
        className="w-full h-full"
      >
        {/* Background gradient and stars */}
        <VaporwaveBackground theme={themes[currentTheme]} />
        <Stars 
          radius={100} 
          depth={50} 
          count={2000} 
          factor={4} 
          saturation={0} 
          fade={true}
        />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.1} color={themes[currentTheme].colors.primary} />
        <directionalLight
          position={[0, 0, 1]}
          intensity={0.5}
          color={themes[currentTheme].colors.secondary}
        />
        <pointLight
          position={[0, 1, -2]}
          intensity={0.8}
          color={themes[currentTheme].colors.light}
          distance={10}
          decay={2}
        />
        
        {/* Main terrain */}
        <VaporwaveTerrain theme={themes[currentTheme]} />
        
        {/* Development controls */}
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={0.5}
          maxDistance={5}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8">
          <h1 className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent transition-all duration-700">
            VAPORWAVE
          </h1>
          <p className="text-neon-cyan mt-2 font-mono transition-colors duration-700">
            Three.js • React Three Fiber
          </p>
        </div>
        
        {/* Theme Indicator */}
        <div className="absolute top-8 right-8 text-right">
          <div className="backdrop-blur-sm bg-black/20 rounded-lg p-4 border border-white/10">
            <p className="text-white font-mono text-sm opacity-60 mb-2">Theme</p>
            <h3 
              className="font-mono text-lg font-bold transition-colors duration-700"
              style={{ color: themes[currentTheme].colors.primary }}
            >
              {themes[currentTheme].name}
            </h3>
            <div className="flex gap-1 mt-2">
              {themes.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTheme ? 'scale-125' : 'opacity-50'
                  }`}
                  style={{ backgroundColor: themes[index].colors.primary }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 right-8 text-right">
          <p className="text-white font-mono text-sm opacity-80">
            Scroll to change themes
          </p>
          <p className="text-white font-mono text-sm opacity-60">
            Drag to explore
          </p>
        </div>
      </div>
    </div>
  );
};