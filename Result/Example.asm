global start

section .data

section .bss
	outv:	resq	1
	inv:	resq	1

section .text
_read:
	push	rbp
	mov		rbp, rsp
	mov		rax, 0x2000003
	mov		rdi, 0
	mov		rsi, inv
	mov		rdx, 1
	syscall
	mov		rcx, inv
	mov		rax, [rcx]
	mov		rsp, rbp
	pop		rbp
	ret

_print:
	push	rbp
	mov		rbp, rsp
	mov		rcx, outv
	mov		rdx, qword [rbp+16]
	mov		[rcx], rdx
	mov		rax, 0x2000004
	mov		rdi, 1
	mov		rsi, outv
	mov		rdx, 1
	syscall
	mov		rsp, rbp
	pop		rbp
	ret

_printNum:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 176
	mov		rcx, [rbp+16]
	mov		rdx, 0
	cmp		rcx, rdx
	jl		L0
	mov		rcx, 0
	mov		[rbp-8], rcx
	jmp		L1
L0:
	mov		rcx, 1
	mov		[rbp-8], rcx
L1:
	mov		rcx, [rbp-8]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L2
	mov		rcx, 45
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 0
	mov		rdx, [rbp+16]
	sub		rcx, rdx
	mov		[rbp-16], rcx
	mov		rcx, [rbp-16]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
	mov		rsp, rbp
	pop		rbp
	ret
L2:
	mov		rcx, [rbp+16]
	mov		rdx, 9
	cmp		rcx, rdx
	jle		L3
	mov		rcx, 0
	mov		[rbp-24], rcx
	jmp		L4
L3:
	mov		rcx, 1
	mov		[rbp-24], rcx
L4:
	mov		rcx, [rbp-24]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L5
	mov		rcx, [rbp+16]
	mov		rdx, 48
	add		rcx, rdx
	mov		[rbp-32], rcx
	mov		rcx, [rbp-32]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rsp, rbp
	pop		rbp
	ret
L5:
	mov		rax, [rbp+16]
	mov		rdx, rax
	sar		rdx, 32
	mov		rcx, 10
	idiv	rcx
	mov		[rbp-40], rax
	mov		rcx, 10
	mov		rdx, [rbp-40]
	imul	rcx, rdx
	mov		[rbp-48], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-48]
	sub		rcx, rdx
	mov		[rbp-56], rcx
	mov		rcx, [rbp-40]
	mov		rdx, 0
	cmp		rcx, rdx
	jg		L6
	mov		rcx, 0
	mov		[rbp-64], rcx
	jmp		L7
L6:
	mov		rcx, 1
	mov		[rbp-64], rcx
L7:
	mov		rcx, [rbp-64]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L8
	mov		rcx, [rbp-40]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
L8:
	mov		rcx, [rbp-56]
	mov		rdx, 9
	cmp		rcx, rdx
	jle		L9
	mov		rcx, 0
	mov		[rbp-72], rcx
	jmp		L10
L9:
	mov		rcx, 1
	mov		[rbp-72], rcx
L10:
	mov		rcx, [rbp-72]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L11
	mov		rcx, [rbp-56]
	mov		rdx, 48
	add		rcx, rdx
	mov		[rbp-80], rcx
	mov		rcx, [rbp-80]
	push	qword	rcx
	call	_print
	add		rsp, 8
L11:
	mov		rsp, rbp
	pop		rbp
	ret

_readNum:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 224
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, 0
	mov		[rbp-16], rcx
	mov		rcx, 0
	mov		[rbp-24], rcx
	call	_read
	mov		[rbp-32], rax
	mov		rcx, [rbp-32]
	mov		[rbp-40], rcx
L17:
	mov		rcx, [rbp-40]
	mov		rdx, 10
	cmp		rcx, rdx
	jne		L12
	mov		rcx, 0
	mov		[rbp-48], rcx
	jmp		L13
L12:
	mov		rcx, 1
	mov		[rbp-48], rcx
L13:
	mov		rcx, [rbp-48]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L18
	mov		rcx, [rbp-40]
	mov		rdx, 45
	cmp		rcx, rdx
	je		L14
	mov		rcx, 0
	mov		[rbp-56], rcx
	jmp		L15
