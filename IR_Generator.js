// 中间代码生成类
const fs = require('fs');
const Node = require('./IR_Node.js');
const FuncTable = require('./FuncSymbolTable.js');
const VarTable = require('./VarSymbolTable.js');
const representFloat = require('./RepresentFloat.js').representFloat;

// 工具函数
/**
 * deepCopy 函数说明: 进行深拷贝，将 oldObject 深拷贝至 newObject
 * 可以对传入参数中的数组和对象递归进行深拷贝
 * @param {any} oldObject
 * @return {Object}: 一个值与 oldObject 相同的对象
 */
const deepCopy = function(oldObject) {
	if(typeof(oldObject) !== 'object' && Array.isArray(oldObject) !== true) {
		return oldObject;
	}
	let newObject;

	if(Array.isArray(oldObject)) {
		newObject = new Array();
		for(let each of oldObject) {
			if(typeof(each) === 'object' || Array.isArray(each)) {
				newObject.push(deepCopy(each));
			} else {
				newObject.push(each);
			}
		}
	} else {
		newObject = new Object();
		for(let each in oldObject) {
			if(oldObject[each] === null || oldObject[each] === undefined) {
				newObject[each] = oldObject[each];
			} else if(typeof(oldObject[each]) === 'object' && !oldObject[each].length) {
				newObject[each] = deepCopy(oldObject[each]);
			} else {
				newObject[each] = oldObject[each];
			}
		}
	}
	
	return newObject;
};

/**
 * 判断一个字符串中是否有字母
 * @param {string} input
 * @return {boolean}
 */
const hasLetter = function(input) {
    for(let each of input) {
        if(each >= 'A' && each <= 'Z') {
            return true;
        } else if(each >= 'a' && each <= 'z') {
            return true;
        }
    }
    return false;
};



/**
 * 临时变量分配机构
 * @class
 */
class TempAllocator {
	constructor() {
        /**
         * 记录当前分配临时变量的编号
         */
		this._count = 0;
	}
}

/**
 * 临时变量分配机构复位
 * @public
 */
TempAllocator.prototype.reset = function() {
    this._count = 0;
};

/** 
 * 获取一个临时变量名
 * @public
 * @return {string}
 */
TempAllocator.prototype.getNewTemp = function() {
    const varName = `tmp${this._count}`;
    this._count++;
    return varName;
}

const TA = new TempAllocator();



/** 
 * 标签名分配机构
 * @class
 */
class LabelAllocator {
	constructor() {
        /**
         * 记录当前分配标签的编号
         */
		this._count = 0;
	}
}

/**
 * 标签名分配机构复位
 * @public
 */
LabelAllocator.prototype.reset = function() {
    this._count = 0;
};

/** 
 * 获取一个标签名
 * @public
 * @return {string}
 */
LabelAllocator.prototype.getNewLabel = function() {
    const labelName = `L${this._count}`;
    this._count++;
    return labelName;
}

const LA = new LabelAllocator();



/**
 * 以下的函数分别对应 58 条产生式
 * 为规约每一条产生式时，需要进行的语义动作
 * 由于 js 的语法缺陷，如果直接将这些函数成为成员变量，则会有 this 指针指向混乱的情况
 * 所以单列成 58 个函数，作为中间代码生成器类中成员 _allFuncs 数组的成员
 * @param right {Array.<Node>} 产生式右部
 * @param VST {VarTable} 符号表
 * @param FST {FuncTable} 函数表
 * @return {Node}
 */
const f1 = function(right, VST, FST) {
    // S' -> S $ 1
    const S_ = new Node();
    const S = deepCopy(right[0]);

    S_.IR = S.IR;

    return S_;
};

const f2 = function(right, VST, FST) {
    // S -> <Body> $ 2
    const S = new Node();
    const B = deepCopy(right[0]);

    S.IR = B.IR;

    return S;
};

const f3 = function(right, VST, FST) {
    // S -> <Body> S $ 3
    const S1 = new Node();
    const B = deepCopy(right[0]);
    const S2 = deepCopy(right[1]);

    S1.IR = B.IR;
    S1.IR = S1.IR.concat(S2.IR);

    return S1;
};

const f4 = function(right, VST, FST) {
    // <Body> -> <Decl> $ 4
    const B = new Node();
    const D = deepCopy(right[0]);

    B.IR = D.IR;

    return B;
};

const f5 = function(right, VST, FST) {
    // <Decl> -> <VarDecl> $ 5
    const D = new Node();
    const VD = deepCopy(right[0]);

    D.IR = VD.IR;
    // const allIR = D.IR.split('\n');
    // allIR.pop(); // 除去最后的空字符串
    // const l2 = allIR.pop();
    // const l1 = allIR.pop(); // 得到末尾三句中间代码，即局部性的变量申明和赋值语句

    // const varValue = l2.split(' ')[2].split(',')[0]; // 按照语法规范，这一部分是变量的值，语法规定这一部分只能是常数（全局变量必须为常数）
    // if(hasLetter(varValue) === NaN) { // 说明全局变量不为常数
    //     const errorInfo = `Global var must be declared as constant, ${varValue} is valid`;
    //     throw new Error(errorInfo);
    // }
    // // 否则说明声明时指定为常数了
    // const varName = l1.split(' ')[0].split('%')[1]; // 操作中间代码可以得到变量名（没有利用继承属性传上了）
    // const varType = VST.getVarType(varName);
    // VST.setGlobal(varName); // 将变量设为全局的
    // allIR.push(`@${varName} = global ${varType === 'int'? 'i32': 'float'} ${varValue}`);
    // //至此，成功将局部变量提升为全局变量，并修改其中间代码形式为符合 LLVM 的形式
    
    // D.IR = ''; //中间代码清零
    // for(let each of allIR) {
    //     D.IR += each.toString() + '\n';
    // }

    return D;
};

