// Starter documents. Add a template by pushing { id, name, desc, make }.
import { newStyle, newMeta, headerBlocks, block, text } from "../handwriting/defaults.js";

const base = (blocks, meta = {}) => ({ v: 1, meta: { ...newMeta(), ...meta }, style: newStyle(), blocks });

const qa = (q, a, extra = []) => [text("question", q), text("answer", a), ...extra];

export const TEMPLATES = [
  {
    id: "blank", name: "Blank page", desc: "Just a header and one question.",
    make: () => base([...headerBlocks("centered"), text("question", "Q1. Write your first question here."), text("answer", "Ans. Write the answer here.")]),
  },
  {
    id: "theory", name: "Theory assignment", desc: "Questions with short answers and bullet points.",
    make: () => base([
      ...headerBlocks("centered"), text("section", "Part A  -  Theory"),
      ...qa("Q1. What is an operating system?", "Ans. An operating system manages hardware and software resources and provides services to programs.", [
        text("point", "(i) Process management - schedules the CPU."), text("point", "(ii) Memory management - allocates and frees memory."),
        text("point", "(iii) File management - stores and organises data."),
      ]),
      ...qa("Q2. Define a deadlock.", "Ans. A deadlock is a state in which processes wait for each other forever and none can proceed."),
    ], { title: "Assignment 1" }),
  },
  {
    id: "lab", name: "Lab report", desc: "Questions, program code and an output screenshot.",
    make: () => base([
      ...headerBlocks("centered"), text("section", "Part B  -  Programs"),
      text("question", "Q1. Write a program that reads one digit and prints it."),
      text("answer", "Ans. Function 01H reads a key into AL and function 02H prints the character in DL."),
      block("code", { text: ".MODEL SMALL\n.STACK 100H\n.CODE\nMAIN PROC\n    MOV AH, 01H\n    INT 21H\n    MOV DL, AL\n    MOV AH, 02H\n    INT 21H\n    MOV AH, 4CH\n    INT 21H\nMAIN ENDP\nEND MAIN" }),
      block("shot", { mode: "terminal", style: "a", lines: "7\n7", cursor: true, caption: "Output of Q1", attach: true, width: 78 }),
    ]),
  },
  {
    id: "example", name: "Full example", desc: "Header, table, code and output - a bit of everything.",
    make: () => base([
      ...headerBlocks("centered"), text("section", "Part A  -  Theory"),
      ...qa("Q1. Mention the types of instruction in assembly with examples.", "Ans. The 8086 instructions are of five types.", [
        text("point", "(i) Data transfer - copies data. MOV AX, BX ; PUSH AX ; XCHG AL, BL"),
        text("point", "(ii) Arithmetic - ADD AL, 05H ; SUB BX, CX ; INC CX"),
        text("point", "(iii) Logical - works on bits. AND AL, 0FH ; OR AL, BL ; NOT AX"),
      ]),
      ...qa("Q2. What is data size?", "Ans. Data size is the number of bits a variable occupies in memory.", [
        block("table", { rows: [["Size", "Directive", "Bits", "Memory"], ["Byte", "DB", "8", "1 byte"], ["Word", "DW", "16", "2 bytes"], ["Double word", "DD", "32", "4 bytes"]] }),
      ]),
      text("section", "Part B  -  Programs"),
      ...qa("Q3. Write a program that prints a message.", "Ans. Function 09H prints a string that ends with a dollar sign.", [
        block("code", { text: ".MODEL SMALL\n.STACK 100H\n.DATA\nMSG DB 'Hello$'\n.CODE\nMAIN PROC\n    MOV AX, @DATA\n    MOV DS, AX\n    LEA DX, MSG\n    MOV AH, 09H\n    INT 21H\n    MOV AH, 4CH\n    INT 21H\nMAIN ENDP\nEND MAIN" }),
        block("shot", { mode: "terminal", style: "b", lines: "Hello", cursor: false, caption: "Output of Q3", attach: true, width: 70 }),
      ]),
    ]),
  },
];
