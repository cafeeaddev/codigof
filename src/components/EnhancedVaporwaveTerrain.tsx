import { useRef, useMemo, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, ShaderMaterial } from 'three';
import * as THREE from 'three';
import gridTexture from '../assets/vaporwave-grid.jpg';

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

interface EnhancedVaporwaveTerrainProps {
  theme: Theme;
  wireframe?: boolean;
}

// Custom vertex shader for enhanced displacement
const vertexShader = `
  uniform float uTime;
  uniform float uDisplacementStrength;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vElevation;

  void main() {
    vUv = uv;
    vPosition = position;
    
    // Enhanced displacement with multiple wave patterns
    float displacement = sin(position.x * 10.0 + uTime * 0.5) * 0.02;
    displacement += sin(position.y * 8.0 + uTime * 0.3) * 0.015;
    displacement += sin(position.x * 15.0 + position.y * 12.0 + uTime * 0.8) * 0.01;
    
    // Create valley effect from center
    float distanceFromCenter = abs(position.x);
    float valley = pow(distanceFromCenter * 1.8, 1.5) * 0.25;
    
    vec3 newPosition = position;
    newPosition.z = valley + displacement * uDisplacementStrength;
    
    vElevation = newPosition.z;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Custom fragment shader with enhanced glow and wireframe
const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform sampler2D uTexture;
  uniform bool uWireframe;
  uniform float uWireframeThickness;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vElevation;

  void main() {
    vec2 uv = vUv;
    
    // Animated UV for flowing effect
    uv.y += uTime * 0.1;
    
    vec4 textureColor = texture2D(uTexture, uv);
    
    if (uWireframe) {
      // Create wireframe effect
      vec2 grid = abs(fract(vUv * 32.0) - 0.5) / fwidth(vUv * 32.0);
      float line = min(grid.x, grid.y);
      float wireframe = 1.0 - min(line, 1.0);
      
      // Enhanced glow effect
      float glow = pow(vElevation + 0.1, 2.0) * 2.0;
      vec3 glowColor = uColor * glow;
      
      gl_FragColor = vec4(mix(uEmissive, glowColor, wireframe), 1.0);
    } else {
      // Standard material with enhanced emissive
      vec3 finalColor = textureColor.rgb * uColor;
      finalColor += uEmissive * (vElevation * 2.0 + 0.3);
      
      gl_FragColor = vec4(finalColor, 0.9);
    }
  }
`;

export const EnhancedVaporwaveTerrain = ({ theme, wireframe = false }: EnhancedVaporwaveTerrainProps) => {
  const mesh1Ref = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  const mesh3Ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  
  // Load the grid texture
  const texture = useLoader(TextureLoader, gridTexture);
  
  // Configure texture properties
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 10);
  }, [texture]);
  
  // Create enhanced terrain geometry with LOD
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(4, 8, 128, 128);
    const positionAttribute = geo.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Enhanced terrain generation
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      
      // Distance-based elevation
      const distanceFromCenter = Math.abs(x);
      const baseHeight = 0.05;
      const sideHeight = Math.pow(distanceFromCenter * 1.8, 1.5) * 0.3;
      positions[i + 2] = baseHeight + sideHeight;
      
      // Multi-layered noise
      const noise1 = Math.sin(x * 12) * Math.cos(z * 10) * 0.02;
      const noise2 = Math.sin(x * 25) * Math.cos(z * 20) * 0.01;
      const noise3 = Math.sin(x * 40 + z * 30) * 0.005;
      
      positions[i + 2] += noise1 + noise2 + noise3;
    }
    
    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    
    return geo;
  }, []);
  
  // Custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(theme.colors.primary) },
        uEmissive: { value: new THREE.Color(theme.colors.emissive) },
        uTexture: { value: texture },
        uWireframe: { value: wireframe },
        uDisplacementStrength: { value: 1.0 },
        uWireframeThickness: { value: 0.02 }
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [theme, texture, wireframe]);
  
  // Animation loop
  useFrame((state) => {
    const speed = 0.4;
    const terrainLength = 8;
    const totalLength = terrainLength * 3;
    
    const baseOffset = (state.clock.elapsedTime * speed) % totalLength;
    
    // Update terrain positions
    if (mesh1Ref.current) {
      mesh1Ref.current.position.z = baseOffset - terrainLength;
    }
    if (mesh2Ref.current) {
      mesh2Ref.current.position.z = baseOffset;
    }
    if (mesh3Ref.current) {
      mesh3Ref.current.position.z = baseOffset + terrainLength;
    }
    
    // Update shader uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uColor.value.set(theme.colors.primary);
      materialRef.current.uniforms.uEmissive.value.set(theme.colors.emissive);
      materialRef.current.uniforms.uWireframe.value = wireframe;
    }
    
    // Animate texture
    if (texture) {
      texture.offset.y = (state.clock.elapsedTime * 0.15) % 1;
    }
  });
  
  return (
    <group>
      <mesh
        ref={mesh1Ref}
        geometry={geometry}
        material={shaderMaterial}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, 0.15]}
      />
      <mesh
        ref={mesh2Ref}
        geometry={geometry}
        material={shaderMaterial}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, 0.15]}
      />
      <mesh
        ref={mesh3Ref}
        geometry={geometry}
        material={shaderMaterial}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, 0, 0.15]}
      />
      <primitive object={shaderMaterial} ref={materialRef} />
    </group>
  );
};