const f6 = function(right, VST, FST) {
    // <Decl> -> <FuncDecl> $ 6
    const D = new Node();
    const FD = deepCopy(right[0]);

    D.IR = FD.IR;

    return D;
};

const f7 = function(right, VST, FST) {
    // <VarDecl> -> int ID ; $ 7
    const VD = new Node();
    const ID = deepCopy(right[1]);

    if(VST.hasVar(ID.val)) {
        const errorInfo = 'Another var that has the same name declared';
        throw new Error(errorInfo);
    }
    if(FST.getReturnType(ID.val) !== null) {
        const errorInfo = 'A function that has the same name declared';
        throw new Error(errorInfo);
    }

    VST.append(ID.val, 'int');

    VD.IR.push(['assign', 0, '', ID.val]);

    return VD;
};

const f8 = function(right, VST, FST) {
    // <VarDecl> -> int ID = <Exprsn> ; $ 8
    const VD = new Node();
    const ID = deepCopy(right[1]);
    const E = deepCopy(right[3]);

    if(E.valType !== 'int') {
        const errorInfo = 'Assign a value of float to a var of int';
        throw new Error(errorInfo);
    }
    if(VST.hasVar(ID.val)) {
        const errorInfo = 'Another var that has the same name declared';
        throw new Error(errorInfo);
    }
    if(FST.getReturnType(ID.val) !== null) {
        const errorInfo = 'A function that has the same name declared';
        throw new Error(errorInfo);
    }

    VST.append(ID.val, 'int');

    VD.IR = E.IR;
    VD.IR.push(['assign', E.val, '', ID.val]);

    return VD;
};

const f9 = function(right, VST, FST) {
    // <VarDecl> -> float ID ; $ 9
    throw new Error('Not support float');
    // const VD = new Node();
    // const ID = deepCopy(right[1]);

    // if(VST.hasVar(ID.val)) {
    //     const errorInfo = 'Another var that has the same name declared';
    //     throw new Error(errorInfo);
    // }
    // if(FST.getReturnType(ID.val) !== null) {
    //     const errorInfo = 'A function that has the same name declared';
    //     throw new Error(errorInfo);
    // }

    // VST.append(ID.val, 'float');

    // // const newTemp1 = TA.getNewTemp(); // 指针
    // const varType = 'float';
    // const storeVal = representFloat('0.0');

    // VD.IR += `%${ID.val} = alloca ${varType}\n`;
    // VD.IR += `store ${varType} ${storeVal}, ${varType}* %${ID.val}\n`;
    // // VD.IR += `%${ID.val} = load ${varType}, ${varType}* ${newTemp1}\n`;  // 此时 ID.val 中储存着带返回值

    // return VD;
};

const f10 = function(right, VST, FST) {
    // <VarDecl> -> float ID = <Exprsn> ; $ 10
    throw new Error('Not support float');
    // const VD = new Node();
    // const ID = deepCopy(right[1]);
    // const E = deepCopy(right[3]);

    // if(E.valType !== 'float') {
    //     const errorInfo = 'Assign a value of int to a var of float';
    //     throw new Error(errorInfo);
    // }
    // if(VST.hasVar(ID.val)) {
    //     const errorInfo = 'Another var that has the same name declared';
    //     throw new Error(errorInfo);
    // }
    // if(FST.getReturnType(ID.val) !== null) {
    //     const errorInfo = 'A function that has the same name declared';
    //     throw new Error(errorInfo);
    // }

    // VST.append(ID.val, 'float');

    // // const newTemp1 = TA.getNewTemp(); // 指针
    // const varType = 'float';
    // let storeVal;
    // if(hasLetter(E.val)) {
    //     storeVal = '%' + E.val;
    // } else {
    //     storeVal = representFloat(E.val);
    // }

    // VD.IR += E.IR;
    // VD.IR += `%${ID.val} = alloca ${varType}\n`;
    // VD.IR += `store ${varType} ${storeVal}, ${varType}* %${ID.val}\n`;
    // // VD.IR += `%${ID.val} = load ${varType}, ${varType}* %${newTemp1}\n`;  // 此时 ID.val 中储存着带返回值

    // return VD;
};

const f11 = function(right, VST, FST) {
    // <FuncDecl> -> int ID  ( <FormalParams> ) <StmtBlock> $ 11
    const FD = new Node();
    const ID = deepCopy(right[1]);
    const FP = deepCopy(right[3]);
    const SB = deepCopy(right[5]);

    if(SB.returnType !== 'int') {
        const errorInfo = 'Return type differs from function declaration';
        throw new Error(errorInfo);
    }
    if(VST.hasVar(ID.val)) {
        const errorInfo = 'A var that has the same name declared';
        throw new Error(errorInfo);
    }
    if(FST.getReturnType(ID.val) !== null) {
        const errorInfo = 'Another function that has the same name declared';
        throw new Error(errorInfo);
    }

    FD.IR.push(['func', '', '', ID.val]);
    for(let i = 0; i < FP.paramName.length; i++) {
        // const nowType = (FP.paramType[i] === 'int')? 'i32': 'float';
        // FD.IR += `%${FP.paramName[i]} = alloca ${nowType}\n`;
        // FD.IR += `store ${nowType} %${i}, ${nowType}* %${FP.paramName[i]}\n`;
        FD.IR.push(['fparam', FP.paramName[i], i+1, '']);
    }
    FD.IR = FD.IR.concat(SB.IR);

    FST.append(ID.val, 'int', FP.paramType, FP.paramName);

    for(let i = 0; i < FP.paramName.length; i++) {
        VST.remove();
    } // 将之前压入符号表的形式参数弹出

    return FD;
};

