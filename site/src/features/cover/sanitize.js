// Imported / restored designs are untrusted: keep only known shapes, numbers, colours and a tiny HTML whitelist.
const OKTAG = new Set(["B", "I", "U", "STRONG", "EM", "BR"]);
const COLOR = /^#[0-9a-f]{3,8}$/i, FONT = /^[\w ,'\-]{0,120}$/, WORD = /^[\w\-. %]{0,60}$/, ID = /^[\w-]{1,40}$/;

function cleanHtml(html) {
  const doc = new DOMParser().parseFromString("<body>" + String(html ?? "").slice(0, 4000), "text/html");
  const walk = (node) => [...node.childNodes].map((n) => {
    if (n.nodeType === 3) return n.textContent.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    if (n.nodeType !== 1) return "";
    const t = n.tagName, inner = walk(n);
    return t === "BR" ? "<br>" : OKTAG.has(t) ? `<${t.toLowerCase()}>${inner}</${t.toLowerCase()}>` : inner;
  }).join("");
  return walk(doc.body);
}

function cleanValue(key, v, base) {
  if (key === "html") return cleanHtml(v);
  if (key === "src") return typeof v === "string" && (v === "" || /^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/.test(v)) && v.length < 6e6 ? v : "";
  if (key === "id") return ID.test(v) ? v : "b" + Math.random().toString(36).slice(2, 8);
  if (/color|accent|head|row|grid|paper|frameC$/i.test(key) || key === "color") return typeof v === "string" && (v === "" || COLOR.test(v)) ? v : base ?? "";
  if (key === "font" || key === "pFont") return typeof v === "string" && FONT.test(v) ? v : "";
  if (typeof base === "number" || typeof v === "number") return Number.isFinite(+v) ? Math.max(-500, Math.min(2000, +v)) : base ?? 0;
  if (typeof base === "boolean" || typeof v === "boolean") return !!v;
  if (typeof v === "string") return WORD.test(v) ? v : base ?? "";
  return base;
}

function cleanBlock(b) {
  if (!b || !["text", "table", "logo", "divider", "spacer"].includes(b.type)) return null;
  const out = { type: b.type };
  for (const [k, v] of Object.entries(b)) {
    if (k === "type") continue;
    if (k === "headers" && Array.isArray(v)) out.headers = v.slice(0, 12).map(cleanHtml);
    else if (k === "rows" && Array.isArray(v)) out.rows = v.slice(0, 40).map((r) => (Array.isArray(r) ? r.slice(0, 12).map(cleanHtml) : []));
    else if (v === null || typeof v === "object") continue;
    else out[k] = cleanValue(k, v);
  }
  out.id = cleanValue("id", out.id);
  return out.type === "table" ? fixTable(out) : out;
}

/** -> a safe design object, or throws when the file is not a cover design at all. */
function sanitizeDesign(d) {
  if (!d || !Array.isArray(d.blocks) || typeof d.page !== "object" || !d.page) throw new Error("bad design");
  const base = defaults().page, page = {};
  for (const [k, bv] of Object.entries(base)) page[k] = d.page[k] === undefined ? bv : cleanValue(k, d.page[k], bv);
  return { page, blocks: d.blocks.slice(0, 80).map(cleanBlock).filter(Boolean) };
}
