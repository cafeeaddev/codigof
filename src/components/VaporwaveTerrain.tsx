
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  
  console.log('VaporwaveTerrain: Component rendering, scroll progress:', scrollProgress);
  
  // Create simple plane geometry with basic wireframe
  const geometry = useMemo(() => {
    console.log('Creating simple terrain geometry...');
    
    // Much simpler geometry - just 8x20 segments
    const geo = new THREE.PlaneGeometry(10, 30, 8, 20);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Add very simple wave displacement
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // Z is Y in plane geometry before rotation
      
      // Simple sine wave pattern
      const wave = Math.sin(z * 0.3) * 0.2 + Math.sin(x * 0.5) * 0.1;
      positions[i + 2] = wave; // Set Y (height)
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    console.log('Simple terrain geometry created with', positions.length / 3, 'vertices');
    return geo;
  }, []);
  
  // Create basic wireframe material as fallback
  const material = useMemo(() => {
    console.log('Creating basic wireframe material...');
    
    // Start with basic wireframe material to ensure visibility
    const basicMaterial = new THREE.MeshBasicMaterial({
      color: '#ff00ff',
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    
    console.log('Basic wireframe material created');
    return basicMaterial;
  }, []);
  
  // Simple animation
  useFrame((state) => {
    if (meshRef.current) {
      // Simple rotation animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Move terrain based on scroll
      const scrollOffset = scrollProgress * 5;
      meshRef.current.position.z = scrollOffset - 2;
      
      // Debug log every 2 seconds
      if (Math.floor(state.clock.elapsedTime) % 2 === 0 && state.clock.elapsedTime % 1 < 0.016) {
        console.log('Terrain animation - Time:', state.clock.elapsedTime.toFixed(1), 
                   'Scroll:', scrollProgress.toFixed(2), 'Position Z:', meshRef.current.position.z.toFixed(2));
      }
    }
  });
  
  console.log('VaporwaveTerrain: Rendering mesh with position [0, 0, 0], rotation [-90°, 0, 0]');
  
  return (
    <group>
      {/* Debug sphere to ensure 3D context is working */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      
      {/* Main terrain */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, 0]}
      />
    </group>
  );
};
