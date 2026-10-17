export const A4W = 794, A4H = 1123;

export const FONTS = [
  { id: "kalam", label: "Kalam - quick print", css: "'Kalam', cursive", group: "Handwriting", nine: 0.26 },
  { id: "gloria", label: "Gloria Hallelujah - round print", css: "'Gloria', cursive", group: "Handwriting", nine: 0.07 },
  { id: "patrick", label: "Patrick Hand - neat", css: "'Patrick Hand', cursive", group: "Handwriting" },
  { id: "indie", label: "Indie Flower - casual", css: "'Indie Flower', cursive", group: "Handwriting" },
  { id: "handlee", label: "Handlee - marker", css: "'Handlee', cursive", group: "Handwriting" },
  { id: "caveat", label: "Caveat - cursive", css: "'Caveat', cursive", group: "Handwriting" },
  { id: "shadows", label: "Shadows Into Light - slim", css: "'Shadows Into Light', cursive", group: "Handwriting" },
  { id: "covered", label: "Covered By Your Grace - loose", css: "'Covered By Your Grace', cursive", group: "Handwriting" },
  { id: "reenie", label: "Reenie Beanie - scribble", css: "'Reenie Beanie', cursive", group: "Handwriting" },
  { id: "arial", label: "Arial", css: "Arial, 'Liberation Sans', Helvetica, sans-serif", group: "Standard" },
  { id: "times", label: "Times New Roman", css: "'Times New Roman', 'Liberation Serif', Times, serif", group: "Standard" },
  { id: "georgia", label: "Georgia", css: "Georgia, 'DejaVu Serif', serif", group: "Standard" },
  { id: "courier", label: "Courier New", css: "'Courier New', 'Liberation Mono', monospace", group: "Standard" },
];
export const fontOf = (id) => FONTS.find((f) => f.id === id) || FONTS[0];

export const HAND = {
  neat: { rot: 0.9, dy: 0.35, skew: 2.0, szLo: 0.97, szHi: 1.04, ls0: -0.3, ls1: 0.6, mr0: -0.8, mr1: 2.4, line: 0.45, opLo: 0.86 },
  natural: { rot: 1.15, dy: 0.42, skew: 3.8, szLo: 0.96, szHi: 1.045, ls0: -0.55, ls1: 0.9, mr0: -1.1, mr1: 2.9, line: 0.55, opLo: 0.78 },
  rough: { rot: 2.2, dy: 1.2, skew: 4.8, szLo: 0.92, szHi: 1.1, ls0: -0.7, ls1: 1.2, mr0: -1.6, mr1: 4.0, line: 1.1, opLo: 0.7 },
};

export const KINDS = [
  ["title", "Title"], ["subtitle", "Subtitle"], ["meta", "Info line"], ["section", "Section heading"],
  ["question", "Question"], ["answer", "Answer"], ["point", "Point / list item"], ["note", "Note"], ["plain", "Plain text"],
];
export const KCLASS = { title: "hdr t1", subtitle: "hdr t2", meta: "meta", section: "sec", question: "q", answer: "a", point: "a idt", note: "res", plain: "a" };
export const KEEP_WITH_NEXT = new Set(["title", "subtitle", "section", "question"]);
