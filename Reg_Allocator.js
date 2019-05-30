const Gen_CFG = require('./Gen_CFG.js'); 
const GC = new Gen_CFG();

/**
 * 寄存器分配类
 * 采用图染色的寄存器分配方法
 * @class
 */
class Reg_Allocator {
    constructor() {

    }
}

/**
 * 计算经过某一条语句后各变量生存期分析的情况
 * @private
 * @param {Array} eachIR 某一条中间代码
 * @param {Set} liveSet 在计算前的生存期情况
 * @return 新的变量生存期情况
 */
Reg_Allocator.prototype._calcLiveOfOneIR = function(eachIR, liveSet) {
    const unrelatedIR = new Set(['call', 'func', 'label', 'data', 'bss', 'fparam', 'flocal']);
    const newLiveSet = new Set([...liveSet].filter(x => x !== eachIR[3]));

    if(!unrelatedIR.has(eachIR[0])) {
        if(eachIR[1] !== '' && isNaN(parseInt(eachIR[1]))) {
            newLiveSet.add(eachIR[1]);
        }
        if(eachIR[2] !== '' && isNaN(parseInt(eachIR[2]))) {
            newLiveSet.add(eachIR[2]);
        }
    }

    // console.log(newLiveSet);
    return newLiveSet;
};

/**
 * 计算某一个基本块中各变量生存期分析的情况
 * @private
 * @param {Array} blockIR 某个基本块的中间代码
 * @param {Set} liveSet 在计算前的生存期情况
 * @return 一个包含各个阶段的变量生存情况的对象，包含最终计算的结果及中间结果
 */
Reg_Allocator.prototype._calcLiveOfBlockIR = function(blockIR, liveSet) {
    let newLiveSet = new Set([...liveSet]);
    const liveSetArray = new Array();
    liveSetArray.push(newLiveSet);
    const blockNum = blockIR.length;

    for(let i = blockNum - 1; i >= 0; i--) {
        newLiveSet = this._calcLiveOfOneIR(blockIR[i], newLiveSet);
        liveSetArray.push(newLiveSet);
    }

    // console.log(newLiveSet);
    return {
        start: newLiveSet,
        all: liveSetArray
    };
};

/**
 * 计算一个函数的中间代码各变量的生存期情况
 * @private
 * @param {Array} partIR 某个函数的中间代码
 * @return {Set.<Set>} 某一个函数的中间代码中，各语句执行后变量生存分析的结果之集合，即会同时活跃的变量的集合
 */
Reg_Allocator.prototype._getLiveInfo = function(partIR) {
    const splitIR = GC.splitIR(partIR);
    const matrix = splitIR.blockMatrix;
    const blocks = splitIR.blocks;
    const blockNum = blocks.length;

    // 找出后续不会执行其他基本块的基本块
    const endBlock = new Set();
    for(let i = 0; i < blockNum; i++) {
        const follows = matrix[i];
        const cond = new Set([...follows]);
        if(cond.size === 1 && cond.has(false)) {
            endBlock.add(i);
        }
    }

    const liveInfoSet = new Set();
    const startLiveSet = new Array(blockNum);
    const endLiveSet = new Array(blockNum);
    for(let i = 0; i < blockNum; i++) {
        startLiveSet[i] = new Set();
        endLiveSet[i] = new Set();
    }

    for(let each of endBlock) {
        const calcResult = this._calcLiveOfBlockIR(blocks[each], endLiveSet[each]);
        startLiveSet[each] = calcResult.start;

        // 将新计算得到的变量生存情况加入集合
        // 剔除重复的情况
        for(let eachSet of calcResult.all) {
            let hasExisted = false;
            for(let existSet of liveInfoSet) {
                let existCount = 0;

                const setDiff1 = new Set([...existSet].filter(x => !eachSet.has(x)));
                existCount += setDiff1.size;
                const setDiff2 = new Set([...eachSet].filter(x => !existSet.has(x)));
                existCount += setDiff2.size;

                if(existCount === 0) {
                    hasExisted = true;
                    break;
                }
            }

            if(!hasExisted) {
                liveInfoSet.add(eachSet);
            }
        }
    }

    while(true) {
        let diffCount = 0;
        for(let i = 0; i < blockNum; i++) {
            const follows = new Set(); // 第 i 个基本块有可能访问的后续基本块的集合
            for(let j = 0; j < blockNum; j++) {
                if(matrix[i][j]) {
                    follows.add(j);
                }
            }
    
            // 计算某个基本块结束时的变量生存信息
            let newEndLiveSet = new Set();
            for(let each of follows) {
                newEndLiveSet = new Set([...newEndLiveSet, ...startLiveSet[each]]);
            }
            endLiveSet[i] = newEndLiveSet;
    
            // 计算基本块开始时和中间各阶段的变量生存信息
            // liveInfoSet
            const calcResult = this._calcLiveOfBlockIR(blocks[i], endLiveSet[i]);
            const newStartLiveSet = calcResult.start;

            // 将新计算得到的变量生存情况加入集合
            // 剔除重复的情况
            for(let eachSet of calcResult.all) {
                let hasExisted = false;
                for(let existSet of liveInfoSet) {
                    let existCount = 0;

                    const setDiff1 = new Set([...existSet].filter(x => !eachSet.has(x)));
                    existCount += setDiff1.size;
                    const setDiff2 = new Set([...eachSet].filter(x => !existSet.has(x)));
                    existCount += setDiff2.size;

                    if(existCount === 0) {
                        hasExisted = true;
                        break;
                    }
                }

                if(!hasExisted) {
                    liveInfoSet.add(eachSet);
                }
            }
            
            // 计算新计算的开始时生存期变量和老的结果的差异
            const startLiveSetDiff = new Set([...newStartLiveSet].filter(x => !startLiveSet[i].has(x)));

            diffCount += startLiveSetDiff.size;
            startLiveSet[i] = newStartLiveSet;
        }

        if(diffCount === 0) {
            break;
        }
    }
    
    // console.log(splitIR.head);
    // console.log(blocks);
    // console.log(liveInfoSet);
    // console.log(startLiveSet);
    // console.log(endLiveSet);
    return liveInfoSet;
};

