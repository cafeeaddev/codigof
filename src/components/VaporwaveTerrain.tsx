
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';

export const VaporwaveTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  
  // Create simplified terrain geometry
  const geometry = useMemo(() => {
    console.log('Creating terrain geometry...');
    // Reduce complexity: 16x80 segments instead of 32x160
    const geo = new THREE.PlaneGeometry(6, 20, 16, 80);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Add simpler terrain displacement
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Calculate distance from center line
      const distanceFromCenter = Math.abs(x);
      
      // Create gentler mountains on the sides
      if (distanceFromCenter > 1.0) {
        const height = Math.pow((distanceFromCenter - 1.0) * 0.8, 1.5) * 0.3;
        positions[i + 2] = height;
      }
      
      // Add subtle rolling hills
      const wave = Math.sin(z * 0.2) * 0.05;
      positions[i + 2] += wave;
      
      // Add minimal noise
      const noise = (Math.sin(x * 4) * Math.cos(z * 3)) * 0.01;
      positions[i + 2] += noise;
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    console.log('Terrain geometry created successfully');
    return geo;
  }, []);
  
  // Create simplified neon grid material
  const material = useMemo(() => {
    console.log('Creating shader material...');
    
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        gridScale: { value: 1.5 },
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
          vec2 gridUv = vUv * gridScale + vec2(0.0, scrollOffset * 1.5);
          
          // Create grid lines using mod instead of fract for better compatibility
          vec2 grid = mod(gridUv, 1.0);
          
          // Create grid effect without fwidth
          float gridLineX = step(0.95, grid.x) + step(grid.x, 0.05);
          float gridLineY = step(0.95, grid.y) + step(grid.y, 0.05);
          float gridLine = max(gridLineX, gridLineY);
          
          // Create neon glow effect
          float neonIntensity = gridLine;
          
          // Animate colors along the grid
          float colorMix = sin(time * 1.5 + vUv.y * 8.0) * 0.5 + 0.5;
          vec3 neonColor = mix(neonColor1, neonColor2, colorMix);
          
          // Add pulsing effect
          float pulse = sin(time * 2.0 + vUv.y * 4.0) * 0.2 + 0.8;
          neonIntensity *= pulse;
          
          // Mix background and neon colors
          vec3 finalColor = mix(backgroundColor, neonColor, neonIntensity * 0.8);
          
          // Set alpha
          float alpha = 0.9;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    console.log('Shader material created successfully');
    return shaderMaterial;
  }, []);
  
  // Animation loop with scroll synchronization
  useFrame((state) => {
    if (meshRef.current && material) {
      // Update time uniform for animations
      material.uniforms.time.value = state.clock.elapsedTime;
      
      // Update scroll offset for terrain movement
      material.uniforms.scrollOffset.value = scrollProgress * 5;
      
      // Move terrain based on scroll (simulating walking forward)
      const terrainOffset = scrollProgress * 10; // Move through 10 units of terrain
      meshRef.current.position.z = terrainOffset - 5; // Center around origin
      
      // Debug log every few frames
      if (Math.floor(state.clock.elapsedTime * 2) % 60 === 0) {
        console.log('Terrain animation - Scroll:', scrollProgress, 'Offset:', terrainOffset);
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI * 0.5, 0, 0]}
      position={[0, -0.3, 0]}
    />
  );
};
