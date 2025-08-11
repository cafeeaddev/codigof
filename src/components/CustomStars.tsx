import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

import * as THREE from 'three';

export const CustomStars = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const baseColorsRef = useRef<Float32Array | null>(null);
  const blinkSpeedsRef = useRef<Float32Array | null>(null);
  
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
    const starCount = 1500;
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

  // Initialize base colors and blinking speeds
  useEffect(() => {
    if (!baseColorsRef.current) {
      baseColorsRef.current = colors.slice();
    }
    if (!blinkSpeedsRef.current) {
      const n = blinkPhases.length;
      const speeds = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        speeds[i] = 0.6 + Math.random() * 1.0;
      }
      blinkSpeedsRef.current = speeds;
    }
  }, [colors, blinkPhases]);

  // Animate twinkling by modulating star brightness
  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const colorAttr = points.geometry.getAttribute('color') as THREE.BufferAttribute;
    const arr = colorAttr.array as Float32Array;
    const base = baseColorsRef.current;
    const speeds = blinkSpeedsRef.current;
    if (!base || !speeds) return;

    const t = state.clock.getElapsedTime();
    for (let i = 0, j = 0; i < blinkPhases.length; i++, j += 3) {
      const f = 0.72 + 0.28 * Math.sin(t * speeds[i] + blinkPhases[i]);
      arr[j] = base[j] * f;
      arr[j + 1] = base[j + 1] * f;
      arr[j + 2] = base[j + 2] * f;
    }
    colorAttr.needsUpdate = true;
  });

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
        depthTest={true}
        depthWrite={false}
      />
    </points>
  );
};