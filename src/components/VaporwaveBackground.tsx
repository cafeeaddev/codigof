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
        // Gradient colors from top to bottom
        vec3 topColor = vec3(0.722, 0.639, 0.851);    // Light purple #B8A3D9
        vec3 midColor = vec3(0.545, 0.435, 0.722);    // Medium purple #8B6FB8
        vec3 bottomColor = vec3(0.353, 0.290, 0.420); // Dark purple #5A4A6B
        
        // Create vertical gradient based on Y coordinate
        float gradientPos = vUv.y;
        
        vec3 finalColor;
        if (gradientPos > 0.5) {
          // Top half: interpolate between top and mid colors
          float t = (gradientPos - 0.5) * 2.0;
          finalColor = mix(midColor, topColor, t);
        } else {
          // Bottom half: interpolate between bottom and mid colors
          float t = gradientPos * 2.0;
          finalColor = mix(bottomColor, midColor, t);
        }
        
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
    <mesh ref={backgroundRef} material={material} geometry={geometry} position={[0, 0, -15]}>
    </mesh>
  );
};