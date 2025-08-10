import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CustomStars = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Helper function to calculate terrain height (matches VaporwaveTerrain)
  const calculateHeightAtPoint = (x: number, z: number) => {
    const wave1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8;
    const wave2 = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.4;
    const wave3 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.2;
    return wave1 + wave2 + wave3;
  };

  // Generate star positions only in the sky area
  const { positions, colors } = useMemo(() => {
    const starCount = 4000; // Aumentando número de estrelas
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    let index = 0;
    
    for (let i = 0; i < starCount; i++) {
      // Spherical distribution to cover the entire visible sky
      const x = (Math.random() - 0.5) * 200; // Much wider X coverage (-100 to +100)
      const z = (Math.random() - 0.3) * 150; // Z coverage from -105 to +45, more behind camera
      
      // Calculate terrain height at this x,z position
      const terrainHeight = calculateHeightAtPoint(x, z);
      
      // Only place stars well above the terrain (in the sky)
      const minSkyHeight = Math.max(terrainHeight + 2, 2); 
      const maxSkyHeight = 40; // Much higher sky coverage
      const y = minSkyHeight + Math.random() * (maxSkyHeight - minSkyHeight);
      
      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
      
      // Cores mais brilhantes e variadas
      const brightness = 0.8 + Math.random() * 0.2; // Aumentando brilho base
      const colorVariation = Math.random();
      
      if (colorVariation < 0.7) {
        // Maioria das estrelas brancas/amareladas
        colors[index] = brightness;     // R
        colors[index + 1] = brightness; // G  
        colors[index + 2] = brightness * 0.9; // B ligeiramente menos azul
      } else if (colorVariation < 0.85) {
        // Algumas estrelas azuladas
        colors[index] = brightness * 0.8;     // R
        colors[index + 1] = brightness * 0.9; // G  
        colors[index + 2] = brightness;       // B
      } else {
        // Algumas estrelas amareladas/alaranjadas
        colors[index] = brightness;           // R
        colors[index + 1] = brightness * 0.9; // G  
        colors[index + 2] = brightness * 0.7; // B
      }
      
      index += 3;
    }
    
    return { positions, colors };
  }, []);

  // Subtle animation
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}           // Aumentando tamanho das estrelas
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={1.0}         // Opacidade máxima
        alphaTest={0.001}
        blending={THREE.AdditiveBlending} // Adicionando brilho
      />
    </points>
  );
};