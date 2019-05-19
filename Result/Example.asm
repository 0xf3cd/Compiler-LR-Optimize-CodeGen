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
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-8]
	cmp		rcx, rdx
	jl		L0
	mov		rcx, 0
	mov		[rbp-16], rcx
	jmp		L1
L0:
	mov		rcx, 1
	mov		[rbp-16], rcx
L1:
	mov		rcx, [rbp-16]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L2
	mov		rcx, 45
	mov		[rbp-24], rcx
	mov		rcx, [rbp-24]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 0
	mov		[rbp-32], rcx
	mov		rcx, [rbp-32]
	mov		rdx, [rbp+16]
	sub		rcx, rdx
	mov		[rbp-40], rcx
	mov		rcx, [rbp-40]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
	mov		rsp, rbp
	pop		rbp
	ret
L2:
	mov		rcx, 9
	mov		[rbp-48], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-48]
	cmp		rcx, rdx
	jle		L3
	mov		rcx, 0
	mov		[rbp-56], rcx
	jmp		L4
L3:
	mov		rcx, 1
	mov		[rbp-56], rcx
L4:
	mov		rcx, [rbp-56]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L5
	mov		rcx, 48
	mov		[rbp-64], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-64]
	add		rcx, rdx
	mov		[rbp-72], rcx
	mov		rcx, [rbp-72]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rsp, rbp
	pop		rbp
	ret
L5:
	mov		rcx, 10
	mov		[rbp-80], rcx
	mov		rax, [rbp+16]
	mov		rdx, rax
	sar		rdx, 32
	mov		rcx, [rbp-80]
	idiv	rcx
	mov		[rbp-88], rax
	mov		rcx, [rbp-88]
	mov		[rbp-96], rcx
	mov		rcx, 10
	mov		[rbp-104], rcx
	mov		rcx, [rbp-104]
	mov		rdx, [rbp-96]
	imul	rcx, rdx
	mov		[rbp-112], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-112]
	sub		rcx, rdx
	mov		[rbp-120], rcx
	mov		rcx, [rbp-120]
	mov		[rbp-128], rcx
	mov		rcx, 0
	mov		[rbp-136], rcx
	mov		rcx, [rbp-96]
	mov		rdx, [rbp-136]
	cmp		rcx, rdx
	jg		L6
	mov		rcx, 0
	mov		[rbp-144], rcx
	jmp		L7
L6:
	mov		rcx, 1
	mov		[rbp-144], rcx
L7:
	mov		rcx, [rbp-144]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L8
	mov		rcx, [rbp-96]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
L8:
	mov		rcx, 9
	mov		[rbp-152], rcx
	mov		rcx, [rbp-128]
	mov		rdx, [rbp-152]
	cmp		rcx, rdx
	jle		L9
	mov		rcx, 0
	mov		[rbp-160], rcx
	jmp		L10
L9:
	mov		rcx, 1
	mov		[rbp-160], rcx
L10:
	mov		rcx, [rbp-160]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L11
	mov		rcx, 48
	mov		[rbp-168], rcx
	mov		rcx, [rbp-128]
	mov		rdx, [rbp-168]
	add		rcx, rdx
	mov		[rbp-176], rcx
	mov		rcx, [rbp-176]
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
	mov		rcx, [rbp-8]
	mov		[rbp-16], rcx
	mov		rcx, 0
	mov		[rbp-24], rcx
	mov		rcx, [rbp-24]
	mov		[rbp-32], rcx
	mov		rcx, 0
	mov		[rbp-40], rcx
	mov		rcx, [rbp-40]
	mov		[rbp-48], rcx
	call	_read
	mov		[rbp-56], rax
	mov		rcx, [rbp-56]
	mov		[rbp-64], rcx
L17:
	mov		rcx, 10
	mov		[rbp-72], rcx
	mov		rcx, [rbp-64]
	mov		rdx, [rbp-72]
	cmp		rcx, rdx
	jne		L12
	mov		rcx, 0
	mov		[rbp-80], rcx
	jmp		L13
L12:
	mov		rcx, 1
	mov		[rbp-80], rcx
L13:
	mov		rcx, [rbp-80]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L18
	mov		rcx, 45
	mov		[rbp-88], rcx
	mov		rcx, [rbp-64]
	mov		rdx, [rbp-88]
	cmp		rcx, rdx
	je		L14
	mov		rcx, 0
	mov		[rbp-96], rcx
	jmp		L15
L14:
	mov		rcx, 1
	mov		[rbp-96], rcx
L15:
	mov		rcx, [rbp-96]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L16
	mov		rcx, 1
	mov		[rbp-104], rcx
	mov		rcx, [rbp-104]
	mov		[rbp-16], rcx
	call	_read
	mov		[rbp-112], rax
	mov		rcx, [rbp-112]
	mov		[rbp-64], rcx
