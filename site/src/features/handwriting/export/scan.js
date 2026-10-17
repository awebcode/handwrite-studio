// "Photographed with a scanner app": small rotation, soft focus, flash hotspot, vignette, grain and levels.
const PAPER = "rgb(249,248,245)";
const smooth = (t) => t * t * (3 - 2 * t);

function blotchField(R, gw = 6, gh = 5) {
  const g = Array.from({ length: gw * gh }, () => R());
  const lo = Math.min(...g), hi = Math.max(...g) - lo + 1e-6;
  return (u, v) => { // u,v in 0..1 -> -1.8..1.8
    const x = u * (gw - 1), y = v * (gh - 1), x0 = Math.min(gw - 2, x | 0), y0 = Math.min(gh - 2, y | 0), fx = smooth(x - x0), fy = smooth(y - y0);
    const at = (i, j) => (g[j * gw + i] - lo) / hi;
    const n = at(x0, y0) * (1 - fx) * (1 - fy) + at(x0 + 1, y0) * fx * (1 - fy) + at(x0, y0 + 1) * (1 - fx) * fy + at(x0 + 1, y0 + 1) * fx * fy;
    return (n * 255 - 128) / 70;
  };
}

export function scanify(canvas, o, R) {
  const w = canvas.width, h = canvas.height, rr = (a, b) => a + R() * (b - a);
  const out = document.createElement("canvas"); out.width = w; out.height = h;
  const c = out.getContext("2d");
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  c.save(); c.translate(w / 2, h / 2); c.rotate((rr(-o.rotate, o.rotate) * Math.PI) / 180);
  if (o.blur > 0) c.filter = `blur(${o.blur}px)`;
  c.drawImage(canvas, -w / 2, -h / 2); c.restore();

  const img = c.getImageData(0, 0, w, h), d = img.data;
  const cx = rr(-0.26, 0.26), cy = rr(-0.32, 0.2), sx = rr(0.68, 0.92), sy = rr(0.74, 0.98);
  const flash = rr(o.flash * 0.6, o.flash * 1.4), tilt = rr(0.018, 0.045), tx = R() < 0.5 ? -1 : 1, ty = R() < 0.5 ? -1 : 1;
  const blotch = blotchField(R), black = rr(14, 24), white = rr(240, 252), gain = 238 / (white - black);
  for (let y = 0; y < h; y++) {
    const ny = (y / h - 0.5) * 2;
    for (let x = 0; x < w; x++) {
      const nx = (x / w - 0.5) * 2, r2 = ((nx - cx) / sx) ** 2 + ((ny - cy) / sy) ** 2;
      let f = (1 + flash * Math.exp(-r2 * 1.2)) * (1 - o.vignette * (nx * nx + ny * ny) - 0.025 * nx * nx * ny * ny) * (1 - (tilt * (nx * tx + ny * ty)) / 2);
      f = Math.min(1.06, Math.max(0.86, f + 0.03 * blotch(x / w, y / h)));
      const lum = (R() + R() + R() + R() - 2) * 1.73 * o.grain, i = (y * w + x) * 4;
      for (let k = 0; k < 3; k++) {
        const v = (d[i + k] * f + lum + (R() - 0.5) * 0.95 - black) * gain;
        d[i + k] = Math.min(244, Math.max(0, v)) * (k === 0 ? 1 : k === 1 ? 0.997 : 0.99);
      }
    }
  }
  c.putImageData(img, 0, 0);
  return out;
}
