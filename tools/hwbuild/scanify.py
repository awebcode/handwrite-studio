#!/usr/bin/env python3
"""Composite emulator shots onto page rasters, then scanner-app pass + JPEG PDF."""
import io, json, sys
import numpy as np
from PIL import Image, ImageFilter

def scanify(img, seed):
    rng = np.random.default_rng(int(seed))
    paper = (249, 248, 245)
    img = img.rotate(float(rng.uniform(-0.40, 0.40)), resample=Image.BICUBIC,
                     fillcolor=paper, expand=False)
    img = img.filter(ImageFilter.GaussianBlur(0.32))
    a = np.asarray(img).astype(np.float32)
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    ny = (yy / h - 0.5) * 2.0
    nx = (xx / w - 0.5) * 2.0
    cx, cy = rng.uniform(-0.26, 0.26), rng.uniform(-0.32, 0.20)
    sx, sy = rng.uniform(0.68, 0.92), rng.uniform(0.74, 0.98)
    r2 = ((nx - cx) / sx) ** 2 + ((ny - cy) / sy) ** 2
    flash = 1.0 + float(rng.uniform(0.05, 0.11)) * np.exp(-r2 * 1.2)
    vignette = 1.0 - 0.085 * (nx ** 2 + ny ** 2) - 0.025 * (nx ** 2) * (ny ** 2)
    tilt = 1.0 - float(rng.uniform(0.018, 0.045)) * (
        nx * rng.choice([-1.0, 1.0]) + ny * rng.choice([-1.0, 1.0])
    ) / 2.0
    small = rng.normal(0, 1, (6, 5)).astype(np.float32)
    small = (small - small.min()) / (np.ptp(small) + 1e-6)
    blot = Image.fromarray((small * 255).astype(np.uint8), mode="L").resize((w, h), Image.BICUBIC)
    blotch = (np.asarray(blot).astype(np.float32) - 128.0) / 70.0
    field = np.clip(flash * vignette * tilt + 0.03 * blotch, 0.86, 1.06)
    a *= field[:, :, None]
    a += rng.normal(0, 1.55, (h, w, 1)) + rng.normal(0, 0.55, (h, w, 3))
    black = float(rng.uniform(14, 24))
    white = float(rng.uniform(240, 252))
    a = (a - black) * (238.0 / (white - black))
    a = np.clip(a, 0, 244)
    a *= np.array([1.0, 0.997, 0.990], np.float32)
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return out.filter(ImageFilter.UnsharpMask(radius=1.3, percent=80, threshold=2))

def fit_paste(base, overlay, box, rot):
    x, y, w, h = box
    pad = 8
    x += pad; y += pad; w -= pad * 2; h -= pad * 2
    if w < 20 or h < 20:
        return
    ov = overlay.convert("RGBA")
    if abs(rot) > 0.05:
        ov = ov.rotate(rot, resample=Image.BICUBIC, expand=True)
    ow, oh = ov.size
    scale = min(w / ow, h / oh)
    nw, nh = max(1, int(ow * scale)), max(1, int(oh * scale))
    ov = ov.resize((nw, nh), Image.LANCZOS)
    px = x + (w - nw) // 2
    py = y + (h - nh) // 2
    base.paste(ov, (px, py), ov)

def jpeg_pdf(images, path):
    blobs = []
    for im in images:
        b = io.BytesIO()
        im.convert("RGB").save(b, format="JPEG", quality=74, optimize=True)
        blobs.append(b.getvalue())
    w_pt, h_pt = 595.28, 841.89
    iw, ih = images[0].size
    objs = {}
    kids = []
    for i, blob in enumerate(blobs):
        img_id = 3 + i * 3
        cont_id = img_id + 1
        page_id = img_id + 2
        kids.append(page_id)
        objs[img_id] = (
            f"<< /Type /XObject /Subtype /Image /Width {iw} /Height {ih} "
            f"/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode "
            f"/Length {len(blob)} >>\nstream\n".encode()
            + blob + b"\nendstream"
        )
        content = f"q {w_pt:.2f} 0 0 {h_pt:.2f} 0 0 cm /Im Do Q\n".encode()
        objs[cont_id] = (
            f"<< /Length {len(content)} >>\nstream\n".encode() + content + b"endstream"
        )
        objs[page_id] = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {w_pt:.2f} {h_pt:.2f}] "
            f"/Contents {cont_id} 0 R /Resources << /XObject << /Im {img_id} 0 R >> >> >>"
        ).encode()
    n = len(blobs)
    kids_str = " ".join(f"{k} 0 R" for k in kids)
    objs[1] = b"<< /Type /Catalog /Pages 2 0 R >>"
    objs[2] = f"<< /Type /Pages /Count {n} /Kids [ {kids_str} ] >>".encode()
    out = bytearray(b"%PDF-1.4\n")
    xref = [0]
    max_id = max(objs)
    for i in range(1, max_id + 1):
        xref.append(len(out))
        out += f"{i} 0 obj\n".encode() + objs[i] + b"\nendobj\n"
    xref_pos = len(out)
    out += f"xref\n0 {max_id + 1}\n".encode()
    out += b"0000000000 65535 f \n"
    for i in range(1, max_id + 1):
        out += f"{xref[i]:010d} 00000 n \n".encode()
    out += (
        f"trailer << /Size {max_id + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n"
    ).encode()
    with open(path, "wb") as f:
        f.write(out)

def main():
    spec = json.load(open(sys.argv[1]))
    pages_out = []
    for p in spec["pages"]:
        im = Image.open(p["src"]).convert("RGB")
        for shot in p.get("shots", []):
            ov = Image.open(shot["file"])
            fit_paste(im, ov, shot["box"], shot.get("rot", 0))
        im = im.resize((1240, 1754), Image.LANCZOS)
        im = scanify(im, p["seed"])
        im.save(p["jpg"], format="JPEG", quality=72, optimize=True)
        pages_out.append(im.convert("RGB"))
        print("page", p["jpg"], im.size)
    jpeg_pdf(pages_out, spec["pdf"])
    print("pdf", spec["pdf"], "pages", len(pages_out))

if __name__ == "__main__":
    main()
