export interface RngResult {
  seed: number;
  value: number;
}

export function nextSeed(seed: number) {
  return (seed * 1664525 + 1013904223) >>> 0;
}

export function nextFloat(seed: number): RngResult {
  const next = nextSeed(seed);
  return { seed: next, value: next / 4294967296 };
}

export function nextInt(seed: number, maxExclusive: number): RngResult {
  const { seed: next, value } = nextFloat(seed);
  return { seed: next, value: Math.floor(value * maxExclusive) };
}
