
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
  const scrollProgress = useScrollProgress();
  
  // Load the grid texture but we'll use it minimally
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 16); // Increased repetition for denser grid
  }, [texture]);
  
  // Create lower mountains with pronounced central path
  const { geometry, maxHeight } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 24, 256, 256);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create pronounced central path - like a valley between mountains
      const distanceFromCenter = Math.abs(x);
      const pathWidth = 2.0; // Narrow central path
      const mountainWidth = 6.0; // Where mountains start
      const mountainHeight = 1.0; // Lower mountains
      
      let pathEffect = 0;
      if (distanceFromCenter < pathWidth) {
        // Deep central valley (the path)
        const pathFactor = (distanceFromCenter / pathWidth);
        pathEffect = -0.8 * (1 - Math.pow(pathFactor, 2)); // Smooth valley
      } else if (distanceFromCenter > mountainWidth) {
        // Mountain ridges on the sides
        const mountainFactor = Math.min(1, (distanceFromCenter - mountainWidth) / 2);
        pathEffect = mountainHeight * (1 - Math.pow(mountainFactor, 2));
      }
      
      // Gentle wave patterns for mountain texture - much lower amplitude
      const wave1 = Math.sin(x * 0.3) * Math.cos(z * 0.2) * 0.3;
      const wave2 = Math.sin(x * 0.8) * Math.cos(z * 0.6) * 0.15;
      const wave3 = Math.sin(x * 1.6) * Math.cos(z * 1.2) * 0.08;
      
      // Longitudinal variations for natural look
      const longitudinal = Math.sin(z * 0.1) * 0.2;
      
      // Combine effects - much lower overall height
      const height = (wave1 + wave2 + wave3 + longitudinal) * 0.8 + pathEffect;
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return { geometry: geo, maxHeight };
  }, []);
  
  // Color system that changes with scroll: blue -> cyan -> orange/gold
  const getScrollBasedColor = (progress: number) => {
    if (progress < 0.33) {
      // Deep blue to bright blue
      const localProgress = progress / 0.33;
      const hue = 240 - (localProgress * 20); // 240 to 220 (deep blue to bright blue)
      const saturation = 80 + (localProgress * 20); // 80-100%
      const lightness = 50 + (localProgress * 20); // 50-70%
      return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
    } else if (progress < 0.66) {
      // Bright blue to cyan
      const localProgress = (progress - 0.33) / 0.33;
      const hue = 220 - (localProgress * 40); // 220 to 180 (blue to cyan)
      const saturation = 100;
      const lightness = 70 + (localProgress * 10); // 70-80%
      return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
    } else {
      // Cyan to orange/gold
      const localProgress = (progress - 0.66) / 0.34;
      const hue = 180 - (localProgress * 150); // 180 to 30 (cyan to orange)
      const saturation = 100 - (localProgress * 10); // 100-90%
      const lightness = 80 - (localProgress * 10); // 80-70%
      return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
    }
  };
  
  // Internal lights for depth effect
  const lightRefs = useRef<THREE.PointLight[]>([]);
  
  // Animation and color updates
  useFrame((state) => {
    if (meshRef.current && materialRef.current && backgroundMeshRef.current && backgroundMaterialRef.current) {
      // Continuous terrain movement + scroll influence
      const timeMovement = state.clock.elapsedTime * 0.3;
      const scrollMovement = -scrollProgress * 8;
      const zPosition = ((timeMovement + scrollMovement) % 24) - 12;
      
      meshRef.current.position.z = zPosition;
      backgroundMeshRef.current.position.z = zPosition;
      
      // Update colors based on scroll progress
      const wireframeColor = getScrollBasedColor(scrollProgress);
      const emissiveColor = getScrollBasedColor(scrollProgress);
      
      materialRef.current.color = wireframeColor;
      materialRef.current.emissive = emissiveColor;
      materialRef.current.emissiveIntensity = 1.5 + (scrollProgress * 1.5);
      
      // Animate internal lights
      lightRefs.current.forEach((light, index) => {
        if (light) {
          const time = state.clock.elapsedTime + index * 2;
          light.intensity = 0.8 + Math.sin(time * 0.5) * 0.4;
          light.position.z = zPosition + (index * 4) - 8;
          // Change light color based on scroll
          const lightColor = getScrollBasedColor(scrollProgress + index * 0.1);
          light.color = lightColor;
        }
      });
      
      // Update background material with gradient effect
      const bgColor = new THREE.Color().setHSL(0.7, 0.3, 0.05 + scrollProgress * 0.1);
      backgroundMaterialRef.current.color = bgColor;
      backgroundMaterialRef.current.opacity = 0.8;
    }
  });
  
  return (
    <group>
      {/* Internal mountain lights for depth */}
      {[-4, -2, 0, 2, 4].map((xPos, index) => (
        <pointLight
          key={index}
          ref={(ref) => {
            if (ref) lightRefs.current[index] = ref;
          }}
          position={[xPos, -0.5, -6]}
          intensity={0.8}
          color="#00aaff"
          distance={8}
          decay={2}
        />
      ))}
      
      {/* Background mountain surface - solid with internal texture */}
      <mesh
        ref={backgroundMeshRef}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.02, -2]}
      >
        <meshStandardMaterial
          ref={backgroundMaterialRef}
          color="#0a0a2a"
          transparent={true}
          opacity={0.8}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Wireframe mountains - on top */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, -2]}
      >
        <meshStandardMaterial
          ref={materialRef}
          color="#0088ff"
          emissive="#0066cc"
          emissiveIntensity={1.8}
          metalness={0.1}
          roughness={0.7}
          wireframe={true}
          transparent={true}
          opacity={0.95}
        />
      </mesh>
    </group>
  );
};
