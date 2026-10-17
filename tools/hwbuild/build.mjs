import { chromium } from "playwright";
import { readFileSync, mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { compile } from "./lib/compile.mjs";
import { findChrome } from "./lib/chrome.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT = {
  gloria: readFileSync(path.join(__dirname, "fonts/gloria.woff2")).toString("base64"),
  kalam: readFileSync(path.join(__dirname, "fonts/kalam.woff2")).toString("base64"),
  vt: readFileSync(path.join(__dirname, "fonts/vt323.woff2")).toString("base64"),
};
const ROOT = path.resolve(__dirname, "../..");
let OUT, RAW; // set per assignment in main()
const PY = existsSync(path.join(__dirname, ".venv/bin/python"))
  ? path.join(__dirname, ".venv/bin/python")
  : "python3";

const CHROME = findChrome();
const DSF = 2;

// How shaky the hand is. Per word: tilt, rise/fall, size, slant, letter and word spacing; per line: tilt.
const GRADES = {
  clean: {
    rot: 1.3, dy: 1.1, szLo: 0.96, szHi: 1.05, skew: 2.0,
    ls0: -0.3, ls1: 0.6, mr0: -0.8, mr1: 2.4, line: 0.55,
  },
  medium: {
    rot: 1.8, dy: 1.5, szLo: 0.95, szHi: 1.07, skew: 2.6,
    ls0: -0.35, ls1: 0.75, mr0: -1.0, mr1: 2.8, line: 0.8,
  },
};
// Code is written more carefully than prose, but still by hand.
const CODE_GRADE = {
  clean: {
    rot: 0.9, dy: 0.8, szLo: 0.98, szHi: 1.04, skew: 1.2,
    ls0: -0.15, ls1: 0.35, mr0: -0.4, mr1: 1.2, line: 0.45,
  },
  medium: {
    rot: 1.3, dy: 1.1, szLo: 0.97, szHi: 1.06, skew: 1.7,
    ls0: -0.2, ls1: 0.5, mr0: -0.6, mr1: 1.7, line: 0.65,
  },
};


function cssFor(s) {
  const face = s.font === "kalam" ? FONT.kalam : FONT.gloria;
  const fam = s.font === "kalam" ? "Kalam" : "Gloria";
  return `
@font-face { font-family:'${fam}'; src:url(data:font/woff2;base64,${face}) format('woff2'); font-weight:400; font-style:normal; }
* { box-sizing: border-box; }
html, body { margin:0; padding:0; background:#fff; }
.page {
  position: relative; width:794px; height:1123px; overflow:hidden;
  background:#fff; margin:0;
}
.page.measure { height:auto; overflow:visible; }
.page::before {
  content:""; position:absolute; inset:0; pointer-events:none; z-index:1;
  background: ${s.L.rules};
}
.ink {
  position:relative; z-index:2;
  padding:${s.L.pad};
  font-family:'${fam}', cursive;
  font-size:${s.fs}px;
  line-height:${s.lh};
  color:${s.ink};
  font-weight:400;
  filter:url(#wob);
}
.ink > * { transform-origin:left center; }
.w { display:inline-block; }
.n9 { display:inline-block; font-style:normal; line-height:1; }
.hdr { text-align:center; }
.t1 { font-size:1.42em; line-height:1.2; margin:0 0 1px; font-weight:400; }
.t2 { font-size:1.08em; line-height:1.28; margin:0 0 1px; font-weight:400; }
.meta { margin:1px 0; line-height:1.45; }
.sec {
  font-size:1.16em; font-weight:400; margin:13px 0 3px;
  border-bottom:1.5px solid rgba(20,20,20,.8);
  display:inline-block; padding-bottom:1px; line-height:1.25;
}
.q { margin-top:11px; line-height:1.42; }
.a { margin-top:2px; line-height:1.46; }
.idt { padding-left:18px; margin-top:2px; line-height:1.46; }
.res { margin-top:3px; line-height:1.42; }
.ln {
  font-size:0.9em; line-height:1.34; margin:0;
  white-space:pre-wrap; overflow-wrap:anywhere;
}
.ln.i { padding-left:22px; }
.sp { height:7px; }
.cap { margin:8px 0 3px; line-height:1.35; }
.end { text-align:center; margin-top:16px; font-size:1.05em; }
.tblwrap { margin:4px 0 4px 0; }
table.tb {
  border-collapse:collapse; margin:4px 0 4px 6px;
  font-size:0.9em; transform:rotate(${s.tableRot}deg);
}
table.tb th, table.tb td {
  border:1.25px solid rgba(20,20,20,.88);
  padding:1px 8px; line-height:1.3; font-weight:400; text-align:left;
}
b { font-weight:400; }
${s.L.css}
`;
}

