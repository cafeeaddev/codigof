import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const VaporwaveBackground = () => {
  const backgroundRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  
  // Create gradient background geometry - much larger to cover the entire view
  const geometry = new THREE.PlaneGeometry(200, 200);
  
  // Geometria para o sol vaporwave
  const sunGeometry = new THREE.SphereGeometry(8, 32, 16);
  
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
        // Vaporwave sky gradient - mais dramático
        vec3 topColor = vec3(0.05, 0.02, 0.15);      // Roxo bem escuro no topo
        vec3 horizonColor = vec3(0.9, 0.2, 0.8);     // Rosa/magenta vibrante
        vec3 bottomColor = vec3(1.0, 0.7, 0.1);      // Laranja/amarelo vibrante
        vec3 midColor = vec3(0.6, 0.1, 0.6);         // Roxo médio
        
        // Create dramatic vertical gradient with multiple zones
        float y = vUv.y;
        vec3 finalColor;
        
        if (y > 0.8) {
          // Zona superior: roxo escuro
          float t = (y - 0.8) / 0.2;
          finalColor = mix(midColor, topColor, t);
        } else if (y > 0.6) {
          // Zona média superior: transição para rosa
          float t = (y - 0.6) / 0.2;
          finalColor = mix(horizonColor, midColor, t);
        } else if (y > 0.4) {
          // Zona do horizonte: rosa/magenta vibrante
          finalColor = horizonColor;
        } else {
          // Zona inferior: transição para laranja
          float t = y / 0.4;
          finalColor = mix(bottomColor, horizonColor, t);
        }
        
        // Adicionar um pouco de brilho dinâmico
        finalColor += sin(time * 0.5) * 0.05;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.BackSide
  });
  
  // Material para o sol vaporwave
  const sunMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
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
      varying vec2 vUv;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        
        // Gradiente radial para o sol
        vec3 sunColor = vec3(1.0, 0.8, 0.1);
        vec3 sunGlow = vec3(1.0, 0.4, 0.6);
        
        // Efeito pulsante
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        
        // Gradiente do centro para fora
        float intensity = 1.0 - smoothstep(0.0, 0.5, dist);
        vec3 finalColor = mix(sunGlow, sunColor, intensity) * pulse;
        
        // Adicionar transparência nas bordas
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  
  useFrame((state) => {
    if (backgroundRef.current) {
      material.uniforms.time.value = state.clock.elapsedTime;
    }
    if (sunRef.current) {
      sunMaterial.uniforms.time.value = state.clock.elapsedTime;
      // Movimento sutil do sol
      sunRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <>
      {/* Céu com gradiente vaporwave - posicionado mais próximo */}
      <mesh ref={backgroundRef} material={material} geometry={geometry} position={[0, 20, -15]} scale={[1, 1, 1]} />
      
      {/* Sol vaporwave - mais visível */}
      <mesh 
        ref={sunRef} 
        material={sunMaterial} 
        geometry={sunGeometry} 
        position={[-20, 25, -10]}
        scale={[1.5, 1.5, 1.5]}
      />
      
      {/* Linhas horizontais do grid no céu - mais próximas */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, 20 - (i * 3), -12]} rotation={[0, 0, 0]}>
          <planeGeometry args={[200, 0.2]} />
          <meshBasicMaterial 
            color="#FF1493" 
            transparent={true} 
            opacity={0.4 - (i * 0.02)}
          />
        </mesh>
      ))}
    </>
  );
};