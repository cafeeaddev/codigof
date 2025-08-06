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
        vec2 uv = vUv;
        
        // Create animated gradient
        float gradient = uv.y;
        
        // Add some movement
        gradient += sin(time * 0.5 + uv.x * 3.0) * 0.1;
        
        // Reference-matched vaporwave colors
        vec3 topColor = vec3(0.176, 0.106, 0.412);    // #2D1B69 - Dark purple
        vec3 bottomColor = vec3(0.059, 0.059, 0.137); // #0F0F23 - Dark blue
        
        // Mix colors based on gradient
        vec3 color = mix(bottomColor, topColor, gradient);
        
        // Enhance depth and richness
        color += vec3(0.1, 0.05, 0.3) * (1.0 - gradient);
        
        // Apply P3 conversion for enhanced vibrancy
        color = LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 * color;
        
        gl_FragColor = vec4(color, 1.0);
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
    <mesh ref={backgroundRef} material={material} geometry={geometry} position={[0, 0, -15]}>
    </mesh>
  );
};