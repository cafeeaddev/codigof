
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

// New function for dynamic neon colors based on scroll progress
export const getDynamicNeonColor = (scrollProgress: number): string => {
  // Array of vibrant neon colors
  const neonColors = [
    '#2283D2', // Substitui Bright Cyan (#00FFFF)
    '#34C5F0', // Substitui #70FFFF
    '#4739CC', // Substitui #7089FF
    '#9649FF', // Substitui Neon Green (#00FF7F)
    '#D92CFF', // Substitui #FF7BFF
    '#2200BF', // Substitui #FFC6FF
  ];
  
  // Calculate which color segment we're in
  const segmentCount = neonColors.length;
  const segmentSize = 1 / (segmentCount - 1);
  const currentSegment = Math.floor(scrollProgress / segmentSize);
  const localProgress = (scrollProgress % segmentSize) / segmentSize;
  
  // Handle edge cases
  if (currentSegment >= segmentCount - 1) {
    return neonColors[segmentCount - 1];
  }
  
  // Get current and next colors
  const currentColor = neonColors[currentSegment];
  const nextColor = neonColors[currentSegment + 1];
  
  // Convert hex to RGB for interpolation
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 255, b: 255 }; // Default to cyan
  };
  
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };
  
  const currentRgb = hexToRgb(currentColor);
  const nextRgb = hexToRgb(nextColor);
  
  // Interpolate between colors
  const interpolatedR = currentRgb.r + (nextRgb.r - currentRgb.r) * localProgress;
  const interpolatedG = currentRgb.g + (nextRgb.g - currentRgb.g) * localProgress;
  const interpolatedB = currentRgb.b + (nextRgb.b - currentRgb.b) * localProgress;
  
  return rgbToHex(interpolatedR, interpolatedG, interpolatedB);
};
