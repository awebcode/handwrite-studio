/** Two distinct 8086 lab answers. Code lines: 4-space indent = instruction. */

import { code } from "../../lib/blocks.mjs";

export const aliceCode6 = code(`
.MODEL SMALL
.STACK 100H
.DATA
INFO DB 'Name: Alice Rahman', 0DH, 0AH
     DB 'ID: 220 000 0001', 0DH, 0AH
     DB 'CGPA: 3.67', '$'
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA DX, INFO
    MOV AH, 09H
    INT 21H
    MOV AH, 4CH
    INT 21H
MAIN ENDP
END MAIN
`);

export const aliceCode7 = code(`
.MODEL SMALL
.STACK 100H
.DATA
P1 DB 'Enter 1st number: $'
P2 DB 0DH, 0AH, 'Enter 2nd number: $'
P3 DB 0DH, 0AH, 'Enter 3rd number: $'
NL DB 0DH, 0AH, '$'
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA DX, P1
    MOV AH, 09H
    INT 21H
    MOV AH, 01H
    INT 21H
    MOV BL, AL
    LEA DX, P2
    MOV AH, 09H
    INT 21H
    MOV AH, 01H
    INT 21H
    MOV BH, AL
    LEA DX, P3
    MOV AH, 09H
    INT 21H
    MOV AH, 01H
    INT 21H
    MOV CL, AL
    LEA DX, NL
    MOV AH, 09H
    INT 21H
    MOV DL, BL
    MOV AH, 02H
    INT 21H
    LEA DX, NL
    MOV AH, 09H
    INT 21H
    MOV DL, BH
    MOV AH, 02H
    INT 21H
    LEA DX, NL
    MOV AH, 09H
    INT 21H
    MOV DL, CL
    MOV AH, 02H
    INT 21H
    MOV AH, 4CH
    INT 21H
MAIN ENDP
END MAIN
`);

export const aliceCode8 = code(`
.MODEL SMALL
.STACK 100H
.DATA
M1 DB 'Enter first number: $'
M2 DB 0DH, 0AH, 'Enter second number: $'
M3 DB 0DH, 0AH, 'Sum = $'
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA DX, M1
    MOV AH, 09H
    INT 21H
    MOV AH, 01H
    INT 21H
    SUB AL, 30H
    MOV BL, AL
    LEA DX, M2
    MOV AH, 09H
    INT 21H
    MOV AH, 01H
    INT 21H
    SUB AL, 30H
    ADD BL, AL
    LEA DX, M3
    MOV AH, 09H
    INT 21H
    MOV AL, BL
    MOV AH, 00H
    MOV CL, 10
    DIV CL
    MOV CH, AH
    CMP AL, 00H
    JE ONEDIG
    ADD AL, 30H
    MOV DL, AL
    MOV AH, 02H
    INT 21H
ONEDIG:
    MOV DL, CH
    ADD DL, 30H
    MOV AH, 02H
    INT 21H
    MOV AH, 4CH
    INT 21H
MAIN ENDP
END MAIN
`);

export const aliceCode9 = code(`
.MODEL SMALL
.STACK 100H
.DATA
N1 DB 'Enter first number: $'
N2 DB 0DH, 0AH, 'Enter second number: $'
N3 DB 0DH, 0AH, 'Difference = $'
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    LEA DX, N1
    MOV AH, 09H
    INT 21H
    MOV AH, 01H
    INT 21H
    SUB AL, 30H
    MOV BL, AL
    LEA DX, N2
    MOV AH, 09H
    INT 21H
    MOV AH, 01H
    INT 21H
    SUB AL, 30H
    SUB BL, AL
    LEA DX, N3
    MOV AH, 09H
    INT 21H
    ADD BL, 30H
    MOV DL, BL
    MOV AH, 02H
    INT 21H
    MOV AH, 4CH
    INT 21H
MAIN ENDP
END MAIN
`);

export const aliceCode10 = code(`
.MODEL SMALL
.STACK 100H
.DATA
S1 DB 'Before : AX = $'
S2 DB '  BX = $'
S3 DB 0DH, 0AH, 'After  : AX = $'
.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV AX, 'P'
    MOV BX, 'Q'
    LEA DX, S1
    CALL SHOW
    XCHG AX, BX
    LEA DX, S3
    CALL SHOW
    MOV AH, 4CH
    INT 21H
MAIN ENDP
SHOW PROC
    PUSH AX
    MOV AH, 09H
    INT 21H
    POP AX
    PUSH AX
    MOV DL, AL
    MOV AH, 02H
    INT 21H
    LEA DX, S2
    MOV AH, 09H
    INT 21H
    MOV DL, BL
    MOV AH, 02H
    INT 21H
    POP AX
    RET
SHOW ENDP
END MAIN
`);

