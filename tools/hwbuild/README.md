# Handwritten assignment builder

Turns typed answers into scanned-looking handwritten A4 pages + a PDF per student.

```
tools/hwbuild/
  build.mjs                 engine (render, paginate, scan effect, PDF) - rarely edited
  lib/blocks.mjs            P / L / R / TABLE / SHOT / CODE helpers for writing answers
  lib/compile.mjs           assignment + profile -> pages
  profiles/<student>.mjs    WHO writes: name, roll, date, font, ink, shakiness, margin/page design
  assignments/<name>/       WHAT is written: questions + one short answer per student
  assignments/_template/    starting point for a new assignment
```

## Run
```
npm run hw:setup                 # once: npm, python venv (pillow, numpy), chromium
npm run hw:build                 # builds the example for every profile
npm run hw:build -- example bob  # one assignment, one student
npm run hw:preview               # build, then preview at http://localhost:8080 (PDF download button)
npm run hw:preview:fast          # preview only
```

## New assignment
```
npm run hw:new -- lab2           # copies _template to assignments/lab2
# edit assignments/lab2/assignment.mjs  (questions, answers per student id, CODE(`...`), SHOT([...]))
npm run hw:build -- lab2
```

## New student
`npm run hw:new-student -- <id>` (copies `profiles/_template.mjs`), then change the details, pick a `font` (gloria | kalam),
`grade` (clean | medium), margin `layout`, and add an answer under that `<id>` in each question
(or use `default:` to share one answer). `grade` sets how shaky the hand is; `hand: { rot, dy, skew, ... }` fine-tunes it. Every line also gets a random neat/rushed mood, so no two lines look the same. Output: `public/<outDir>/<id>.pdf`.

Pages never get page numbers or running headers; only page 1 carries the title block. Each page gets a
random amount of blank paper at the bottom (`layout.gapMin/gapMax`), a slightly different tilt and offset.

## Profile settings (final set)
| setting | what it does |
|---|---|
| `font` `fs` `lh` `ink` | handwriting font (`gloria` / `kalam`), size, line height, ink colour |
| `grade` + `hand: {...}` | base shakiness; `hand` overrides `rot dy skew szLo szHi ls0 ls1 mr0 mr1 line opLo boldP` (keep `dy`/size small for steady lines) |
| `wobble` `wobbleFreq` | letter-shape roughness (higher = rougher, shakier letters) |
| `marks: {dots,ticks,scribble,blots,margin}` | stray pen dots, ticks, pen-test scribbles, thinking blots; `margin:false` = clean left margin |
| `batch` | used in the PDF name |
| `layout.rules / pad / css` | margin lines (single, double, top rule), page padding, header/section/question styling |
| `layout.gapMin gapMax` | random blank paper left at the bottom of each page |
| `layout.gapQ` | random gap above each question |
| `qLabel` `sectionNames` `shotCaption` `header` | numbering style, section titles, screenshot captions, first-page title block |

Built in for every student: no page numbers, title block on page 1 only, every handwritten 9 drawn as a
turned 6 (the fonts' own 9 looks like a "q"), a nearly empty last page is pulled back onto the page before,
octal examples use the `Q` suffix (`31Q`) so they are not mistaken for decimal.

## Output
`public/<outDir>/ROLL-NAME-BATCH-ASSIGNMENT_NAME.pdf` (uppercase), page images in `public/<outDir>/<id>/`,
and `public/<outDir>/manifest.json` lists the build for the preview page.
