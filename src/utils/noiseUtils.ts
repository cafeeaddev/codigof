
// Simple noise implementation for terrain generation
export class NoiseGenerator {
  private permutation: number[];
  
  constructor(seed: number = 12345) {
    // Initialize permutation table with pseudo-random values based on seed
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    
    // Shuffle using seed
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * (i + 1));
      seed = (seed * 9301 + 49297) % 233280;
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    
    // Extend to avoid index out of bounds
    this.permutation = [...this.permutation, ...this.permutation];
  }
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }
  
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.permutation[X] + Y;
    const AA = this.permutation[A];
    const AB = this.permutation[A + 1];
    const B = this.permutation[X + 1] + Y;
    const BA = this.permutation[B];
    const BB = this.permutation[B + 1];
    
    return this.lerp(
      this.lerp(
        this.grad(this.permutation[AA], x, y),
        this.grad(this.permutation[BA], x - 1, y),
        u
      ),
      this.lerp(
        this.grad(this.permutation[AB], x, y - 1),
        this.grad(this.permutation[BB], x - 1, y - 1),
        u
      ),
      v
    );
  }
  
  // Fractal noise for more complex terrain
  fractalNoise(x: number, y: number, octaves: number = 4, frequency: number = 0.1, amplitude: number = 1): number {
    let value = 0;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return value / maxValue;
  }
  
  // Ridge noise for mountain peaks
  ridgeNoise(x: number, y: number, octaves: number = 3): number {
    return 1 - Math.abs(this.fractalNoise(x, y, octaves, 0.05, 1));
  }
}