function shell(s, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cssFor(s)}</style></head><body>
<svg width="0" height="0" style="position:absolute">
  <filter id="wob" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence id="turb" type="fractalNoise" baseFrequency="${s.wobbleFreq || "0.02 0.035"}" numOctaves="2" seed="${s.turb}" result="t"/>
    <feDisplacementMap id="disp" in="SourceGraphic" in2="t" scale="${s.wobble}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
${body}
</body></html>`;
}

function terminalHtml(style, lines, cursor) {
  const text = lines.map((ln) => ln.replace(/&/g, "&").replace(/</g, "<")).join("\n");
  if (style === "a") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'VT'; src:url(data:font/woff2;base64,${FONT.vt}) format('woff2'); }
html,body { margin:0; background:transparent; }
.wrap { display:inline-block; padding:14px 16px 18px 14px; background:transparent; }
.win { width:640px; background:#d4d0c8; border:2px solid #fff; border-right-color:#404040; border-bottom-color:#404040;
       box-shadow: 3px 4px 0 rgba(0,0,0,.35); font-family:Tahoma, sans-serif; }
.title { height:22px; background:linear-gradient(#0a246a,#3a6ea5 55%, #0a246a);
         color:#fff; font-size:12px; display:flex; align-items:center; padding:0 4px 0 6px; font-weight:700; }
.title .tt { letter-spacing:.2px; }
.title .sp { flex:1; }
.btn { width:16px; height:14px; margin-left:2px; background:#d4d0c8; border:1px solid #fff; border-right-color:#404040; border-bottom-color:#404040;
       font-size:9px; line-height:12px; text-align:center; color:#111; font-weight:700; }
.screen { background:#000; color:#c8c8c8; padding:12px 14px 16px; min-height:40px;
          font-family:'VT', monospace; font-size:26px; line-height:1.12; white-space:pre; }
.cur { display:inline-block; width:11px; height:18px; background:#c8c8c8; vertical-align:-2px; margin-left:1px; }
</style></head><body><div class="wrap"><div class="win">
  <div class="title"><span class="tt">screen</span><span class="sp"></span><span class="btn">_</span><span class="btn">[]</span><span class="btn">X</span></div>
  <div class="screen">${text}${cursor ? '<span class="cur"></span>' : ""}</div>
</div></div></body></html>`;
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'VT'; src:url(data:font/woff2;base64,${FONT.vt}) format('woff2'); }
html,body { margin:0; background:transparent; }
.wrap { display:inline-block; padding:10px 12px 14px; background:transparent; }
.win { width:600px; background:#0a0a0a; border:8px solid #1c1c1c; outline:1px solid #3a3a3a;
       box-shadow: 0 8px 16px rgba(0,0,0,.28); }
.bar { height:18px; background:#2b2b2b; color:#d0d0d0; font-family:Tahoma,sans-serif; font-size:11px;
       display:flex; align-items:center; padding:0 8px; letter-spacing:.3px; }
