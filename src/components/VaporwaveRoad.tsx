
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';

export const VaporwaveRoad = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  
  console.log('VaporwaveRoad: Creating infinite highway, scroll progress:', scrollProgress);
  
  // Create road geometry - long and narrow like a highway
  const { geometry, material } = useMemo(() => {
    console.log('Creating vaporwave highway...');
    
    // Highway dimensions - long road stretching into distance
    const roadWidth = 12;
    const roadLength = 100;
    const segments = { width: 60, height: 200 };
    
    const geo = new THREE.PlaneGeometry(roadWidth, roadLength, segments.width, segments.height);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Create subtle road surface with minimal elevation changes
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // Z is Y in plane geometry before rotation
      
      // Very subtle road surface variations - almost flat
      const roadNoise = Math.sin(x * 0.1) * Math.cos(z * 0.05) * 0.02;
      const centerLine = Math.abs(x) < 0.2 ? 0.01 : 0; // Slight center line elevation
      
      positions[i + 2] = roadNoise + centerLine;
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    // Classic vaporwave highway shader
    const roadMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        roadWidth: { value: roadWidth },
        neonPink: { value: new THREE.Color('#ff007f') },
        neonCyan: { value: new THREE.Color('#00ffff') },
        darkPurple: { value: new THREE.Color('#1a0033') }
      },
      vertexShader: `
        uniform float scrollOffset;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vDistanceFromCamera;
        
        void main() {
          vPosition = position;
          vUv = uv;
          
          vec3 pos = position;
          
          // Move road based on scroll only
          pos.z += scrollOffset * 50.0;
          
          vDistanceFromCamera = distance(pos, cameraPosition);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float scrollOffset;
        uniform float roadWidth;
        uniform vec3 neonPink;
        uniform vec3 neonCyan;
        uniform vec3 darkPurple;
        
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vDistanceFromCamera;
        
        void main() {
          // Road surface base color
          vec3 roadColor = darkPurple * 0.3;
          
          // Classic vaporwave grid with perspective
          float gridScale = 20.0;
          vec2 grid = fract(vUv * gridScale);
          
          // Vertical lines (road lanes)
          float verticalLines = step(0.95, grid.x) + step(grid.x, 0.05);
          
          // Horizontal lines (road segments) with perspective scaling
          float perspectiveScale = 1.0 + vUv.y * 3.0; // Lines get closer together in distance
          vec2 perspectiveGrid = fract(vUv * vec2(1.0, gridScale * perspectiveScale));
          float horizontalLines = step(0.95, perspectiveGrid.y) + step(perspectiveGrid.y, 0.05);
          
          // Center line
          float centerLine = abs(vPosition.x) < 0.1 ? 1.0 : 0.0;
          
          // Combine grid lines
          float gridLines = max(verticalLines, horizontalLines);
          
          // Apply neon colors to grid
          vec3 gridColor = mix(neonCyan, neonPink, vUv.y);
          roadColor += gridLines * gridColor * 0.8;
          roadColor += centerLine * neonPink * 1.2;
          
          // Distance fade for infinite road effect
          float distanceFade = 1.0 - clamp(vUv.y, 0.0, 0.9);
          roadColor *= distanceFade;
          
          // Atmospheric perspective
          float atmosphericFade = 1.0 - clamp(vDistanceFromCamera / 80.0, 0.0, 0.8);
          roadColor *= atmosphericFade;
          
          gl_FragColor = vec4(roadColor, 0.95);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    return { geometry: geo, material: roadMaterial };
  }, []);
  
  // Update road position based on scroll only
  useFrame(() => {
    if (meshRef.current && material instanceof THREE.ShaderMaterial) {
      material.uniforms.scrollOffset.value = scrollProgress;
      
      // Road moves backward as we scroll (simulating forward movement)
      meshRef.current.position.z = -scrollProgress * 50;
    }
  });
  
  return (
    <group>
      {/* Highway road */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.1, 0]}
      />
    </group>
  );
};
