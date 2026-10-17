// Image intake: pick, drop or paste -> resized data URL (keeps pages light, stays sharp).
const MAX_BYTES = 900_000;

async function toBitmap(blob) {
  if (window.createImageBitmap) { try { return await createImageBitmap(blob); } catch { /* fall through */ } }
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  } finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
}
const draw = (bmp, w, h, bg) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
  x.imageSmoothingQuality = "high"; x.drawImage(bmp, 0, 0, w, h);
  return c;
};

/** Resize to fit `max` px (never upscales). PNG stays PNG while small, otherwise JPEG with adaptive quality. */
export async function resizeImage(blob, { max = 1600, quality = 0.9, keepPng = true } = {}) {
  const bmp = await toBitmap(blob);
  const sw = bmp.width, sh = bmp.height;
  let k = Math.min(1, max / Math.max(sw, sh));
  const isPng = blob.type === "image/png" && keepPng;
  for (let pass = 0; pass < 5; pass++) {
    const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
    if (isPng) {
      const png = draw(bmp, w, h).toDataURL("image/png");
      if (png.length < MAX_BYTES * 1.37 || pass === 4) return { src: png, width: w, height: h };
    } else {
      const jpg = draw(bmp, w, h, "#fff").toDataURL("image/jpeg", Math.max(0.6, quality - pass * 0.08));
      if (jpg.length < MAX_BYTES * 1.37 || pass === 4) return { src: jpg, width: w, height: h };
    }
    k *= 0.82;
  }
}

export const isImage = (f) => f && /^image\//.test(f.type);
export const imagesIn = (list) => [...(list || [])].filter(isImage);

/** Open the OS file picker for images. */
export function pickImages(multiple = false) {
  return new Promise((res) => {
    const i = document.createElement("input");
    i.type = "file"; i.accept = "image/*"; i.multiple = multiple;
    i.onchange = () => res(imagesIn(i.files)); i.click();
  });
}

/**
 * Make `target` accept dropped images, and (optionally) pasted ones anywhere on the page.
 * onFiles(files, event) is called with image Files only.
 */
export function acceptImages(target, onFiles, { paste = true } = {}) {
  const over = (e) => { if ([...(e.dataTransfer?.types || [])].includes("Files")) { e.preventDefault(); target.classList.add("drop-hint"); } };
  target.addEventListener("dragenter", over); target.addEventListener("dragover", over);
  target.addEventListener("dragleave", (e) => { if (e.target === target) target.classList.remove("drop-hint"); });
  target.addEventListener("drop", (e) => {
    target.classList.remove("drop-hint");
    const files = imagesIn(e.dataTransfer?.files);
    if (files.length) { e.preventDefault(); onFiles(files, e); }
  });
  if (paste) document.addEventListener("paste", (e) => {
    const files = imagesIn(e.clipboardData?.files);
    if (files.length) { e.preventDefault(); onFiles(files, e); }
  });
}
