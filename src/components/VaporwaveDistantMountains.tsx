
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollTerrain } from '../hooks/useScrollTerrain';
import { NoiseGenerator } from '../utils/noiseUtils';

export const VaporwaveDistantMountains = () => {
  const leftMountainsRef = useRef<THREE.Mesh>(null);
  const rightMountainsRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollTerrain();
  const noise = useMemo(() => new NoiseGenerator(888), []);
  
  // Create distant mountain silhouettes
  const mountainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 15, 50, 20);
    const positions = geo.getAttribute('position').array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Create mountain silhouette
      const height = noise.fractalNoise(x * 0.1, z * 0.1, 3, 0.1, 2) * 5;
      positions[i + 2] = Math.max(0, height);
    }
    
    geo.getAttribute('position').needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [noise]);
  
  const mountainMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        scrollOffset: { value: 0 },
        neonPink: { value: new THREE.Color('#ff007f') },
        darkPurple: { value: new THREE.Color('#2d1b69') }
      },
      vertexShader: `
        uniform float scrollOffset;
        varying vec3 vPosition;
        varying float vHeight;
        
        void main() {
          vPosition = position;
          vHeight = position.z;
          
          vec3 pos = position;
          pos.z += scrollOffset * 10.0; // Parallax - slower than road
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 neonPink;
        uniform vec3 darkPurple;
        varying float vHeight;
        
        void main() {
          float heightGradient = clamp(vHeight / 5.0, 0.0, 1.0);
          vec3 color = mix(darkPurple, neonPink * 0.6, heightGradient);
          
          gl_FragColor = vec4(color, 0.7);
        }
      `,
      transparent: true,
      side: THREE.FrontSide
    });
  }, []);
  
  useFrame(() => {
    if (leftMountainsRef.current && mountainMaterial instanceof THREE.ShaderMaterial) {
      mountainMaterial.uniforms.scrollOffset.value = scrollProgress;
    }
  });
  
  return (
    <group>
      {/* Left distant mountains */}
      <mesh
        ref={leftMountainsRef}
        geometry={mountainGeometry}
        material={mountainMaterial}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[-25, 2, -30]}
      />
      
      {/* Right distant mountains */}
      <mesh
        ref={rightMountainsRef}
        geometry={mountainGeometry}
        material={mountainMaterial}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[25, 2, -30]}
      />
    </group>
  );
};
