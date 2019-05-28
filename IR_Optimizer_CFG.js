const Gen_CFG = require('./Gen_CFG.js');
const GC = new Gen_CFG();

/**
 * 针对控制流图进行中间代码优化的类
 * 进一步消除死代码
 * 对于基本块内部进行优化，如删除无用赋值语句等
 * @class
 */
class IR_Optimizer_CFG {
    constructor() {
        /**
         * 记录 CFG 拆分结果
         * @private
         * @type {Array}
         */
    }
}

/**
 * 删除没有使用的基本块
 * @public
 * @param {Array} IR
 * @return 优化后的中间代码（控制流图的形式），及优化的次数
 */
IR_Optimizer_CFG.prototype.eliminateUnusedBlock = function(IR) {
    const res = GC.splitIR(IR);
    // res is an object
    // res: {
    //     head: head,
    //     otherIR: otherIR,
    //     splitRange: splitRange,
    //     blocks: blocks,
    //     blockMatrix: blockMatrix
    // }

    const blockNum = res.blocks.length;
    const hasVisited = new Array(blockNum);
    for(let i = 0; i < blockNum; i++) {
        hasVisited[i] = false;
    }

    const blockMatrix = res.blockMatrix;
    const checkList = new Array([0]);
    while(true) {
        if(checkList.length === 0) {
            break;
        }
        const nowCheck = checkList.shift();

        hasVisited[nowCheck] = true;
        for(let i = 0; i < blockNum; i++) { // 遍历接下来所有可能到达的基本块
            const comeTo = blockMatrix[nowCheck][i];
            if(comeTo && !hasVisited[i] && checkList.indexOf(i) === -1) { // 如果有可能执行某基本块，同时这个基本块又没有被检查过
                checkList.push(i);
            }
        }
    }

    let newOtherIR = new Array();
    let count = 0;
    for(let i = 0; i < blockNum; i++) {
        if(hasVisited[i]) {
            newOtherIR = newOtherIR.concat(res.blocks[i]);
        } else {
            count++;
        }
    }
    const newIR = res.head.concat(newOtherIR);
    const optimizedIR = GC.splitIR(newIR);
    optimizedIR.count = count; // 记录被消除掉的基本块的数量

    // if(IR[0][3] === '_printNum')
    //     console.log(blockMatrix);
    return optimizedIR;
};

/**
 * 找到公共子表达式，并用赋值代替重复计算
 * 如：
 * a = b * c
 * d = c * b
 * 等价于：
 * a = b * c
 * d = a
 * @private
 * @param {Array} blockIR
 * @return 优化后的中间代码，及优化的次数
 */