const f12 = function(right, VST, FST) {
    // <FuncDecl> -> float ID  ( <FormalParams> ) <StmtBlock> $ 12
    throw new Error('Not support float');
    // const FD = new Node();
    // const ID = deepCopy(right[1]);
    // const FP = deepCopy(right[3]);
    // const SB = deepCopy(right[5]);

    // if(SB.returnType !== 'float') {
    //     const errorInfo = 'Return type differs from function declaration';
    //     throw new Error(errorInfo);
    // }
    // if(VST.hasVar(ID.val)) {
    //     const errorInfo = 'A var that has the same name declared';
    //     throw new Error(errorInfo);
    // }
    // if(FST.getReturnType(ID.val) !== null) {
    //     const errorInfo = 'Another function that has the same name declared';
    //     throw new Error(errorInfo);
    // }

    // FD.IR += `define float @${ID.val}(${FP.IR}) {\n`;
    // for(let i = 0; i < FP.paramName.length; i++) {
    //     const nowType = (FP.paramType[i] === 'int')? 'i32': 'float';
    //     FD.IR += `%${FP.paramName[i]} = alloca ${nowType}\n`;
    //     FD.IR += `store ${nowType} %${i}, ${nowType}* %${FP.paramName[i]}\n`;
    // }
    // FD.IR += SB.IR;
    // FD.IR += `}\n`;

    // FST.append(ID.val, 'float', FP.paramType, FP.paramName);

    // for(let i = 0; i < FP.paramName.length; i++) {
    //     VST.remove();
    // } // 将之前压入符号表的形式参数弹出

    // return FD;
};

const f13 = function(right, VST, FST) {
    // <FuncDecl> -> void ID  ( <FormalParams> ) <StmtBlock> $ 13
    const FD = new Node();
    const ID = deepCopy(right[1]);
    const FP = deepCopy(right[3]);
    const SB = deepCopy(right[5]);

    if(SB.returnType !== 'void') {
        const errorInfo = 'Return type differs from function declaration';
        throw new Error(errorInfo);
    }
    if(VST.hasVar(ID.val)) {
        const errorInfo = 'A var that has the same name declared';
        throw new Error(errorInfo);
    }
    if(FST.getReturnType(ID.val) !== null) {
        const errorInfo = 'Another function that has the same name declared';
        throw new Error(errorInfo);
    }

    FD.IR.push(['func', '', '', ID.val]);
    for(let i = 0; i < FP.paramName.length; i++) {
        // const nowType = (FP.paramType[i] === 'int')? 'i32': 'float';
        // FD.IR += `%${FP.paramName[i]} = alloca ${nowType}\n`;
        // FD.IR += `store ${nowType} %${i}, ${nowType}* %${FP.paramName[i]}\n`;
        FD.IR.push(['fparam', paramName[i], i+1, '']);
    }
    FD.IR = FD.IR.concat(SB.IR);
    if(FD.IR.slice(-1)[0] !== 'ret') {
        FD.IR.push(['ret', '', '', '']);
    }

    FST.append(ID.val, 'void', FP.paramType, FP.paramName);

    for(let i = 0; i < FP.paramName.length; i++) {
        VST.remove();
    } // 将之前压入符号表的形式参数弹出

    return FD;
};

const f14 = function(right, VST, FST) {
    // <FormalParams> -> <ParamList> $ 14
    const FP = new Node();
    const P = deepCopy(right[0]);

    FP.paramName = P.paramName;
    FP.paramType = P.paramType;
    // FP.IR = P.IR;

    for(let i = 0; i < FP.paramName.length; i++) {
        VST.append(FP.paramName[i], FP.paramType[i]);
    } // 将形式参数压入符号表

    return FP;
};

const f15 = function(right, VST, FST) {
    // <FormalParams> -> void $ 15
    const FP = new Node();
    return FP;
};

const f16 = function(right, VST, FST) {
    // <FormalParams> -> ε $ 16
    const FP = new Node();
    return FP;
};

const f17 = function(right, VST, FST) {
    // <ParamList> -> <Param> $ 17
    const PL = new Node();
    const P = deepCopy(right[0]);

    PL.paramName.unshift(P.paramName[0]);
    PL.paramType.unshift(P.paramType[0]);
    // PL.IR = P.IR;

    return PL;
};

const f18 = function(right, VST, FST) {
    // <ParamList> -> <Param> , <ParamList> $ 18
    const PL1 = new Node();
    const P = deepCopy(right[0]);
    const PL2 = deepCopy(right[2]);

    PL1.paramType = PL2.paramType;
    PL1.paramName = PL2.paramName;
    PL1.paramType.unshift(P.paramType[0]);
    PL1.paramName.unshift(P.paramName[0]);
    // PL1.IR = P.IR + ', ' + PL2.IR;

    return PL1;
};

const f19 = function(right, VST, FST) {
    // <Param> -> int ID $ 19
    const P = new Node();
    const ID = deepCopy(right[1]);

    if(VST.isGlobal(ID.val) === true) {
        const errorInfo = `Parameter name is the same as global var ${ID.val}`;
        throw new Error(errorInfo);
    }

    P.paramType.unshift('int');
    P.paramName.unshift(ID.val);
    // P.IR = `i32`;

    return P;
};

const f20 = function(right, VST, FST) {
    // <Param> -> float ID $ 20
    throw new Error('Not support float');
    // const P = new Node();
    // const ID = deepCopy(right[1]);

    // if(VST.isGlobal(ID.val) === true) {
    //     const errorInfo = `Parameter name is the same as global var ${ID.val}`;
    //     throw new Error(errorInfo);
    // }

    // P.paramType = 'float';
    // P.paramName = ID.val;
    // P.IR = `float`;

    // return P;
};

