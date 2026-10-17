// Pen wobble: displaces pixels with smooth 2-octave value noise (the DOM filter cannot be captured, so we do it on the canvas).
function lattice(n, R) { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = R() * 2 - 1; return a; }
function noise(a, gw, x, y) {
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), i = y0 * gw + x0;
  return a[i] * (1 - sx) * (1 - sy) + a[i + 1] * sx * (1 - sy) + a[i + gw] * (1 - sx) * sy + a[i + gw + 1] * sx * sy;
}

/** amp in output pixels, freq in noise cycles per output pixel. Returns the same canvas. */
export function wobble(canvas, amp, freq, R) {
  if (amp < 0.25) return canvas;
  const w = canvas.width, h = canvas.height, ctx = canvas.getContext("2d");
  const src = ctx.getImageData(0, 0, w, h), dst = ctx.createImageData(w, h), s = src.data, d = dst.data;
  const cell = Math.max(6, 1 / freq), gw = Math.ceil(w / cell) + 4, gh = Math.ceil(h / cell) + 4;
  const nx = lattice(gw * gh, R), ny = lattice(gw * gh, R), nx2 = lattice(gw * gh, R), ny2 = lattice(gw * gh, R);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / cell, v = y / cell;
      const dx = amp * (noise(nx, gw, u, v) * 0.7 + noise(nx2, gw, u * 2, v * 2) * 0.3);
      const dy = amp * (noise(ny, gw, u, v) * 0.7 + noise(ny2, gw, u * 2, v * 2) * 0.3);
      const sx = Math.min(w - 1.001, Math.max(0, x + dx)), sy = Math.min(h - 1.001, Math.max(0, y + dy));
      const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0, i = (y0 * w + x0) * 4, o = (y * w + x) * 4;
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
      for (let c = 0; c < 4; c++) d[o + c] = s[i + c] * w00 + s[i + 4 + c] * w10 + s[i + w * 4 + c] * w01 + s[i + w * 4 + 4 + c] * w11;
    }
  }
  ctx.putImageData(dst, 0, 0);
  return canvas;
}
