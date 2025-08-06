
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
  
  // Create path geometry with valley in center and taller mountains on sides
  const { geometry, material } = useMemo(() => {
    console.log('Creating vaporwave path with taller side mountains...');
    
    const segments = { width: 80, height: 150 };
    const size = { width: 24, height: 50 };
    
    const geo = new THREE.PlaneGeometry(size.width, size.height, segments.width, segments.height);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Generate path with valley center and much taller mountain sides
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // Z is Y in plane geometry before rotation
      
      // Distance from center (path width)
      const distanceFromCenter = Math.abs(x);
      
      // Create valley effect with path elevations and tall mountains
      let valleyHeight = 0;
      
      // Path valley (center area with some elevations)
      if (distanceFromCenter < 2.5) {
        // Central path area - add small hills and variations
        const pathElevations = noise.fractalNoise(x * 0.4, z * 0.2, 3, 0.15, 0.8);
        const pathDetails = noise.noise(x * 0.8, z * 0.3) * 0.2;
        valleyHeight = Math.max(0, pathElevations + pathDetails) * 0.6;
      } else {
        // Side mountains - much taller with dramatic height increase
        const mountainDistance = distanceFromCenter - 2.5;
        const mountainBase = Math.pow(mountainDistance / 8, 1.2) * 8; // Increased height multiplier
        
        // Add multiple noise layers for realistic tall mountains
        const mountainNoise = noise.fractalNoise(x, z, 5, 0.04, 2.5);
        const ridgeDetail = noise.ridgeNoise(x, z, 4) * 1.8; // Enhanced ridges
        const finePeaks = noise.noise(x * 0.12, z * 0.12) * 1.2;
        const megaPeaks = noise.fractalNoise(x * 0.03, z * 0.03, 2, 0.1, 3) * 2;
        
        valleyHeight = mountainBase + mountainNoise + ridgeDetail + finePeaks + megaPeaks;
      }
      
      // Distance-based falloff for perspective
      const distance = Math.sqrt(x * x + z * z);
      const falloff = Math.max(0.2, 1 - distance / (size.width * 0.9));
      
      positions[i + 2] = Math.max(0, valleyHeight * falloff);
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    console.log('Path geometry created with taller valley and mountains');
    
    // Enhanced shader for path effect
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        gridScale: { value: 3.0 },
        pathWidth: { value: 5.0 },
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
          
          // Continuous path animation independent of scroll
          pos.z += sin(time * 0.6 + position.x * 0.1) * 0.08;
          pos.x += sin(time * 0.3 + position.z * 0.05) * 0.03;
          
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
          float normalizedHeight = clamp(height / 8.0, 0.0, 1.0); // Adjusted for taller mountains
          
          // Different coloring for path vs mountains
          vec3 color;
          
          if (vDistanceFromCenter < 2.5) {
            // Path area - blue/cyan tones with elevation highlights
            vec3 pathBase = mix(pathColor * 0.3, neonCyan * 0.6, normalizedHeight);
            
            // Highlight path elevations
            if (height > 0.2) {
              pathBase = mix(pathBase, neonPink * 0.4, (height - 0.2) * 2.0);
            }
            
            color = pathBase;
            
            // Enhanced grid for path
            vec2 pathGrid = abs(fract(vUv * gridScale * 15.0) - 0.5);
            float pathGridLine = 1.0 - smoothstep(0.0, 0.02, min(pathGrid.x, pathGrid.y));
            color += pathGridLine * neonCyan * 0.8;
          } else {
            // Mountain areas - pink/purple tones for tall peaks
            vec3 lowColor = neonPurple * 0.25;
            vec3 midColor = neonPink * 0.7;
            vec3 highColor = mix(neonCyan, vec3(1.0, 1.0, 0.8), 0.3); // Peak glow
            
            if (normalizedHeight < 0.3) {
              color = mix(lowColor, midColor, normalizedHeight * 3.33);
            } else if (normalizedHeight < 0.7) {
              color = mix(midColor, highColor, (normalizedHeight - 0.3) * 2.5);
            } else {
              // Bright peaks
              color = mix(highColor, vec3(1.0, 1.0, 1.0), (normalizedHeight - 0.7) * 3.33);
            }
            
            // Mountain grid
            vec2 grid = abs(fract(vUv * gridScale * 6.0) - 0.5);
            float gridLine = 1.0 - smoothstep(0.0, 0.08, min(grid.x, grid.y));
            color += gridLine * neonPink * 0.5;
          }
          
          // Path center highlighting
          if (vDistanceFromCenter < 2.0) {
            float pathGlow = (2.0 - vDistanceFromCenter) / 2.0;
            color += pathGlow * pathColor * 0.4;
          }
          
          // Distance fade for depth
          float distanceFade = 1.0 - clamp(distance(vPosition.xy, vec2(0.0)) / 15.0, 0.0, 0.8);
          color *= distanceFade;
          
          // Enhanced glow for tall peaks
          if (normalizedHeight > 0.8) {
            color += (normalizedHeight - 0.8) * 5.0 * neonCyan * 0.6;
          }
          
          gl_FragColor = vec4(color, 0.94);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    console.log('Path shader material created with taller mountain effects');
    
    return { geometry: geo, material: shaderMaterial };
  }, [noise]);
  
  // Create background mountain layer - even taller
  const backgroundGeometry = useMemo(() => {
    const bgGeo = new THREE.PlaneGeometry(35, 70, 30, 60);
    const bgPositions = bgGeo.getAttribute('position').array as Float32Array;
    
    for (let i = 0; i < bgPositions.length; i += 3) {
      const x = bgPositions[i];
      const z = bgPositions[i + 1];
      
      const distanceFromCenter = Math.abs(x);
      const bgHeight = Math.pow(distanceFromCenter / 12, 1.8) * 12 + 
                      noise.fractalNoise(x * 0.02, z * 0.02, 4, 0.08, 3);
      
      bgPositions[i + 2] = Math.max(0, bgHeight);
    }
    
    bgGeo.getAttribute('position').needsUpdate = true;
    bgGeo.computeVertexNormals();
    return bgGeo;
  }, [noise]);
  
  // Animation with continuous movement
  useFrame((state) => {
    if (meshRef.current && material instanceof THREE.ShaderMaterial) {
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.scrollOffset.value = scrollProgress;
      
      // Continuous forward movement independent of scroll
      const continuousMovement = state.clock.elapsedTime * 2; // Always moving forward
      const scrollMovement = scrollProgress * 15; // Scroll-based additional movement
      
      meshRef.current.position.z = continuousMovement + scrollMovement - 15;
      
      if (backgroundMeshRef.current) {
        // Background mountains move slower (parallax) but also continuously
        backgroundMeshRef.current.position.z = (continuousMovement * 0.3) + (scrollMovement * 0.4) - 20;
      }
      
      // Debug every 3 seconds
      if (Math.floor(state.clock.elapsedTime) % 3 === 0 && state.clock.elapsedTime % 1 < 0.016) {
        console.log('Continuous Path movement - Time:', state.clock.elapsedTime.toFixed(1),
                   'Continuous:', continuousMovement.toFixed(1), 'Scroll:', scrollMovement.toFixed(1));
      }
    }
  });
  
  return (
    <group>
      {/* Background mountain layer - taller */}
      <mesh
        ref={backgroundMeshRef}
        geometry={backgroundGeometry}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -3, -25]}
      >
        <meshBasicMaterial 
          color="#2a0845" 
          wireframe={true} 
          transparent={true} 
          opacity={0.4} 
        />
      </mesh>
      
      {/* Main path with elevated valley and taller side mountains */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.8, -12]}
      />
      
      {/* Path center reference marker */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
};
