import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const VaporwaveBackground = () => {
  const backgroundRef = useRef<THREE.Mesh>(null);
  
  // Create gradient background geometry - much larger to cover the entire view
  const geometry = new THREE.PlaneGeometry(100, 100);
  
  // Create shader material for animated gradient background
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;
      
      // P3 color space conversion matrix
      const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
        vec3(0.8224621, 0.177538, 0.0),
        vec3(0.0331941, 0.9668058, 0.0),
        vec3(0.0170827, 0.0723974, 0.9105199)
      );
      
      void main() {
        // Much darker gradient for dramatic atmosphere
        vec3 topColor = vec3(0.15, 0.1, 0.2);    // Very dark purple
        vec3 bottomColor = vec3(0.05, 0.02, 0.08); // Almost black
        
        // Create smooth vertical gradient
        float gradientPos = vUv.y;
        
        // Add subtle orange glow near bottom for lava effect
        vec3 lavaGlow = vec3(0.1, 0.03, 0.0);
        float lavaIntensity = smoothstep(0.0, 0.3, 1.0 - gradientPos);
        
        // Smooth interpolation between colors with lava glow
        vec3 finalColor = mix(bottomColor, topColor, gradientPos);
        finalColor += lavaGlow * lavaIntensity * 0.5;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.BackSide
  });
  
  useFrame((state) => {
    if (backgroundRef.current) {
      material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={backgroundRef} material={material} geometry={geometry} position={[0, 0, -20]} scale={[1, 1, 1]}>
    </mesh>
  );
};