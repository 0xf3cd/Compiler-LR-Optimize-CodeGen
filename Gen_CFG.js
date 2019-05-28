/**
 * 根据中间代码生成 CFG 控制流图
 * @class
 */
class Gen_CFG {
    constructor() {
    }
}

/**
 * 将中间代码拆分为基本块
 * @private
 * @param {Array} IR
 * @return 一个对象，包含中间代码的头部分控制流图的部分 head（bss、data、fparam、flocal等），及基本块
 */
Gen_CFG.prototype._splitIntoBlocks = function(IR) {
    const IRLength = IR.length;

    const head = new Array();
    const headSet = new Set(['bss', 'data', 'fparam', 'flocal', 'func']);
    const otherIR = new Array(); // 除去 head 以外的中间代码
    const record = new Map(); // 记录控制流图开始和结束的节点
    const startSet = new Set(['label']); // 记录导致控制流图开始的中间代码
    const endSet = new Set(['goto', 'jg', 'jge', 'jl', 'jle', 'je', 'jne', 'ret']); // 记录导致控制流图结尾的中间代码
    const splitRange = new Array(); // 记录控制流图的划分情况
    const blocks = new Array(); // 基本块

    let i = 0;
    while(i < IRLength) {
        if(headSet.has(IR[i][0])) {
            head.push(IR[i]);
            i++;
        } else {
            break;
        }
    }

    let lineCount = 0;
    while(i < IRLength) {
        otherIR.push(IR[i]);

        if(startSet.has(IR[i][0]) || endSet.has(IR[i][0])) {
            record.set(lineCount, IR[i][0]);
        }

        lineCount++;
        i++;
    }

    let startIndex = 0;
    const otherLength = otherIR.length;
    for(i = 0; i < otherLength; i++) {
        if(record.has(i)) {
            if(endSet.has(record.get(i))) { // 当前中间代码应该为控制流图中某一块的结尾
                if(startIndex <= i) {
                    splitRange.push([startIndex, i]);
                    startIndex = i + 1;
                }  
            } else { // 当前中间代码应该为控制流图中某一块的开头
                if(startIndex <= i-1) {
                    splitRange.push([startIndex, i-1]);
                    startIndex = i;
                }
            }
        }
    }
   
    for(let [startIndex, endIndex] of splitRange) {
        // console.log(startIndex, endIndex);
        const block = otherIR.slice(startIndex, endIndex+1);
        blocks.push(block);
    }

    // console.log(IR);
    // console.log(record);
    // console.log(otherIR);
    // console.log(splitRange);
    // console.log(blocks);
    return {
        head: head,
        otherIR: otherIR,
        splitRange: splitRange,
        blocks: blocks
    };
};

/**
 * 根据中间代码建立控制流图
 * @public
 * @param {Array} IR
 * @return 一个对象，包含中间代码划分结果及控制流图
 */
Gen_CFG.prototype.splitIR = function(IR) {
    const res = this._splitIntoBlocks(IR);

    const jumpSet = new Set(['jg', 'jge', 'jl', 'jle', 'je', 'jne']);

    const head = res.head;
    const otherIR = res.otherIR; // 除去 head 以外的中间代码
    const splitRange = res.splitRange; // 记录控制流图的划分情况
    const blocks = res.blocks; // 基本块

    const blockMatrix = new Array();
    const blockNum = blocks.length;
    for(let i = 0; i < blockNum; i++) {
        const item = new Array();
        for(let j = 0; j < blockNum; j++) {
            item[j] = false;
        }
        blockMatrix.push(item);
    }

    const blockLabel = new Map();
    for(let i = 0; i < blockNum; i++) {
        const each = blocks[i];
        if(each[0][0] !== 'label') {
            continue;
        }

        blockLabel.set(each[0][3], i);
    }

    for(let i = 0; i < blockNum; i++) {
        const each = blocks[i];
        const eachLastIR = each[each.length-1]; // the last IR of the block "each"

        if(jumpSet.has(eachLastIR[0])) {
            const jumpTo = blockLabel.get(eachLastIR[3]);
            blockMatrix[i][jumpTo] = true;

            if(i !== blockNum-1) {
                blockMatrix[i][i+1] = true;
            }
        } else if(eachLastIR[0] === 'goto') {
            const jumpTo = blockLabel.get(eachLastIR[3]);
            blockMatrix[i][jumpTo] = true;
        } else if(eachLastIR[0] === 'ret') {
            // do nothing
        } else {
            if(i !== blockNum-1) {
                blockMatrix[i][i+1] = true;
            }
        }
    }

    // console.log(IR);
    // console.log(record);
    // console.log(otherIR);
    // console.log(splitRange);
    // console.log(blocks);
    // console.log(blockMatrix);
    // console.log(blockLabel);
    return {
        head: head,
        otherIR: otherIR,
        splitRange: splitRange,
        blocks: blocks,
        blockMatrix: blockMatrix
    };
};

module.exports = Gen_CFG;