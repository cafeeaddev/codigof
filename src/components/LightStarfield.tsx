import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface LightStarfieldProps {
  count?: number;
  radius?: number; // keep within camera far (Canvas far is 300 in VaporwaveScene)
  size?: number;
  twinkle?: boolean;
  color?: string; // hex or css color
}

export const LightStarfield = ({
  count = 3500,
  radius = 260,
  size = 1.2,
  twinkle = true,
  color = '#ffffff',
}: LightStarfieldProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  // Attributes
  const { positions, scales, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute on a sphere (hemisphere also works if desired)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const r = radius;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Vary size and phase
      scales[i] = size * (0.6 + Math.random() * 0.8);
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, scales, phases };
  }, [count, radius, size]);

  // Create shader material
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uTwinkle: { value: twinkle ? 1.0 : 0.0 },
      },
      vertexShader: `
        attribute float aScale;
        attribute float aPhase;
        uniform float uTime;
        uniform float uTwinkle;
        varying float vAlpha;
        void main(){
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aScale * (300.0 / max(1.0, -mvPosition.z));
          float tw = 0.65 + 0.35 * sin(uTime * 0.8 + aPhase);
          vAlpha = mix(1.0, tw, uTwinkle);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main(){
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          if (d > 0.5) discard;
          float edge = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, vAlpha * edge);
        }
      `,
      fog: false,
      toneMapped: false,
    });
    return mat;
  }, [color, twinkle]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = t;
    }
    const g = groupRef.current;
    if (g) {
      // Keep aligned to camera position (parallax-free background)
      g.position.copy(camera.position);
      g.rotation.y += 0.00005; // slow drift
    }
  });

  return (
    <group ref={groupRef} renderOrder={-10} frustumCulled={false}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            itemSize={3}
            count={positions.length / 3}
          />
          <bufferAttribute attach="attributes-aScale" array={scales} itemSize={1} count={scales.length} />
          <bufferAttribute attach="attributes-aPhase" array={phases} itemSize={1} count={phases.length} />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>
    </group>
  );
};
