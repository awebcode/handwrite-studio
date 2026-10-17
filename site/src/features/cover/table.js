// A table always has column names and a full grid. Blank cells stay blank and show a grey hint while editing.
const blank = (s) => !String(s ?? "").replace(/&nbsp;|\u00a0|<br>|\s/g, "").length;

/** Normalises a table block in place: at least 1 named column, every row the same width, at least 1 row. */
function fixTable(b) {
  let headers = Array.isArray(b.headers) && b.headers.length ? b.headers.slice(0, 12) : ["Column 1", "Column 2"];
  headers = headers.map((h, i) => (blank(h) ? `Column ${i + 1}` : h));
  const n = headers.length;
  let rows = Array.isArray(b.rows) && b.rows.length ? b.rows.slice(0, 40) : [[]];
  rows = rows.map((r) => Array.from({ length: n }, (_, c) => (blank(r?.[c]) ? "" : r[c])));
  return Object.assign(b, { headers, rows });
}
