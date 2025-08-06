
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
  
  // Create lower mountains with pronounced central path and higher side mountains
  const { geometry, maxHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(24, 35, 220, 280);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create wide, clear central path
      const distanceFromCenter = Math.abs(x);
      const pathWidth = 3.8; // Wide path
      const pathDepth = 1.0; // Moderate depth for clear passage
      const transitionZone = 5.8; // Where transition to mountains begins
      const mountainStart = 7.0; // Where main mountains begin
      
      let height = 0;
      
      if (distanceFromCenter < pathWidth) {
        // Central path - completely flat with slight depression
        const pathFactor = 1 - (distanceFromCenter / pathWidth);
        height = -pathDepth * Math.pow(pathFactor, 1.5);
      } else if (distanceFromCenter < transitionZone) {
        // Transition zone - gentle hills
        const transitionFactor = (distanceFromCenter - pathWidth) / (transitionZone - pathWidth);
        height = Math.sin(transitionFactor * Math.PI * 0.5) * 0.4;
        
        // Add some small hills in transition
        const smallHills = Math.sin(x * 1.2) * Math.cos(z * 0.8) * 0.2;
        height += smallHills * transitionFactor;
      } else if (distanceFromCenter < mountainStart) {
        // Pre-mountain area with medium elevations
        const preMountainFactor = (distanceFromCenter - transitionZone) / (mountainStart - transitionZone);
        const mediumElevations = Math.sin(x * 0.6) * Math.cos(z * 0.4) * 0.8;
        const detailWaves = Math.sin(x * 2.0) * Math.cos(z * 1.5) * 0.3;
        height = (mediumElevations + detailWaves) * preMountainFactor;
      } else {
        // Main mountain ranges - much higher and more varied
        const mountainDistance = distanceFromCenter - mountainStart;
        
        // Multiple mountain layers for complexity
        const primaryMountains = Math.sin(x * 0.3) * Math.cos(z * 0.25) * 2.2; // Tall primary peaks
        const secondaryMountains = Math.sin(x * 0.7) * Math.cos(z * 0.5) * 1.4; // Medium peaks
        const tertiaryMountains = Math.sin(x * 1.4) * Math.cos(z * 1.0) * 0.8; // Smaller peaks
        const detailRidges = Math.sin(x * 2.8) * Math.cos(z * 2.0) * 0.4; // Fine details
        const microVariations = Math.sin(x * 5.6) * Math.cos(z * 4.0) * 0.15; // Micro details
        
        // Distance-based scaling - mountains get higher further from center
        const distanceScale = Math.min(mountainDistance / 4.0, 1.2);
        
        // Create ridges parallel to the path
        const ridgeEffect = Math.sin(z * 0.8) * 0.6;
        
        // Combine all mountain effects
        height = (primaryMountains + secondaryMountains + tertiaryMountains + detailRidges + microVariations + ridgeEffect) * distanceScale;
        
        // Add some dramatic peaks at the edges
        if (distanceFromCenter > 10) {
          const edgePeaks = Math.sin(x * 0.4 + z * 0.3) * 1.8;
          height += edgePeaks * Math.min((distanceFromCenter - 10) / 2.0, 1.0);
        }
        
        // Ensure mountains don't go too low
        height = Math.max(height, 0.2 * distanceScale);
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

  // Internal lights for mountain depth - more lights for bigger mountains
  const internalLights = useMemo(() => {
    const lights = [];
    // Main mountain lights
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 8 + Math.random() * 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -0.3 - Math.random() * 0.8;
      
      lights.push({
        position: [x, y, z],
        color: new THREE.Color().setHSL((i * 30) / 360, 0.8, 0.6),
        intensity: 0.4 + Math.random() * 0.4
      });
    }
    
    // Additional peak lights for dramatic effect
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (10 + Math.random() * 4);
      const z = -10 + (i * 4) + Math.random() * 2;
      const y = 0.5 + Math.random() * 1.0;
      
      lights.push({
        position: [x, y, z],
        color: new THREE.Color().setHSL((240 + i * 20) / 360, 0.9, 0.7),
        intensity: 0.6 + Math.random() * 0.3
      });
    }
    
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
