import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const VaporwaveBackground = () => {
  const backgroundRef = useRef<THREE.Mesh>(null);
  
  // Create gradient background geometry
  const geometry = new THREE.PlaneGeometry(50, 50);
  
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
      
      void main() {
        vec2 uv = vUv;
        
        // Create animated gradient
        float gradient = uv.y;
        
        // Add some movement
        gradient += sin(time * 0.5 + uv.x * 3.0) * 0.1;
        
        // Vaporwave color palette
        vec3 topColor = vec3(1.0, 0.0, 1.0);    // Magenta
        vec3 bottomColor = vec3(0.0, 0.0, 0.2); // Dark blue
        
        // Mix colors based on gradient
        vec3 color = mix(bottomColor, topColor, gradient);
        
        // Add some purple tint
        color += vec3(0.2, 0.0, 0.4) * (1.0 - gradient);
        
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
    <mesh ref={backgroundRef} material={material} geometry={geometry} position={[0, 0, -10]}>
    </mesh>
  );
};