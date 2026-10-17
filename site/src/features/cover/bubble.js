/* ---------- floating action bar on the selected block ---------- */
function updateBubble() {
  const bub = $("bubble"), b = cur();
  const el = b && document.querySelector(`.blk[data-id="${b.id}"]`);
  if (!el) { bub.hidden = true; return; }
  const btn = (act, label, title, cls = "") => `<button data-a="${act}" title="${title}" class="${cls}">${label}</button>`;
  const sep = '<span class="sep"></span>';
  let h = "";
  if (b.type === "text") {
    h += btn("edit", "✎ Edit", "Edit this text") + sep + btn("bold", "<b>B</b>", "Bold", b.bold ? "on" : "") + btn("italic", "<i>I</i>", "Italic", b.italic ? "on" : "") + btn("under", "<u>U</u>", "Underline", b.under ? "on" : "") + sep +
      btn("smaller", "A−", "Smaller") + btn("bigger", "A+", "Bigger") + sep +
      btn("left", "⟸", "Align left", b.align === "left" ? "on" : "") + btn("center", "≡", "Centre", b.align === "center" ? "on" : "") + btn("right", "⟹", "Align right", b.align === "right" ? "on" : "") + sep +
      `<input type="color" data-a="color" value="${b.color || "#000000"}" title="Text colour">`;
  } else if (b.type === "logo") {
    h += btn("pick", "⇄ Replace", "Choose another image") + btn("nologo", "✕ Remove image", "Show an empty drop zone") + btn("deflogo", "Default", "Use the default shield") + sep + btn("smaller", "−", "Smaller") + btn("bigger", "+", "Bigger");
  } else if (b.type === "table") {
    h += btn("addr", "+ Row", "Add a row") + btn("delr", "− Row", "Remove the last row") + btn("addc", "+ Col", "Add a column") + btn("delc", "− Col", "Remove the last column") + sep + btn("smaller", "A−", "Smaller text") + btn("bigger", "A+", "Bigger text");
  } else if (b.type === "spacer") {
    h += btn("smaller", "− Space", "Less space") + btn("bigger", "+ Space", "More space");
  }
  h += (h ? sep : "") + btn("up", "↑", "Move up") + btn("down", "↓", "Move down") + btn("dup", "⧉ Copy", "Duplicate") + btn("del", "🗑 Delete", "Delete this block", "danger");
  bub.innerHTML = h; bub.hidden = false;
  const st = $("stage").getBoundingClientRect(), r = el.getBoundingClientRect();
  const w = bub.offsetWidth, hh = bub.offsetHeight;
  let top = r.top - st.top - hh - 8; if (top < 0) top = r.bottom - st.top + 8;
  let left = r.left - st.left + (r.width - w) / 2; left = Math.max(0, Math.min(left, st.width - w));
  bub.style.top = top + "px"; bub.style.left = left + "px";
}
$("bubble").addEventListener("mousedown", (e) => { if (e.target.tagName !== "INPUT") e.preventDefault(); });
$("bubble").addEventListener("input", (e) => { if (e.target.dataset.a === "color") { cur().color = e.target.value; const k = sel; render(); select(k, true); } });
$("bubble").addEventListener("click", (e) => {
  const a = e.target.closest("button") && e.target.closest("button").dataset.a; if (!a) return;
  const b = cur(); if (!b) return;
  const again = () => { const k = b.id; render(); save(); if (blockById(k)) select(k, true); };
  const num = (k, d, lo, hi) => { b[k] = Math.max(lo, Math.min(hi, +(b[k] + d).toFixed(2))); again(); };
  switch (a) {
    case "edit": { const t = document.querySelector(`.blk[data-id="${b.id}"] .t`); if (t) { t.focus(); const r = document.createRange(); r.selectNodeContents(t); r.collapse(false); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); } break; }
    case "bold": b.bold = !b.bold; again(); break;
    case "italic": b.italic = !b.italic; again(); break;
    case "under": b.under = !b.under; again(); break;
    case "left": case "center": case "right": b.align = a; again(); break;
    case "smaller": case "bigger": {
      const d = a === "bigger" ? 1 : -1;
      if (b.type === "text") num("size", d, 8, 64); else if (b.type === "logo") num("w", d * 10, 30, 400);
      else if (b.type === "table") { b.rowSize = Math.max(9, Math.min(34, b.rowSize + d)); b.headSize = Math.max(8, Math.min(30, b.headSize + d)); again(); }
      else if (b.type === "spacer") num("h", d * 10, 0, 400);
      break;
    }
    case "pick": pickLogo(b.id); break;
    case "nologo": b.src = null; again(); break;
    case "deflogo": b.src = ""; again(); break;
    case "addr": b.rows.push(b.headers.map(() => "&nbsp;")); again(); break;
    case "delr": if (b.rows.length > 1) b.rows.pop(); again(); break;
    case "addc": b.headers.push("Column"); b.rows.forEach((r) => r.push("&nbsp;")); again(); break;
    case "delc": if (b.headers.length > 1) { b.headers.pop(); b.rows.forEach((r) => r.pop()); } again(); break;
    case "up": case "down": { const i = S.blocks.indexOf(b), j = i + (a === "up" ? -1 : 1); if (j >= 0 && j < S.blocks.length) { S.blocks.splice(i, 1); S.blocks.splice(j, 0, b); } again(); break; }
    case "dup": { const c = JSON.parse(JSON.stringify(b)); c.id = id(); S.blocks.splice(S.blocks.indexOf(b) + 1, 0, c); sel = c.id; render(); save(); break; }
    case "del": S.blocks.splice(S.blocks.indexOf(b), 1); sel = null; render(); save(); break;
  }
});
window.addEventListener("resize", updateBubble);
$("stagewrap").addEventListener("scroll", updateBubble);
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redo(); return; }
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { sel = null; document.querySelectorAll(".blk.sel").forEach((x) => x.classList.remove("sel")); syncPanel(); } });

