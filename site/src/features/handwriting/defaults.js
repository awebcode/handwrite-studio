// Defaults for a handwriting document: style, student info and header layouts.
import { uid, clone } from "../../shared/dom.js";
import { HAND } from "./engine/constants.js";

export function newStyle() {
  return {
    font: "kalam", fs: 17.8, lh: 1.76, ink: "#161616", paper: "#ffffff",
    amount: 1, handPreset: "natural", hand: clone(HAND.natural), codeHand: 0.45,
    wobble: 3.2, wobbleFreq: 0.06, fixNine: true,
    margin: { left: 2, top: true, ruled: false, x: 60, y: 88, color: "#111111", width: 2 },
    padTop: 106, padLeft: 90, padRight: 40, padBottom: 34,
    gapMin: 30, gapMax: 170, qGapMin: 16, qGapMax: 44,
    marks: { dots: 7, ticks: 0.5, scribble: 0.4, blots: 0.6, doodles: 0.3, margin: true },
    scan: { on: true, flash: 0.08, vignette: 0.085, grain: 1.5, blur: 0.32, rotate: 0.4, jpeg: 0.74 },
    pageNumbers: false, seed: 230,
  };
}

export const newMeta = () => ({
  name: "Your Full Name", roll: "0000000000", section: "A", batch: "00A", date: "01 January, 2027",
  university: "Example University", dept: "Department of CSE", course: "Course Name", code: "CSE0000000",
  term: "Fall 26", title: "Lab Assignment 1", teacher: "Teacher Name",
});

export const block = (type, o = {}) => ({ id: uid(), type, ...o });
export const text = (kind, t, o = {}) => block("text", { kind, text: t, ...o });

export const HEADER_PRESETS = { centered: "Centered", boxed: "Left + boxed title", compact: "Compact" };

export function headerBlocks(preset = "centered") {
  const h = { hdr: true };
  if (preset === "boxed") return [
    text("title", "{university}", { align: "left", boxed: true, ...h }),
    text("subtitle", "{dept}   -   {title}", { align: "left", ...h }),
    text("subtitle", "{course}", { align: "left", ...h }),
    text("meta", "Course : {code}     Semester : {term}", h), text("meta", "Name : {name}", h),
    text("meta", "Roll : {roll}       Sec : {section}", h), text("meta", "Date of submission : {date}", h),
  ];
  if (preset === "compact") return [
    text("title", "{title}", h), text("subtitle", "{course}  ({code})", h),
    text("meta", "Name : {name}          Roll : {roll}", h), text("meta", "Section : {section}          Date : {date}", h),
    block("rule", h),
  ];
  return [
    text("title", "{university}", h), text("subtitle", "{dept}", h), text("subtitle", "{title}", h), text("subtitle", "{course}", h),
    text("meta", "Course Code : {code}    {term}", h), text("meta", "Name : {name}", h),
    text("meta", "Roll : {roll}      Section : {section}", h), text("meta", "Submission Date : {date}", h),
  ];
}
