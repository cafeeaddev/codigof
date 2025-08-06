
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const backgroundMeshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const backgroundMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightGroup = useRef<THREE.Group>(null);
  const scrollProgress = useScrollProgress();
  
  // Load the grid texture but we'll use it minimally
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 16); // Increased repetition for denser grid
  }, [texture]);
  
  // Create terrain with craters like the reference
  const { geometry, maxHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(28, 40, 240, 320);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    // Define crater locations
    const craters = [
      { x: -8, z: -5, radius: 3.5, depth: 2.8 },
      { x: 10, z: 2, radius: 4.2, depth: 3.2 },
      { x: -12, z: 8, radius: 2.8, depth: 2.2 },
      { x: 7, z: -10, radius: 3.8, depth: 2.9 },
      { x: -6, z: 15, radius: 2.5, depth: 1.8 },
      { x: 14, z: -3, radius: 3.0, depth: 2.4 },
      { x: -10, z: -12, radius: 2.2, depth: 1.6 },
      { x: 9, z: 12, radius: 3.6, depth: 2.7 },
      { x: -15, z: 5, radius: 2.0, depth: 1.4 },
      { x: 12, z: 8, radius: 2.8, depth: 2.1 }
    ];
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Central path - keep it clear
      const distanceFromCenter = Math.abs(x);
      const pathWidth = 3.5;
      
      let height = 0;
      
      if (distanceFromCenter < pathWidth) {
        // Central path - slightly depressed
        const pathFactor = 1 - (distanceFromCenter / pathWidth);
        height = -0.8 * Math.pow(pathFactor, 1.5);
      } else {
        // Base terrain with gentle elevation
        const baseElevation = Math.sin(x * 0.2) * Math.cos(z * 0.15) * 0.6;
        const mediumWaves = Math.sin(x * 0.5) * Math.cos(z * 0.4) * 0.3;
        const fineDetails = Math.sin(x * 1.2) * Math.cos(z * 1.0) * 0.15;
        
        height = baseElevation + mediumWaves + fineDetails;
        
        // Apply crater effects
        craters.forEach(crater => {
          const distanceToCrater = Math.sqrt(
            Math.pow(x - crater.x, 2) + Math.pow(z - crater.z, 2)
          );
          
          if (distanceToCrater < crater.radius * 1.5) {
            if (distanceToCrater < crater.radius) {
              // Inside crater - create depression
              const craterFactor = 1 - (distanceToCrater / crater.radius);
              const craterDepth = -crater.depth * Math.pow(craterFactor, 1.8);
              height += craterDepth;
            } else {
              // Crater rim - slight elevation
              const rimFactor = (distanceToCrater - crater.radius) / (crater.radius * 0.5);
              const rimHeight = Math.sin((1 - rimFactor) * Math.PI) * 0.4;
              height += rimHeight;
            }
          }
        });
        
        // Add some background variation to avoid flatness
        const backgroundVariation = Math.sin(x * 0.8 + z * 0.6) * 0.2;
        height += backgroundVariation;
        
        // Ensure minimum elevation outside path
        if (distanceFromCenter > pathWidth + 1) {
          height = Math.max(height, -1.5);
        }
      }
      
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return { geometry: geo, maxHeight };
  }, []);
  
  // Scroll-based color system: blue to orange/gold
  const getScrollColor = (progress: number) => {
    // Smooth transition from blue (0) to orange/gold (1)
    const hue = 240 - (progress * 210); // 240 (blue) to 30 (orange)
    const saturation = 85 + (progress * 15); // 85% to 100%
    const lightness = 50 + (progress * 30); // 50% to 80%
    return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
  };

  // Internal lights for crater depth and rim illumination
  const internalLights = useMemo(() => {
    const lights = [];
    
    // Crater interior lights
    const craterPositions = [
      [-8, -5], [10, 2], [-12, 8], [7, -10], [-6, 15],
      [14, -3], [-10, -12], [9, 12], [-15, 5], [12, 8]
    ];
    
    craterPositions.forEach((pos, index) => {
      // Light at the bottom of each crater
      lights.push({
        position: [pos[0], -1.5, pos[1]],
        color: new THREE.Color().setHSL((index * 36) / 360, 0.8, 0.7),
        intensity: 0.6 + Math.random() * 0.4
      });
      
      // Rim lights for some craters
      if (index % 2 === 0) {
        const angle1 = (index * 60) * Math.PI / 180;
        const angle2 = angle1 + Math.PI;
        const radius = 2.5;
        
        lights.push({
          position: [pos[0] + Math.cos(angle1) * radius, 0.2, pos[1] + Math.sin(angle1) * radius],
          color: new THREE.Color().setHSL((index * 36 + 180) / 360, 0.9, 0.6),
          intensity: 0.3 + Math.random() * 0.2
        });
        
        lights.push({
          position: [pos[0] + Math.cos(angle2) * radius, 0.2, pos[1] + Math.sin(angle2) * radius],
          color: new THREE.Color().setHSL((index * 36 + 90) / 360, 0.85, 0.65),
          intensity: 0.3 + Math.random() * 0.2
        });
      }
    });
    
    return lights;
  }, []);
  
  // Animation and color updates
  useFrame((state) => {
    if (meshRef.current && materialRef.current && backgroundMeshRef.current && backgroundMaterialRef.current) {
      // Terrain movement
      const timeMovement = state.clock.elapsedTime * 0.3;
      const scrollMovement = -scrollProgress * 8;
      const zPosition = ((timeMovement + scrollMovement) % 30) - 15;
      
      meshRef.current.position.z = zPosition;
      backgroundMeshRef.current.position.z = zPosition;
      
      // Apply scroll-based colors to wireframe
      const wireframeColor = getScrollColor(scrollProgress);
      const emissiveColor = getScrollColor(scrollProgress);
      emissiveColor.multiplyScalar(0.6);
      
      materialRef.current.color.copy(wireframeColor);
      materialRef.current.emissive.copy(emissiveColor);
      materialRef.current.emissiveIntensity = 1.5 + (scrollProgress * 1.5);
      
      // Animate internal lights
      if (lightGroup.current) {
        lightGroup.current.children.forEach((light, index) => {
          if (light instanceof THREE.PointLight) {
            const time = state.clock.elapsedTime;
            const flickerSpeed = 2 + index * 0.5;
            const baseIntensity = internalLights[index].intensity;
            light.intensity = baseIntensity * (0.8 + 0.4 * Math.sin(time * flickerSpeed));
            
            // Color transition based on scroll
            const lightColor = getScrollColor((scrollProgress + index * 0.1) % 1);
            light.color.copy(lightColor);
          }
        });
        lightGroup.current.position.z = zPosition;
      }
      
      // Background material - distinct from sky
      backgroundMaterialRef.current.color.setHSL(0.66, 0.8, 0.15); // Dark purple-blue
      backgroundMaterialRef.current.opacity = 0.8;
    }
  });
  
  return (
    <group>
      {/* Internal mountain lights for depth */}
      <group ref={lightGroup}>
        {internalLights.map((light, index) => (
          <pointLight
            key={index}
            position={light.position}
            color={light.color}
            intensity={light.intensity}
            distance={8}
            decay={2}
          />
        ))}
      </group>
      
      {/* Background terrain - solid mountain interior */}
      <mesh
        ref={backgroundMeshRef}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.02, -2]}
      >
        <meshStandardMaterial
          ref={backgroundMaterialRef}
          color="#1a0d2e"
          transparent={true}
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Wireframe terrain - the grid lines */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, -2]}
      >
        <meshStandardMaterial
          ref={materialRef}
          color="#0088ff"
          emissive="#0044bb"
          emissiveIntensity={2.0}
          metalness={0.1}
          roughness={0.9}
          wireframe={true}
          transparent={true}
          opacity={0.95}
        />
      </mesh>
    </group>
  );
};
