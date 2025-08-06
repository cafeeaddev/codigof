import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { NoiseGenerator } from '../utils/noiseUtils';

export const VaporwavePath = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const backgroundMeshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  const noise = useMemo(() => new NoiseGenerator(123), []);
  
  console.log('VaporwavePath: Component rendering, scroll progress:', scrollProgress);
  
  // Create path geometry with valley in center and mountains on sides
  const { geometry, material } = useMemo(() => {
    console.log('Creating vaporwave path with side mountains...');
    
    const segments = { width: 80, height: 150 };
    const size = { width: 24, height: 50 };
    
    const geo = new THREE.PlaneGeometry(size.width, size.height, segments.width, segments.height);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Generate path with valley center and mountain sides
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // Z is Y in plane geometry before rotation
      
      // Distance from center (path width)
      const distanceFromCenter = Math.abs(x);
      
      // Create valley effect - low in center, high on sides
      let valleyHeight = 0;
      
      // Path valley (center area stays low)
      if (distanceFromCenter < 2) {
        // Central path area - keep low with subtle variation
        valleyHeight = noise.noise(x * 0.3, z * 0.1) * 0.1;
      } else {
        // Side mountains - height increases with distance from center
        const mountainBase = Math.pow((distanceFromCenter - 2) / 10, 1.8) * 4;
        
        // Add noise layers for realistic mountain texture
        const mountainNoise = noise.fractalNoise(x, z, 4, 0.06, 1.5);
        const ridgeDetail = noise.ridgeNoise(x, z, 3) * 0.8;
        const finePeaks = noise.noise(x * 0.15, z * 0.15) * 0.4;
        
        valleyHeight = mountainBase + mountainNoise + ridgeDetail + finePeaks;
      }
      
      // Distance-based falloff for perspective
      const distance = Math.sqrt(x * x + z * z);
      const falloff = Math.max(0.3, 1 - distance / (size.width * 0.8));
      
      positions[i + 2] = Math.max(0, valleyHeight * falloff);
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    console.log('Path geometry created with valley and mountains');
    
    // Enhanced shader for path effect
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        gridScale: { value: 3.0 },
        pathWidth: { value: 4.0 },
        neonPink: { value: new THREE.Color('#ff00ff') },
        neonCyan: { value: new THREE.Color('#00ffff') },
        neonPurple: { value: new THREE.Color('#8000ff') },
        pathColor: { value: new THREE.Color('#0066ff') }
      },
      vertexShader: `
        uniform float time;
        uniform float scrollOffset;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vDistanceFromCenter;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vUv = uv;
          vDistanceFromCenter = abs(position.x);
          
          vec3 pos = position;
          
          // Subtle path animation
          pos.z += sin(time * 0.4 + position.x * 0.08) * 0.03;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float scrollOffset;
        uniform float gridScale;
        uniform float pathWidth;
        uniform vec3 neonPink;
        uniform vec3 neonCyan;
        uniform vec3 neonPurple;
        uniform vec3 pathColor;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vDistanceFromCenter;
        
        void main() {
          float height = vPosition.z;
          float normalizedHeight = clamp(height / 4.0, 0.0, 1.0);
          
          // Different coloring for path vs mountains
          vec3 color;
          
          if (vDistanceFromCenter < 2.0) {
            // Path area - blue/cyan tones
            color = mix(pathColor * 0.4, neonCyan * 0.8, normalizedHeight);
            
            // Enhanced grid for path
            vec2 pathGrid = abs(fract(vUv * gridScale * 12.0) - 0.5);
            float pathGridLine = 1.0 - smoothstep(0.0, 0.03, min(pathGrid.x, pathGrid.y));
            color += pathGridLine * neonCyan * 0.7;
          } else {
            // Mountain areas - pink/purple tones
            vec3 lowColor = neonPurple * 0.2;
            vec3 midColor = neonPink * 0.6;
            vec3 highColor = neonCyan * 0.9;
            
            if (normalizedHeight < 0.4) {
              color = mix(lowColor, midColor, normalizedHeight * 2.5);
            } else {
              color = mix(midColor, highColor, (normalizedHeight - 0.4) * 1.67);
            }
            
            // Mountain grid
            vec2 grid = abs(fract(vUv * gridScale * 8.0) - 0.5);
            float gridLine = 1.0 - smoothstep(0.0, 0.06, min(grid.x, grid.y));
            color += gridLine * neonPink * 0.4;
          }
          
          // Path center highlighting
          if (vDistanceFromCenter < 1.5) {
            float pathGlow = (1.5 - vDistanceFromCenter) / 1.5;
            color += pathGlow * pathColor * 0.3;
          }
          
          // Distance fade for depth
          float distanceFade = 1.0 - clamp(distance(vPosition.xy, vec2(0.0)) / 12.0, 0.0, 0.7);
          color *= distanceFade;
          
          // Enhanced glow for peaks
          if (normalizedHeight > 0.6) {
            color += (normalizedHeight - 0.6) * 2.5 * neonCyan * 0.4;
          }
          
          gl_FragColor = vec4(color, 0.92);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    console.log('Path shader material created with valley/mountain effects');
    
    return { geometry: geo, material: shaderMaterial };
  }, [noise]);
  
  // Create background mountain layer
  const backgroundGeometry = useMemo(() => {
    const bgGeo = new THREE.PlaneGeometry(30, 60, 40, 80);
    const bgPositions = bgGeo.getAttribute('position').array as Float32Array;
    
    for (let i = 0; i < bgPositions.length; i += 3) {
      const x = bgPositions[i];
      const z = bgPositions[i + 1];
      
      const distanceFromCenter = Math.abs(x);
      const bgHeight = Math.pow(distanceFromCenter / 15, 2) * 6 + 
                      noise.fractalNoise(x * 0.03, z * 0.03, 3, 0.1, 2);
      
      bgPositions[i + 2] = Math.max(0, bgHeight);
    }
    
    bgGeo.getAttribute('position').needsUpdate = true;
    bgGeo.computeVertexNormals();
    return bgGeo;
  }, [noise]);
  
  // Animation and movement
  useFrame((state) => {
    if (meshRef.current && material instanceof THREE.ShaderMaterial) {
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.scrollOffset.value = scrollProgress;
      
      // Path moves toward camera as we scroll
      const scrollMovement = scrollProgress * 25;
      meshRef.current.position.z = scrollMovement - 10;
      
      if (backgroundMeshRef.current) {
        // Background mountains move slower (parallax)
        backgroundMeshRef.current.position.z = scrollMovement * 0.5 - 15;
      }
      
      // Debug every 3 seconds
      if (Math.floor(state.clock.elapsedTime) % 3 === 0 && state.clock.elapsedTime % 1 < 0.016) {
        console.log('Path movement - Scroll:', scrollProgress.toFixed(2), 
                   'Path Z:', meshRef.current.position.z.toFixed(1));
      }
    }
  });
  
  return (
    <group>
      {/* Background mountain layer */}
      <mesh
        ref={backgroundMeshRef}
        geometry={backgroundGeometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -2, -20]}
      >
        <meshBasicMaterial 
          color="#1a0a2e" 
          wireframe={true} 
          transparent={true} 
          opacity={0.3} 
        />
      </mesh>
      
      {/* Main path with side mountains */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.5, -10]}
      />
      
      {/* Path center reference marker */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
};
