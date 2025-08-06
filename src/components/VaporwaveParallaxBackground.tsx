import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const VaporwaveParallaxBackground = () => {
  const backgroundRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollProgress();
  
  // Create animated gradient background
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      scrollProgress: { value: 0 },
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
      uniform float scrollProgress;
      uniform vec2 resolution;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        
        // Base gradient from dark to vaporwave colors
        float gradient = uv.y;
        
        // Add scrolling influence
        gradient += scrollProgress * 0.3;
        
        // Add subtle movement
        gradient += sin(time * 0.3 + uv.x * 2.0) * 0.05;
        gradient += cos(time * 0.2 + uv.y * 3.0) * 0.03;
        
        // Vaporwave color palette - dark space to neon
        vec3 color1 = vec3(0.02, 0.02, 0.1);  // Very dark blue
        vec3 color2 = vec3(0.1, 0.05, 0.2);   // Dark purple
        vec3 color3 = vec3(0.3, 0.1, 0.4);    // Purple
        vec3 color4 = vec3(0.6, 0.2, 0.8);    // Bright purple
        vec3 color5 = vec3(1.0, 0.4, 0.8);    // Pink/magenta
        
        vec3 finalColor;
        
        if (gradient < 0.25) {
          finalColor = mix(color1, color2, gradient * 4.0);
        } else if (gradient < 0.5) {
          finalColor = mix(color2, color3, (gradient - 0.25) * 4.0);
        } else if (gradient < 0.75) {
          finalColor = mix(color3, color4, (gradient - 0.5) * 4.0);
        } else {
          finalColor = mix(color4, color5, (gradient - 0.75) * 4.0);
        }
        
        // Add some atmospheric glow
        float glow = 1.0 - abs(uv.y - 0.7);
        glow = pow(glow, 3.0) * 0.3;
        finalColor += glow * vec3(0.9, 0.4, 1.0);
        
        // Add stars effect
        float stars = fract(sin(dot(uv * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
        if (stars > 0.998) {
          finalColor += vec3(0.8, 0.8, 1.0) * (1.0 - gradient);
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.BackSide
  });
  
  useFrame((state) => {
    if (backgroundRef.current) {
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.scrollProgress.value = scrollProgress;
    }
  });
  
  return (
    <mesh 
      ref={backgroundRef} 
      material={material} 
      position={[0, 0, -25]}
    >
      <sphereGeometry args={[50, 32, 32]} />
    </mesh>
  );
};