L16:
	mov		rcx, 10
	mov		[rbp-120], rcx
	mov		rcx, [rbp-120]
	mov		rdx, [rbp-32]
	imul	rcx, rdx
	mov		[rbp-128], rcx
	mov		rcx, [rbp-128]
	mov		[rbp-32], rcx
	mov		rcx, 48
	mov		[rbp-136], rcx
	mov		rcx, [rbp-64]
	mov		rdx, [rbp-136]
	sub		rcx, rdx
	mov		[rbp-144], rcx
	mov		rcx, [rbp-32]
	mov		rdx, [rbp-144]
	add		rcx, rdx
	mov		[rbp-152], rcx
	mov		rcx, [rbp-152]
	mov		[rbp-32], rcx
	mov		rcx, 10
	mov		[rbp-160], rcx
	mov		rcx, [rbp-160]
	mov		rdx, [rbp-48]
	imul	rcx, rdx
	mov		[rbp-168], rcx
	mov		rcx, [rbp-168]
	mov		[rbp-48], rcx
	mov		rcx, 48
	mov		[rbp-176], rcx
	mov		rcx, [rbp-64]
	mov		rdx, [rbp-176]
	sub		rcx, rdx
	mov		[rbp-184], rcx
	mov		rcx, [rbp-48]
	mov		rdx, [rbp-184]
	sub		rcx, rdx
	mov		[rbp-192], rcx
	mov		rcx, [rbp-192]
	mov		[rbp-48], rcx
	call	_read
	mov		[rbp-200], rax
	mov		rcx, [rbp-200]
	mov		[rbp-64], rcx
	jmp		L17
L18:
	mov		rcx, 0
	mov		[rbp-208], rcx
	mov		rcx, [rbp-16]
	mov		rdx, [rbp-208]
	cmp		rcx, rdx
	je		L19
	mov		rcx, 0
	mov		[rbp-216], rcx
	jmp		L20
L19:
	mov		rcx, 1
	mov		[rbp-216], rcx
L20:
	mov		rcx, [rbp-216]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L21
	mov		rax, [rbp-32]
	mov		rsp, rbp
	pop		rbp
	ret
	jmp		L22
L21:
	mov		rax, [rbp-48]
	mov		rsp, rbp
	pop		rbp
	ret
L22:
	mov		rcx, 0
	mov		[rbp-224], rcx
	mov		rax, [rbp-224]
	mov		rsp, rbp
	pop		rbp
	ret

_mul:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 72
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, 1
	mov		[rbp-16], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-16]
	cmp		rcx, rdx
	jle		L23
	mov		rcx, 0
	mov		[rbp-24], rcx
	jmp		L24
L23:
	mov		rcx, 1
	mov		[rbp-24], rcx
L24:
	mov		rcx, [rbp-24]
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
	mov		rcx, 1
	mov		[rbp-32], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-32]
	sub		rcx, rdx
	mov		[rbp-40], rcx
	mov		rcx, [rbp-40]
	mov		[rbp-48], rcx
	mov		rcx, [rbp-48]
	push	qword	rcx
	call	_mul
	add		rsp, 8
	mov		[rbp-56], rax
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-56]
	imul	rcx, rdx
	mov		[rbp-64], rcx
	mov		rcx, [rbp-64]
	mov		[rbp-8], rcx
	mov		rax, [rbp-8]
	mov		rsp, rbp
	pop		rbp
	ret
L26:
	mov		rcx, 0
	mov		[rbp-72], rcx
	mov		rax, [rbp-72]
	mov		rsp, rbp
	pop		rbp
	ret

_test:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 184
	mov		rcx, 10
	mov		[rbp-8], rcx
	mov		rcx, [rbp-8]
	mov		[rbp-16], rcx
	mov		rcx, 14
	mov		[rbp-24], rcx
	mov		rcx, [rbp-24]
	mov		[rbp-32], rcx
	mov		rcx, 100
	mov		[rbp-40], rcx
	mov		rcx, [rbp-16]
	mov		rdx, [rbp-40]
	cmp		rcx, rdx
	jl		L27
	mov		rcx, 0
	mov		[rbp-48], rcx
	jmp		L28
L27:
	mov		rcx, 1
	mov		[rbp-48], rcx
L28:
	mov		rcx, [rbp-48]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L29
	mov		rcx, 0
	mov		[rbp-56], rcx
	mov		rcx, [rbp-56]
	mov		[rbp-32], rcx
	mov		rax, [rbp-32]
	mov		rsp, rbp
	pop		rbp
	ret
	jmp		L30
