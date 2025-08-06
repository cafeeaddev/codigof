import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface MountainLayerProps {
  zPosition: number;
  color: string;
  opacity: number;
  scale: number;
  speed: number;
  blur?: boolean;
  glow?: boolean;
}

const MountainLayer = ({ zPosition, color, opacity, scale, speed, blur, glow }: MountainLayerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const scrollProgress = useScrollProgress();

  // Generate mountain silhouette geometry
  const geometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const width = 50;
    const segments = 100;
    
    // Generate mountain peaks
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width - width / 2;
      let y = 0;
      
      // Multiple sine waves for mountain peaks
      const peak1 = Math.sin(x * 0.1) * 3;
      const peak2 = Math.sin(x * 0.15 + 1) * 2;
      const peak3 = Math.sin(x * 0.08 + 2) * 4;
      const peak4 = Math.sin(x * 0.12 + 3) * 1.5;
      const peak5 = Math.sin(x * 0.2 + 4) * 1;
      
      y = peak1 + peak2 + peak3 + peak4 + peak5;
      
      // Ensure base is at ground level
      y = Math.max(y, 0);
      
      points.push(new THREE.Vector2(x, y));
    }
    
    // Add bottom points to close the shape
    points.push(new THREE.Vector2(width / 2, -5));
    points.push(new THREE.Vector2(-width / 2, -5));
    
    const shape = new THREE.Shape(points);
    const geo = new THREE.ShapeGeometry(shape);
    
    return geo;
  }, []);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Parallax movement
      const time = state.clock.elapsedTime;
      const parallaxX = Math.sin(time * speed) * 2;
      const scrollInfluence = scrollProgress * 5;
      
      meshRef.current.position.x = parallaxX + scrollInfluence * speed;
      
      // Color animation based on scroll
      const baseColor = new THREE.Color(color);
      if (glow) {
        const glowIntensity = 0.5 + Math.sin(time * 0.5) * 0.3;
        baseColor.multiplyScalar(1 + glowIntensity);
      }
      
      materialRef.current.color.copy(baseColor);
      materialRef.current.opacity = opacity + Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, -3, zPosition]}
      scale={[scale, scale, 1]}
    >
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent={true}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const VaporwaveMountains = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Mountain layers configuration
  const mountainLayers = [
    {
      zPosition: -20,
      color: '#0a0a1a', // Darkest background
      opacity: 0.9,
      scale: 1.8,
      speed: 0.1,
      blur: true
    },
    {
      zPosition: -15,
      color: '#1a0d2e', // Dark purple
      opacity: 0.8,
      scale: 1.5,
      speed: 0.15,
      blur: true
    },
    {
      zPosition: -10,
      color: '#2d1b3d', // Medium purple
      opacity: 0.7,
      scale: 1.2,
      speed: 0.2,
      glow: true
    },
    {
      zPosition: -5,
      color: '#4a2c5a', // Lighter purple
      opacity: 0.6,
      scale: 1.0,
      speed: 0.25,
      glow: true
    },
    {
      zPosition: -2,
      color: '#6b4c9a', // Neon purple
      opacity: 0.5,
      scale: 0.8,
      speed: 0.3,
      glow: true
    }
  ];

  return (
    <group ref={groupRef}>
      {/* Atmospheric lighting */}
      <ambientLight intensity={0.2} color="#2d1b3d" />
      <directionalLight
        position={[0, 10, 5]}
        intensity={0.5}
        color="#9d4edd"
      />
      
      {/* Mountain layers */}
      {mountainLayers.map((layer, index) => (
        <MountainLayer key={index} {...layer} />
      ))}
      
      {/* Additional atmospheric effects */}
      <pointLight
        position={[-10, 5, -8]}
        intensity={0.3}
        color="#ff006e"
        distance={30}
        decay={2}
      />
      <pointLight
        position={[10, 8, -12]}
        intensity={0.4}
        color="#7209b7"
        distance={35}
        decay={2}
      />
      <pointLight
        position={[0, 12, -15]}
        intensity={0.2}
        color="#480ca8"
        distance={40}
        decay={2}
      />
    </group>
  );
};