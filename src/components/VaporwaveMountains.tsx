
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { NoiseGenerator } from '../utils/noiseUtils';

export const VaporwaveMountains = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  const noise = useMemo(() => new NoiseGenerator(42), []);
  
  console.log('VaporwaveMountains: Component rendering, scroll progress:', scrollProgress);
  
  // Create mountain geometry with noise-based heights
  const { geometry, material } = useMemo(() => {
    console.log('Creating vaporwave mountain geometry...');
    
    const segments = { width: 64, height: 128 };
    const size = { width: 20, height: 40 };
    
    const geo = new THREE.PlaneGeometry(size.width, size.height, segments.width, segments.height);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Generate mountain heights using noise
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // Z is Y in plane geometry before rotation
      
      // Distance-based falloff for perspective
      const distance = Math.sqrt(x * x + z * z);
      const falloff = Math.max(0, 1 - distance / (size.width * 0.7));
      
      // Combine multiple noise layers for realistic mountains
      const baseHeight = noise.fractalNoise(x, z, 4, 0.08, 2) * falloff;
      const ridges = noise.ridgeNoise(x, z, 2) * 0.8 * falloff;
      const details = noise.noise(x * 0.2, z * 0.2) * 0.3 * falloff;
      
      const finalHeight = (baseHeight + ridges + details) * 3;
      positions[i + 2] = Math.max(0, finalHeight); // Set Y (height), never below 0
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    console.log('Mountain geometry created with', positions.length / 3, 'vertices');
    
    // Create vaporwave shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        gridScale: { value: 2.0 },
        neonPink: { value: new THREE.Color('#ff00ff') },
        neonCyan: { value: new THREE.Color('#00ffff') },
        neonPurple: { value: new THREE.Color('#8000ff') }
      },
      vertexShader: `
        uniform float time;
        uniform float scrollOffset;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vUv = uv;
          
          vec3 pos = position;
          
          // Subtle animation
          pos.z += sin(time * 0.3 + position.x * 0.1) * 0.05;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float scrollOffset;
        uniform float gridScale;
        uniform vec3 neonPink;
        uniform vec3 neonCyan;
        uniform vec3 neonPurple;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          // Height-based color gradient
          float height = vPosition.z;
          float normalizedHeight = clamp(height / 3.0, 0.0, 1.0);
          
          // Vaporwave color gradient
          vec3 lowColor = neonPurple * 0.3;
          vec3 midColor = neonPink * 0.8;
          vec3 highColor = neonCyan;
          
          vec3 color;
          if (normalizedHeight < 0.5) {
            color = mix(lowColor, midColor, normalizedHeight * 2.0);
          } else {
            color = mix(midColor, highColor, (normalizedHeight - 0.5) * 2.0);
          }
          
          // Grid effect
          vec2 grid = abs(fract(vUv * gridScale * 10.0) - 0.5);
          float gridLine = 1.0 - smoothstep(0.0, 0.05, min(grid.x, grid.y));
          
          // Enhanced grid on edges
          float edgeGrid = max(gridLine, 0.0) * 0.8;
          color += edgeGrid * neonCyan * 0.5;
          
          // Glow effect based on height
          float glow = pow(normalizedHeight, 2.0) * 0.3;
          color += glow * neonPink;
          
          // Fade with distance for depth
          float distanceFade = 1.0 - clamp(distance(vPosition.xy, vec2(0.0)) / 10.0, 0.0, 0.8);
          color *= distanceFade;
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    console.log('Vaporwave shader material created');
    
    return { geometry: geo, material: shaderMaterial };
  }, [noise]);
  
  // Animation and scroll-based movement
  useFrame((state) => {
    if (meshRef.current && material instanceof THREE.ShaderMaterial) {
      // Update shader uniforms
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.scrollOffset.value = scrollProgress;
      
      // Subtle rotation animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
      
      // Move mountains based on scroll with parallax effect
      const scrollMovement = scrollProgress * 8;
      meshRef.current.position.z = scrollMovement - 5;
      
      // Debug log every 3 seconds
      if (Math.floor(state.clock.elapsedTime) % 3 === 0 && state.clock.elapsedTime % 1 < 0.016) {
        console.log('Mountains animation - Time:', state.clock.elapsedTime.toFixed(1), 
                   'Scroll:', scrollProgress.toFixed(2), 'Position Z:', meshRef.current.position.z.toFixed(2));
      }
    }
  });
  
  console.log('VaporwaveMountains: Rendering mesh at position [0, -1, -5]');
  
  return (
    <group>
      {/* Debug elements for reference */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      
      {/* Mountain terrain */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -1, -5]}
      />
      
      {/* Additional mountain layers for depth */}
      <mesh
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -1.5, -8]}
        scale={[1.2, 1, 0.8]}
      />
    </group>
  );
};
