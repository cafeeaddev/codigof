import { useEffect, useRef } from 'react';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const GalaxyBackground = () => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((obj) => {
      const anyObj = obj as any;
      if (anyObj?.isPoints && anyObj.material) {
        const mat = anyObj.material as THREE.PointsMaterial;
        mat.depthTest = false; // ensure always visible
        mat.depthWrite = false;
        mat.transparent = true;
        mat.opacity = 0.85;
        mat.blending = THREE.AdditiveBlending;
        mat.needsUpdate = true;
      }
    });
  }, []);

  return (
    <group ref={groupRef} renderOrder={0}>
      <Stars
        radius={300}      // inner radius of the sphere
        depth={80}        // star field depth
        count={9000}      // number of stars
        factor={2}        // size factor
        saturation={0}    // white stars
        fade              // fade at distance
        speed={0}         // static background
      />
    </group>
  );
};
