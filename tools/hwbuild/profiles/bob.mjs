export default {
  id: "bob",
  name: "Bob Khan",
  roll: "2200000002",
  section: "A",
  batch: "22",
  batchLabel: "00A Day",   // shown on the cover page
  date: "2 January, 2027",

  font: "kalam", fs: 17.4, lh: 1.8, ink: "#161616",
  grade: "medium",
  hand: { rot: 1.0, dy: 0.36, skew: 3.1, szLo: 0.975, szHi: 1.035, ls0: -0.45, ls1: 0.7, mr0: -0.9, mr1: 2.4, line: 0.45, opLo: 0.82, boldP: 0 },   // about 85% as rough as alice
  marks: { dots: 2, ticks: 0, scribble: 0, blots: 0.4, margin: false },   // nothing in the left margin
  wobble: 2.7, wobbleFreq: "0.05 0.07", turb: 41, tableRot: 0.3, seed: 914,
  shotStyle: "b",

  qLabel: (n) => `${n}.`,
  sectionNames: { theory: "Written questions", programs: "Programs" },
  shotCaption: (n) => `Q${n} screen.`,
  header: (a, s) => [
    { k: "h1", t: a.university },
    { k: "h2", t: a.dept },
    { k: "h2", t: a.title.replace(/ (\d+)$/, " - $1") },
    { k: "h2", t: a.course },
    { k: "meta", t: `Course Code : ${a.courseCode}    ${a.term}` },
    { k: "meta", t: `Name : ${s.name}` },
    { k: "meta", t: `Roll : ${s.roll}      Section : ${s.section}` },
    { k: "meta", t: `Submission Date : ${s.date}` },
  ],

  layout: {
    rules: `
      linear-gradient(to right, rgba(0,0,0,0) 60px, rgba(0,0,0,.72) 60px 62px, rgba(0,0,0,0) 62px),
      linear-gradient(to bottom, rgba(0,0,0,0) 94px, rgba(0,0,0,.7) 94px 95.5px, rgba(0,0,0,0) 95.5px)`,
    pad: "114px 30px 34px 82px",
    css: `
      .hdr { text-align:center; }
      .sec { border:1.4px solid rgba(20,20,20,.75); border-radius:3px; padding:0 10px; display:inline-block; margin:15px 0 4px; }
      .q { margin-top:13px; }`,
    gapQ: [12, 38],   // random px gap before each question
    limit: 895, gapMin: 10, gapMax: 175,
  },
};