.screen { color:#f3f1e6; padding:16px 16px 20px; font-family:'VT', monospace; font-size:28px;
          line-height:1.18; white-space:pre; background:#050505; }
</style></head><body><div class="wrap"><div class="win">
  <div class="bar">EMU8086 emulator</div>
  <div class="screen">${text}</div>
</div></div></body></html>`;
}

function classFor(k) {
  switch (k) {
    case "h1": return "hdr t1";
    case "h2": return "hdr t2";
    case "meta": return "meta";
    case "sec": return "sec";
    case "q": return "q";
    case "a": return "a";
    case "idt": return "a idt";
    case "res": return "res";
    case "ln": return "ln";
    case "ln i": return "ln i";
    case "sp": return "sp";
    case "end": return "end";
    case "cap": return "cap";
    default: return "a";
  }
}

async function launch() {
  return chromium.launch({
    ...(CHROME ? { executablePath: CHROME } : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
  });
}

async function renderStudent(browser, student) {
  const dir = path.join(RAW, student.id);
  mkdirSync(dir, { recursive: true });
  // drop pages left over from an earlier run with a different page count
  // clear the files, not the folder: a running dev server keeps serving the same directory
  const outDir = path.join(OUT, student.id);
  mkdirSync(outDir, { recursive: true });
  for (const f of readdirSync(outDir)) rmSync(path.join(outDir, f), { force: true });
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  mkdirSync(path.join(OUT, student.id), { recursive: true });

  const measureHtml = shell(student, `<div class="page measure" id="pg"><div class="ink" id="ink"></div></div>`);
  const mp = await browser.newPage({ viewport: { width: 820, height: 900 }, deviceScaleFactor: 1 });
  await mp.setContent(measureHtml, { waitUntil: "domcontentloaded" });
  await mp.evaluate(async () => { if (document.fonts) await document.fonts.ready; });

  const g = { ...GRADES[student.grade], ...(student.hand || {}) };   // profile.hand overrides any value
  const cg = CODE_GRADE[student.grade];
  const measured = await mp.evaluate(async ({ blocks, g, cg, seed, fs, fam, gapQ, nineShift }) => {
    let S = (seed | 0) * 2654435761 % 2147483647;
    if (S <= 0) S += 2147483646;
    function rnd() { S = (S * 16807) % 2147483647; return (S - 1) / 2147483645; }
    function rr(a, b) { return a + rnd() * (b - a); }
    function put(sp, text, shift) {
              // a handwritten 9 is a 6 turned over; the font's own 9 looks like a "q"
              text.split(/(9)/).forEach((seg) => {
                if (seg === "9") {
                  const i = document.createElement("i");
                  i.className = "n9";
                  i.textContent = "6";
                  i.style.transform = `rotate(${(180 + rr(-9, 9)).toFixed(1)}deg) translateY(${(shift + rr(-0.02, 0.02)).toFixed(3)}em)`;
                  sp.appendChild(i);
                } else if (seg) sp.appendChild(document.createTextNode(seg));
              });
            }
    function jitter(el, base) {
      // each line is written in a slightly different mood: sometimes neat, sometimes rushed
      const m = rr(0.85, 1.15);
      const grade = { ...base };
      for (const k of ["rot", "dy", "skew", "line"]) grade[k] = base[k] * m;
      const r = rr(-grade.line, grade.line);
      const x = rr(-2, 2), y = rr(-1.4, 1.4);
      el.style.transform = `rotate(${r.toFixed(2)}deg) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) if (n.nodeValue.trim().length) nodes.push(n);
      nodes.forEach((node) => {
        const parts = node.nodeValue.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
          const sp = document.createElement("span");
          sp.className = "w";
          put(sp, p, nineShift);
          const rot = rr(-grade.rot, grade.rot);
          const dy = rr(-grade.dy, grade.dy);
          const sz = rr(grade.szLo, grade.szHi);
          const skw = rr(-grade.skew, grade.skew);
          const ls = rr(grade.ls0, grade.ls1);
          const mr = rr(grade.mr0, grade.mr1);
          // some words are pressed harder: thicker strokes
          const bold = rnd() < (grade.boldP ?? 0) ? `-webkit-text-stroke:${rr(0.35, 0.95).toFixed(2)}px;` : "";
          sp.setAttribute("style",
            bold + `transform:rotate(${rot.toFixed(2)}deg) translateY(${dy.toFixed(1)}px) skewX(${skw.toFixed(1)}deg);` +
            `font-size:${sz.toFixed(3)}em;letter-spacing:${ls.toFixed(2)}px;margin-right:${mr.toFixed(1)}px;opacity:${rr(grade.opLo ?? 0.86, 1).toFixed(2)};`);
          frag.appendChild(sp);
        });
        node.parentNode.replaceChild(frag, node);
      });
    }
    const ink = document.getElementById("ink");
    blocks.forEach((b) => {
      let el;
      if (b.k === "table") {
        el = document.createElement("div");
        el.className = "tblwrap";
        const head = b.rows[0], rest = b.rows.slice(1);
        let h = "<table class='tb'><tr>" + head.map((c) => `<th>${c}</th>`).join("") + "</tr>";
        rest.forEach((r) => { h += "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>"; });
        h += "</table>";
        el.innerHTML = h;
      } else {
        el = document.createElement("div");
        el.className = ({
          h1: "hdr t1", h2: "hdr t2", meta: "meta", sec: "sec", q: "q", a: "a",
          idt: "a idt", res: "res", ln: "ln", "ln i": "ln i", sp: "sp", end: "end", cap: "cap",
        })[b.k] || "a";
        el.textContent = b.t || "";
      }
      el.dataset.k = b.k;
      ink.appendChild(el);
      // natural, uneven gap before each question / section, like a real answer sheet
      if (b.k === "q") el.style.marginTop = rr(gapQ[0], gapQ[1]).toFixed(1) + "px";
      if (b.k !== "sp") {
        const grade = (b.k === "ln" || b.k === "ln i") ? cg : g;
        jitter(el, grade);
      }
    });
    await document.fonts.load(fs + "px '" + fam + "'");
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const els = [...ink.children];
    const tops = els.map((e) => e.offsetTop);
    const sh = ink.scrollHeight;
    const PAD_B = 34;
    const heights = tops.map((t, i) => (i + 1 < tops.length ? tops[i + 1] : sh - PAD_B) - t);
    return { heights, html: ink.innerHTML, sh };
  }, {
    blocks: student.blocks,
    g,
    cg,
    seed: student.seed,
    fs: student.fs,
    gapQ: student.layout.gapQ || [14, 36],
    nineShift: student.font === "kalam" ? 0.26 : 0.07,
    fam: student.font === "kalam" ? "Kalam" : "Gloria",
  });

  await mp.close();

  const items = student.blocks.map((b, i) => ({ ...b, h: Math.max(1, measured.heights[i] || 1), htmlIndex: i }));
  // Rebuild elements from the jittered HTML snapshot by splitting on a marker.
  // We'll re-parse the ink HTML as a list of top-level nodes via a second page.

  console.log(student.id, "measured ink", measured.sh, "blocks", measured.heights.length);
  // Random bottom whitespace: each page gets its own fill limit, so pages end at
  // different heights and leave a blank band of paper like a real notebook.
  const L = student.L;
  let gS = ((student.seed + 77) | 0) * 2654435761 % 2147483647;
  if (gS <= 0) gS += 2147483646;
  const grnd = () => { gS = (gS * 16807) % 2147483647; return (gS - 1) / 2147483645; };
  const gaps = [];

  function pack(scale) {
    const pages = [];
    let cur = [];
    let used = 0;
    let limit = 0;
    const nextLimit = () => {
      const gap = L.gapMin + grnd() * (L.gapMax - L.gapMin);
      gaps.push(Math.round(gap));
      limit = (L.limit - gap) * scale;
    };
    nextLimit();
    const flush = () => { if (cur.length) pages.push(cur); cur = []; used = 0; nextLimit(); };
    for (const b of items) {
      if (used > 0 && used + b.h > limit) {
        // never leave a question / section heading stranded at the bottom
        const pulled = [];
        while (cur.length && ["q", "sec", "h1", "h2"].includes(cur[cur.length - 1].k)) {
          const x = cur.pop();
          used -= x.h;
          pulled.unshift(x);
        }
        flush();
        for (const x of pulled) { cur.push(x); used += x.h; }
      }
      cur.push(b);
      used += b.h;
    }
    flush();
    // never leave a nearly empty last page: pull it back onto the page before when it fits
    const sum = (pg) => pg.reduce((t, b) => t + b.h, 0);
    while (pages.length > 1 && sum(pages[pages.length - 1]) < 160 && sum(pages[pages.length - 2]) + sum(pages[pages.length - 1]) <= L.limit * scale) {
      pages[pages.length - 2].push(...pages.pop());
    }
    return pages;
  }

  async function assemble(pages) {
    const fp = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: DSF });
    await fp.setContent(shell(student, `<div id="host"></div>`), { waitUntil: "domcontentloaded" });
    await fp.evaluate(async () => { if (document.fonts) await document.fonts.ready; });
    const heights = await fp.evaluate(async ({ inkHtml, pages, seed, marks }) => {
      const host = document.getElementById("host");
      const holder = document.createElement("div");
      holder.innerHTML = inkHtml;
      const nodes = [...holder.children];
      let idx = 0;
      const made = [];
      let S0 = ((seed + 9) | 0) * 2654435761 % 2147483647;
      if (S0 <= 0) S0 += 2147483646;
      const rnd0 = () => { S0 = (S0 * 16807) % 2147483647; return (S0 - 1) / 2147483645; };
      pages.forEach((p) => {
        const pg = document.createElement("div");
        pg.className = "page";
        const ink = document.createElement("div");
        ink.className = "ink";
        p.forEach(() => { const node = nodes[idx++]; if (node) ink.appendChild(node); });
        pg.appendChild(ink);
        // each page of a notebook is written a little off-square
        ink.style.transform = `translate(${(rnd0() * 10 - 5).toFixed(1)}px, ${(rnd0() * 6 - 3).toFixed(1)}px) rotate(${(rnd0() * 0.5 - 0.25).toFixed(2)}deg)`;
        host.appendChild(pg);
        made.push(pg);
      });
      // pen dots, tick marks and little scribbles, like a real page that was handled
      let S = ((seed + 50) | 0) * 2654435761 % 2147483647;
      if (S <= 0) S += 2147483646;
      function rnd() { S = (S * 16807) % 2147483647; return (S - 1) / 2147483645; }
      const NS = "http://www.w3.org/2000/svg";
      const mk = { dots: 2, ticks: 0.3, scribble: 0.2, ...(marks || {}) };
      made.forEach((pg) => {
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("viewBox", "0 0 794 1123");
        svg.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:5");
        const k = Math.max(0, Math.round(mk.dots * (0.5 + rnd())));
        for (let i = 0; i < k; i++) {
          const inMargin = mk.margin !== false && rnd() < 0.4;
          const c = document.createElementNS(NS, "ellipse");
          c.setAttribute("cx", (inMargin ? 12 + rnd() * 40 : 90 + rnd() * 650).toFixed(1));
          c.setAttribute("cy", (100 + rnd() * 930).toFixed(1));
          c.setAttribute("rx", (0.6 + rnd() * 1.5).toFixed(2));
          c.setAttribute("ry", (0.5 + rnd() * 1.3).toFixed(2));
          c.setAttribute("fill", `rgba(20,20,20,${(0.35 + rnd() * 0.5).toFixed(2)})`);
          svg.appendChild(c);
        }
        // pen resting on the paper while thinking: one or two darker blots on some pages
        if (rnd() < (mk.blots ?? 0.5)) {
          const n = 1 + Math.floor(rnd() * 2);
          for (let i = 0; i < n; i++) {
            const c = document.createElementNS(NS, "ellipse");
            c.setAttribute("cx", (96 + rnd() * 640).toFixed(1));
            c.setAttribute("cy", (110 + rnd() * 900).toFixed(1));
            c.setAttribute("rx", (1.6 + rnd() * 1.8).toFixed(2));
            c.setAttribute("ry", (1.4 + rnd() * 1.6).toFixed(2));
            c.setAttribute("fill", `rgba(15,15,15,${(0.6 + rnd() * 0.3).toFixed(2)})`);
            svg.appendChild(c);
          }
        }
        const stroke = (d, w, a) => {
          const path = document.createElementNS(NS, "path");
          path.setAttribute("d", d);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", `rgba(20,20,20,${a})`);
          path.setAttribute("stroke-width", w);
          path.setAttribute("stroke-linecap", "round");
          svg.appendChild(path);
        };
        if (rnd() < mk.ticks) {            // a small tick / check mark by the margin
          const x = 20 + rnd() * 30, y = 110 + rnd() * 880;
          stroke(`M${x} ${y} l${5 + rnd() * 3} ${6 + rnd() * 3} l${9 + rnd() * 6} ${-(13 + rnd() * 6)}`, (1.1 + rnd() * 0.6).toFixed(2), (0.55 + rnd() * 0.3).toFixed(2));
        }
        if (rnd() < mk.scribble) {         // a quick zig-zag, as if the pen was tested
          const x = 10 + rnd() * 30, y = 120 + rnd() * 860;
          let d = `M${x} ${y}`;
          for (let j = 0; j < 5; j++) d += ` l${(rnd() * 10 + 6).toFixed(1)} ${(rnd() * 3 - 1.5).toFixed(1)} l${(-(rnd() * 8 + 4)).toFixed(1)} ${(rnd() * 3 + 1).toFixed(1)}`;
          stroke(d, (0.9 + rnd() * 0.5).toFixed(2), (0.4 + rnd() * 0.3).toFixed(2));
        }
        pg.appendChild(svg);
      });
      const probe = document.querySelector(".ink");
      if (probe) {
        const fam = getComputedStyle(probe).fontFamily;
        try { await document.fonts.load("20px " + fam); } catch (e) {}
      }
      await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return made.map((pg) => pg.querySelector(".ink").scrollHeight);
    }, {
      inkHtml: measured.html,
      pages: pages.map((p) => p.map((b) => b.k)),
      seed: student.seed,
      marks: student.marks,
    });
    return { fp, heights };
  }

  let pages = pack(1);
  let built = await assemble(pages);
  if (built.heights.some((h) => h > 1123)) {
    console.warn("overflow on", student.id, "- repacking tighter");
    await built.fp.close();
    gaps.length = 0;
    pages = pack(0.88);
    built = await assemble(pages);
  }
  const { fp, heights } = built;
  console.log(student.id, "pages", heights.length, "ink heights", heights.join(","), "| bottom gaps", gaps.join(","));

  const shotInfo = await addShotPages(fp, student, heights.length);
  const allPages = await fp.$$(".page");
  const pageMeta = [];
  for (let i = 0; i < allPages.length; i++) {
    const src = path.join(dir, `p${String(i + 1).padStart(2, "0")}.png`);
    await allPages[i].screenshot({ path: src });
    pageMeta.push({ src, shots: shotInfo[i] || [], seed: student.seed + i * 19 });
  }
  await fp.close();
  return pageMeta;
}