/**
 * 根据 Liveness Analysis 的结果，利用图染色算法进行寄存器分配
 * rbx 作为临时寄存器
 * rcx, rdx, r8 - r15 共 10 个寄存器用于分配
 * @private
 * @param {Array} liveInfoSet 会同时活跃的变量的集合
 * @param {Array} varSet 变量集合
 * @return {Object} 分配结果
 */
Reg_Allocator.prototype._graphColoration = function(liveInfoSet, varSet) {
    const varNum = varSet.size;
    let no = 0;
    const varNo = new Map(); // 为变量分配编号
    for(let v of varSet) {
        varNo.set(v, no);
        no++;
    }

    const matrix = new Array(varNum); // 邻接矩阵，记录活跃变量同时出现的关系
    for(let i = 0; i < varNum; i++) {
        matrix[i] = new Array();
        for(let j = 0; j < varNum; j++) {
            matrix[i][j] = false;
        }
    }
    
    for(let s of liveInfoSet) {
        for(let v1 of s) {
            for(let v2 of s) {
                if(v1 === v2) {
                    continue;
                }

                const vn1 = varNo.get(v1);
                const vn2 = varNo.get(v2);
                matrix[vn1][vn2] = true;
                matrix[vn2][vn1] = true;
            }
        }
    }
    // 至此，得到了对应的邻接矩阵

    const allocateMap = new Map();
    const endSize = varNum > 10? 10: varNum; // 当所有变量分配完毕，或是所有寄存器已经分配完时，结束分配
    const varStack = new Array; // 用数组模拟 Chaitin 算法中的栈
    while(allocateMap.size < endSize) {
        let connectNum = varNum + 1;
        let leastConnectVar;
        for(let v of varSet) {
            if(varStack.indexOf(v) !== -1) {
                continue; // 如果某个变量已经在栈中，则不参与比较
            }

            const vn = varNo.get(v); // 得到该变量的编号
            let connectCount = 0;
            for(let v_ of varSet) {
                const vn_ = varNo.get(v_);
                if(varStack.indexOf(v_) !== -1 && matrix[vn][vn_]) {
                    // 如果某个变量 v_ 和 v 在图中有边连接，同时 v_ 还未压栈
                    connectCount++;
                }
            }
            // 至此计算出图中和 v 相连的、未压入栈中的结点的数量
            if(connectCount < connectNum) {
                connectNum = connectCount;
                leastConnectVar = v;
            }
        }

        varStack.push(leastConnectVar);
    }

    console.log(varStack);
};

module.exports = Reg_Allocator;