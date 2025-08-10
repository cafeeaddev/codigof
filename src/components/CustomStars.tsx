import { useRef, useMemo } from 'react';

import * as THREE from 'three';

export const CustomStars = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Helper function to calculate terrain height (matches VaporwaveTerrain)
  const calculateHeightAtPoint = (x: number, z: number) => {
    const wave1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.8;
    const wave2 = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.4;
    const wave3 = Math.sin(x * 1.2) * Math.cos(z * 1.2) * 0.2;
    return wave1 + wave2 + wave3;
  };

  // Create circular star texture
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Create radial gradient for circular star
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Generate star positions with a strong horizon focus
  const { positions, colors, blinkPhases } = useMemo(() => {
    const starCount = 3500;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const blinkPhases = new Float32Array(starCount);

    let index = 0;

    for (let i = 0; i < starCount; i++) {
      // Concentrate stars near the horizon line of the terrain
      const x = (Math.random() - 0.5) * 240; // Wider lateral spread (-120 .. 120)
      const z = -140 + Math.random() * 30;   // Tight horizon band (-140 .. -110)
      const y = 15 + Math.random() * 20;     // Higher above mountains (15 .. 35)

      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;

      // Bright star colors for visibility
      const colorVariation = Math.random();
      if (colorVariation < 0.6) {
        colors[index] = 1.0;     // R
        colors[index + 1] = 1.0; // G
        colors[index + 2] = 1.0; // B
      } else if (colorVariation < 0.8) {
        colors[index] = 1.0;     // R
        colors[index + 1] = 1.0; // G
        colors[index + 2] = 0.8; // B
      } else {
        colors[index] = 0.9;     // R
        colors[index + 1] = 0.95; // G
        colors[index + 2] = 1.0; // B
      }

      blinkPhases[i] = Math.random() * Math.PI * 2;
      index += 3;
    }

    return { positions, colors, blinkPhases };
  }, []);

  // Stars are static; no animation or blinking

  return (
    <points ref={pointsRef} renderOrder={10} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2.4}
        sizeAttenuation={false}
        vertexColors={true}
        fog={false}
        transparent={true}
        opacity={1}
        alphaTest={0.001}
        map={starTexture}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </points>
  );
};