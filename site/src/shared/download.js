export function saveBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
export const dataUrlToBlob = (url) => fetch(url).then((r) => r.blob());
export const safeName = (s, fb = "file") => String(s || fb).trim().replace(/[^\w.\-]+/g, "_").replace(/^_+|_+$/g, "") || fb;
export const upperName = (s) => safeName(String(s).replace(/\./g, "")).toUpperCase();