const f21 = function(right, VST, FST) {
    // <StmtBlock> -> { <Stmts> } $ 21
    const SB = new Node();
    const S = deepCopy(right[1]);

    SB.IR = S.IR;
    SB.returnType = S.returnType;
    for(let i = 0; i < S.innerVarAmount; i++) {
        VST.remove(); //离开一个语句块时，将块内声明的变量全部从符号表中移除
    }

    return SB;
};

const f22 = function(right, VST, FST) {
    // <Stmts> -> <Stmt> <Stmts> $ 22
    const Ss1 = new Node();
    const S = deepCopy(right[0]);
    const Ss2 = deepCopy(right[1]);

    if(S.returnType === 'void') {
        Ss1.returnType = Ss2.returnType;
    } else {
        if(Ss2.returnType === 'void') {
            Ss1.returnType = S.returnType;
        } else {
            if(S.returnType === Ss2.returnType) {
                Ss1.returnType = S.returnType;
            } else {
                const errorInfo = 'Can\'t return values of different types in a function';
                throw new Error(errorInfo);
            }
        }
    }

    Ss1.IR = S.IR.concat(Ss2.IR);
    Ss1.innerVarAmount = S.innerVarAmount + Ss2.innerVarAmount;

    return Ss1;
};

const f23 = function(right, VST, FST) {
    // <Stmts> -> <Stmt> $ 23
    const Ss = new Node();
    const S = deepCopy(right[0]);

    Ss.IR = S.IR;
    Ss.returnType = S.returnType;
    Ss.innerVarAmount = S.innerVarAmount;

    return Ss;
};

const f24 = function(right, VST, FST) {
    // <Stmt> -> <VarDecl> $ 24
    const S = new Node();
    const VD = deepCopy(right[0]);

    S.IR = VD.IR;
    S.returnType = 'void';
    S.innerVarAmount++;

    return S;
};

const f25 = function(right, VST, FST) {
    // <Stmt> -> <IfStmt> $ 25
    const S = new Node();
    const IS = deepCopy(right[0]);

    S.IR = IS.IR;
    S.returnType = IS.returnType;

    return S;
};

const f26 = function(right, VST, FST) {
    // <Stmt> -> <WhileStmt> $ 26
    const S = new Node();
    const WS = deepCopy(right[0]);

    S.IR = WS.IR;
    S.returnType = WS.returnType;

    return S;
};

const f27 = function(right, VST, FST) {
    // <Stmt> -> <ReturnStmt> $ 27
    const S = new Node();
    const RS = deepCopy(right[0]);

    S.IR = RS.IR;
    S.returnType = RS.returnType;

    return S;
};

const f28 = function(right, VST, FST) {
    // <Stmt> -> <AssignStmt> $ 28
    const S = new Node();
    const AS = deepCopy(right[0]);

    S.IR = AS.IR;
    S.returnType = 'void';

    return S;
};

const f29 = function(right, VST, FST) {
    // <Stmt> -> ID <FuncCall> ; $ 29
    const S = new Node();
	const ID = deepCopy(right[0]);
	const FC = deepCopy(right[1]);

    if(FST.getReturnType(ID.val) === null) {
        const errorInfo = 'Function called didn\'t be declared';
        throw new Error(errorInfo);
    }
	if(!FST.hasFunc(ID.val, FC.argType)) {
        const errorInfo = 'Function parameter type don\'t match';
        throw new Error(errorInfo);
    }
    // 至此通过函数参数类型检查
    const funcReturnType = FST.getReturnType(ID.val);
    if(funcReturnType !== 'void') {
        const errorInfo = `Call a function which returns ${funcReturnType}`;
        throw new Error(errorInfo);
    }
    // 通过函数返回值类型检查

    S.IR = FC.IR;
    
    for(let each of FC.args) {
        S.IR.push(['param', each, '', ''])
    }
    // 函数返回值一定不为 void
    S.IR.push(['call', ID.val, '', S.val]);

    return S;
};

const f30 = function(right, VST, FST) {
    // <AssignStmt> -> ID = <Exprsn> ; $ 30
    const A = new Node();
    const ID = deepCopy(right[0]);
    const E = deepCopy(right[2]);

    if(!VST.hasVar(ID.val)) {
        const errorInfo = 'Use a var without declaration';
        throw new Error(errorInfo);
    }
    if(VST.getVarType(ID.val) !== E.valType) {
        const errorInfo = 'Can\'t assign to a var of different type';
        throw new Error(errorInfo);
    }
    // 至此变量检查结束

    A.IR = E.IR;
    A.IR.push(['assign', E.val, '', ID.val]);

    return A;
};

const f31 = function(right, VST, FST) {
    // <ReturnStmt> -> return <Exprsn> ; $ 31
    const RS = new Node();
    const E = deepCopy(right[1]);

    RS.returnType = E.valType;
    RS.IR = E.IR;
    // RS.IR += 'ret ' + rtValue + '\n';
    RS.IR.push(['ret', E.val, '', '']);

    return RS;
};

const f32 = function(right, VST, FST) {
    // <ReturnStmt> -> return ; $ 32
    const RS = new Node();

    RS.returnType = 'void';
    // RS.IR = 'ret void\n';
    RS.IR.push(['ret', '', '', '']);

    return RS;
};

const f33 = function(right, VST, FST) {
    // <WhileStmt> -> while ( <Exprsn> ) <StmtBlock> $ 33
    const WS = new Node();
    const E = deepCopy(right[2]);
    const SB = deepCopy(right[4]);

    if(E.valType !== 'int') {
        const errorInfo = 'While branch condition must be of int';
        throw new Error(errorInfo);
    }
    // 类型检查通过
    WS.returnType = SB.returnType;   
    
    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    WS.IR = E.IR;
    WS.IR.push(['label', '', '', newLabel1]);
    WS.IR.push(['je', E.val, 0, newLabel2]); // 如果条件为假
    WS.IR = WS.IR.concat(SB.IR);
    WS.IR.push(['goto', '', '', newLabel1]);
    WS.IR.push(['label', '', '', newLabel2]);

    return WS;
};

