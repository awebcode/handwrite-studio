# ai-hand-writing-generator

Turn typed assignment answers into **realistic handwritten, scanned-looking A4 pages** and a print-ready **PDF per student** - with different handwriting, margins and page design for every student.

Write the questions and answers once in plain JavaScript, describe each student in a small profile, run one command, and get:

- a PDF named `ROLL-NAME-BATCH-ASSIGNMENT_NAME.pdf` (all uppercase)
- the page images (JPG, 1240x1754 = 150 dpi A4)
- a web preview with a **Download as PDF** button

| Student A | Student B | Output screenshots |
|---|---|---|
| ![A](docs/sample-alice.jpg) | ![B](docs/sample-bob.jpg) | ![out](docs/sample-output.jpg) |

*(The sample students "Alice" and "Bob" are made up.)*

## Features

- **Natural handwriting**: Gloria Hallelujah / Kalam fonts with per-word tilt, size and spacing, a pen "wobble" filter, uneven line pressure, stray pen dots, ticks and blots.
- **Scanner look**: flash, vignette, grain and slight page rotation, then a JPEG-compressed PDF.
- **Realistic layout**: top margin like a notebook, single or double margin lines, random blank space at the bottom of each page, uneven gaps between questions, no page numbers, title block on page 1 only.
- **Terminal screenshots**: black "emulator" windows (two styles) with your program output, placed on the last pages.
- **Handwritten digits fixed**: the fonts' own `9` looks like a `q`, so every 9 is drawn as a turned 6.
- **Reusable**: assignments, students and styling are separate files; add either without touching the engine.

## Requirements

- Node.js 20+ and npm
- Python 3 (with `venv`) - for the scanner effect and PDF (Pillow, NumPy)
- Chromium (installed by Playwright)

## Quick start

```bash
git clone https://github.com/awebcode/ai-hand-writting-generator.git
cd ai-hand-writting-generator
npm run hw:setup        # once: npm install, python venv (pillow, numpy), chromium
npm run hw:preview      # builds the example, then serves the preview on http://localhost:8080
```

Other commands:

```bash
npm run hw:build                    # build the example assignment
npm run hw:build -- example alice   # one assignment, one student
npm run hw:new -- lab2              # new assignment from the template
npm run hw:new-student -- carol     # new student profile from the template
HW_ASSIGNMENT=lab2 npm run hw:preview
```

Output goes to `public/<outDir>/` (PDFs and `<student>/NN.jpg`). The preview page lists the last build.

## Project layout

```
tools/hwbuild/
  build.mjs                 engine: render, paginate, scan effect, PDF
  scanify.py                scanner effect + JPEG PDF writer
  lib/blocks.mjs            helpers: P, L, R, TABLE, SHOT, CODE
  lib/compile.mjs           assignment + profile -> pages
  profiles/<student>.mjs    who writes: details, handwriting, page design
  assignments/<name>/       what is written: questions + one answer per student
  assignments/_template/    copy this for a new assignment
  profiles/_template.mjs    copy this for a new student
  preview.mjs               tiny dependency-free preview server
  fonts/                    Gloria Hallelujah, Kalam, VT323 (SIL OFL)
preview/index.html          preview page (student tabs, page images, Download as PDF)
```

## Write an assignment

```js
// tools/hwbuild/assignments/lab2/assignment.mjs
import { P, L, R, TABLE, SHOT, CODE } from "../../lib/blocks.mjs";

export default {
  slug: "lab2", title: "Lab Assignment 2", course: "Course Name", courseCode: "CSE0000000",
  university: "Example University", dept: "Department of CSE", term: "Fall 26",
  students: ["alice", "bob"],
  sections: [{ from: 0, key: "theory" }],
  questions: [
    {
      q: "What is an assembler directive?",          // numbering is added automatically
      a: {
        alice: [P("Ans. A message to the assembler."), L("(i) .DATA - starts the data segment")],
        bob:   [P("Answer: A command for the assembler."), L("1. .CODE - starts the code segment")],
        // CODE(`...`) -> handwritten code, SHOT(["line 1", "line 2"]) -> terminal screenshot
      },
    },
  ],
};
```

Use `default:` instead of a student id to share one answer between students.

## Add a student

`npm run hw:new-student -- <id>` then edit `profiles/<id>.mjs`:

| setting | what it does |
|---|---|
| `name` `roll` `section` `batch` `date` | printed in the header and the PDF name |
| `font` `fs` `lh` `ink` | `gloria` or `kalam`, size, line height, ink colour |
| `grade` + `hand: {...}` | base shakiness (`clean`/`medium`); override `rot dy skew szLo szHi ls0 ls1 mr0 mr1 line opLo boldP` |
| `wobble` `wobbleFreq` | letter-shape roughness (higher = rougher) |
| `marks: {dots, ticks, scribble, blots, margin}` | stray pen dots, ticks, scribbles, blots; `margin:false` = clean left margin |
| `layout.rules / pad / css` | margin lines, page padding, header/section/question styling |
| `layout.gapMin gapMax gapQ` | random blank paper at page bottom; random gap above each question |
| `qLabel` `sectionNames` `shotCaption` `header` | numbering style, section titles, screenshot captions, title block |
| `shotStyle` | `a` grey window, `b` black terminal |

## Privacy

Real student data (names, roll numbers), source attachments, generated PDFs and page images are **git-ignored** - keep real assignments in `tools/hwbuild/assignments/<name>/` and `profiles/<id>.mjs` locally. Only the made-up `example` assignment is committed.

## Notes

- The preview is a single static page served by a 40-line Node script; the generator itself only needs Node, Python and Chromium.
- Set `PORT=3000` to change the preview port, or `CHROME_PATH` to use an existing Chromium.
- Use it for practice, demos and design experiments. Submitting generated work as your own where handwriting or original work is required may break your school's rules.

## License

MIT for the code. The bundled fonts are licensed under the SIL Open Font License.