async function addShotPages(fp, student, theoryCount) {
  // returns map of absolute page index -> [{file, box, rot}]
  const byPage = Array.from({ length: student.pageCount }, () => []);
  student.shots.forEach((s, i) => byPage[s.page].push({ ...s, i }));

  const termFiles = [];
  for (const s of student.shots) {
    const tp = await fp.context().newPage
      ? null
      : null;
    termFiles.push(null);
  }

  // Render terminals with a fresh page from the same browser context
  const browser = fp.context().browser();
  for (let i = 0; i < student.shots.length; i++) {
    const s = student.shots[i];
    const tpage = await browser.newPage({ viewport: { width: 760, height: 640 }, deviceScaleFactor: 2 });
    await tpage.setContent(terminalHtml(student.shotStyle, s.lines, s.cursor), { waitUntil: "domcontentloaded" });
    await tpage.evaluate(async () => { if (document.fonts) await document.fonts.ready; });
    const file = path.join(RAW, student.id, `shot${i}.png`);
    await (await tpage.$(".wrap")).screenshot({ path: file, omitBackground: true });
    await tpage.close();
    termFiles[i] = file;
  }

  const info = await fp.evaluate(async ({ byPage, seed, gradeName, nineShift }) => {
    const host = document.getElementById("host");
    const g = gradeName;
    let S = ((seed + 200) | 0) * 2654435761 % 2147483647;
    if (S <= 0) S += 2147483646;
    function rnd() { S = (S * 16807) % 2147483647; return (S - 1) / 2147483645; }
    function rr(a, b) { return a + rnd() * (b - a); }
    // mild jitter for captions only — duplicate of the writer, lighter
    function put(sp, text, shift) {
              // a handwritten 9 is a 6 turned over; the font's own 9 looks like a "q"
              text.split(/(9)/).forEach((seg) => {
                if (seg === "9") {
                  const i = document.createElement("i");
                  i.className = "n9";
                  i.textContent = "6";
                  i.style.transform = `rotate(${(180 + rr(-9, 9)).toFixed(1)}deg) translateY(${(shift + rr(-0.02, 0.02)).toFixed(3)}em)`;
                  sp.appendChild(i);
                } else if (seg) sp.appendChild(document.createTextNode(seg));
              });
            }
    function jitter(el) {
      const rot = g === "medium" ? 1.4 : 0.9;
      el.style.transform = `rotate(${rr(-0.4, 0.4).toFixed(2)}deg)`;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) if (n.nodeValue.trim().length) nodes.push(n);
      nodes.forEach((node) => {
        const parts = node.nodeValue.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
          const sp = document.createElement("span");
          sp.className = "w";
          put(sp, p, nineShift);
          sp.setAttribute("style",
            `transform:rotate(${rr(-rot, rot).toFixed(2)}deg) translateY(${rr(-0.8, 0.8).toFixed(1)}px);` +
            `font-size:${rr(0.98, 1.03).toFixed(3)}em;opacity:.96;`);
          frag.appendChild(sp);
        });
        node.parentNode.replaceChild(frag, node);
      });
    }
    const map = {};
    byPage.forEach((group, gi) => {
      if (!group.length) return;
      const pg = document.createElement("div");
      pg.className = "page";
      const ink = document.createElement("div");
      ink.className = "ink";
      const title = document.createElement("div");
      title.className = "hdr t2";
      title.textContent = gi === 0 ? "Output screenshots" : "Output screenshots (contd.)";
      ink.appendChild(title);
      jitter(title);
      group.forEach((s) => {
        const cap = document.createElement("div");
        cap.className = "cap";
        cap.textContent = s.cap;
        ink.appendChild(cap);
        jitter(cap);
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.dataset.shot = String(s.i);
        slot.style.height = s.h + "px";
        ink.appendChild(slot);
      });
      pg.appendChild(ink);
      host.appendChild(pg);
    });
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const pages = [...host.querySelectorAll(".page")];
    const out = {};
    pages.forEach((pg, pi) => {
      const slots = [...pg.querySelectorAll(".slot")];
      if (!slots.length) return;
      const pr = pg.getBoundingClientRect();
      out[pi] = slots.map((slot) => {
        const r = slot.getBoundingClientRect();
        return {
          i: Number(slot.dataset.shot),
          box: [
            Math.round((r.x - pr.x) * deviceScale()),
            Math.round((r.y - pr.y) * deviceScale()),
            Math.round(r.width * deviceScale()),
            Math.round(r.height * deviceScale()),
          ],
        };
      });
    });
    function deviceScale() { return window.devicePixelRatio || 1; }
    // also return ink heights of shot pages
    out._h = pages.map((pg) => pg.querySelector(".ink").scrollHeight);
    return out;
  }, { byPage, seed: student.seed, gradeName: student.grade, nineShift: student.font === "kalam" ? 0.26 : 0.07 });

  console.log(student.id, "all ink after shots", (info._h || []).join(","));
  const map = {};
  for (const [k, v] of Object.entries(info)) {
    if (k === "_h") continue;
    map[Number(k)] = v.map((slot) => ({
      file: termFiles[slot.i],
      box: slot.box,
      rot: student.shotStyle === "a" ? ((slot.i % 2 === 0) ? -0.35 : 0.28) : ((slot.i % 2 === 0) ? 0.4 : -0.22),
    }));
  }
  return map;
}

