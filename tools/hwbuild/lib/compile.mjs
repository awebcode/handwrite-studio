// assignment + student profile  ->  the flat block list and screenshot list build.mjs renders.
export function compile(assignment, profile) {
  const blocks = [...profile.header(assignment, profile)];
  const shots = [];
  const sections = assignment.sections || [];
  assignment.questions.forEach((q, i) => {
    const sec = sections.find((s) => s.from === i);
    if (sec && profile.sectionNames?.[sec.key]) blocks.push({ k: "sec", t: profile.sectionNames[sec.key] });
    blocks.push({ k: "q", t: `${profile.qLabel(i + 1)} ${q.q}` });
    for (const b of q.a[profile.id] || q.a.default || []) {
      if (b.k === "shot") {
        shots.push({ cap: profile.shotCaption(i + 1), lines: b.lines, cursor: profile.shotStyle === "a", h: 100 + 19 * b.lines.length });
      } else blocks.push(b);
    }
  });
  // place screenshots on the last pages, about 3 per page
  let page = 0, used = 0;
  for (const s of shots) {
    if (used + s.h + 40 > 800) { page++; used = 0; }
    s.page = page; used += s.h + 40;
  }
  return { ...profile, blocks, shots, pageCount: shots.length ? page + 1 : 0 };
}
