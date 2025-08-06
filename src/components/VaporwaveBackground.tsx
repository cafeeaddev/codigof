import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VaporwaveBackgroundProps {
  scrollProgress: number;
}

export const VaporwaveBackground = ({ scrollProgress }: VaporwaveBackgroundProps) => {
  const backgroundRef = useRef<THREE.Mesh>(null);
  
  // Create gradient background geometry
  const geometry = new THREE.PlaneGeometry(50, 50);
  
  // Create shader material for animated gradient background
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
      
      vec3 hsl2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      void main() {
        vec2 uv = vUv;
        
        // Create animated gradient
        float gradient = uv.y;
        
        // Add some movement
        gradient += sin(time * 0.5 + uv.x * 3.0) * 0.1;
        
        // Dynamic colors based on scroll
        float hue1 = scrollProgress * 0.8; // Cycle through hues
        float hue2 = scrollProgress * 0.8 + 0.3;
        
        vec3 topColor = hsl2rgb(vec3(hue1, 1.0, 0.6));
        vec3 bottomColor = hsl2rgb(vec3(hue2, 0.8, 0.1));
        
        // Mix colors based on gradient
        vec3 color = mix(bottomColor, topColor, gradient);
        
        // Add dynamic intensity
        color *= 1.0 + scrollProgress * 0.5;
        
        gl_FragColor = vec4(color, 1.0);
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
    <mesh ref={backgroundRef} material={material} geometry={geometry} position={[0, 0, -10]}>
    </mesh>
  );
};