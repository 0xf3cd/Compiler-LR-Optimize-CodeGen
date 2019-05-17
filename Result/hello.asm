; nasm -f macho64 hello.s
; ld -macosx_version_min 10.7.0 -lSystem -o hello hello.o
global start

section .data
	msg:    db      "Hello, Jake!", 10
	.len:   equ     $ - msg

section .bss
    x:      resq    1

section .text

start:
    ; mov     rax, 0x2000004 ; write
    ; mov     rdi, 1 ; stdout
    ; mov     rsi, msg
    ; mov     rdx, msg.len
    ; ; mov 	ax, 0x3
    ; syscall

    mov     rax, 0x2000003 ; write
    mov     rdi, 0 ; stdout
    mov     rsi, x
    mov     rdx, 1
    ; mov 	ax, 0x3
    syscall

L:
    mov     rax, 0x2000004 ; write
    mov     rdi, 1 ; stdout
    mov     rsi, x
    mov     rdx, 1
    syscall

    mov     rax, 0x2000004 ; write
    mov     rdi, 1 ; stdout
    mov     rsi, x
    mov     rdx, 1
    syscall

    mov     rax, 0x2000001 ; exit
    mov     rdi, 0
    syscall


