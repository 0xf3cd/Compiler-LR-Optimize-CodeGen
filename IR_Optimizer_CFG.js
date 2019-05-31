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
 * 如:
 * int f() {
 *  int x = 10;
 *  while(x > 0) x--;
 *  return 18;
 * }
 * 优化为：
 * int f() { reutnrn 18; }
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

    // 检查是否存在无用跳转
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
    let newIR = res.head.concat(newOtherIR);
    let optimizedIR = GC.splitIR(newIR);

    // 接下来检查是否存在无用的计算
    // 如果不管输入如何，最终的计算结果都一致且确定，则可以直接返回确定的计算结果
    let callCount = 0;
    for(let block of optimizedIR.blocks) {
        if(callCount > 0) {
            break;
        }
        for(let each of block) {
            if(each[0] === 'call') {
                callCount++;
                break;
            }
        }
    }

    if(optimizedIR.blocks.length > 1 && callCount === 0) { // 如果函数内部用其他函数的调用，则不能直接删除基本块，否则会导致运行结果出错
        const matrix = optimizedIR.blockMatrix;
        const endBlock = new Set();
        for(let i = 0; i < matrix.length; i++) {
            const follows = matrix[i];
            const cond = new Set([...follows]);
            if(cond.size === 1 && cond.has(false)) {
                endBlock.add(i);
            }
        }
        // console.log(endBlock);
        const returnSet = new Set();
        for(let each of endBlock) {
            returnSet.add(optimizedIR.blocks[each].slice(-1)[0][1]);
        }
        // console.log(returnSet);
        if(returnSet.size === 1) {
            const returnName = [...returnSet][0];
            if(!isNaN(parseInt(returnName))) {
                // 如果所有可能的返回结果都是确定且一致的，则说明其他基本块都是多余的
                count++;
                newIR = res.head;
                newIR.push(['ret', returnName, '', '']);
                optimizedIR = GC.splitIR(newIR);
            } else if(returnName !== '') {
                // 如果返回结果是变量（函数参数），而且在所有基本块中，这个变量都没有被重新赋值，则也可以直接返回
                let returnAssignCount = 0;
                for(let block of optimizedIR.blocks) {
                    if(returnAssignCount > 0) {
                        break;
                    }
                    for(let each of block) {
                        if(each[3] === returnName) {
                            returnAssignCount++;
                            break;
                        }
                    }
                }

                if(returnAssignCount === 0) {
                    count++;
                    newIR = res.head;
                    newIR.push(['ret', returnName, '', '']);
                    optimizedIR = GC.splitIR(newIR);
                }
            }
        }
    }
    
    optimizedIR.count = count; // 记录被消除掉的基本块的数量

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
IR_Optimizer_CFG.prototype._eliminateRedundantAssignWithin = function(blockIR) {
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
 * 分析基本块相互关系，删除无作用的语句
 * @private
 * @param {Array} splitIR
 * @return 优化后的中间代码，及优化的次数
 */
IR_Optimizer_CFG.prototype._eliminateRedundantIRBetween = function(splitIR) {
    // splitIR: {
    //     head: head,
    //     otherIR: otherIR,
    //     splitRange: splitRange,
    //     blocks: blocks,
    //     blockMatrix: blockMatrix
    // }

    // return {
    //     IR: splitIR.head.concat(splitIR.otherIR),
    //     count: 0
    // };

    const usedVar = new Map();
    const assignVar = new Map();
    const assignSet = new Set(['uminus', '+', '-', '*', '/', 'call', 'assign']); // 赋值和加减乘除等计算都包括赋值的动作
    let count = 0;

    const blockNum = splitIR.blocks.length;
    for(let i = 0; i < blockNum; i++) {
        usedVar.set(i, new Set());
        assignVar.set(i, new Set());
    }

    // 计算每个基本块使用的变量及进行赋值的变量
    // 使用的变量即作为操作数的变量
    for(let i = 0; i < blockNum; i++) {
        const block = splitIR.blocks[i];
        for(let each of block) {
            if(assignSet.has(each[0])) {
                if(each[3] !== '') {
                    assignVar.get(i).add(each[3]);
                }
            }

            if(each[0] === 'call') {
                continue;
            }

            if(each[1] !== '') {
                usedVar.get(i).add(each[1]);
            }
            if(each[2] !== '') {
                usedVar.get(i).add(each[2]);
            }
        }
    }
    // 至此得到每个基本块中，对于变量的赋值和使用情况
    // console.log(usedVar);
    // console.log(assignVar);

    for(let i = 0; i < blockNum; i++) {
        const followBlocks = new Array(blockNum); // 记录从某一个基本块开始，接下来可能访问的其他块
        for(let j = 0; j < blockNum; j++) {
            followBlocks[j] = false;
        }
        const checkList = new Array();
        checkList.push(i);

        while(true) {
            if(checkList.length === 0) {
                break;
            }

            const nowCheck = checkList.shift();
            for(let j = 0; j < blockNum; j++) {
                if(splitIR.blockMatrix[nowCheck][j] && 
                   !followBlocks[j] && 
                   checkList.indexOf(j) === -1) {
                    checkList.push(j);
                    followBlocks[j] = true;
                }
            }
        } // 至此，找到了从某个基本块开始，有可能能访问的所有基本块
        // console.log(followBlocks);

        let followUsed = new Set(); // 记录后续基本块有可能使用的
        for(let j = 0; j < blockNum; j++) {
            if(followBlocks[j]) {
                followUsed = new Set([...followUsed, ...usedVar.get(j)]);
            }
        }  // 至此，找到了某基本块之后可能访问到的基本块中使用到的变量（不完整，还需要考虑本块内部使用的情况）
        
        const deletedAssign = new Set([...assignVar.get(i)].filter(x => !followUsed.has(x))); // 找出应该被删除的赋值操作
        // console.log(deletedAssign);

        for(let eachDel of deletedAssign) {
            const block = splitIR.blocks[i];
            for(let j = block.length - 1; j >= 0; j--) { // 逆向遍历
                if(block[j][1] === eachDel || block[j][2] === eachDel) {
                    break; // 如果在本块内部仍有使用这个变量，则不能删除
                }

                if(!assignSet.has(block[j][0])) {
                    continue;
                }

                if(block[j][3] !== eachDel) {
                    continue;
                }

                // 至此，找到了需要删除无用赋值/加减乘除等计算
                count++;
                if(block[j][0] === 'call') {
                    splitIR.blocks[i][j][3] = ''; // 保留函数调用，但删除将函数调用结果对变量进行的赋值
                } else {
                    // console.log(splitIR.blocks[i][j]);
                    splitIR.blocks[i].splice(j, 1); // 删除这句中间代码
                }
                break;
            }
        }
    }

    for(let i = 0; i < blockNum; i++) {
        const block = splitIR.blocks[i];
        for(let j = 0; j < block.length - 1; j++) {
            const IR1 = block[j];
            const IR2 = block[j+1];
            if((IR1[0] === IR2[0]) &&
               (IR1[1] === IR2[1]) &&
               (IR1[2] === IR2[2]) &&
               (IR1[3] === IR2[3])) {
                count++;
                splitIR.blocks[i].splice(j, 1); // 删除这句中间代码
            }
        }
    }

    let newOtherIR = new Array();
    for(let each of splitIR.blocks) {
        newOtherIR = newOtherIR.concat(each);
    }

    return {
        IR: splitIR.head.concat(newOtherIR),
        count: count
    };
};

/**
 * 分析基本块相互关系，对变量进行替换
 * 进行块间的常量传播和复写传播
 * 找到块间的公共子表达式，进行优化
 * @private
 * @param {Array} splitIR
 * @return 优化后的中间代码，及优化的次数
 */
IR_Optimizer_CFG.prototype._replaceVarBetween = function(splitIR) {
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

    const usedVar = new Map();
    const assignVar = new Map();
    const assignSet = new Set(['uminus', '+', '-', '*', '/', 'call', 'assign']); // 赋值和加减乘除等计算都包括赋值的动作
    let count = 0;

    const blockNum = splitIR.blocks.length;
    for(let i = 0; i < blockNum; i++) {
        usedVar.set(i, new Set());
        assignVar.set(i, new Set());
    }

    // 计算每个基本块使用的变量及进行赋值的变量
    // 使用的变量即作为操作数的变量
    for(let i = 0; i < blockNum; i++) {
        const block = splitIR.blocks[i];
        for(let each of block) {
            if(assignSet.has(each[0])) {
                if(each[3] !== '') {
                    assignVar.get(i).add(each[3]);
                }
            }

            if(each[0] === 'call') {
                continue;
            }

            if(each[1] !== '') {
                usedVar.get(i).add(each[1]);
            }
            if(each[2] !== '') {
                usedVar.get(i).add(each[2]);
            }
        }
    }
    // 至此得到每个基本块中，对于变量的赋值和使用情况


    for(let i = 0; i < blockNum; i++) {
        const block = splitIR.blocks[i];
        const assignVarInBlock = assignVar.get(i);
        for(let eachVar of assignVarInBlock) {
            for(let j = block.length - 1; j >= 0; j--) {
                if(block[j][3] !== eachVar) {
                    continue;
                }
                // 定位到相关语句
                // console.log(block[j]);
            }
        }        
    }
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

        result = this._eliminateRedundantAssignWithin(result.IR);
        count += result.count;

        newOtherIR = newOtherIR.concat(result.IR);
    }

    let optimizedIR = GC.splitIR(head.concat(newOtherIR)); 
    let optimizedIRRes = this._eliminateRedundantJump(optimizedIR);

    optimizedIR = GC.splitIR(optimizedIRRes.IR);
    count += optimizedIRRes.count;

    optimizedIRRes = this._eliminateRedundantIRBetween(optimizedIR); 

    optimizedIR = GC.splitIR(optimizedIRRes.IR);
    count += optimizedIRRes.count;

    optimizedIRRes = this._replaceVarBetween(optimizedIR); 

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
        while(i < each.length) {
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