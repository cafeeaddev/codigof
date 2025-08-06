
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const VaporwaveTerrain = () => {
  const backgroundMeshRef = useRef<THREE.Mesh>(null);
  const wireframeMeshRef = useRef<THREE.Mesh>(null);
  const backgroundMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const scrollProgress = useScrollProgress();
  
  // Load the grid texture but we'll use it minimally
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties for wireframe
  const wireframeTexture = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8); // Square grid repetition
    return tex;
  }, [texture]);
  
  // Configure texture for background (stone-like appearance)
  const backgroundTexture = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4); // Less repetition for better visibility
    tex.offset.set(0, 0);
    // Increase contrast and brightness
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [texture]);
  
  // Create normal map from the same texture for depth
  const normalTexture = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, [texture]);
  
  // Helper function to calculate height at any point (matches terrain generation)
  const calculateHeightAtPoint = (x: number, z: number) => {
    const wave1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8;
    const wave2 = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.4;
    const wave3 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.2;
    const wave4 = Math.sin(x * 2.4) * Math.cos(z * 2.4) * 0.1;
    const distanceEffect = Math.sin(Math.sqrt(x * x + z * z) * 0.2) * 0.3;
    return wave1 + wave2 + wave3 + wave4 + distanceEffect;
  };

  // Create square terrain geometry for background
  const { backgroundGeometry, maxHeight } = useMemo(() => {
    // Background terrain geometry
    const bgGeo = new THREE.PlaneGeometry(24, 24, 48, 48);
    const positionAttribute = bgGeo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create smooth wave terrain like in reference image
      const wave1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8;
      const wave2 = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.4;
      const wave3 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.2;
      const wave4 = Math.sin(x * 2.4) * Math.cos(z * 2.4) * 0.1;
      
      // Distance-based variation for more dynamic terrain
      const distanceEffect = Math.sin(Math.sqrt(x * x + z * z) * 0.2) * 0.3;
      
      // Combine waves for natural undulating terrain
      const height = wave1 + wave2 + wave3 + wave4 + distanceEffect;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    bgGeo.computeVertexNormals();
    
    return { backgroundGeometry: bgGeo, maxHeight };
  }, []);
  
  
  // Enhanced color system similar to reference image
  const getEnhancedColor = (progress: number) => {
    // Colors inspired by the reference: blue to orange/gold gradient
    if (progress < 0.5) {
      // Blue to cyan range
      const hue = 200 - (progress * 40); // 200 to 180 (blue to cyan)
      const saturation = 90 + (progress * 10); // 90-100%
      const lightness = 60 + (progress * 20); // 60-80%
      return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
    } else {
      // Cyan to orange/gold range
      const localProgress = (progress - 0.5) * 2;
      const hue = 180 - (localProgress * 150); // 180 to 30 (cyan to orange)
      const saturation = 95 + (localProgress * 5); // 95-100%
      const lightness = 70 + (localProgress * 10); // 70-80%
      return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
    }
  };
  
  // Animation and color updates
  useFrame((state) => {
    if (backgroundMeshRef.current && wireframeMeshRef.current && backgroundMaterialRef.current) {
      // Continuous terrain movement + inverted scroll influence - longer cycle
      const timeMovement = state.clock.elapsedTime * 0.2;
      const scrollMovement = -scrollProgress * 12;
      const zPosition = ((timeMovement + scrollMovement) % 24) - 12; // Square cycle
      
      backgroundMeshRef.current.position.z = zPosition;
      wireframeMeshRef.current.position.z = zPosition;
    }
  });
  
  return (
    <group>
      {/* Neon terrain with grid pattern and depth */}
      <mesh
        ref={backgroundMeshRef}
        geometry={backgroundGeometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.02, -2]}
      >
        <meshStandardMaterial
          ref={backgroundMaterialRef}
          map={wireframeTexture}
          normalMap={normalTexture}
          color="#1a1a2e"
          emissive="#2a2a2a"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.7}
          transparent={true}
          opacity={0.8}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>
      
      {/* Wireframe overlay for neon grid effect */}
      <mesh
        ref={wireframeMeshRef}
        geometry={backgroundGeometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, -2]}
      >
        <meshBasicMaterial
          color="#ff00ff"
          transparent={true}
          opacity={0.4}
          wireframe={true}
        />
      </mesh>
      
    </group>
  );
};
