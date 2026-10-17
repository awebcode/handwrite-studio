// Plain text -> document blocks. One simple convention, so any pasted notes become a formatted assignment.
//   Q1. / Q. / 1) / Question: ...   question          Ans. / Answer: ...   answer
//   # Heading                       section           - item / * item / (i) item   point
//   ```  ...  ```                   code block        a line of only ---   rule      blank line   small gap
import { block, text } from "../handwriting/defaults.js";

const RE = {
  question: /^\s*(?:q(?:uestion)?\s*\d*\s*[.:)\-]|\d+\s*[.)])\s*(.*)$/i,
  answer: /^\s*(?:ans(?:wer)?\s*[.:\-])\s*(.*)$/i,
  section: /^\s*#{1,3}\s+(.*)$/,
  point: /^\s*(?:[-*•]|\((?:[ivx]+|[a-z]|\d+)\)|[a-z]\))\s+(.*)$/i,
};

/** parseRaw(string) -> blocks[]. Indented / unmatched lines continue the previous block. */
export function parseRaw(raw) {
  const blocks = [];
  let code = null, last = null;
  const push = (b) => { blocks.push(b); last = b.type === "text" ? b : null; return b; };
  for (const line of String(raw ?? "").replace(/\r/g, "").split("\n")) {
    if (/^\s*```/.test(line)) {
      if (code) { push(block("code", { text: code.join("\n") })); code = null; } else code = [];
      continue;
    }
    if (code) { code.push(line); continue; }
    if (!line.trim()) { last = null; if (blocks.at(-1)?.type !== "spacer") push(block("spacer", { h: 10 })); continue; }
    if (/^\s*-{3,}\s*$/.test(line)) { push(block("rule")); continue; }
    let m;
    if ((m = line.match(RE.section))) push(text("section", m[1]));
    else if ((m = line.match(RE.answer))) push(text("answer", "Ans. " + m[1]));
    else if ((m = line.match(RE.question)) && /^\s*(q|\d)/i.test(line)) push(text("question", line.trim()));
    else if ((m = line.match(RE.point))) push(text("point", line.trim()));
    else if (last) last.text += "\n" + line.trim();
    else push(text("answer", line.trim()));
  }
  if (code) push(block("code", { text: code.join("\n") }));
  while (blocks.at(-1)?.type === "spacer") blocks.pop();
  return blocks.filter((b, i) => !(b.type === "spacer" && (i === 0)));
}
