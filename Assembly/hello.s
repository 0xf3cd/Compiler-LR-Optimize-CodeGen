; nasm -f macho64 hello.s
; ld -macosx_version_min 10.7.0 -lSystem -o hello hello.o

section .data
	msg:    db      "Hello, Jake!", 10
	.len:   equ     $ - msg

global start

section .text

start:
    mov     rax, 0x2000004 ; write
    mov     rdi, 1 ; stdout
    mov     rsi, msg
    mov     rdx, msg.len
    ; mov 	ax, 0x3
    syscall

    mov     rax, 0x2000001 ; exit
    mov     rdi, 0
    syscall


