export interface SeededRng {
  next(): number;
  nextInt(min: number, max: number): number;
  shuffle<T>(items: readonly T[]): T[];
}

export function createRng(seed: number): SeededRng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };

  const nextInt = (min: number, max: number): number => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
      throw new RangeError("nextInt requires integer bounds with min less than or equal to max");
    }

    return Math.floor(next() * (max - min + 1)) + min;
  };

  const shuffle = <T>(items: readonly T[]): T[] => {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = nextInt(0, index);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result;
  };

  return { next, nextInt, shuffle };
}
