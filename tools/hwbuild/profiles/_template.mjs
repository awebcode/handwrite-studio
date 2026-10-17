// Copy to profiles/<id>.mjs (or run: npm run hw:new-student -- <id>) and edit. Files starting with "_" are ignored.
export default {
  id: "newstudent",
  name: "Full Name",
  roll: "0000000000",
  section: "A",
  batchLabel: "00A Day",   // shown on the cover page
  batch: "225",
  date: "1 January, 2027",

  font: "gloria", fs: 20.2, lh: 1.66, ink: "#171717",
  grade: "clean",            // clean | medium (how shaky); override single values with hand: { rot: 2, skew: 3 }
  // hand: { rot: 2.0, opLo: 0.8, boldP: 0.08 },   // boldP = share of words pressed harder (thicker)
  // marks: { dots: 4, ticks: 0.3, scribble: 0.2, blots: 0.5, margin: true },   // margin:false keeps the left margin clean; random pen dots / ticks / scribbles per page
  // wobbleFreq: "0.055 0.075",   // higher = rougher, shakier letter shapes
  wobble: 1.6, turb: 11, tableRot: -0.22, seed: 101,
  shotStyle: "b",

  qLabel: (n) => `${n}.`,
  sectionNames: { theory: "Written questions", programs: "Programs" },
  shotCaption: (n) => `Q${n} screen.`,
  header: (a, s) => [
    { k: "h1", t: a.university },
    { k: "h2", t: `Dept. of CSE   -   ${a.title}` },
    { k: "h2", t: a.course },
    { k: "meta", t: `Course : ${a.courseCode}     Semester : ${a.term}` },
    { k: "meta", t: `Name : ${s.name}` },
    { k: "meta", t: `Roll : ${s.roll}       Sec : ${s.section}` },
    { k: "meta", t: `Date of submission : ${s.date.replace(",", "")}` },
  ],

  layout: {
    rules: `
      linear-gradient(to right, rgba(0,0,0,0) 60px, rgba(0,0,0,.72) 60px 62px, rgba(0,0,0,0) 62px),
      linear-gradient(to bottom, rgba(0,0,0,0) 94px, rgba(0,0,0,.7) 94px 95.5px, rgba(0,0,0,0) 95.5px)`,
    pad: "114px 30px 34px 82px",
    css: `
      .hdr { text-align:left; }
      .t1 { border:1.6px solid rgba(20,20,20,.8); padding:2px 14px; display:inline-block; margin-top:2px; }
      .t2 { margin-left:4px; }
      .meta { margin-left:4px; }
      .sec { border:1.4px solid rgba(20,20,20,.75); border-radius:3px; padding:0 10px; display:inline-block; margin:15px 0 4px; }
      .q { margin-top:13px; padding-left:11px; border-left:2.5px solid rgba(20,20,20,.5); }
      .a { padding-left:11px; }`,
    // gapQ: [14, 36],   // random px gap before each question
    limit: 895, gapMin: 10, gapMax: 285,
  },
};
