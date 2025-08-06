
import * as THREE from 'three';

export const getVaporwaveColor = (progress: number, height: number = 0): THREE.Color => {
  // Bright cyan-based colors for wireframe terrain
  const heightFactor = Math.max(0, Math.min(1, (height + 0.5) / 1.0));
  
  let baseColor: THREE.Color;
  
  if (progress < 0.33) {
    // Bright cyan to electric blue
    const localProgress = progress / 0.33;
    baseColor = new THREE.Color().setHSL(0.5, 1.0, 0.6); // Bright cyan
    const accentColor = new THREE.Color().setHSL(0.55, 1.0, 0.65); // Electric blue
    baseColor.lerp(accentColor, localProgress);
  } else if (progress < 0.66) {
    // Electric blue to teal
    const localProgress = (progress - 0.33) / 0.33;
    baseColor = new THREE.Color().setHSL(0.55, 1.0, 0.65); // Electric blue
    const accentColor = new THREE.Color().setHSL(0.48, 0.9, 0.6); // Bright teal
    baseColor.lerp(accentColor, localProgress);
  } else {
    // Teal to cyan-white
    const localProgress = (progress - 0.66) / 0.34;
    baseColor = new THREE.Color().setHSL(0.48, 0.9, 0.6); // Bright teal
    const accentColor = new THREE.Color().setHSL(0.52, 0.8, 0.7); // Cyan-white
    baseColor.lerp(accentColor, localProgress);
  }
  
  // Apply height factor for brightness variation
  const heightIntensity = 0.8 + (heightFactor * 0.4);
  baseColor.multiplyScalar(heightIntensity);
  
  return baseColor;
};

export const getEmissiveIntensity = (progress: number, height: number = 0): number => {
  const baseIntensity = 0.8 + (progress * 0.6); // Much brighter base intensity
  const heightFactor = Math.max(0, Math.min(1, (height + 0.5) / 1.0));
  return baseIntensity + (heightFactor * 0.4); // Strong emission for wireframe glow
};
