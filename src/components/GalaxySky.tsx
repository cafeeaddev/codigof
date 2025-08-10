import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Large, static galaxy starfield rendered behind everything
export const GalaxySky = () => {
  

  // Create circular star sprite texture (crisp, soft edges)
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

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

  // Helper to generate a hemisphere of stars behind the camera (z < 0, y > 0)
  const generateLayer = (count: number, minR: number, maxR: number) => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const blinkPhases = new Float32Array(count);
    const blinkSpeeds = new Float32Array(count);

    let i3 = 0;
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      let tries = 0;
      do {
        // sample direction uniformly on sphere
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = minR + Math.random() * (maxR - minR);
        const sinPhi = Math.sin(phi);
        x = r * sinPhi * Math.cos(theta);
        y = r * Math.cos(phi);
        z = r * sinPhi * Math.sin(theta);
        tries++;
      } while ((y <= 0 || z >= 0) && tries < 10); // keep above horizon and behind scene

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Mostly white with subtle tint
      const tint = Math.random();
      let rCol = 1.0, gCol = 1.0, bCol = 1.0;
      if (tint < 0.2) { gCol = 0.96; bCol = 0.98; }
      else if (tint > 0.85) { gCol = 1.0; bCol = 0.94; }

      colors[i3] = rCol;
      colors[i3 + 1] = gCol;
      colors[i3 + 2] = bCol;

      blinkPhases[i] = Math.random() * Math.PI * 2;
      blinkSpeeds[i] = 0.6 + Math.random() * 1.0;

      i3 += 3;
    }

    const baseColors = colors.slice();
    return { positions, colors, blinkPhases, blinkSpeeds, baseColors };
  };

  // Keep inside camera far (300) to avoid clipping
  const small = useMemo(() => generateLayer(14000, 140, 260), []);
  const medium = useMemo(() => generateLayer(5000, 150, 240), []);
  const large = useMemo(() => generateLayer(1800, 160, 220), []);
  // Refs to update star colors each frame
  const smallRef = useRef<THREE.Points>(null);
  const mediumRef = useRef<THREE.Points>(null);
  const largeRef = useRef<THREE.Points>(null);

  // Twinkle animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const updateLayer = (ref: any, layer: any) => {
      const pts = ref.current as THREE.Points | null;
      if (!pts) return;
      const colorAttr = pts.geometry.getAttribute('color') as THREE.BufferAttribute;
      const arr = colorAttr.array as Float32Array;
      const base = layer.baseColors as Float32Array;
      const phases = layer.blinkPhases as Float32Array;
      const speeds = layer.blinkSpeeds as Float32Array;
      for (let i = 0, j = 0; i < phases.length; i++, j += 3) {
        const f = 0.72 + 0.28 * Math.sin(t * speeds[i] + phases[i]);
        arr[j] = base[j] * f;
        arr[j + 1] = base[j + 1] * f;
        arr[j + 2] = base[j + 2] * f;
      }
      colorAttr.needsUpdate = true;
    };
    updateLayer(smallRef, small);
    updateLayer(mediumRef, medium);
    updateLayer(largeRef, large);
  });

  return (
    <>
      {/* Small star layer - wide and faint */}
      <points ref={smallRef} renderOrder={0} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={small.positions.length / 3}
            array={small.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={small.colors.length / 3}
            array={small.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.1}
          sizeAttenuation={false}
          vertexColors={true}
          fog={false}
          transparent={true}
          opacity={0.7}
          alphaTest={0.001}
          map={starTexture}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
           depthTest={true}
          depthWrite={false}
        />
      </points>

      {/* Medium star layer */}
      <points ref={mediumRef} renderOrder={1} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={medium.positions.length / 3}
            array={medium.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={medium.colors.length / 3}
            array={medium.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.8}
          sizeAttenuation={false}
          vertexColors={true}
          fog={false}
          transparent={true}
          opacity={0.85}
          alphaTest={0.001}
          map={starTexture}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
           depthTest={true}
          depthWrite={false}
        />
      </points>

      {/* Large, bright stars */}
      <points ref={largeRef} renderOrder={2} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={large.positions.length / 3}
            array={large.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={large.colors.length / 3}
            array={large.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2.6}
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
    </>
  );
};
