global start

section .data
	tmp0:	dq	13
	tmp1:	dq	9
	tmp2:	dq	4
	tmp3:	dq	59
	tmp34:	dq	13
	tmp35:	dq	98
	tmp36:	dq	9
	tmp37:	dq	4
	tmp41:	dq	-20
	_c:		dq	0

section .bss
	_aa:	resq	1
	tmp4:	resq	1
	tmp5:	resq	1
	_bb:	resq	1
	tmp38:	resq	1
	tmp39:	resq	1
	tmp40:	resq	1
	_a:		resq	1
	_b:		resq	1
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

_calcSum:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 88
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, [rbp-8]
	mov		[rbp-16], rcx
	mov		rcx, [rbp+16]
	mov		[rbp-24], rcx
L2:
	mov		rcx, [rbp-24]
	mov		rdx, [rbp+24]
	cmp		rcx, rdx
	jbe		L0
	mov		rcx, 0
	mov		[rbp-32], rcx
	jmp		L1
L0:
	mov		rcx, 1
	mov		[rbp-32], rcx
L1:
	mov		rcx, [rbp-32]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L3
	mov		rcx, [rbp-24]
	mov		rdx, [rbp+24]
	imul	rcx, rdx
	mov		[rbp-40], rcx
	mov		rcx, [rbp-40]
	mov		[rbp-48], rcx
	mov		rcx, [rbp-16]
	mov		rdx, [rbp-24]
	add		rcx, rdx
	mov		[rbp-56], rcx
	mov		rcx, [rbp-56]
	mov		[rbp-16], rcx
	mov		rcx, 1
	mov		[rbp-64], rcx
	mov		rcx, [rbp-24]
	mov		rdx, [rbp-64]
	add		rcx, rdx
	mov		[rbp-72], rcx
	mov		rcx, [rbp-72]
	mov		[rbp-24], rcx
	jmp		L2
L3:
	mov		rcx, 2
	mov		[rbp-80], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-80]
	imul	rcx, rdx
	mov		[rbp-88], rcx
	mov		rcx, [rbp-88]
	mov		[rbp+24], rcx
	mov		rax, [rbp-16]
	mov		rsp, rbp
	pop		rbp
	ret

_plusOne:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 16
	mov		rcx, 1
	mov		[rbp-8], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-8]
	add		rcx, rdx
	mov		[rbp-16], rcx
	mov		rax, [rbp-16]
	mov		rsp, rbp
	pop		rbp
	ret

_minusOne:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 16
	mov		rcx, 1
	mov		[rbp-8], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-8]
	sub		rcx, rdx
	mov		[rbp-16], rcx
	mov		rax, [rbp-16]
	mov		rsp, rbp
	pop		rbp
	ret

_multiply:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 16
	mov		rcx, [rbp+16]
	mov		rdx, [rbp+24]
	imul	rcx, rdx
	mov		[rbp-8], rcx
	mov		rcx, [rbp-8]
	mov		[rbp-16], rcx
	mov		rax, [rbp-16]
	mov		rsp, rbp
	pop		rbp
	ret

_nothing:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 152
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, [rbp+16]
	mov		rdx, [rbp+24]
	sub		rcx, rdx
	mov		[rbp-16], rcx
	mov		rax, [rbp+24]
	mov		rdx, rax
	sar		rdx, 32
	mov		rcx, [rbp-16]
	idiv	rcx
	mov		[rbp-24], rax
	mov		rcx, [rbp+16]
	mov		rdx, [rbp-24]
	imul	rcx, rdx
	mov		[rbp-32], rcx
	mov		rcx, [rbp-32]
	mov		[rbp-8], rcx
	mov		rcx, 13
	mov		[rbp-40], rcx
	mov		rcx, [rbp-8]
	mov		rdx, [rbp-40]
	cmp		rcx, rdx
	jg		L4
	mov		rcx, 0
	mov		[rbp-48], rcx
	jmp		L5
L4:
	mov		rcx, 1
	mov		[rbp-48], rcx
L5:
	mov		rcx, [rbp-48]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L6
	mov		rcx, 1
	mov		[rbp-56], rcx
	mov		rcx, [rbp-8]
	mov		rdx, [rbp-56]
	add		rcx, rdx
	mov		[rbp-64], rcx
	mov		rcx, [rbp-64]
	mov		[rbp-72], rcx
	jmp		L7