const f34 = function(right, VST, FST) {
    // <IfStmt> -> if ( <Exprsn> ) <StmtBlock> else <StmtBlock> $ 34
    const IS = new Node();
    const E = deepCopy(right[2]);
    const SB1 = deepCopy(right[4]);
    const SB2 = deepCopy(right[6]);

    if(SB1.returnType !== SB2.returnType) {
        if(SB1.returnType === 'void') {
            IS.returnType = SB2.returnType;
        } else if(SB2.returnType === 'void') {
            IS.returnType = SB1.returnType;
        } else {
            const errorInfo = 'The values returnd have different types';
            throw new Error(errorInfo);
        }
    } else {
        IS.returnType = SB1.returnType;
    }

    if(E.valType !== 'int') {
        const errorInfo = 'If branch condition must be of int';
        throw new Error(errorInfo);
    }
    // 类型检查通过

    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    IS.IR = E.IR;
    IS.IR.push(['je', E.val, 0, newLabel1]); // 如果为假，跳转到 newLabel1
    IS.IR = IS.IR.concat(SB1.IR);
    IS.IR.push(['goto', '', '', newLabel2]);
    IS.IR.push(['label', '', '', newLabel1]);
    IS.IR = IS.IR.concat(SB2.IR);
    IS.IR.push(['label', '', '', newLabel2]);

    return IS;
};

const f35 = function(right, VST, FST) {
    // <IfStmt> -> if ( <Exprsn> ) <StmtBlock> $ 35
    const IS = new Node();
    const E = deepCopy(right[2]);
    const SB = deepCopy(right[4]);

    if(E.valType !== 'int') {
        const errorInfo = 'If branch condition must be of int';
        throw new Error(errorInfo);
    }
    // 类型检查通过

    IS.returnType = SB.returnType;
    // for(let i = 0; i < SB.innerVarAmount; i++) {
    //     // 离开一个语句块时，将其中声明的变量从符号表中移除
    //     VST.remove();
    // }

    const newLabel1 = LA.getNewLabel();
    
    IS.IR = E.IR;
    IS.IR.push(['je', E.val, 0, newLabel1]); // 如果为假，跳转到 newLabel1
    IS.IR = IS.IR.concat(SB.IR);
    IS.IR.push(['label', '', '', newLabel1]);

    return IS;
};

const f36 = function(right, VST, FST) {
    // <Exprsn> -> <AddExprsn> $ 36
    const E = new Node();
    const A = deepCopy(right[0]);

    E.val = A.val;
    E.valType = A.valType;
    E.IR = A.IR;

    return E;
};

