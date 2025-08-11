
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { getDynamicNeonColor } from '../utils/vaporwaveColors';

interface VaporwaveTerrainProps {
  cameraPosition?: [number, number, number];
}

export const VaporwaveTerrain = ({ cameraPosition = [0, 3, 5] }: VaporwaveTerrainProps) => {
  const groupRefs = useRef<THREE.Group[]>([]);
  
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
  
  // Configure texture for background (stone-like appearance)
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

  // Create dramatic terrain geometry for realistic mountains
  const { backgroundGeometry, maxHeight } = useMemo(() => {
    // Reduced resolution terrain geometry for cleaner wireframe
    const bgGeo = new THREE.PlaneGeometry(100, 100, 50, 50);
    const positionAttribute = bgGeo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    let maxHeight = 0;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create valley/path in the center (when x is close to 0)
      const centerDistance = Math.abs(x);
      const pathEffect = Math.max(0, 1 - centerDistance / 15); // Path width of ~30 units
      
      // Mountains on the sides - stronger effect farther from center
      const sideEffect = Math.pow(centerDistance / 25, 2) * 3;
      
      // Base terrain variation
      const wave1 = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 1.5;
      const wave2 = Math.sin(x * 0.4) * Math.cos(z * 0.4) * 0.8;
      const wave3 = Math.sin(z * 0.3) * 0.6; // Z-direction waves for depth
      
      // Ridge formations for mountains (stronger on sides)
      const ridgeEffect = Math.abs(Math.sin(x * 0.1)) * sideEffect * 0.8;
      
      // Subtle path depression in center
      const pathDepression = pathEffect * -0.5;
      
      // Combine effects: lower in center, higher on sides
      const height = (wave1 + wave2 + wave3 + ridgeEffect + sideEffect + pathDepression) * (1 - pathEffect * 0.7);
      
      positions[i + 2] = height;
      maxHeight = Math.max(maxHeight, Math.abs(height));
    }
    
    positionAttribute.needsUpdate = true;
    bgGeo.computeVertexNormals();
    
    return { backgroundGeometry: bgGeo, maxHeight };
  }, []);
  
  // Wireframe geometry for line rendering (shared)
  const wireframeGeometry = useMemo(() => new THREE.WireframeGeometry(backgroundGeometry), [backgroundGeometry]);
  
  // Get dynamic neon color based on scroll progress
  const currentNeonColor = getDynamicNeonColor(scrollProgress);
  
  // Animation and color updates with pulsating effect
  useFrame((state) => {
    // Movimento automático contínuo + efeito do scroll + posição da câmera
    const timeMovement = state.clock.elapsedTime * 0.8; // Movimento mais consistente
    const scrollMovement = scrollProgress * 8; // Mais responsivo ao scroll
    const cameraZOffset = cameraPosition[2] * 0.2; // Ajusta baseado na posição Z da câmera
    
    // Combina os três movimentos - INVERTIDO para ir para frente
    const totalMovement = -(timeMovement + scrollMovement + cameraZOffset);
    
    // Pulsating effect for wireframe material
    const pulseIntensity = 2.0 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    
    // Terrain spacing: 90 units for better overlap and continuity
    const terrainSpacing = 90;
    const totalLoopDistance = terrainSpacing * 4; // 4 terrain segments = 360 units total
    
    // Move cada grupo de terreno individualmente
    groupRefs.current.forEach((group, index) => {
      if (group) {
        // Posição base de cada terreno com espaçamento otimizado
        const basePosition = index * terrainSpacing;
        
        // Calcula posição atual com movimento contínuo
        const currentPosition = basePosition + (totalMovement % totalLoopDistance);
        
        // Normaliza a posição para manter dentro do loop
        let normalizedPosition = currentPosition;
        if (normalizedPosition > terrainSpacing * 2) {
          normalizedPosition -= totalLoopDistance;
        }
        if (normalizedPosition < -terrainSpacing * 2) {
          normalizedPosition += totalLoopDistance;
        }
        
        group.position.z = normalizedPosition;
        
         // Apply pulsating effect and dynamic color to all wireframe line materials
         group.children.forEach((child) => {
           if ((child as any).type === 'LineSegments') {
             const material = (child as THREE.LineSegments).material as THREE.LineBasicMaterial;
             if (material) {
               material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
               material.color.set(currentNeonColor); // Apply dynamic color
             }
           }
         });
      }
    });
  });
  
  return (
    <group>
      {/* Increased to 4 terrain segments for perfect infinite loop */}
      {[0, 1, 2, 3].map((index) => (
        <group 
          key={index}
          ref={(el) => {
            if (el) {
              groupRefs.current[index] = el;
              (el as any).userData = { ...(el as any).userData, zIndex: index };
            }
          }}
          position={[0, 0, index * -90]} // Optimized spacing for seamless connection
        >
          {/* Dark terrain base with gradient effect */}
          <mesh
            geometry={backgroundGeometry}
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -3.0, 0]}
            renderOrder={1}
          >
            <meshBasicMaterial
              color="#2b2b31"
              transparent={false}
              opacity={1.0}
              side={THREE.DoubleSide}
              depthTest={true}
              depthWrite={true}
              polygonOffset={true}
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
            />
          </mesh>
          
          {/* Wireframe overlay with dynamic neon color */}
          <lineSegments
            rotation={[-Math.PI * 0.5, 0, 0]}
            position={[0, -2.91, 0]}
            renderOrder={2}
          >
            <primitive attach="geometry" object={wireframeGeometry} />
            <lineBasicMaterial
              color={currentNeonColor}
              transparent={true}
              depthTest={true}
              depthWrite={false}
              polygonOffset={true}
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
            />
          </lineSegments>

          {/* Left tile (extend sideways) */}
          <group position={[-100, 0, 0]}>
            <mesh
              geometry={backgroundGeometry}
              rotation={[-Math.PI * 0.5, 0, 0]}
              position={[0, -3.0, 0]}
              renderOrder={1}
            >
              <meshBasicMaterial
                color="#2b2b31"
                transparent={false}
                opacity={1.0}
                side={THREE.DoubleSide}
                depthTest={true}
                depthWrite={true}
                polygonOffset={true}
                polygonOffsetFactor={1}
                polygonOffsetUnits={1}
              />
            </mesh>
            <lineSegments
              rotation={[-Math.PI * 0.5, 0, 0]}
              position={[0, -2.91, 0]}
              renderOrder={2}
            >
              <primitive attach="geometry" object={wireframeGeometry} />
              <lineBasicMaterial
                color={currentNeonColor}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
              />
            </lineSegments>
          </group>

          {/* Right tile (extend sideways) */}
          <group position={[100, 0, 0]}>
            <mesh
              geometry={backgroundGeometry}
              rotation={[-Math.PI * 0.5, 0, 0]}
              position={[0, -3.0, 0]}
              renderOrder={1}
            >
              <meshBasicMaterial
                color="#2b2b31"
                transparent={false}
                opacity={1.0}
                side={THREE.DoubleSide}
                depthTest={true}
                depthWrite={true}
                polygonOffset={true}
                polygonOffsetFactor={1}
                polygonOffsetUnits={1}
              />
            </mesh>
            <lineSegments
              rotation={[-Math.PI * 0.5, 0, 0]}
              position={[0, -2.91, 0]}
              renderOrder={2}
            >
              <primitive attach="geometry" object={wireframeGeometry} />
              <lineBasicMaterial
                color={currentNeonColor}
                transparent={true}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
              />
            </lineSegments>
          </group>
        </group>
      ))}
    </group>
  );
};