L6:
	mov		rcx, 1
	mov		[rbp-80], rcx
	mov		rcx, [rbp-8]
	mov		rdx, [rbp-80]
	sub		rcx, rdx
	mov		[rbp-88], rcx
	mov		rcx, [rbp-88]
	mov		[rbp-96], rcx
L7:
	mov		rcx, 13
	mov		[rbp-104], rcx
	mov		rcx, [rbp-8]
	mov		rdx, [rbp-104]
	cmp		rcx, rdx
	jb		L8
	mov		rcx, 0
	mov		[rbp-112], rcx
	jmp		L9
L8:
	mov		rcx, 1
	mov		[rbp-112], rcx
L9:
	mov		rcx, [rbp-112]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L10
	mov		rcx, 2
	mov		[rbp-120], rcx
	mov		rcx, [rbp-8]
	mov		rdx, [rbp-120]
	add		rcx, rdx
	mov		[rbp-128], rcx
	mov		rcx, [rbp-128]
	mov		[rbp-136], rcx
L10:
	mov		rcx, 1
	mov		[rbp-144], rcx
	mov		rcx, [rbp+24]
	mov		rdx, [rbp-144]
	add		rcx, rdx
	mov		[rbp-152], rcx
	mov		rcx, [rbp-152]
	mov		[rbp+16], rcx
	mov		rsp, rbp
	pop		rbp
	ret

_main:
	push	rbp
	mov		rbp, rsp
	sub		rsp, 264
	mov		rcx, 0
	mov		[rbp-8], rcx
	mov		rcx, 0
	mov		[rbp-16], rcx
	mov		rcx, -13
	mov		[rbp-24], rcx
	mov		rcx, [rbp-24]
	mov		rbx, _b
	mov		rdx, [rbx]
	add		rcx, rdx
	mov		[rbp-32], rcx
	mov		rcx, [rbp-32]
	mov		[rbp-8], rcx
	mov		rcx, 15
	mov		[rbp-40], rcx
	mov		rcx, [rbp-40]
	mov		rbx, _c
	mov		rdx, [rbx]
	add		rcx, rdx
	mov		[rbp-48], rcx
	mov		rcx, [rbp-48]
	mov		[rbp-16], rcx
	mov		rcx, [rbp-16]
	push	qword	rcx
	mov		rcx, [rbp-8]
	push	qword	rcx
	call	_multiply
	add		rsp, 16
	mov		[rbp-56], rax
	mov		rcx, [rbp-56]
	mov		[rbp-16], rcx
	mov		rcx, [rbp-8]
	push	qword	rcx
	call	_plusOne
	add		rsp, 8
	mov		[rbp-64], rax
	mov		rcx, [rbp-64]
	mov		[rbp-8], rcx
	mov		rcx, [rbp-16]
	push	qword	rcx
	call	_minusOne
	add		rsp, 8
	mov		[rbp-72], rax
	mov		rcx, [rbp-72]
	mov		[rbp-16], rcx
	mov		rcx, [rbp-16]
	push	qword	rcx
	mov		rcx, [rbp-8]
	push	qword	rcx
	call	_calcSum
	add		rsp, 16
	mov		[rbp-80], rax
	mov		rcx, [rbp-80]
	mov		[rbp-88], rcx
	mov		rcx, 1
	mov		[rbp-96], rcx
	mov		rcx, 3
	mov		[rbp-104], rcx
	mov		rcx, [rbp-96]
	push	qword	rcx
	mov		rcx, [rbp-104]
	push	qword	rcx
	call	_nothing
	add		rsp, 16
	call	_read
	mov		[rbp-112], rax
	mov		rcx, [rbp-112]
	mov		[rbp-120], rcx
	mov		rcx, 0
	mov		[rbp-128], rcx
	mov		rcx, [rbp-128]
	mov		[rbp-136], rcx
L17:
	mov		rcx, 10
	mov		[rbp-144], rcx
	mov		rcx, [rbp-136]
	mov		rdx, [rbp-144]
	cmp		rcx, rdx
	jb		L11
	mov		rcx, 0
	mov		[rbp-152], rcx
	jmp		L12
L11:
	mov		rcx, 1
	mov		[rbp-152], rcx
