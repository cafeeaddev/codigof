import { Canvas } from '@react-three/fiber';
import { VaporwaveTerrain } from './VaporwaveTerrain';
import { Suspense, useMemo } from 'react';
import { Html } from '@react-three/drei';

import * as THREE from 'three';
import { LightStarfield } from './LightStarfield';

interface VaporwaveSceneProps {
  cameraPosition: [number, number, number];
  cameraFov: number;
}

export const VaporwaveScene = ({ cameraPosition, cameraFov }: VaporwaveSceneProps) => {
  const webglSupported = useMemo(() => {
    if (typeof window === 'undefined') return true; // SSR-safe default
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      return !!(window.WebGLRenderingContext && gl);
    } catch (e) {
      console.warn('[VaporwaveScene] WebGL check failed:', e);
      return false;
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-[100svh] grid place-content-center bg-background text-foreground">
        <div className="text-center px-6">
          <p className="text-sm opacity-80">Seu navegador não suporta WebGL.</p>
          <p className="text-xs opacity-60">Exibindo visual estático no lugar da cena 3D.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100svh] relative overflow-hidden">
      <Canvas
        dpr={[1, 1]}
        camera={{
          position: cameraPosition,
          fov: cameraFov,
          near: 0.1,
          far: 300,
        }}
        gl={{ alpha: false, depth: true, antialias: false, powerPreference: 'low-power' }}
        className="w-full h-full"
        onCreated={({ scene, gl }) => {
          try {
            gl.setPixelRatio(1);
            gl.setClearColor('#000000', 1);
            scene.fog = new THREE.Fog(0x000000, 80, 200);
            console.info('[VaporwaveScene] Canvas created');
          } catch (e) {
            console.error('[VaporwaveScene] Error during Canvas onCreated:', e);
          }
        }}
      >
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-md border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground shadow-sm backdrop-blur-sm">
                Inicializando cena 3D...
              </div>
            </Html>
          }
        >
          {/* Light starfield background (temporary replacement) */}
          <LightStarfield count={3500} radius={260} size={1.2} twinkle />

          <ambientLight intensity={0.35} color="#ffffff" />

          {/* Main directional light */}
          <directionalLight position={[0, 5, 3]} intensity={0.35} color="#ffffff" />

          {/* Large ground plane to ensure no "glass floor" */}
          <mesh position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2000, 2000]} />
            <meshBasicMaterial color="#2b2b31" transparent={false} side={THREE.DoubleSide} />
          </mesh>

          {/* Main terrain */}
          <VaporwaveTerrain cameraPosition={cameraPosition} />
        </Suspense>
      </Canvas>
    </div>
  );
};