const f37 = function(right, VST, FST) {
    // <Exprsn> -> <AddExprsn> < <Exprsn> $ 37
    const E1 = new Node();
    const A = deepCopy(right[0]);
    const E2 = deepCopy(right[2]);

    if(A.valType !== E2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过

    const newTemp1 = TA.getNewTemp(); // i1 类型的比较结果
    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    E1.val = newTemp1;
    E1.valType = 'int';

    E1.IR = E1.IR.concat(A.IR);
    E1.IR = E1.IR.concat(E2.IR);
    E1.IR.push(['jb', A.val, E2.val, newLabel1]);
    E1.IR.push(['assign', 0, '', newTemp1]);
    E1.IR.push(['goto', '', '', newLabel2]);
    E1.IR.push(['label', '', '', newLabel1]);
    E1.IR.push(['assign', 1, '', newTemp1]);
    E1.IR.push(['label', '', '', newLabel2]);

    return E1;
};

const f38 = function(right, VST, FST) {
    // <Exprsn> -> <AddExprsn> <= <Exprsn> $ 38
    const E1 = new Node();
    const A = deepCopy(right[0]);
    const E2 = deepCopy(right[2]);

    if(A.valType !== E2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过

    const newTemp1 = TA.getNewTemp(); // i1 类型的比较结果
    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    E1.val = newTemp1;
    E1.valType = 'int';

    E1.IR = E1.IR.concat(A.IR);
    E1.IR = E1.IR.concat(E2.IR);
    E1.IR.push(['jbe', A.val, E2.val, newLabel1]);
    E1.IR.push(['assign', 0, '', newTemp1]);
    E1.IR.push(['goto', '', '', newLabel2]);
    E1.IR.push(['label', '', '', newLabel1]);
    E1.IR.push(['assign', 1, '', newTemp1]);
    E1.IR.push(['label', '', '', newLabel2]);

    return E1;
};

const f39 = function(right, VST, FST) {
    // <Exprsn> -> <AddExprsn> > <Exprsn> $ 39
    const E1 = new Node();
    const A = deepCopy(right[0]);
    const E2 = deepCopy(right[2]);

    if(A.valType !== E2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过

    const newTemp1 = TA.getNewTemp(); // i1 类型的比较结果
    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    E1.val = newTemp1;
    E1.valType = 'int';

    E1.IR = E1.IR.concat(A.IR);
    E1.IR = E1.IR.concat(E2.IR);
    E1.IR.push(['jg', A.val, E2.val, newLabel1]);
    E1.IR.push(['assign', 0, '', newTemp1]);
    E1.IR.push(['goto', '', '', newLabel2]);
    E1.IR.push(['label', '', '', newLabel1]);
    E1.IR.push(['assign', 1, '', newTemp1]);
    E1.IR.push(['label', '', '', newLabel2]);

    return E1;
};

const f40 = function(right, VST, FST) {
    // <Exprsn> -> <AddExprsn> >= <Exprsn> $ 40
    const E1 = new Node();
    const A = deepCopy(right[0]);
    const E2 = deepCopy(right[2]);

    if(A.valType !== E2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过

    const newTemp1 = TA.getNewTemp(); // i1 类型的比较结果
    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    E1.val = newTemp1;
    E1.valType = 'int';

    E1.IR = E1.IR.concat(A.IR);
    E1.IR = E1.IR.concat(E2.IR);
    E1.IR.push(['jge', A.val, E2.val, newLabel1]);
    E1.IR.push(['assign', 0, '', newTemp1]);
    E1.IR.push(['goto', '', '', newLabel2]);
    E1.IR.push(['label', '', '', newLabel1]);
    E1.IR.push(['assign', 1, '', newTemp1]);
    E1.IR.push(['label', '', '', newLabel2]);

    return E1;
};

const f41 = function(right, VST, FST) {
    // <Exprsn> -> <AddExprsn> == <Exprsn> $ 41
    const E1 = new Node();
    const A = deepCopy(right[0]);
    const E2 = deepCopy(right[2]);

    if(A.valType !== E2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过

    const newTemp1 = TA.getNewTemp(); // i1 类型的比较结果
    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    E1.val = newTemp1;
    E1.valType = 'int';

    E1.IR = E1.IR.concat(A.IR);
    E1.IR = E1.IR.concat(E2.IR);
    E1.IR.push(['je', A.val, E2.val, newLabel1]);
    E1.IR.push(['assign', 0, '', newTemp1]);
    E1.IR.push(['goto', '', '', newLabel2]);
    E1.IR.push(['label', '', '', newLabel1]);
    E1.IR.push(['assign', 1, '', newTemp1]);
    E1.IR.push(['label', '', '', newLabel2]);

    return E1;
};

const f42 = function(right, VST, FST) {
    // <Exprsn> -> <AddExprsn> != <Exprsn> $ 42
    const E1 = new Node();
    const A = deepCopy(right[0]);
    const E2 = deepCopy(right[2]);

    if(A.valType !== E2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过

    const newTemp1 = TA.getNewTemp(); // i1 类型的比较结果
    const newLabel1 = LA.getNewLabel();
    const newLabel2 = LA.getNewLabel();

    E1.val = newTemp1;
    E1.valType = 'int';

    E1.IR = E1.IR.concat(A.IR);
    E1.IR = E1.IR.concat(E2.IR);
    E1.IR.push(['jne', A.val, E2.val, newLabel1]);
    E1.IR.push(['assign', 0, '', newTemp1]);
    E1.IR.push(['goto', '', '', newLabel2]);
    E1.IR.push(['label', '', '', newLabel1]);
    E1.IR.push(['assign', 1, '', newTemp1]);
    E1.IR.push(['label', '', '', newLabel2]);

    return E1;
};

const f43 = function(right, VST, FST) {
    // <AddExprsn> -> <Item> + <AddExprsn> $ 43
    const A1 = new Node();
    const I = deepCopy(right[0]);
    const A2 = deepCopy(right[2]);

    if(I.valType !== A2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过
    const newTemp = TA.getNewTemp();

    A1.valType = I.valType;
    A1.val = newTemp;
    
    A1.IR = A1.IR.concat(I.IR);
    A1.IR = A1.IR.concat(A2.IR);
    A1.IR.push(['+', I.val, A2.val, A1.val]);

    return A1;
};

const f44 = function(right, VST, FST) {
    // <AddExprsn> -> <Item> - <AddExprsn> $ 44
    const A1 = new Node();
    const I = deepCopy(right[0]);
    const A2 = deepCopy(right[2]);

    if(I.valType !== A2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过
    const newTemp = TA.getNewTemp();

    A1.valType = I.valType;
    A1.val = newTemp;

    A1.IR = A1.IR.concat(I.IR);
    A1.IR = A1.IR.concat(A2.IR);
    A1.IR.push(['-', I.val, A2.val, A1.val]);

    return A1;
};

const f45 = function(right, VST, FST) {
    // <AddExprsn> -> <Item> $ 45
    const A = new Node();
    const I = deepCopy(right[0]);

    A.val = I.val;
    A.valType = I.valType;
    A.IR = I.IR;

    return A;
};

const f46 = function(right, VST, FST) {
    // <Item> -> <Factor> * <Item> $ 46
    const I1 = new Node();
    const F = deepCopy(right[0]);
    const I2 = deepCopy(right[2]);

    if(F.valType !== I2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过
    const newTemp = TA.getNewTemp();

    I1.valType = F.valType;
    I1.val = newTemp;
    
    I1.IR = I1.IR.concat(F.IR);
    I1.IR = I1.IR.concat(I2.IR);
    I1.IR.push(['*', F.val, I2.val, I1.val]);

    return I1;
};

const f47 = function(right, VST, FST) {
    // <Item> -> <Factor> / <Item> $ 47
    const I1 = new Node();
    const F = deepCopy(right[0]);
    const I2 = deepCopy(right[2]);

    if(F.valType !== I2.valType) {
        const errorInfo = 'Two operands have different type';
        throw new Error(errorInfo);
    }
    // 运算数类型检查通过
    const newTemp = TA.getNewTemp();

    I1.valType = F.valType;
    I1.val = newTemp;
    I1.IR = I1.IR.concat(F.IR);
    I1.IR = I1.IR.concat(I2.IR);

    I1.IR.push(['/', F.val, I2.val, I1.val]);

    return I1;
};

const f48 = function(right, VST, FST) {
    // <Item> -> <Factor> $ 48
    const I = new Node();
    const F = deepCopy(right[0]);

    I.val = F.val;
    I.valType = F.valType;
    I.IR = F.IR;

    return I;
};

const f49 = function(right, VST, FST) {
    // <Factor> -> inum $ 49
    const F = new Node();
    const inum = deepCopy(right[0]);

    const newTemp = TA.getNewTemp();
    F.val = newTemp; ;
    F.valType = 'int';
    F.IR.push(['assign', inum.val, '', F.val]);

    return F;
};

const f50 = function(right, VST, FST) {
    // <Factor> -> - inum $ 50
    const F = new Node();
    const inum = deepCopy(right[1]);

    const newTemp = TA.getNewTemp();
    F.val = newTemp; ;
    F.valType = 'int';
    F.IR.push(['assign', inum.val, '', F.val]);
    F.IR.push(['unimus', F.val, '', F.val]);

    return F;
};

const f51 = function(right, VST, FST) {
    // <Factor> -> fnum $ 51
    throw new Error('Not support float');
    // const F = new Node();
    // const fnum = deepCopy(right[0]);

    // F.val = fnum.val;
    // F.valType = 'float';

    // return F;
};

const f52 = function(right, VST, FST) {
    // <Factor> -> - fnum $ 52
    throw new Error('Not support float');
    // const F = new Node();
    // const fnum = deepCopy(right[1]);

    // F.val = '-' + fnum.val;
    // F.valType = 'float';

    // return F;
};

const f53 = function(right, VST, FST) {
    // <Factor> -> ( <Exprsn> ) $ 53
    const F = new Node();
    const E = deepCopy(right[1]);

    F.val = E.val;
    F.valType = E.valType;
    F.IR = E.IR;

    return F;
};

const f54 = function(right, VST, FST) {
	// <Factor> -> ID $ 54
    const F = new Node();
    const ID = deepCopy(right[0]);
    
    if(!VST.hasVar(ID.val)) {
        const errorInfo = 'Use a var without declaration';
        throw new Error(errorInfo);
    }
    // 至此变量检查结束

    // const newTemp1 = TA.getNewTemp();
    F.val = ID.val; // newTemp1;
    F.valType = VST.getVarType(ID.val);

    return F;
};

const f55 = function(right, VST, FST) {
	// <Factor> -> ID <FuncCall> $ 55
	const F = new Node();
	const ID = deepCopy(right[0]);
	const FC = deepCopy(right[1]);

    if(FST.getReturnType(ID.val) === null) {
        // console.log(ID.val)
        const errorInfo = 'Function called didn\'t be declared';
        throw new Error(errorInfo);
    }
	if(!FST.hasFunc(ID.val, FC.argType)) {
        const errorInfo = 'Function parameter type don\'t match';
        throw new Error(errorInfo);
    }
    // 至此通过函数参数类型检查
    const funcReturnType = FST.getReturnType(ID.val);
    if(funcReturnType === 'void') {
        const errorInfo = 'Call a function which returns void';
        throw new Error(errorInfo);
    }
    // 通过函数返回值类型检查
    const newTemp = TA.getNewTemp(); // 申请一个局部变量的空间
    F.val = newTemp;
    F.valType = funcReturnType;

    F.IR = FC.IR;
    
    for(let each of FC.args) {
        F.IR.push(['param', each, '', ''])
    }

    if(funcReturnType !== 'void') { F.IR.push(['call', ID.val, '', F.val]); }
    else { F.IR.push(['call', ID.val, '', '']); }

    return F;
};

const f56 = function(right, VST, FST) {
	// <FuncCall> -> ( <ActualArgs> ) $ 56
	const F = new Node();
    const Ac = deepCopy(right[1]);

	F.args = Ac.args;
    F.argType = Ac.argType;
    F.IR = Ac.IR;

	return F;
};

const f57 = function(right, VST, FST) {
	// <ActualArgs> -> <ArgList> $ 57
	const Ac = new Node();
	const Arg = deepCopy(right[0]);

	Ac.args = Arg.args;
    Ac.argType = Arg.argType;
    Ac.IR = Arg.IR;

	return Ac;
};

const f58 = function(right, VST, FST) {
	// <ActualArgs> -> void $ 58
	const A = new Node();
	
	A.args = new Array();
	A.argType = new Array();

	return A;
};

const f59 = function(right, VST, FST) {
	// <ActualArgs> -> ε $ 59
	const A = new Node();

	A.args = new Array();
	A.argType = new Array();

	return A;
};

const f60 = function(right, VST, FST) {
	// <ArgList> -> <Exprsn> , <ArgList> $ 60
	const A1 = new Node();
	const E = deepCopy(right[0]);
	const A2 = deepCopy(right[2]);

	A1.args = A2.args;
	A1.argType = A2.argType;
	A1.args.unshift(E.val);
    A1.argType.unshift(E.valType);
    A1.IR = E.IR.concat(A2.IR);
	
	return A1;
};

const f61 = function(right, VST, FST) {
    // <ArgList> -> <Exprsn> $ 61
	const A = new Node();
	const E = deepCopy(right[0]);

	A.args.unshift(E.val);
    A.argType.unshift(E.valType);
    A.IR = E.IR;

	return A;
};
// 类外语义分析处理函数到此结束

/**
 * 中间代码生成器类
 * @class
 */
class IR_Generator {
    constructor() {
        /**
         * 产生式标号表的地址
         * @private
         * @type {string}
         */
        this._filePath = './Grammar/Production-No.txt';

        /**
         * 生成中间代码的存放地址
         * @private
         * @type {string}
         */
        this._IR_Path = './IR/IR.ll';

        /**
         * 产生式编号表
         * 通过读取文件获取
         * @private
         * @type {Map<string, number>}
         */
        this._prodNo = new Map();

        /**
         * 是否读取完毕
         * @private
         * @type {boolean}
         */
        this._fileReadFinish = false;

        /**
         * 函数表
         * @private
         * @type {Object}
         */
        this._funcTable = new FuncTable();

        /**
         * 变量表
         * @private
         * @type {Object}
         */
        this._varTable = new VarTable();

        /**
         * 在语义分析过程中的当前顶层节点
         * 类似 Parser 中的 topNodes，但是每个结点处多了属性
         * @private
         * @type {Array.<Node>}
         */
        this._topNodes = new Array();

        /**
         * 记录语义分析处理函数的数组
         * @private
         * @type {Map.<number, Function>}
         */
        this._allFuncs = new Map();

        /**
         * 储存中间代码的头部（其中有库函数）
         * @private
         * @type {string}
         */
        this._IR_Head = null;

        /**
         * 储存的中间代码（分析完成后自动储存）
         * @private
         * @type {string}
         */
        this._IR_Code = null;

        this._initialize();
    }
}

/**
 * 初始化函数，将 f1 - f58 加入 this.allFuncs 中
 * @private
 */
IR_Generator.prototype._initialize = function() {
    for(let i = 1; i <= 61; i++) {
        const code = `this._allFuncs[${i}] = f${i};`;
        eval(code); // 执行上述代码
    }

    // const headContent = fs.readFileSync(__dirname + '/IR/head.ll').toString();
    // this._IR_Head = headContent;
    // console.log(this._IR_Head);

    // 向符号表和函数表中预先存入库函数和需要的全局变量
    // this._varTable.append('inputf', 'float');
    // this._varTable.append('inputi', 'int');
    // this._funcTable.append('readf', 'float', [], []);
    // this._funcTable.append('writef', 'void', ['float'], ['itDoesntMatter']);
    // this._funcTable.append('readi', 'int', [], []);
    // this._funcTable.append('writei', 'void', ['int'], ['itDoesntMatter']);
    // this._funcTable.append('readc', 'int', [], []);
    // this._funcTable.append('writec', 'void', ['int'], ['itDoesntMatter']);
    // this._funcTable.append('itof', 'float', ['int'], ['itDoesntMatter']);
    // this._funcTable.append('ftoi', 'int', ['float'], ['itDoesntMatter']);
};

/**
 * 根据传入的 Record 对象，选取本次规约应当使用的语义分析和处理函数
 * @private
 * @param {Record} record 
 * @return {Function} 返回应该执行的处理函数
 */
IR_Generator.prototype._getFunc = function(record) {
    const pLeft = record.productionLeft;
    const pRight = record.productionRight;

    let key = pLeft;
    for(let each of pRight) {
        key += ' ';
        key += each;
    }
    const pNo = this._prodNo[key];
    const f = this._allFuncs[pNo];

    return f;
};


// 以下为暴露给外部的函数
/**
 * 设置文件地址
 * @public
 * @param {string} newFilePath
 */
IR_Generator.prototype.setProdNoFilePath = function(newFilePath) {
    this._filePath = newFilePath;
};

/**
 * 设置生成的中间代码的地址
 * @public
 * @param {string} newIRPath
 */
IR_Generator.prototype.setIRPath = function(newIRPath) {
    this._IR_Path = newIRPath;
};

/**
 * 读取产生式编号表
 * @public
 */
IR_Generator.prototype.readProdNoFile = function() {
    const data = fs.readFileSync(this._filePath).toString();
    const prods = data.split('\n');

    for(let p of prods) {
        let left = '';
        let right = '';
        let no = -1;

        const splitResult1 = p.split(' -> ');
        left = splitResult1[0].trim(); // 得到产生式左部
        const splitResult2 = splitResult1[1].split('$');
        right = splitResult2[0].trim(); // 得到产生式右部
        no = splitResult2[1]; // 得到产生式标号

        this._prodNo[`${left} ${right}`] = parseInt(no); // 将产生式左部和右部接合作为键，编号作为值，加入 map 中
    }

    this._fileReadFinish = true;
};

/**
 * 根据传入的 Record 对象，进行一次语义分析操作
 * @public
 * @param {Object} record
 */
IR_Generator.prototype.analyze = function(record) {
    if(record.parseResult[0] === 's') {
        console.log('shift in: ' + record.tokenValue);
        const N = new Node();
        N.name = record.symbolName;
        N.val = record.tokenValue;
        this._topNodes.push(N);
    } else if(record.parseResult[0] === 'r') {
        console.log('reduce: ' + record.productionLeft + ' -> ' + record.productionRight);
        const f = this._getFunc(record); // 得到语义分析函数

        const rightNodes = new Array();
        let rightAmount; //产生式右部的符号个数
        if(record.productionRight.length === 1 && record.productionRight[0] === 'ε') {
            rightAmount = 0;
        } else {
            rightAmount = record.productionRight.length;
        }
        for(let i = 0; i < rightAmount; i++) {
            const tN = this._topNodes.pop();
            rightNodes.unshift(tN);
        }
        // 此时得到所有待规约符号

        const leftNode = f(rightNodes, this._varTable, this._funcTable);
        leftNode.name = record.productionLeft;
        this._topNodes.push(leftNode);
    } else if(record.parseResult === 'acc') {
        console.log('acc');
        this._IR_Code = this._topNodes[0].IR;
    } else if(record.parseResult === 'error') {
        console.log('error');
        const errorInfo = 'Source file syntax error';
        throw new Error(errorInfo);
    } else {
        const errorInfo = 'Unknown error, please fix me!';
        throw new Error(errorInfo);
    }
};

/**
 * 输出分析后的中间代码到文件
 * @public
 */
IR_Generator.prototype.outputIR = function() {
    fs.writeFileSync(this._IR_Path, this._IR_Head + this._IR_Code);
};

/**
 * 输出分析后的中间代码
 * @public
 */
IR_Generator.prototype.showIR = function() {
    console.log(this._IR_Code);
};


// const IR = new IR_Generator();
// IR.readProdNoFile();
// const x = IR._allFuncs[51];
// x();

module.exports = IR_Generator;