function runPy(specPath) {
  return new Promise((resolve, reject) => {
    const p = spawn(PY, [path.join(__dirname, "scanify.py"), specPath], { stdio: "inherit" });
    p.on("exit", (code) => code === 0 ? resolve() : reject(new Error("scanify " + code)));
  });
}

// usage: node build.mjs [assignment-folder-name] [studentId ...]
async function main() {
  const [slug = process.env.HW_ASSIGNMENT || "example", ...only] = process.argv.slice(2);
  const assignment = (await import(pathToFileURL(path.join(__dirname, "assignments", slug, "assignment.mjs")).href)).default;
  const profileDir = path.join(__dirname, "profiles");
  const ids = readdirSync(profileDir).filter((f) => f.endsWith(".mjs") && !f.startsWith("_")).map((f) => f.replace(/\.mjs$/, ""));
  const profiles = [];
  for (const id of ids.filter((i) => (!only.length || only.includes(i)) && (!assignment.students || assignment.students.includes(i)))) {
    profiles.push((await import(pathToFileURL(path.join(profileDir, id + ".mjs")).href)).default);
  }
  OUT = path.join(ROOT, "public", assignment.outDir || assignment.slug);
  RAW = path.join(__dirname, "raw", assignment.slug);
  const urlBase = "/" + (assignment.outDir || assignment.slug);
  mkdirSync(OUT, { recursive: true });
  mkdirSync(RAW, { recursive: true });
  const browser = await launch();
  const manifest = { course: assignment.courseCode, title: assignment.title, students: [] };
  try {
    for (const profile of profiles) {
      const student = compile(assignment, profile);
      student.L = student.layout;
      console.log("=== rendering", student.id);
      const pages = await renderStudent(browser, student);
      const specPages = pages.map((p, i) => ({
        src: p.src,
        jpg: path.join(OUT, student.id, `${String(i + 1).padStart(2, "0")}.jpg`),
        seed: p.seed,
        shots: p.shots,
      }));
      // ROLL-NAME-BATCH-ASSIGNMENT-NAME.pdf, all uppercase
      const part = (t) => String(t).replace(/\./g, "").trim().replace(/\s+/g, "_").toUpperCase();
      const fileName = [student.roll, part(student.name), part(student.batch || ""), part(assignment.title)].filter(Boolean).join("-") + ".pdf";
      rmSync(path.join(OUT, `${student.id}.pdf`), { force: true });
      const spec = { pages: specPages, pdf: path.join(OUT, fileName) };
      const specPath = path.join(RAW, `${student.id}-spec.json`);
      writeFileSync(specPath, JSON.stringify(spec));
      await runPy(specPath);
      manifest.students.push({
        id: student.id,
        name: student.name,
        roll: student.roll,
        section: student.section,
        date: student.date,
        pages: specPages.length,
        pdf: `${urlBase}/${fileName}`,
        fileName,
        images: specPages.map((_, i) => `${urlBase}/${student.id}/${String(i + 1).padStart(2, "0")}.jpg`),
      });
    }
  } finally {
    await browser.close();
  }
  writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("built:", manifest.students.map((x) => `${x.id} (${x.pages} pages)`).join(", "));
}

main().catch((err) => { console.error(err); process.exit(1); });
