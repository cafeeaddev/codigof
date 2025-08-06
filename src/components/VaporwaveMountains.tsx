
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { NoiseGenerator } from '../utils/noiseUtils';

export const VaporwaveMountains = () => {
  const leftMountainRef = useRef<THREE.Mesh>(null);
  const rightMountainRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  const noise = useMemo(() => new NoiseGenerator(42), []);
  
  console.log('VaporwaveMountains: Criando montanhas, scroll progress:', scrollProgress);
  
  // Criar geometria de montanha com elevações maiores
  const { geometry, material } = useMemo(() => {
    console.log('Criando geometria das montanhas vaporwave...');
    
    const segments = { width: 64, height: 128 };
    const size = { width: 25, height: 60 };
    
    const geo = new THREE.PlaneGeometry(size.width, size.height, segments.width, segments.height);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Gerar alturas das montanhas com noise
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // Z é Y na geometria do plano antes da rotação
      
      // Falloff baseado na distância para perspectiva
      const distance = Math.sqrt(x * x + z * z);
      const falloff = Math.max(0.2, 1 - distance / (size.width * 0.8));
      
      // Combinar múltiplas camadas de noise para montanhas realistas
      const baseHeight = noise.fractalNoise(x, z, 4, 0.08, 2) * falloff;
      const ridges = noise.ridgeNoise(x, z, 3) * 1.2 * falloff;
      const details = noise.noise(x * 0.15, z * 0.15) * 0.4 * falloff;
      
      const finalHeight = (baseHeight + ridges + details) * 5; // Montanhas mais altas
      positions[i + 2] = Math.max(0, finalHeight);
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    console.log('Geometria da montanha criada com', positions.length / 3, 'vértices');
    
    // Material shader vaporwave
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        gridScale: { value: 2.0 },
        neonPink: { value: new THREE.Color('#ff00ff') },
        neonCyan: { value: new THREE.Color('#00ffff') },
        neonPurple: { value: new THREE.Color('#8000ff') }
      },
      vertexShader: `
        uniform float time;
        uniform float scrollOffset;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vUv = uv;
          
          vec3 pos = position;
          
          // Movimento baseado no scroll com paralaxe
          pos.z += scrollOffset * 25.0;
          
          // Animação sutil
          pos.z += sin(time * 0.3 + position.x * 0.1) * 0.08;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float scrollOffset;
        uniform float gridScale;
        uniform vec3 neonPink;
        uniform vec3 neonCyan;
        uniform vec3 neonPurple;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          // Gradiente de cor baseado na altura
          float height = vPosition.z;
          float normalizedHeight = clamp(height / 5.0, 0.0, 1.0);
          
          // Gradiente de cores vaporwave
          vec3 lowColor = neonPurple * 0.4;
          vec3 midColor = neonPink * 0.8;
          vec3 highColor = neonCyan;
          
          vec3 color;
          if (normalizedHeight < 0.5) {
            color = mix(lowColor, midColor, normalizedHeight * 2.0);
          } else {
            color = mix(midColor, highColor, (normalizedHeight - 0.5) * 2.0);
          }
          
          // Efeito de grid
          vec2 grid = abs(fract(vUv * gridScale * 8.0) - 0.5);
          float gridLine = 1.0 - smoothstep(0.0, 0.06, min(grid.x, grid.y));
          
          // Grid nas bordas
          float edgeGrid = max(gridLine, 0.0) * 0.7;
          color += edgeGrid * neonCyan * 0.6;
          
          // Brilho baseado na altura
          float glow = pow(normalizedHeight, 2.0) * 0.4;
          color += glow * neonPink;
          
          // Fade com distância para profundidade
          float distanceFade = 1.0 - clamp(distance(vPosition.xy, vec2(0.0)) / 12.0, 0.0, 0.8);
          color *= distanceFade;
          
          // Brilho extra nos picos
          if (normalizedHeight > 0.8) {
            color += (normalizedHeight - 0.8) * 5.0 * vec3(1.0, 1.0, 0.8) * 0.3;
          }
          
          gl_FragColor = vec4(color, 0.92);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    console.log('Material shader vaporwave criado');
    
    return { geometry: geo, material: shaderMaterial };
  }, [noise]);
  
  // Animação e movimento baseado no scroll
  useFrame((state) => {
    if (leftMountainRef.current && rightMountainRef.current && material instanceof THREE.ShaderMaterial) {
      // Atualizar uniforms do shader
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.scrollOffset.value = scrollProgress;
      
      // Mover montanhas baseado no scroll com efeito parallax
      const scrollMovement = scrollProgress * 25;
      leftMountainRef.current.position.z = scrollMovement - 8;
      rightMountainRef.current.position.z = scrollMovement - 8;
      
      // Debug a cada 3 segundos
      if (Math.floor(state.clock.elapsedTime) % 3 === 0 && state.clock.elapsedTime % 1 < 0.016) {
        console.log('Montanhas - Tempo:', state.clock.elapsedTime.toFixed(1), 
                   'Scroll:', scrollProgress.toFixed(2), 'Posição Z:', scrollMovement.toFixed(2));
      }
    }
  });
  
  console.log('VaporwaveMountains: Renderizando montanhas nas laterais');
  
  return (
    <group>
      {/* Montanha esquerda */}
      <mesh
        ref={leftMountainRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[-15, -1, -8]}
        scale={[0.8, 1, 1]}
      />
      
      {/* Montanha direita */}
      <mesh
        ref={rightMountainRef}
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[15, -1, -8]}
        scale={[0.8, 1, 1]}
      />
      
      {/* Camada adicional de montanhas mais distantes */}
      <mesh
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[-25, -2, -15]}
        scale={[1.2, 1, 0.6]}
      />
      
      <mesh
        geometry={geometry}
        material={material}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[25, -2, -15]}
        scale={[1.2, 1, 0.6]}
      />
    </group>
  );
};
