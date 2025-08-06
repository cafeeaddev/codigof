
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  
  // Create much longer terrain geometry
  const geometry = useMemo(() => {
    // Make terrain much longer for scroll effect
    const geo = new THREE.PlaneGeometry(8, 40, 32, 160);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Add terrain displacement (mountains on the sides, valley in the middle)
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Calculate distance from center line
      const distanceFromCenter = Math.abs(x);
      
      // Create steep mountains on the sides
      if (distanceFromCenter > 1.5) {
        const height = Math.pow((distanceFromCenter - 1.5) * 1.5, 2) * 0.5;
        positions[i + 2] = height;
      }
      
      // Add rolling hills effect based on Z position
      const wave = Math.sin(z * 0.3) * 0.1;
      positions[i + 2] += wave;
      
      // Add some noise for more interesting terrain
      const noise = (Math.sin(x * 8) * Math.cos(z * 6)) * 0.03;
      positions[i + 2] += noise;
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return geo;
  }, []);
  
  // Create procedural neon grid material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        gridScale: { value: 2.0 },
        neonColor1: { value: new THREE.Color('#ff00ff') }, // Neon pink
        neonColor2: { value: new THREE.Color('#00ffff') }, // Neon cyan
        backgroundColor: { value: new THREE.Color('#000011') }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float scrollOffset;
        uniform float gridScale;
        uniform vec3 neonColor1;
        uniform vec3 neonColor2;
        uniform vec3 backgroundColor;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          // Create animated grid coordinates
          vec2 gridUv = vUv * gridScale + vec2(0.0, scrollOffset * 2.0);
          
          // Create grid lines
          vec2 grid = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
          float gridLine = min(grid.x, grid.y);
          
          // Create neon glow effect
          float neonIntensity = 1.0 - min(gridLine, 1.0);
          neonIntensity = pow(neonIntensity, 0.3) * 2.0;
          
          // Animate colors along the grid
          float colorMix = sin(time * 2.0 + vUv.y * 10.0) * 0.5 + 0.5;
          vec3 neonColor = mix(neonColor1, neonColor2, colorMix);
          
          // Add pulsing effect
          float pulse = sin(time * 3.0 + vUv.y * 5.0) * 0.3 + 0.7;
          neonIntensity *= pulse;
          
          // Mix background and neon colors
          vec3 finalColor = mix(backgroundColor, neonColor, neonIntensity);
          
          // Add transparency for outer areas
          float alpha = 1.0 - smoothstep(0.0, 0.3, neonIntensity);
          alpha = clamp(alpha + neonIntensity * 0.8, 0.3, 1.0);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, []);
  
  // Animation loop with scroll synchronization
  useFrame((state) => {
    if (meshRef.current && material) {
      // Update time uniform for animations
      material.uniforms.time.value = state.clock.elapsedTime;
      
      // Update scroll offset for terrain movement
      material.uniforms.scrollOffset.value = scrollProgress * 10;
      
      // Move terrain based on scroll (simulating walking forward)
      const terrainOffset = scrollProgress * 20; // Move through 20 units of terrain
      meshRef.current.position.z = terrainOffset - 10; // Center around origin
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI * 0.5, 0, 0]}
      position={[0, -0.5, 0]}
    />
  );
};
