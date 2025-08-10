import { useMemo } from 'react';
import * as THREE from 'three';

interface SkyGradientProps {
  topColor?: string; // hex or CSS color
  bottomColor?: string;
  exponent?: number; // curve of the gradient
  radius?: number;
}

export const SkyGradient = ({
  topColor = '#0b1023',
  bottomColor = '#000000',
  exponent = 1.5,
  radius = 500,
}: SkyGradientProps) => {
  // Memoize uniforms so they aren't recreated on every render
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color(topColor) },
      bottomColor: { value: new THREE.Color(bottomColor) },
      exponent: { value: exponent },
    }), [topColor, bottomColor, exponent]
  );

  const vertexShader = /* glsl */`
    varying float vY;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      // Normalize and map Y from [-1,1] to [0,1]
      vY = normalize(worldPosition.xyz).y * 0.5 + 0.5;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragmentShader = /* glsl */`
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float exponent;
    varying float vY;
    void main() {
      float t = pow(smoothstep(0.0, 1.0, vY), exponent);
      vec3 col = mix(bottomColor, topColor, t);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms as any}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};
