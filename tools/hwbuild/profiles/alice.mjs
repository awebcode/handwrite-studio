// One student = one profile: who they are, their handwriting, and their page design.
export default {
  id: "alice",
  name: "Alice Rahman",
  roll: "2200000001",
  section: "A",
  batch: "22",
  date: "1 January, 2027",

  // handwriting
  font: "kalam", fs: 17.8, lh: 1.76, ink: "#161616",
  grade: "medium",          // key of GRADES in build.mjs (how shaky the hand is)
  hand: { rot: 1.15, dy: 0.42, skew: 3.8, szLo: 0.96, szHi: 1.045, ls0: -0.55, ls1: 0.9, mr0: -1.1, mr1: 2.9, line: 0.55, opLo: 0.78, boldP: 0 },   // steady lines, rough letter shapes
  marks: { dots: 7, ticks: 0.55, scribble: 0.45, blots: 0.75 },   // stray pen dots, ticks, pen-test scribbles per page
  wobble: 3.2, wobbleFreq: "0.06 0.08", turb: 29, tableRot: 0.4, seed: 230,
  shotStyle: "a",          // a = grey window, b = plain black terminal

  // wording
  qLabel: (n) => `Q${n}.`,
  sectionNames: { theory: "Part A  -  Theory", programs: "Part B  -  Programs" },
  shotCaption: (n) => `Output of Q${n}`,
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

  // page design
  layout: {
    rules: `
      linear-gradient(to right, rgba(0,0,0,0) 60px, rgba(0,0,0,.72) 60px 62px, rgba(0,0,0,0) 62px 67px, rgba(0,0,0,.72) 67px 69px, rgba(0,0,0,0) 69px),
      linear-gradient(to bottom, rgba(0,0,0,0) 88px, rgba(0,0,0,.72) 88px 90px, rgba(0,0,0,0) 90px)`,
    pad: "106px 40px 34px 90px",
    css: `
      .hdr { text-align:center; }
      .sec { border-bottom:1.5px solid rgba(20,20,20,.8); display:inline-block; padding-bottom:1px; }
      .q { margin-top:11px; }`,
    gapQ: [16, 44],   // random px gap before each question
    limit: 905, gapMin: 30, gapMax: 170,   // px of blank paper left at page bottom (random per page)
  },
};
