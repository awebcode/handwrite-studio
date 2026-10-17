/** Small seeded PRNG (mulberry32): same seed -> same handwriting, so edits do not reshuffle everything. */
export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const range = (R, a, b) => a + R() * (b - a);
export const tok = (t, meta) => String(t ?? "").replace(/\{(\w+)\}/g, (x, k) => (meta[k] !== undefined && meta[k] !== "" ? meta[k] : x));
