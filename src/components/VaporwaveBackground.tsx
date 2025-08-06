import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    emissive: string;
    background: string[];
    light: string;
  };
}

interface VaporwaveBackgroundProps {
  theme: Theme;
}

export const VaporwaveBackground = ({ theme }: VaporwaveBackgroundProps) => {
  const backgroundRef = useRef<THREE.Mesh>(null);
  
  // Create gradient background geometry
  const geometry = new THREE.PlaneGeometry(50, 50);
  
  // Create shader material for animated gradient background
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      topColor: { value: new THREE.Color(theme.colors.primary) },
      bottomColor: { value: new THREE.Color(theme.colors.background[1]) }
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
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        
        // Create animated gradient
        float gradient = uv.y;
        
        // Add some movement
        gradient += sin(time * 0.5 + uv.x * 3.0) * 0.1;
        
        // Mix colors based on gradient using theme colors
        vec3 color = mix(bottomColor, topColor, gradient);
        
        // Add some dynamic tint based on theme
        color += topColor * 0.2 * (1.0 - gradient);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide
  }), [theme]);
  
  // Update theme colors
  useMemo(() => {
    material.uniforms.topColor.value.set(theme.colors.primary);
    material.uniforms.bottomColor.value.set(theme.colors.background[1]);
  }, [theme, material]);
  
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