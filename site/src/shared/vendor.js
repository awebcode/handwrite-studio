// Lazy-load the vendored export libraries (site/vendor). Each loads once, only when first needed.
const FILES = { html2canvas: ["html2canvas.min.js", "html2canvas"], jspdf: ["jspdf.umd.min.js", "jspdf"], jszip: ["jszip.min.js", "JSZip"] };
const pending = {};
export function vendor(name) {
  const [file, global] = FILES[name];
  if (window[global]) return Promise.resolve(window[global]);
  pending[name] ??= new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = `/vendor/${file}`; s.onload = () => res(window[global]); s.onerror = () => rej(new Error("Could not load " + file));
    document.head.appendChild(s);
  });
  return pending[name];
}