L12:
	mov		rcx, [rbp-152]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L18
	mov		rcx, [rbp-120]
	mov		rdx, [rbp-136]
	add		rcx, rdx
	mov		[rbp-160], rcx
	mov		rcx, [rbp-160]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 1
	mov		[rbp-168], rcx
	mov		rcx, [rbp-136]
	mov		rdx, [rbp-168]
	add		rcx, rdx
	mov		[rbp-176], rcx
	mov		rcx, [rbp-120]
	mov		rdx, [rbp-176]
	add		rcx, rdx
	mov		[rbp-184], rcx
	mov		rcx, [rbp-184]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 2
	mov		[rbp-192], rcx
	mov		rcx, [rbp-136]
	mov		rdx, [rbp-192]
	add		rcx, rdx
	mov		[rbp-200], rcx
	mov		rcx, [rbp-120]
	mov		rdx, [rbp-200]
	add		rcx, rdx
	mov		[rbp-208], rcx
	mov		rcx, [rbp-208]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 97
	mov		[rbp-216], rcx
	mov		rcx, [rbp-120]
	mov		rdx, [rbp-216]
	cmp		rcx, rdx
	jg		L13
	mov		rcx, 0
	mov		[rbp-224], rcx
	jmp		L14
L13:
	mov		rcx, 1
	mov		[rbp-224], rcx
L14:
	mov		rcx, [rbp-224]
	mov		rdx, 0
	cmp		rcx, rdx
	je		L15
	mov		rcx, 10
	mov		[rbp-232], rcx
	mov		rcx, [rbp-232]
	push	qword	rcx
	call	_print
	add		rsp, 8
	jmp		L16
L15:
	mov		rcx, 88
	mov		[rbp-240], rcx
	mov		rcx, [rbp-240]
	push	qword	rcx
	call	_print
	add		rsp, 8
	mov		rcx, 10
	mov		[rbp-248], rcx
	mov		rcx, [rbp-248]
	push	qword	rcx
	call	_print
	add		rsp, 8
L16:
	mov		rcx, 1
	mov		[rbp-256], rcx
	mov		rcx, [rbp-136]
	mov		rdx, [rbp-256]
	add		rcx, rdx
	mov		[rbp-264], rcx
	mov		rcx, [rbp-264]
	mov		[rbp-136], rcx
	jmp		L17
L18:
	mov		rax, [rbp-88]
	mov		rsp, rbp
	pop		rbp
	ret

start:
	mov		rbx, tmp0
	mov		rcx, [rbx]
	mov		rbx, _aa
	mov		[rbx], rcx
	mov		rbx, tmp2
	mov		rcx, [rbx]
	mov		rbx, tmp3
	mov		rdx, [rbx]
	imul	rcx, rdx
	mov		rbx, tmp4
	mov		[rbx], rcx
	mov		rbx, tmp1
	mov		rax, [rbx]
	mov		rdx, rax
	sar		rdx, 32
	mov		rbx, tmp4
	mov		rcx, [rbx]
	idiv	rcx
	mov		rbx, tmp5
	mov		[rbx], rax
	mov		rbx, tmp5
	mov		rcx, [rbx]
	mov		rbx, _bb
	mov		[rbx], rcx
	mov		rbx, tmp36
	mov		rax, [rbx]
	mov		rdx, rax
	sar		rdx, 32
	mov		rbx, tmp37
	mov		rcx, [rbx]
	idiv	rcx
	mov		rbx, tmp38
	mov		[rbx], rax
	mov		rbx, tmp35
	mov		rax, [rbx]
	mov		rdx, rax
	sar		rdx, 32
	mov		rbx, tmp38
	mov		rcx, [rbx]
	idiv	rcx
	mov		rbx, tmp39
	mov		[rbx], rax
	mov		rbx, tmp34
	mov		rcx, [rbx]
	mov		rbx, tmp39
	mov		rdx, [rbx]
	imul	rcx, rdx
	mov		rbx, tmp40
	mov		[rbx], rcx
	mov		rbx, tmp40
	mov		rcx, [rbx]
	mov		rbx, _a
	mov		[rbx], rcx
	mov		rbx, tmp41
	mov		rcx, [rbx]
	mov		rbx, _b
	mov		[rbx], rcx
	call	_main
	mov		rax, 0x2000001
	mov		rdi, 0
	syscall

