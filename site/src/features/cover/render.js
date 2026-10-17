/* ---------- render ---------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function textStyle(b) {
  const sc = S.page.scale > 0 ? S.page.scale : 1;
  return `font-size:${(b.size * sc).toFixed(2)}px;font-weight:${b.bold ? 700 : 400};font-style:${b.italic ? "italic" : "normal"};text-decoration:${b.under ? "underline" : "none"};text-align:${b.align};line-height:${b.lh};letter-spacing:${b.ls}px;` +
    (b.color ? `color:${b.color};` : "") + (b.font ? `font-family:${b.font};` : "");
}
function blockHtml(b) {
  const mt = b.mt ?? 0, mb = b.mb ?? 0;
  let inner = "";
  if (b.type === "text") inner = `<div class="t" contenteditable="true" spellcheck="false" style="${textStyle(b)}">${b.html}</div>`;
  else if (b.type === "logo") {
    const img = b.src ? `<img src="${esc(b.src)}" style="width:${b.w}px" alt="logo">` : "";
    const just = b.align === "left" ? "flex-start" : b.align === "right" ? "flex-end" : "center";
    inner = b.src === ""
      ? `<div class="logo" style="justify-content:${just}"><div style="width:${b.w}px">${SHIELD}</div><div class="cap ui"><button data-act="pick">Replace</button></div></div>`
      : b.src === null
        ? `<div class="logo empty ui" data-act="pick">Drop a logo image here or click to choose</div>`
        : `<div class="logo" style="justify-content:${just}">${img}<div class="cap ui"><button data-act="pick">Replace</button></div></div>`;
  } else if (b.type === "divider") inner = `<hr class="divider" style="border-top-width:${b.th || 1}px">`;
  else if (b.type === "spacer") inner = `<div style="height:${b.h}px"></div>`;
  else if (b.type === "table") {
    fixTable(b);
    const cs = b.headers.length, scale = S.page.scale > 0 ? S.page.scale : 1;
    const w = b.w, colw = (w / cs).toFixed(1);
    let h = `<table class="tb" style="width:${w}px"><colgroup>${b.headers.map(() => `<col style="width:${colw}px">`).join("")}</colgroup><thead><tr>`;
    h += b.headers.map((x, c) => `<th data-r="-1" data-c="${c}" style="font-size:${(b.headSize * scale).toFixed(1)}px;padding:${b.rowH || 6}px 8px"><div contenteditable="true" spellcheck="false" data-ph="Column ${c + 1}">${x}</div></th>`).join("") + "</tr></thead><tbody>";
    h += b.rows.map((r, ri) => "<tr>" + r.map((x, c) => `<td data-r="${ri}" data-c="${c}" style="font-size:${(b.rowSize * scale).toFixed(1)}px;padding:${(b.rowH || 6) + 2}px 8px;${b.boldLast && c === cs - 1 ? "font-weight:700;" : ""}"><div contenteditable="true" spellcheck="false" data-ph="Type here">${x}</div></td>`).join("") + "</tr>").join("") + "</tbody></table>";
    inner = h;
  }
  return `<div class="blk${sel === b.id ? " sel" : ""}" data-id="${b.id}" style="margin-top:${mt}px;margin-bottom:${b.type === "logo" && b.mb == null ? 0 : mb}px"><span class="grip ui" title="Drag to reorder">⋮⋮</span>${inner}</div>`;
}
function applyPage() {
  const p = S.page, sh = $("sheet");
  sh.style.setProperty("--font", p.font);
  sh.style.setProperty("--padv", p.padV + "px"); sh.style.setProperty("--padh", p.padH + "px");
  sh.style.setProperty("--accent", p.accent); sh.style.setProperty("--head", p.head); sh.style.setProperty("--headInk", p.headInk);
  sh.style.setProperty("--row", p.row); sh.style.setProperty("--grid", p.grid);
  sh.style.setProperty("--frameW", (p.frame ? p.frameW : 0) + "px"); sh.style.setProperty("--frameC", p.frameC); sh.style.setProperty("--frameInset", p.frameI + "px");
  sh.style.background = p.paper;
  const z = p.zoom;
  sh.style.transform = `scale(${z})`;
  $("stage").style.width = 794 * z + "px"; $("stage").style.height = 1122 * z + "px";
}
function render() {
  applyPage();
  $("sheet").innerHTML = `<div class="frame"></div><div class="inner" style="justify-content:${S.page.just}">` + S.blocks.map(blockHtml).join("") + "</div>";
  bind(); attachDnd(); syncPanel(); checkOverflow(); updateBubble();
}
function checkOverflow() {
  const inner = $("sheet").querySelector(".inner"); if (!inner) return;
  const need = [...inner.children].reduce((t, c) => t + c.offsetHeight + (parseFloat(c.style.marginTop) || 0) + (parseFloat(c.style.marginBottom) || 0), 0) + S.page.padV * 2;
  const o = $("over"); const bad = need > 1126;
  o.style.display = bad ? "block" : "none"; o.style.top = 1122 * S.page.zoom + "px";
}

/* ---------- bind events on rendered blocks ---------- */
function bind() {
  document.querySelectorAll(".blk").forEach((el) => {
    const b = blockById(el.dataset.id);
    el.addEventListener("mousedown", () => select(b.id, false));
    el.addEventListener("focusin", () => select(b.id, false));
    if (b.type === "text") {
      const t = el.querySelector(".t");
      t.addEventListener("input", () => { b.html = t.innerHTML.replace(/<br>$/, ""); saveSoon(); });
    }
    if (b.type === "table") el.querySelectorAll("td,th").forEach((c) => {
      const r = +c.dataset.r, k = +c.dataset.c;
      c.firstChild.addEventListener("input", () => { (r < 0 ? b.headers : b.rows[r])[k] = c.firstChild.innerHTML; saveSoon(); });
    });
    el.querySelectorAll("[data-act=pick]").forEach((x) => x.addEventListener("click", (e) => { e.stopPropagation(); pickLogo(b.id); }));
  });
}
function select(i, rerender) {
  if (sel === i && !rerender) return;
  sel = i;
  document.querySelectorAll(".blk").forEach((e) => e.classList.toggle("sel", e.dataset.id === i));
  syncPanel();
}