IR_Optimizer_CFG.prototype._replaceCommonExp = function(blockIR) {
    const posSet = new Set(['uminus', '+', '-', '*', '/']); // posSet: possible set，能够导致优化发生的中间代码类别
    const blockLength = blockIR.length;
    const newIR = new Array();
    blockIR.forEach(x => newIR.push(x));

    let count = 0;
    // 找出可以由公共子表达式导致的可以复写的变量
    for(let i = 0; i < blockLength; i++) {
        const each = blockIR[i];
        if(!posSet.has(each[0])) {
            continue;
        }

        let op1, op2;
        let des;
        if(each[0] === 'uminus') {
            op1 = each[1];
            des = each[3];
            for(let j = i + 1; j < blockLength; j++) {
                const each_ = blockIR[j];
                const each_des = each_[3];
                if(each_[0] !== 'uminus' || each_[1] !== op1) {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                // 此时发现公共子表达式
                count++;
                newIR[j] = ['assign', des, '', each_[3]];

                // 如果源操作数被改变 
                if(each_des === op1) {
                    break;
                }
            }
        } else if(each[0] === '+') {
            op1 = each[1];
            op2 = each[2];
            des = each[3];
            for(let j = i + 1; j < blockLength; j++) {
                const each_ = blockIR[j];
                const each_des = each_[3];
                if(each_[0] !== '+') {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                if(!(each_[1] === op1 && each_[2] === op2) &&
                   !(each_[1] === op2 && each_[2] === op1)) {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                // 此时发现公共子表达式
                count++;
                newIR[j] = ['assign', des, '', each_[3]];

                // 如果源操作数被改变
                if(each_des === op1) {
                    break;
                }
            }
        } else if(each[0] === '-') {
            op1 = each[1];
            op2 = each[2];
            des = each[3];
            for(let j = i + 1; j < blockLength; j++) {
                const each_ = blockIR[j];
                const each_des = each_[3];
                if(each_[0] !== '-') {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                if(each_[1] !== op1 || each_[2] !== op2) {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                // 此时发现公共子表达式
                count++;
                newIR[j] = ['assign', des, '', each_[3]];

                // 如果源操作数被改变
                if(each_des === op1) {
                    break;
                }
            }
        } else if(each[0] === '*') {
            op1 = each[1];
            op2 = each[2];
            des = each[3];
            for(let j = i + 1; j < blockLength; j++) {
                const each_ = blockIR[j];
                const each_des = each_[3];
                if(each_[0] !== '*') {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                if(!(each_[1] === op1 && each_[2] === op2) &&
                   !(each_[1] === op2 && each_[2] === op1)) {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                // 此时发现公共子表达式
                count++;
                newIR[j] = ['assign', des, '', each_[3]];

                // 如果源操作数被改变
                if(each_des === op1) {
                    break;
                }
            }
        } else if(each[0] === '/') {
            op1 = each[1];
            op2 = each[2];
            des = each[3];
            for(let j = i + 1; j < blockLength; j++) {
                const each_ = blockIR[j];
                const each_des = each_[3];
                if(each_[0] !== '/') {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                if(each_[1] !== op1 || each_[2] !== op2) {
                    if(each_des === op1) {
                        break;
                    }
                    continue;
                }
                // 此时发现公共子表达式
                count++;
                newIR[j] = ['assign', des, '', each_[3]];

                // 如果源操作数被改变
                if(each_des === op1) {
                    break;
                }
            }
        }
    }

    return {
        IR: newIR,
        count: count
    };
};

/**
 * 对某一个基本块内部进行优化，做一定的复写传播
 * 以便在全局优化时删去无用赋值和无用变量
 * 如：
 * assign a b   ---- b = a
 * ret b        ---- return b
 * 等价于：
 * ret a        ---- return a
 * @private
 * @param {Array} blockIR
 * @return 优化后的中间代码，及优化的次数
 */
IR_Optimizer_CFG.prototype._eliminateRedundantAssign = function(blockIR) {
    const newIR = new Array();
    blockIR.forEach(x => newIR.push(x));
    const blockLength = blockIR.length;
    let count = 0;

    for(let i = 0; i < blockLength; i++) {
        const each = blockIR[i];
        if(each[0] !== 'assign') {
            continue;
        }

        const op = each[1];
        const des = each[3];
        for(let j = i + 1; j < blockLength; j++) {
            const each_ = blockIR[j];
            const each_des = each_[3];

            if(each_[1] !== des && each_[2] !== des) {
                if(each_des === des) {
                    break;
                }
                continue;
            }

            if(each_[1] === des) {
                count++;
                newIR[j][1] = op;
            }
            if(each_[2] === des) {
                count++;
                newIR[j][2] = op;
            }

            if(each_des === des) {
                break;
            }
        }
    }

    // return {
    //     IR: blockIR,
    //     count: 0
    // };
    return {
        IR: newIR,
        count: count
    };
};

/**
 * 删除无意义的跳转
 * 如:
 * assign a b   ---- b = a
 * goto L1      ---- useless
 * label L1:
 * @private
 * @param {Array} splitIR
 * @return 优化后的中间代码，及优化的次数
 */
IR_Optimizer_CFG.prototype._eliminateRedundantJump = function(splitIR) {
    // splitIR: {
    //     head: head,
    //     otherIR: otherIR,
    //     splitRange: splitRange,
    //     blocks: blocks,
    //     blockMatrix: blockMatrix
    // }
    const onlyJumpBlock = new Map(); // 仅有跳转指令的基本块
    const blocks = splitIR.blocks;
    const blockNum = blocks.length;
    let count = 0;

    const blockLabel = new Map();
    for(let i = 0; i < blockNum; i++) {
        const each = blocks[i];
        if(each[0][0] !== 'label') {
            continue;
        }

        blockLabel.set(each[0][3], i);
    }

    for(let block of blocks) {
        if(block.length === 2) {
            if((block[0][0] === 'label') &&
               (block[1][0] === 'goto')) {
                onlyJumpBlock.set(block[0][3], block[1][3]);
            }
        }
    }

    while(true) {
        let count = 0;
        for(let [k, v] of onlyJumpBlock) {
            if(onlyJumpBlock.has(v)) {
                count++;
                onlyJumpBlock.set(k, onlyJumpBlock.get(v));
            }
        }

        if(count === 0) {
            break;
        }
    }

    for(let block of blocks) {
        for(let i = 0; i < block.length; i++) {
            const each = block[i];
            if(each[0] === 'goto' && onlyJumpBlock.has(each[3])) {
                count++;
                block[i][3] = onlyJumpBlock.get(each[3]);
            }
        }
    }

    for(let i = 0; i < blocks.length - 1; i++) {
        const block = blocks[i];
        const lastIR = block.slice(-1)[0];
        
        if(lastIR[0] === 'goto' && blockLabel.get(lastIR[3]) === i + 1) {
            // 如果末尾要进行跳转，且刚好要跳转到下一个区块，则不需要冗余的 goto 指令
            count++;
            blocks[i] = block.slice(0, block.length - 1);
        }
    };

    let newOtherIR = new Array();
    for(let block of blocks) {
        newOtherIR = newOtherIR.concat(block);
    }

    return {
        IR: splitIR.head.concat(newOtherIR),
        count: count
    };
};

/**
 * 删除无作用的各种操作
 * 如:
 * int f() {
 *  int x = 10;
 *  while(x > 0) x--;
 *  return 18;
 * }
 * 优化为：
 * int f() { reutnrn 18; }
 * @private
 * @param {Array} splitIR
 * @return 优化后的中间代码，及优化的次数
 */
IR_Optimizer_CFG.prototype._eliminateUselessIR = function(splitIR) {
    // splitIR: {
    //     head: head,
    //     otherIR: otherIR,
    //     splitRange: splitRange,
    //     blocks: blocks,
    //     blockMatrix: blockMatrix
    // }

    return {
        IR: splitIR.head.concat(splitIR.otherIR),
        count: 0
    };
};

/**
 * 对所有基本块内部进行优化，删去无用赋值和无用变量
 * @public
 * @param {Array} splitIR
 * @return 优化后的中间代码（控制流图），及优化的次数
 */
IR_Optimizer_CFG.prototype.optimizeBlocks = function(splitIR) {
    // splitIR: {
    //     head: head,
    //     otherIR: otherIR,
    //     splitRange: splitRange,
    //     blocks: blocks,
    //     blockMatrix: blockMatrix
    // }
    const head = splitIR.head;
    let count = 0;
    let newOtherIR = new Array();
    for(let each of splitIR.blocks) {
        let result = this._replaceCommonExp(each);
        count += result.count;

        result = this._eliminateRedundantAssign(result.IR);
        count += result.count;

        newOtherIR = newOtherIR.concat(result.IR);
    }

    let optimizedIR = GC.splitIR(head.concat(newOtherIR)); 
    let optimizedIRRes = this._eliminateRedundantJump(optimizedIR);

    optimizedIR = GC.splitIR(optimizedIRRes.IR);
    count += optimizedIRRes.count;

    optimizedIRRes = this._eliminateUselessIR(optimizedIR); 

    optimizedIR = GC.splitIR(optimizedIRRes.IR);
    count += optimizedIRRes.count;

    optimizedIR.count = count;
    return optimizedIR;
};

/**
 * 优化一部分中间代码
 * @private
 * @param {Array} partIR
 * @return 优化后的中间代码，及优化的次数
 */
IR_Optimizer_CFG.prototype.optimizePart = function(partIR) {
    let result;
    let totalCount = 0;
    let newIR = new Array();
    partIR.forEach(x => newIR.push(x));

    while(true) {
        let count = 0;
        result = this.eliminateUnusedBlock(newIR);
        count += result.count;

        result = this.optimizeBlocks(result);
        count += result.count;

        newIR = result.head.concat(result.otherIR);

        if(count === 0) {
            break;
        } else {
            totalCount += count;
        }
    }

    // console.log(newIR);
    return {
        IR: newIR,
        count: totalCount
    }
};

/**
 * 优化某一个基本块内部的中间代码
 * @private
 * @param {Array} IR
 * @return 优化后的中间代码（控制流图的形式），及优化的次数
 */
IR_Optimizer_CFG.prototype.optimize = function(IR) {
    const global = IR.global;
    const funcs = IR.funcs;
    let result;
    let count = 0;

    result = this.optimizePart(global);
    const newGlobal = result.IR;
    count += result.count;

    const newFuncs = new Array();
    for(let each of funcs) {
        result = this.optimizePart(each);
        newFuncs.push(result.IR);
        count += result.count;
    }

    const funcVarNum = new Map();
    for(let each of newFuncs) {
        const funcName = each[0][3];
        let i = 1;
        let fparamCount = 0;
        let flocalCount = 0;
        while(true) {
            if(each[i][0] === 'fparam') {
                fparamCount++;
            } else if(each[i][0] === 'flocal') {
                flocalCount++;
            } else {
                break;
            }
            i++;
        }

        funcVarNum.set(funcName, [fparamCount, flocalCount]);
    }
    funcVarNum.set('_print', [1, 0]);
    funcVarNum.set('_read', [0, 0]);    

    return {
        global: newGlobal,
        funcs: newFuncs,
        funcVarNum: funcVarNum,
        count: count
    };
};

module.exports = IR_Optimizer_CFG;