L14:
	mov		rcx, 1
	mov		[rbp-56], rcx
L15:
	mov		rcx, [rbp-56]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L16
	mov		rcx, 1
	mov		[rbp-8], rcx
	call	_read
	mov		[rbp-64], rax
	mov		rcx, [rbp-64]
	mov		[rbp-40], rcx
L16:
	mov		rcx, 10
	mov		rdx, [rbp-16]
	imul	rcx, rdx
	mov		[rbp-72], rcx
	mov		rcx, [rbp-72]
	mov		[rbp-16], rcx
	mov		rcx, [rbp-40]
	mov		rdx, 48
	sub		rcx, rdx
	mov		[rbp-80], rcx
	mov		rcx, [rbp-16]
	mov		rdx, [rbp-80]
	add		rcx, rdx
	mov		[rbp-88], rcx
	mov		rcx, [rbp-88]
	mov		[rbp-16], rcx
	mov		rcx, 10
	mov		rdx, [rbp-24]
	imul	rcx, rdx
	mov		[rbp-96], rcx
	mov		rcx, [rbp-96]
	mov		[rbp-24], rcx
	mov		rcx, [rbp-40]
	mov		rdx, 48
	sub		rcx, rdx
	mov		[rbp-104], rcx
	mov		rcx, [rbp-24]
	mov		rdx, [rbp-104]
	sub		rcx, rdx
	mov		[rbp-112], rcx
	mov		rcx, [rbp-112]
	mov		[rbp-24], rcx
	call	_read
	mov		[rbp-120], rax
	mov		rcx, [rbp-120]
	mov		[rbp-40], rcx
	jmp		L17
L18:
	mov		rcx, [rbp-8]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L19
	mov		rcx, 0
	mov		[rbp-128], rcx
	jmp		L20
L19:
	mov		rcx, 1
	mov		[rbp-128], rcx
L20:
	mov		rcx, [rbp-128]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L21
	mov		rax, [rbp-16]
	mov		rsp, rbp
	pop		rbp
	ret
	jmp		L22
L21:
	mov		rax, [rbp-24]
	mov		rsp, rbp
	pop		rbp
	ret
L22:
	mov		rax, 0
	mov		rsp, rbp
	pop		rbp
	ret

_mul:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 72
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, [rbp+16]
	mov		rdx, 1
	cmp		rcx, rdx
	jle		L23
	mov		rcx, 0
	mov		[rbp-16], rcx
	jmp		L24
L23:
	mov		rcx, 1
	mov		[rbp-16], rcx
L24:
	mov		rcx, [rbp-16]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L25
	mov		rcx, [rbp+16]
	mov		[rbp-8], rcx
	mov		rax, [rbp-8]
	mov		rsp, rbp
	pop		rbp
	ret
	jmp		L26
L25:
	mov		rcx, [rbp+16]
	mov		rdx, 1
	sub		rcx, rdx
	mov		[rbp-24], rcx
	mov		rcx, [rbp-24]
	push	qword	rcx
	call	_mul
	add		rsp, 8
	mov		[rbp-32], rax
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-32]
	imul	rcx, rdx
	mov		[rbp-40], rcx
	mov		rcx, [rbp-40]
	mov		[rbp-8], rcx
	mov		rax, [rbp-8]
	mov		rsp, rbp
	pop		rbp
	ret
L26:
	mov		rax, 0
	mov		rsp, rbp
	pop		rbp
	ret

_main:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 88
	call	_readNum
	mov		[rbp-8], rax
	call	_readNum
	mov		[rbp-16], rax
	mov		rcx, [rbp-8]
	mov		rdx, [rbp-16]
	add		rcx, rdx
	mov		[rbp-24], rcx
	mov		rcx, [rbp-24]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
	mov		rcx, 10
	push	qword	rcx
	call	_print
	add		rsp, 8
	call	_readNum
	mov		[rbp-32], rax
	mov		rcx, [rbp-32]
	push	qword	rcx
	call	_mul
	add		rsp, 8
	mov		[rbp-40], rax
	mov		rcx, [rbp-40]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
	mov		rcx, 10
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rax, 0
	mov		rsp, rbp
	pop		rbp
	ret

start:
	call	_main
	mov		rax, 0x2000001
	mov		rdi, 0
	syscall

