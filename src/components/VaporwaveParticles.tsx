import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    light: string;
  };
}

interface VaporwaveParticlesProps {
  theme: Theme;
  count?: number;
}

export const VaporwaveParticles = ({ theme, count = 500 }: VaporwaveParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  const { positions, geometry } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Distribute particles in a tunnel-like formation
      const angle = (i / count) * Math.PI * 2 * 4;
      const radius = 2 + Math.random() * 3;
      const height = (Math.random() - 0.5) * 8;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius - Math.random() * 10;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    return { positions, geometry };
  }, [count]);
  
  // Animated material
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: theme.colors.light,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
    });
  }, [theme.colors.light]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      // Rotate particles slowly
      pointsRef.current.rotation.y += 0.001;
      
      // Move particles towards camera for tunnel effect
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += 0.01;
        
        // Reset particles that have passed the camera
        if (positions[i * 3 + 2] > 2) {
          positions[i * 3 + 2] = -10;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    if (materialRef.current) {
      // Pulse opacity
      materialRef.current.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      materialRef.current.color.set(theme.colors.light);
    }
  });
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <primitive object={material} ref={materialRef} />
    </points>
  );
};