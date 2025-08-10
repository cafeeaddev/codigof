import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MeteorsProps {
  count?: number; // max concurrent meteors
  spawnRate?: number; // meteors per second
  area?: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  speedRange?: [number, number]; // units/sec
  lengthRange?: [number, number]; // mesh length in world units
  thickness?: number; // mesh height
}

export const Meteors = ({
  count = 80,
  spawnRate = 0.8,
  area = { x: [-160, 160], y: [20, 100], z: [-220, -120] },
  speedRange = [40, 90],
  lengthRange = [3, 9],
  thickness = 0.12,
}: MeteorsProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Gradient trail texture (bright head, soft tail)
  const trailTexture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, c.width, 0);
    grad.addColorStop(0.0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.8, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1.0, 'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Geometry/material reused by instances
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, thickness), [thickness]);
  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      map: trailTexture,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
      color: new THREE.Color(1, 1, 1),
    });
    return m;
  }, [trailTexture]);

  // Per-instance state
  const positions = useMemo(() => Array.from({ length: count }, () => new THREE.Vector3()), [count]);
  const velocities = useMemo(() => Array.from({ length: count }, () => new THREE.Vector3()), [count]);
  const lengths = useMemo(() => new Float32Array(count).fill(0), [count]);
  const lifetimes = useMemo(() => new Float32Array(count).fill(0), [count]);
  const alive = useMemo(() => new Array<boolean>(count).fill(false), [count]);

  // Helpers for transforms
  const xAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpMat = useMemo(() => new THREE.Matrix4(), []);
  const tmpScale = useMemo(() => new THREE.Vector3(), []);

  // Spawn a meteor into the first free slot
  const spawnMeteor = () => {
    const idx = alive.indexOf(false);
    if (idx === -1) return; // pool full

    // Spawn region
    const x = THREE.MathUtils.randFloat(area.x[0], area.x[1]);
    const y = THREE.MathUtils.randFloat(area.y[0], area.y[1]);
    const z = THREE.MathUtils.randFloat(area.z[0], area.z[1]);
    positions[idx].set(x, y, z);

    // Direction: mostly diagonal across the sky and slightly downward
    const dir = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(1.6), // -0.8 .. 0.8
      -THREE.MathUtils.randFloat(0.4, 0.9), // downward
      THREE.MathUtils.randFloatSpread(0.3)
    ).normalize();

    const speed = THREE.MathUtils.randFloat(speedRange[0], speedRange[1]);
    velocities[idx].copy(dir.multiplyScalar(speed));

    lengths[idx] = THREE.MathUtils.randFloat(lengthRange[0], lengthRange[1]);
    lifetimes[idx] = THREE.MathUtils.randFloat(1.6, 3.2); // seconds
    alive[idx] = true;
  };

  // Drive updates
  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Spawn probabilistically (poisson)
    const expected = spawnRate * dt;
    if (Math.random() < expected) spawnMeteor();
    if (Math.random() < expected * 0.2) spawnMeteor(); // occasional double spawn for bursts

    for (let i = 0; i < count; i++) {
      if (!alive[i]) {
        // Hide inactive instance by scaling to nearly zero
        tmpScale.setScalar(0.0001);
        tmpMat.compose(positions[i], tmpQuat.identity(), tmpScale);
        mesh.setMatrixAt(i, tmpMat);
        continue;
      }

      // Integrate motion
      positions[i].addScaledVector(velocities[i], dt);
      lifetimes[i] -= dt;

      // Recycle if lifetime ended or out of bounds
      const p = positions[i];
      if (
        lifetimes[i] <= 0 ||
        p.x < area.x[0] - 40 || p.x > area.x[1] + 40 ||
        p.y < -5 || p.y > area.y[1] + 40 ||
        p.z < area.z[0] - 40 || p.z > area.z[1] + 40
      ) {
        alive[i] = false;
        // Hide
        tmpScale.setScalar(0.0001);
        tmpMat.compose(positions[i], tmpQuat.identity(), tmpScale);
        mesh.setMatrixAt(i, tmpMat);
        continue;
      }

      // Orient X axis to velocity
      const vNorm = tmpScale.copy(velocities[i]).normalize();
      tmpQuat.setFromUnitVectors(xAxis, vNorm);

      // Scale: length along X, constant thickness along Y
      tmpScale.set(lengths[i], thickness, 1);

      // Compose transform
      tmpMat.compose(positions[i], tmpQuat, tmpScale);
      mesh.setMatrixAt(i, tmpMat);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false}>
      {/* Geometry/material provided via args; nothing nested here */}
    </instancedMesh>
  );
};
