const $ = (id) => document.getElementById(id);
document.execCommand("defaultParagraphSeparator", false, "br");

/* ---------- default design: the same layout as the reference cover ---------- */
const SHIELD = `<svg viewBox="0 0 100 124" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="sh"><path d="M7 5H93V67C93 94 73 110 50 119C27 110 7 94 7 67Z"/></clipPath></defs><g clip-path="url(#sh)"><rect x="7" y="5" width="43" height="58" fill="#fff"/><rect x="50" y="5" width="43" height="58" fill="#4b1fd1"/><rect x="7" y="63" width="43" height="60" fill="#4b1fd1"/><rect x="50" y="63" width="43" height="60" fill="#fff"/></g><path d="M7 5H93V67C93 94 73 110 50 119C27 110 7 94 7 67Z" fill="none" stroke="#4b1fd1" stroke-width="6" stroke-linejoin="round"/><g fill="#4b1fd1"><path d="M15 22q9-6 18 0v22q-9-5-18 0zM35 22q9-6 18 0v0" opacity="0"/><path d="M14 21q10-5 18 1v21q-8-5-18-1z"/><path d="M36 22q8-6 18-1v21q-10-4-18 1z" transform="translate(-3 0)"/></g><g fill="#fff"><circle cx="71" cy="30" r="5"/><circle cx="71" cy="19" r="5"/><circle cx="71" cy="41" r="5"/><circle cx="60" cy="30" r="5"/><circle cx="82" cy="30" r="5"/></g><circle cx="71" cy="30" r="4" fill="#4b1fd1"/><g fill="#fff"><path d="M13 84q12-14 24-2l8 8q-6 8-14 4l-6-5-8 5q-6-4-4-10z"/><path d="M45 88q10-8 20 0"  opacity="0"/></g><g fill="#4b1fd1"><circle cx="72" cy="82" r="13"/><path d="M64 92l-4 20 12-6 12 6-4-20z"/></g><circle cx="72" cy="82" r="8" fill="#fff"/><circle cx="72" cy="82" r="4" fill="#4b1fd1"/></svg>`;
const SHIELD_URL = "data:image/svg+xml;utf8," + encodeURIComponent(SHIELD);

let uid = 0;
const id = () => "b" + Date.now().toString(36) + (uid++);
const T = (html, o = {}) => ({ id: id(), type: "text", html, size: 15, bold: false, italic: false, under: false, align: "center", color: "", font: "", mt: 0, mb: 0, lh: 1.25, ls: 0, ...o });

function defaults(v = {}) {
  const A = v.accent || "#0e5a6b";
  const g = (k, d) => (v[k] !== undefined && v[k] !== "" ? esc(v[k]) : d);
  const title = g("title", "Assignment 1");
  const rows = [[g("id", "0000000000"), g("name", "Your Full Name")]];
  for (let i = 2; i <= 6; i++) if (v["id" + i] || v["name" + i]) rows.push([g("id" + i, ""), g("name" + i, "")]);
  return {
    v: 1,
    page: { font: v.font || "'Times New Roman', 'Liberation Serif', Times, serif", scale: 1, padV: 62, padH: 70, just: "flex-start", frame: v.border === "1", frameW: 2, frameC: "#222222", frameI: 22, accent: A, head: v.head || "#4472c4", headInk: "#111111", row: v.row || "#dbe5f1", grid: "#8eaadb", paper: "#ffffff", zoom: v.zoom ? +v.zoom : 0.85 },
    blocks: [
      { id: id(), key: "logo", type: "logo", src: v.logo ? v.logo : "", w: 76, mb: 6, align: "center" },
      T(title, { key: "title", size: 31, bold: true, mb: 14 }),
      T(`Course Title: ${g("course", "Course Name")}<br>Course code: ${g("code", "CSE0000000")}`, { key: "course", size: 14, mb: 14 }),
      T(g("term", "Spring 2026"), { key: "term", size: 17 }),
      T(`Batch ${g("batch", "00A Day")}`, { key: "batch", size: 14, mb: 14 }),
      T(`Assignment: ${v.assignment ? g("assignment") : title}`, { key: "assignment", size: 28, bold: true, mb: 14 }),
      T(`<b>Date of Submission</b>: ${g("date", "01-01-2026")}`, { key: "date", size: 14.5, mb: 24 }),
      T("Submitted to-", { size: 14.5, bold: true, mb: 6 }),
      T(g("teacher", "Teacher Name"), { key: "teacher", size: 19, bold: true, color: A, font: "Arial, 'Liberation Sans', Helvetica, sans-serif" }),
      T(g("role", "Lecturer"), { key: "role", size: 19, color: A }),
      T(g("dept", "Department of CSE"), { key: "dept", size: 19, color: A }),
      T(g("university", "Example University"), { key: "university", size: 14, color: A }),
      T(g("city", "City, Country"), { key: "city", size: 14, color: A, mb: 24 }),
      { id: id(), type: "spacer", h: 56 },
      T("Submitted By-", { size: 14.5, bold: true, mb: 12 }),
      { id: id(), type: "table", w: 520, headSize: 13, rowSize: 19, rowH: 8, boldLast: true, mt: 0, mb: 0, headers: ["ID", "Name"], rows },
    ],
  };
}

