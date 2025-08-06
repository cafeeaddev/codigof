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
    const starCount = 5000; // Muito mais estrelas para melhor cobertura
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    let index = 0;
    
    for (let i = 0; i < starCount; i++) {
      // Distribuição esférica para cobrir todo o céu visível
      const x = (Math.random() - 0.5) * 300; // Cobertura X muito mais ampla (-150 to +150)
      const z = (Math.random() - 0.2) * 200; // Cobertura Z expandida, mais estrelas atrás da câmera
      
      // Calculate terrain height at this x,z position
      const terrainHeight = calculateHeightAtPoint(x, z);
      
      // Colocar estrelas bem acima do terreno (no céu)
      const minSkyHeight = Math.max(terrainHeight + 1, 1); 
      const maxSkyHeight = 60; // Cobertura do céu muito mais alta
      const y = minSkyHeight + Math.random() * (maxSkyHeight - minSkyHeight);
      
      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
      
      // Cor branca com variação maior para mais brilho
      const brightness = 0.8 + Math.random() * 0.4; // Mais brilhantes
      colors[index] = brightness;     // R
      colors[index + 1] = brightness; // G  
      colors[index + 2] = brightness; // B
      
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
        size={0.06}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={1.0}
        alphaTest={0.001}
      />
    </points>
  );
};