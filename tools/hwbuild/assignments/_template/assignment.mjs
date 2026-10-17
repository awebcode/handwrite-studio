// Copy this folder to assignments/<name>/ (or run: npm run hw:new -- <name>), then edit.
import { P, L, R, TABLE, SHOT, CODE } from "../../lib/blocks.mjs";

export default {
  slug: "newassignment",          // build name; output goes to public/<outDir or slug>/
  students: ["alice", "bob"],     // profile ids to build (omit = every profile)
  title: "Assignment 2",
  course: "Course Name",
  courseCode: "CSE0000000",
  university: "Uttara University",
  dept: "Department of CSE",
  city: "City, Country",          // shown on the cover page
  term: "Fall 26",
  instructor: "Teacher Name",       // shown on the cover page
  instructorRole: "Lecturer",
  sections: [{ from: 0, key: "theory" }],   // optional; heading text comes from each profile.sectionNames

  questions: [
    {
      q: "Write the question here (the number is added automatically).",
      a: {
        // one answer per student profile id (profiles/<id>.mjs). Use "default" for a shared answer.
        alice: [P("Ans. Short answer."), L("(i) a point"), R("a note line")],
        bob: [P("Answer: Short answer in a different wording."), L("1. a point")],
        // CODE(`...`) turns raw assembly into handwritten code lines; SHOT([...]) adds a terminal screenshot page.
      },
    },
  ],
};
