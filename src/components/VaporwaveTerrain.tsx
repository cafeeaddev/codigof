
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const VaporwaveTerrain = () => {
  const gridRef = useRef<THREE.LineSegments>(null);
  const backgroundMeshRef = useRef<THREE.Mesh>(null);
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
  const { backgroundGeometry, gridGeometry, maxHeight } = useMemo(() => {
    // Background terrain geometry (same as before)
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
    
    // Create custom grid geometry with only horizontal and vertical lines
    const gridPoints = [];
    const gridSize = 24;
    const gridSegments = 48;
    const stepSize = gridSize / gridSegments;
    
    // Create horizontal lines (along X axis)
    for (let i = 0; i <= gridSegments; i++) {
      const z = -gridSize / 2 + i * stepSize;
      for (let j = 0; j < gridSegments; j++) {
        const x1 = -gridSize / 2 + j * stepSize;
        const x2 = -gridSize / 2 + (j + 1) * stepSize;
        
        // Calculate height at both points - but put Y in the correct position for rotated geometry
        const height1 = calculateHeightAtPoint(x1, z);
        const height2 = calculateHeightAtPoint(x2, z);
        
        // Points are arranged for XZ plane (already rotated coordinates)
        gridPoints.push(x1, 0, z, height1);  // First point: x, y, z, then x, y, z for second point
        gridPoints.push(x2, 0, z, height2);
      }
    }
    
    // Create vertical lines (along Z axis)
    for (let i = 0; i <= gridSegments; i++) {
      const x = -gridSize / 2 + i * stepSize;
      for (let j = 0; j < gridSegments; j++) {
        const z1 = -gridSize / 2 + j * stepSize;
        const z2 = -gridSize / 2 + (j + 1) * stepSize;
        
        // Calculate height at both points
        const height1 = calculateHeightAtPoint(x, z1);
        const height2 = calculateHeightAtPoint(x, z2);
        
        // Points are arranged for XZ plane (already rotated coordinates)
        gridPoints.push(x, 0, z1, height1);
        gridPoints.push(x, 0, z2, height2);
      }
    }
    
    // Fix the points array - remove the extra values
    const fixedGridPoints = [];
    for (let i = 0; i < gridPoints.length; i += 4) {
      fixedGridPoints.push(gridPoints[i], gridPoints[i + 3], gridPoints[i + 2]); // x, height, z
    }
    
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(fixedGridPoints, 3));
    
    return { backgroundGeometry: bgGeo, gridGeometry: gridGeo, maxHeight };
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
    if (gridRef.current && backgroundMeshRef.current && backgroundMaterialRef.current) {
      // Continuous terrain movement + inverted scroll influence - longer cycle
      const timeMovement = state.clock.elapsedTime * 0.2;
      const scrollMovement = -scrollProgress * 12;
      const zPosition = ((timeMovement + scrollMovement) % 24) - 12; // Square cycle
      
      gridRef.current.position.z = zPosition;
      backgroundMeshRef.current.position.z = zPosition;
    }
  });
  
  return (
    <group>
      {/* Background terrain - textured surface */}
      <mesh
        ref={backgroundMeshRef}
        geometry={backgroundGeometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.02, -2]}
      >
        <meshStandardMaterial
          ref={backgroundMaterialRef}
          map={backgroundTexture}
          normalMap={normalTexture}
          color="#444444"
          emissive="#111111"
          emissiveIntensity={0.2}
          roughness={0.9}
          metalness={0.1}
          transparent={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Clean grid lines - following the terrain mountains */}
      <lineSegments
        ref={gridRef}
        geometry={gridGeometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, -2]}
      >
        <lineBasicMaterial
          color="#ffdd00"
          transparent={true}
          opacity={0.9}
        />
      </lineSegments>
    </group>
  );
};