L29:
	mov		rcx, 1
	mov		[rbp-64], rcx
	mov		rcx, [rbp-32]
	mov		rdx, [rbp-64]
	add		rcx, rdx
	mov		[rbp-72], rcx
	mov		rcx, [rbp-72]
	mov		[rbp-32], rcx
	mov		rax, [rbp-32]
	mov		rsp, rbp
	pop		rbp
	ret
L30:
	mov		rcx, 1
	mov		[rbp-80], rcx
	mov		rcx, 4
	mov		[rbp-88], rcx
	mov		rcx, [rbp-80]
	mov		rdx, [rbp-88]
	cmp		rcx, rdx
	jl		L31
	mov		rcx, 0
	mov		[rbp-96], rcx
	jmp		L32
L31:
	mov		rcx, 1
	mov		[rbp-96], rcx
L32:
	mov		rcx, [rbp-96]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L33
	mov		rcx, 13
	mov		[rbp-104], rcx
	mov		rcx, [rbp-104]
	mov		[rbp-112], rcx
	mov		rcx, 13
	mov		[rbp-120], rcx
	mov		rcx, [rbp-120]
	mov		[rbp-16], rcx
L33:
	mov		rcx, 4
	mov		[rbp-128], rcx
	mov		rcx, 1
	mov		[rbp-136], rcx
	mov		rcx, [rbp-128]
	mov		rdx, [rbp-136]
	cmp		rcx, rdx
	jg		L34
	mov		rcx, 0
	mov		[rbp-144], rcx
	jmp		L35
L34:
	mov		rcx, 1
	mov		[rbp-144], rcx
L35:
	mov		rcx, [rbp-144]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L36
	mov		rcx, 15
	mov		[rbp-152], rcx
	mov		rcx, [rbp-152]
	mov		[rbp-160], rcx
	mov		rcx, 14
	mov		[rbp-168], rcx
	mov		rcx, [rbp-168]
	mov		[rbp-16], rcx
	jmp		L37
L36:
	mov		rcx, 15
	mov		[rbp-176], rcx
	mov		rcx, [rbp-176]
	mov		[rbp-184], rcx
L37:
	mov		rax, [rbp-32]
	mov		rsp, rbp
	pop		rbp
	ret

_main:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 160
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, [rbp-8]
	mov		[rbp-16], rcx
L40:
	mov		rcx, 26
	mov		[rbp-24], rcx
	mov		rcx, [rbp-16]
	mov		rdx, [rbp-24]
	cmp		rcx, rdx
	jl		L38
	mov		rcx, 0
	mov		[rbp-32], rcx
	jmp		L39
L38:
	mov		rcx, 1
	mov		[rbp-32], rcx
L39:
	mov		rcx, [rbp-32]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L41
	mov		rcx, 97
	mov		[rbp-40], rcx
	mov		rcx, [rbp-40]
	mov		rdx, [rbp-16]
	add		rcx, rdx
	mov		[rbp-48], rcx
	mov		rcx, [rbp-48]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 1
	mov		[rbp-56], rcx
	mov		rcx, [rbp-16]
	mov		rdx, [rbp-56]
	add		rcx, rdx
	mov		[rbp-64], rcx
	mov		rcx, [rbp-64]
	mov		[rbp-16], rcx
	jmp		L40
L41:
	mov		rcx, 10
	mov		[rbp-72], rcx
	mov		rcx, [rbp-72]
	push	qword	rcx
	call	_print
	add		rsp, 8
	call	_readNum
	mov		[rbp-80], rax
	mov		rcx, [rbp-80]
	mov		[rbp-88], rcx
	call	_readNum
	mov		[rbp-96], rax
	mov		rcx, [rbp-96]
	mov		[rbp-104], rcx
	mov		rcx, [rbp-88]
	mov		rdx, [rbp-104]
	add		rcx, rdx
	mov		[rbp-112], rcx
	mov		rcx, [rbp-112]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
	mov		rcx, 10
	mov		[rbp-120], rcx
	mov		rcx, [rbp-120]
	push	qword	rcx
	call	_print
	add		rsp, 8
	call	_readNum
	mov		[rbp-128], rax
	mov		rcx, [rbp-128]
	mov		[rbp-136], rcx
	mov		rcx, [rbp-136]
	push	qword	rcx
	call	_mul
	add		rsp, 8
	mov		[rbp-144], rax
	mov		rcx, [rbp-144]
	push	qword	rcx
	call	_printNum
	add		rsp, 8
	mov		rcx, 10
	mov		[rbp-152], rcx
	mov		rcx, [rbp-152]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 0
	mov		[rbp-160], rcx
	mov		rax, [rbp-160]
	mov		rsp, rbp
	pop		rbp
	ret

start:
	call	_main
	mov		rax, 0x2000001
	mov		rdi, 0
	syscall

