import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rocket, Star, Sparkles } from 'lucide-react';

interface FloatingSpaceshipProps {
  position: [number, number, number];
  scale: number;
}

const FloatingSpaceship = ({ position, scale }: FloatingSpaceshipProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <coneGeometry args={[0.3, 1, 8]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
    </mesh>
  );
};

const StarField = () => {
  const starsRef = useRef<THREE.Points>(null);
  
  const starPositions = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 20;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.02} sizeAttenuation={false} />
    </points>
  );
};

export const SpaceshipElements = () => {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    const timeline = [
      { delay: 0, type: 'starfield' },
      { delay: 1000, type: 'spaceship', id: 1 },
      { delay: 2000, type: 'spaceship', id: 2 },
      { delay: 3000, type: 'spaceship', id: 3 },
    ];

    timeline.forEach(({ delay, type, id }) => {
      setTimeout(() => {
        setElements(prev => [...prev, { type, id, timestamp: Date.now() }]);
      }, delay);
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          
          <StarField />
          
          {elements.map((element, index) => {
            if (element.type === 'spaceship') {
              return (
                <FloatingSpaceship
                  key={`spaceship-${element.id}`}
                  position={[
                    (element.id - 2) * 3,
                    Math.sin(element.id) * 2,
                    Math.cos(element.id) * 2
                  ]}
                  scale={1 + element.id * 0.2}
                />
              );
            }
            return null;
          })}
        </Canvas>
      </div>

      {/* 2D Overlay Elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        {elements.map((element, index) => (
          <div
            key={index}
            className="absolute animate-fade-in"
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${30 + Math.sin(index) * 20}%`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            {element.type === 'spaceship' && (
              <div className="text-4xl text-primary animate-pulse">
                <Rocket />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Text */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center animate-fade-in">
        <div className="flex items-center space-x-2 text-primary">
          <Sparkles className="w-6 h-6" />
          <span className="text-xl font-bold">Spaceship - Rumo ao Futuro</span>
          <Sparkles className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};