import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { EffectComposer, RenderPass, UnrealBloomPass, FilmPass } from 'three-stdlib';
import * as THREE from 'three';

// Extend the fiber namespace
extend({ EffectComposer, RenderPass, UnrealBloomPass, FilmPass });

interface PostProcessingProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  theme: {
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export const PostProcessing = ({ scene, camera, renderer, theme }: PostProcessingProps) => {
  const composerRef = useRef<EffectComposer>(null);
  
  const { renderPass, bloomPass, filmPass } = useMemo(() => {
    const renderPass = new RenderPass(scene, camera);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    
    const filmPass = new FilmPass(
      0.35, // noise intensity
      0.025, // scanline intensity
      648, // scanline count
      false // grayscale
    );
    
    return { renderPass, bloomPass, filmPass };
  }, [scene, camera]);
  
  // Update bloom based on theme
  useFrame(() => {
    if (bloomPass) {
      // Adjust bloom intensity based on theme colors
      const primaryColor = new THREE.Color(theme.colors.primary);
      const intensity = (primaryColor.r + primaryColor.g + primaryColor.b) / 3;
      bloomPass.strength = 1.2 + intensity * 0.8;
    }
  });
  
  return (
    <effectComposer ref={composerRef} args={[renderer]}>
      <primitive object={renderPass} />
      <primitive object={bloomPass} />
      <primitive object={filmPass} />
    </effectComposer>
  );
};