export const bobCode6 = code(`
.model small
.stack 100h
.data
ln1 db 'Name : Bob Khan', 0Dh, 0Ah
    db 'ID   : 220 000 0002', 0Dh, 0Ah
    db 'CGPA : 3.42', '$'
.code
start:
    mov ax, @data
    mov ds, ax
    lea dx, ln1
    mov ah, 9
    int 21h
    mov ah, 4ch
    int 21h
end start
`);

export const bobCode7 = code(`
.model small
.stack 100h
.data
a1 db 'Input first  : $'
a2 db 0Dh, 0Ah, 'Input second : $'
a3 db 0Dh, 0Ah, 'Input third  : $'
nw db 0Dh, 0Ah, '$'
.code
start:
    mov ax, @data
    mov ds, ax
    lea dx, a1
    mov ah, 9
    int 21h
    mov ah, 1
    int 21h
    mov bl, al
    lea dx, a2
    mov ah, 9
    int 21h
    mov ah, 1
    int 21h
    mov bh, al
    lea dx, a3
    mov ah, 9
    int 21h
    mov ah, 1
    int 21h
    mov cl, al
    lea dx, nw
    mov ah, 9
    int 21h
    mov dl, bl
    mov ah, 2
    int 21h
    lea dx, nw
    mov ah, 9
    int 21h
    mov dl, bh
    mov ah, 2
    int 21h
    lea dx, nw
    mov ah, 9
    int 21h
    mov dl, cl
    mov ah, 2
    int 21h
    mov ah, 4ch
    int 21h
end start
`);

export const bobCode8 = code(`
.model small
.stack 100h
.data
q1 db 'First number  : $'
q2 db 0Dh, 0Ah, 'Second number : $'
q3 db 0Dh, 0Ah, 'Sum is $'
.code
start:
    mov ax, @data
    mov ds, ax
    lea dx, q1
    mov ah, 9
    int 21h
    mov ah, 1
    int 21h
    sub al, 30h
    mov bl, al
    lea dx, q2
    mov ah, 9
    int 21h
    mov ah, 1
    int 21h
    sub al, 30h
    add bl, al
    lea dx, q3
    mov ah, 9
    int 21h
    mov ah, 0
    mov al, bl
    mov cl, 10
    div cl
    mov bh, ah
    cmp al, 0
    je units
    add al, 30h
    mov dl, al
    mov ah, 2
    int 21h
units:
    mov dl, bh
    add dl, 30h
    mov ah, 2
    int 21h
    mov ah, 4ch
    int 21h
end start
`);

export const bobCode9 = code(`
.model small
.stack 100h
.data
r1 db 'First number  : $'
r2 db 0Dh, 0Ah, 'Second number : $'
r3 db 0Dh, 0Ah, 'Answer = $'
.code
start:
    mov ax, @data
    mov ds, ax
    lea dx, r1
    mov ah, 9
    int 21h
    mov ah, 1
    int 21h
    sub al, 30h
    mov bl, al
    lea dx, r2
    mov ah, 9
    int 21h
    mov ah, 1
    int 21h
    sub al, 30h
    sub bl, al
    lea dx, r3
    mov ah, 9
    int 21h
    add bl, 30h
    mov dl, bl
    mov ah, 2
    int 21h
    mov ah, 4ch
    int 21h
end start
`);

export const bobCode10 = code(`
.model small
.stack 100h
.data
t1 db 'Before swapping', 0Dh, 0Ah, '$'
t2 db 'AX = $'
t3 db 0Dh, 0Ah, 'BX = $'
t4 db 0Dh, 0Ah, 'After swapping', 0Dh, 0Ah, '$'
.code
start:
    mov ax, @data
    mov ds, ax
    mov ax, 'P'
    mov bx, 'Q'
    lea dx, t1
    call show
    mov cx, ax
    mov ax, bx
    mov bx, cx
    lea dx, t4
    call show
    mov ah, 4ch
    int 21h
show:
    push ax
    mov ah, 9
    int 21h
    lea dx, t2
    int 21h
    pop ax
    push ax
    mov dl, al
    mov ah, 2
    int 21h
    lea dx, t3
    mov ah, 9
    int 21h
    mov dl, bl
    mov ah, 2
    int 21h
    pop ax
    ret
end start
`);

