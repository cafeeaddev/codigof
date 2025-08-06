
import * as THREE from 'three';

export const getVaporwaveColor = (progress: number, height: number = 0): THREE.Color => {
  // Normalizar altura para influenciar a cor (-0.3 a 0.3 -> 0 a 1)
  const heightFactor = Math.max(0, Math.min(1, (height + 0.3) / 0.6));
  
  // Três esquemas de cores baseados no progresso do scroll
  let baseColor: THREE.Color;
  let accentColor: THREE.Color;
  
  if (progress < 0.33) {
    // Início: Rosa/magenta → Ciano/azul
    const localProgress = progress / 0.33;
    baseColor = new THREE.Color().setHSL(0.83, 1, 0.5); // Magenta
    accentColor = new THREE.Color().setHSL(0.5, 1, 0.5); // Ciano
    baseColor.lerp(accentColor, localProgress);
  } else if (progress < 0.66) {
    // Meio: Roxo profundo → Rosa neon
    const localProgress = (progress - 0.33) / 0.33;
    baseColor = new THREE.Color().setHSL(0.75, 1, 0.3); // Roxo profundo
    accentColor = new THREE.Color().setHSL(0.92, 1, 0.5); // Rosa neon
    baseColor.lerp(accentColor, localProgress);
  } else {
    // Final: Laranja neon → Rosa quente
    const localProgress = (progress - 0.66) / 0.34;
    baseColor = new THREE.Color().setHSL(0.08, 1, 0.5); // Laranja neon
    accentColor = new THREE.Color().setHSL(0.94, 1, 0.58); // Rosa quente
    baseColor.lerp(accentColor, localProgress);
  }
  
  // Aplicar fator de altura para criar variação nas montanhas
  const heightIntensity = 0.5 + (heightFactor * 0.5);
  baseColor.multiplyScalar(heightIntensity);
  
  return baseColor;
};

export const getEmissiveIntensity = (progress: number, height: number = 0): number => {
  const baseIntensity = 0.2 + (progress * 0.3);
  const heightFactor = Math.max(0, Math.min(1, (height + 0.3) / 0.6));
  return baseIntensity + (heightFactor * 0.2);
};
