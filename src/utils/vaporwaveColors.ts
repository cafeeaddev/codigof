
import * as THREE from 'three';

export const getVaporwaveColor = (progress: number, height: number = 0): THREE.Color => {
  // Normalizar altura para influenciar a cor (-0.3 a 0.3 -> 0 a 1)
  const heightFactor = Math.max(0, Math.min(1, (height + 0.3) / 0.6));
  
  // Cores mais sutis e elegantes baseadas no progresso do scroll
  let baseColor: THREE.Color;
  let accentColor: THREE.Color;
  
  if (progress < 0.33) {
    // Início: Rosa suave → Azul acinzentado
    const localProgress = progress / 0.33;
    baseColor = new THREE.Color().setHSL(0.9, 0.4, 0.4); // Rosa suave
    accentColor = new THREE.Color().setHSL(0.6, 0.5, 0.45); // Azul acinzentado
    baseColor.lerp(accentColor, localProgress);
  } else if (progress < 0.66) {
    // Meio: Roxo acinzentado → Rosa pálido
    const localProgress = (progress - 0.33) / 0.33;
    baseColor = new THREE.Color().setHSL(0.75, 0.3, 0.35); // Roxo acinzentado
    accentColor = new THREE.Color().setHSL(0.95, 0.4, 0.5); // Rosa pálido
    baseColor.lerp(accentColor, localProgress);
  } else {
    // Final: Coral suave → Lavanda
    const localProgress = (progress - 0.66) / 0.34;
    baseColor = new THREE.Color().setHSL(0.05, 0.4, 0.5); // Coral suave
    accentColor = new THREE.Color().setHSL(0.78, 0.3, 0.6); // Lavanda
    baseColor.lerp(accentColor, localProgress);
  }
  
  // Aplicar fator de altura de forma mais sutil
  const heightIntensity = 0.7 + (heightFactor * 0.3);
  baseColor.multiplyScalar(heightIntensity);
  
  return baseColor;
};

export const getEmissiveIntensity = (progress: number, height: number = 0): number => {
  const baseIntensity = 0.05 + (progress * 0.1); // Muito mais sutil
  const heightFactor = Math.max(0, Math.min(1, (height + 0.3) / 0.6));
  return baseIntensity + (heightFactor * 0.05); // Emissão bem reduzida
};
