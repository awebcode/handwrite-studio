// Lab Assignment 1 - questions and a short, exam-style answer for each student.
// Add another assignment by copying this folder (see tools/hwbuild/README.md).
import { P, L, R, TABLE, SHOT } from "../../lib/blocks.mjs";
import * as C from "./codes.mjs";

export default {
  slug: "example",
  students: ["alice", "bob"],   // profiles to build; omit to build every profile
  outDir: "example",
  title: "Lab Assignment 1",
  course: "Microprocessor Assembly Programming Lab",
  courseCode: "CSE0000000",
  university: "Example University",
  dept: "Department of CSE",
  term: "Fall 26",
  // question index where each section starts; the heading text comes from the student profile
  sections: [{ from: 0, key: "theory" }, { from: 5, key: "programs" }],

  questions: [
    {
      q: "Mention the types of instruction in assembly with examples.",
      a: {
        alice: [
          P("Ans. The 8086 instructions are of five types."),
          L("(i) Data transfer - copies data. MOV AX, BX ; PUSH AX ; XCHG AL, BL"),
          L("(ii) Arithmetic - ADD AL, 05H ; SUB BX, CX ; INC CX"),
          L("(iii) Logical - works on bits. AND AL, 0FH ; OR AL, BL ; NOT AX"),
          L("(iv) Control transfer - changes the flow. JMP L1 ; CALL PRINT ; LOOP L2"),
          L("(v) Processor control and string - NOP ; HLT ; MOVSB"),
        ],
        bob: [
          P("Answer: Instructions of 8086 are divided in five groups."),
          L("1. Data movement: MOV BL, AL ; PUSH AX ; XCHG AX, BX"),
          L("2. Arithmetic: ADD BX, AX ; SUB CX, 1 ; INC AL"),
          L("3. Logical: AND AL, 80H ; XOR AX, AX ; NOT BX"),
          L("4. Branch and loop: JMP EXIT ; JNZ AGAIN ; LOOP NEXT"),
          L("5. Machine control: NOP ; HLT ; CLC"),
        ],
      },
    },
    {
      q: "Describe different memory models of assembly and the need of different models.",
      a: {
        alice: [
          P("Ans. A memory model tells the assembler how much code and data a program can use."),
          L("(i) TINY - code and data in one 64 KB segment (.COM file)."),
          L("(ii) SMALL - one code segment and one data segment."),
          L("(iii) MEDIUM - many code segments, one data segment."),
          L("(iv) COMPACT - one code segment, many data segments."),
          L("(v) LARGE - many code and many data segments."),
          L("(vi) HUGE - like large, but one data item can be over 64 KB."),
          P("Need: programs differ in size, so the right model saves memory and keeps the program simple and fast."),
        ],
        bob: [
          P("Answer: Memory model decides the number of code and data segments of a program."),
          L("1. Tiny - everything inside one segment, used for .COM programs."),
          L("2. Small - one code and one data segment. We use this in lab."),
          L("3. Medium - big code but small data."),
          L("4. Compact - small code but big data."),
          L("5. Large - both code and data are big."),
          L("6. Huge - a single variable may cross 64 KB."),
          P("We need many models because small programs should not waste memory and big programs need more than 64 KB."),
        ],
      },
    },
    {
      q: "Define assembler directives and explain any three directives we have used in our assembly programs.",
      a: {
        alice: [
          P("Ans. Assembler directives are instructions to the assembler. They are not executed by the CPU and give no machine code."),
          L("(i) .MODEL SMALL - selects the memory model of the program."),
          L("(ii) .DATA - starts the data segment where variables are declared."),
          L("(iii) DB - Define Byte, reserves one byte and gives it a value. Example: A DB 5"),
        ],
        bob: [
          P("Answer: A directive is a command for the assembler, it does not run on the processor."),
          L("1. .STACK 100h - reserves 100h bytes for the stack."),
          L("2. .CODE - starts the code segment, the instructions go below it."),
          L("3. END - ends the program, the label after it is the starting point."),
        ],
      },
    },
    {
      q: "What is data size? Mention different data sizes available in assembly with the physical memory each one uses.",
      a: {
        alice: [
          P("Ans. Data size is the number of bits a variable occupies in memory. One address holds one byte."),
          TABLE([
            ["Size", "Directive", "Bits", "Memory"],
            ["Byte", "DB", "8", "1 byte"],
            ["Word", "DW", "16", "2 bytes"],
            ["Double word", "DD", "32", "4 bytes"],
            ["Quad word", "DQ", "64", "8 bytes"],
            ["Ten byte", "DT", "80", "10 bytes"],
          ]),
        ],
        bob: [
          P("Answer: Data size means how much memory a value takes. Sizes available:"),
          L("1. DB (byte) = 8 bits = 1 location"),
          L("2. DW (word) = 16 bits = 2 locations"),
          L("3. DD (double word) = 32 bits = 4 locations"),
          L("4. DQ (quad word) = 64 bits = 8 locations"),
          L("5. DT (ten byte) = 80 bits = 10 locations"),
        ],
      },
    },
    {
      q: "Write down the format of declaring user defined variables in assembly. Show examples for decimal, hexadecimal, binary and octal values.",
      a: {
        alice: [
          P("Ans. Format:   name   directive   value"),
          R("A  DB  25        ; decimal"),
          R("B  DB  19H       ; hexadecimal"),
          R("C  DB  00011001B ; binary"),
          R("D  DB  31Q       ; octal"),
          P("All four are the same value, 25."),
        ],
        bob: [
          P("Answer: variable_name  directive  initial_value"),
          R("num1 db 50        ; decimal"),
          R("num2 db 32h       ; hex"),
          R("num3 db 00110010b ; binary"),
          R("num4 db 62q       ; octal"),
          P("Each one stores 50."),
        ],
      },
    },
    {
      q: "Discuss three different input and output functions we have learned, with examples. Then write an assembly program using user defined variables whose output is my name, id and cgpa.",
      a: {
        alice: [
          P("Ans. DOS functions are called with INT 21H after putting the function number in AH."),
          L("(i) 01H - reads one character from keyboard, the ASCII code comes in AL."),
          L("(ii) 02H - prints the character that is in DL."),
          L("(iii) 09H - prints a string whose address is in DX, the string ends with '$'."),
          ...C.aliceCode6,
          SHOT(["Name: Alice Rahman", "ID: 220 000 0001", "CGPA: 3.67"]),
        ],
        bob: [
          P("Answer: Input and output is done by int 21h, the service number goes in AH."),
          L("1. Service 1 - takes one key from the keyboard, result is in AL."),
          L("2. Service 2 - shows one character from DL."),
          L("3. Service 9 - shows a string from address DX, string must end with $."),
          ...C.bobCode6,
          SHOT(["Name : Bob Khan", "ID   : 220 000 0002", "CGPA : 3.42"]),
        ],
      },
    },
    {
      q: "Write an assembly program that will take three numbers from the keyboard as input and print the numbers in the console, each on its own line.",
      a: {
        alice: [
          P("Ans. Each number is read with 01H and kept in BL, BH and CL. Then every one is printed with 02H on a new line."),
          ...C.aliceCode7,
          SHOT(["Enter 1st number: 3", "Enter 2nd number: 6", "Enter 3rd number: 2", "3", "6", "2"]),
        ],
        bob: [
          P("Answer: Three keys are read with service 1 and saved in BL, BH and CL, then printed one by one with service 2."),
          ...C.bobCode7,
          SHOT(["Input first  : 7", "Input second : 4", "Input third  : 1", "7", "4", "1"]),
        ],
      },
    },
    {
      q: "Write a program in assembly that takes two numbers from the user, adds them, and prints the result in the console.",
      a: {
        alice: [
          P("Ans. The input is an ASCII character, so 30H is subtracted to get the number. The two numbers are added. If the sum is more than 9 it is divided by 10 and both digits are printed."),
          ...C.aliceCode8,
          SHOT(["Enter first number: 4", "Enter second number: 2", "Sum = 6"]),
        ],
        bob: [
          P("Answer: Subtract 30h from both keys, add them, and divide by 10 to get the tens digit and the units digit."),
          ...C.bobCode8,
          SHOT(["First number  : 6", "Second number : 7", "Sum is 13"]),
        ],
      },
    },
    {
      q: "Write a program in assembly that takes two numbers from the user, subtracts the 2nd input from the 1st input, and prints the result.",
      a: {
        alice: [
          P("Ans. Both inputs are converted by subtracting 30H, then the second is subtracted from the first. 30H is added back before printing."),
          ...C.aliceCode9,
          SHOT(["Enter first number: 8", "Enter second number: 3", "Difference = 5"]),
        ],
        bob: [
          P("Answer: Take two keys, remove 30h, do first minus second, add 30h again and show the digit."),
          ...C.bobCode9,
          SHOT(["First number  : 9", "Second number : 2", "Answer = 7"]),
        ],
      },
    },
    {
      q: "Write a program in assembly that swaps two character values assigned in two registers. Sample: AX = 'P', BX = 'Q' becomes AX = 'Q', BX = 'P'.",
      a: {
        alice: [
          P("Ans. 'P' and 'Q' are loaded in AX and BX and printed. XCHG AX, BX swaps them and they are printed again. PUSH and POP keep AX safe while printing."),
          ...C.aliceCode10,
          SHOT(["Before : AX = P  BX = Q", "After  : AX = Q  BX = P"]),
        ],
        bob: [
          P("Answer: The swap is done without XCHG. CX holds AX, AX gets BX and BX gets CX. Push ax and pop ax protect AX while printing."),
          ...C.bobCode10,
          SHOT(["Before swapping", "AX = P", "BX = Q", "After swapping", "AX = Q", "BX = P"]),
        ],
      },
    },
  ],
};
