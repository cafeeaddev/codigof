import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Large, static galaxy starfield rendered behind everything
export const GalaxyBackground = () => {
  const pointsRef = useRef<THREE.Points>(null);

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

  // Generate stars distributed in a distant spherical shell around origin
  const { positions, colors } = useMemo(() => {
    const count = 9000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Shell parameters: radius ~ 380-500 to sit far behind the scene
    const minR = 380;
    const maxR = 500;

    let i3 = 0;
    for (let i = 0; i < count; i++) {
      // Uniform sampling on a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = minR + Math.random() * (maxR - minR);

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * sinPhi * Math.sin(theta);

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Mostly white with subtle cool tint variations for depth
      const tint = Math.random();
      let rCol = 1.0, gCol = 1.0, bCol = 1.0;
      if (tint < 0.15) {
        gCol = 0.96; bCol = 0.98; // slightly warmer
      } else if (tint > 0.85) {
        gCol = 1.0; bCol = 0.94; // slight blue tint
      }
      colors[i3] = rCol;
      colors[i3 + 1] = gCol;
      colors[i3 + 2] = bCol;

      i3 += 3;
    }

    return { positions, colors };
  }, []);

  return (
    <points ref={pointsRef} renderOrder={0} frustumCulled={false}>
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
        size={1.6}
        sizeAttenuation={false}
        vertexColors={true}
        fog={false}
        transparent={true}
        opacity={0.9}
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
