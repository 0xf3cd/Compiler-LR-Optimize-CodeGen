; nasm -f macho64 func.s
; ld -macosx_version_min 10.7.0 -lSystem -o func func.o

global start

section .data
    msg:    db      "Hello, Jake!", 10
    .len:   equ     $ - msg
    char:   db      10
    x:      dq      101

section .bss
    temp:   resq    1 ; RESB, RESW, RESD, RESQ, REST, RESO, RESY and RESZ
    printv: resq    1

section .text
print:
    push    rbp
    mov     rbp, rsp
    ; sub     rsp, 8

    mov     rcx, qword [rbp+16]

    mov     rax, 0x2000004 ; write
    mov     rdi, 1 ; stdout
    mov     rsi, rcx ; msg
    mov     rdx, 1 ; msg.len
    syscall

    ; mov     rax, [rbp-8]
    mov     rsp, rbp
    pop     rbp
    ret

sum:
    push    rbp
    mov     rbp, rsp
    sub     rsp, 8

    mov     rbx, qword [rbp+16]
    mov     rcx, qword [rbp+24]
    add     rbx, rcx
    mov     [rbp-8], rbx

    mov     rax, [rbp-8]
    mov     rsp, rbp
    pop     rbp
    ret

_div:
    push    rbp
    mov     rbp, rsp
    sub     rsp, 8

    mov     rbx, qword [rbp+16]
    mov     rcx, qword [rbp+24]
    mov     rdx, rbx
    sar     rdx, 32
    mov     rax, rbx
    idiv    rcx
    mov     [rbp-8], rax

    mov     rax, [rbp-8]
    mov     rsp, rbp
    pop     rbp
    ret

start:
    ; push    rbp 
    ; mov     qword [rbp-4], 0x15
    ; mov     qword [rbp-8], 0x51
    push    qword -2;[rbp-8]
    push    qword -198;[rbp-4]
    call    _div
    add     rsp, 16
    ; pop     rbp
    
    ; mov     byte [temp], byte 97
    ; mov     [temp], ax
    mov     rcx, printv
    mov     rdx, 97
    mov     [rcx], rdx

    mov     rax, 0x2000004 ; write
    mov     rdi, 1 ; stdout
    mov     rsi, printv; x ; msg
    mov     rdx, 1 ; msg.len
    syscall

    mov     rcx, temp
    mov     rdx, 10
    mov     [rcx], rdx

    mov     rax, 0x2000004 ; write
    mov     rdi, 1 ; stdout
    mov     rsi, temp ; msg
    mov     rdx, 1 ; msg.len
    syscall

    mov     rax, 0x2000001 ; exit
    mov     rdi, 0
    syscall


