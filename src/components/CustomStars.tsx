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

  // Generate star positions - simplified approach
  const { positions, colors } = useMemo(() => {
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    let index = 0;
    
    for (let i = 0; i < starCount; i++) {
      // Simple random distribution in sky area
      const x = (Math.random() - 0.5) * 60; 
      const y = Math.random() * 15 + 2; // Always above ground, simple range
      const z = Math.random() * -30 - 5;     
      
      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
      
      // White color
      colors[index] = 1;     // R
      colors[index + 1] = 1; // G  
      colors[index + 2] = 1; // B
      
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
        size={0.04}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.9}
        alphaTest={0.001}
      />
    </points>
  );
};