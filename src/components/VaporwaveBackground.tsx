import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const VaporwaveBackground = () => {
  const backgroundRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  
  // Create gradient background geometry - much larger to cover the entire view
  const geometry = new THREE.PlaneGeometry(200, 200);
  
  // Geometria para o sol vaporwave
  const sunGeometry = new THREE.SphereGeometry(12, 32, 16);
  
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
        // Vaporwave sky gradient exatamente como na referência
        vec3 topColor = vec3(0.02, 0.02, 0.08);      // Roxo bem escuro no topo
        vec3 midColor = vec3(0.4, 0.1, 0.6);         // Roxo médio
        vec3 horizonColor = vec3(0.9, 0.3, 0.8);     // Rosa/magenta vibrante
        vec3 bottomColor = vec3(0.2, 0.1, 0.4);      // Roxo escuro embaixo
        
        // Create smooth vertical gradient matching the reference
        float y = vUv.y;
        vec3 finalColor;
        
        if (y > 0.75) {
          // Zona superior: roxo escuro
          float t = (y - 0.75) / 0.25;
          finalColor = mix(midColor, topColor, t);
        } else if (y > 0.5) {
          // Zona média: transição para rosa
          float t = (y - 0.5) / 0.25;
          finalColor = mix(horizonColor, midColor, t);
        } else {
          // Zona do horizonte: rosa vibrante
          finalColor = horizonColor;
        }
        
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
        
        // Gradiente do sol exatamente como na referência
        vec3 centerColor = vec3(1.0, 1.0, 0.8);     // Amarelo claro no centro
        vec3 midColor = vec3(1.0, 0.6, 0.1);        // Laranja médio
        vec3 outerColor = vec3(1.0, 0.2, 0.4);      // Rosa/vermelho nas bordas
        
        // Gradiente radial suave
        vec3 finalColor;
        if (dist < 0.2) {
          finalColor = centerColor;
        } else if (dist < 0.35) {
          float t = (dist - 0.2) / 0.15;
          finalColor = mix(centerColor, midColor, t);
        } else {
          float t = (dist - 0.35) / 0.15;
          finalColor = mix(midColor, outerColor, smoothstep(0.0, 1.0, t));
        }
        
        // Adicionar transparência nas bordas
        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        
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
      {/* Céu com gradiente vaporwave - matching the reference */}
      <mesh ref={backgroundRef} material={material} geometry={geometry} position={[0, 20, -15]} scale={[1, 1, 1]} />
      
      {/* Sol vaporwave - posicionado como na referência */}
      <mesh 
        ref={sunRef} 
        material={sunMaterial} 
        geometry={sunGeometry} 
        position={[0, 20, -12]}
        scale={[1, 1, 1]}
      />
    </>
  );
};