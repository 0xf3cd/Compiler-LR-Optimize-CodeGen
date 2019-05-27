/**
 * 寄存器分配类
 * @class
 */
class Reg_Allocator {
    constructor() {
        /**
         * 记录 CFG 拆分结果
         * @private
         * @type {Array}
         */
    }
}

/**
 * 将中间代码拆分程数据流图，生成一个对象
 * @public
 * @param {Array} IR
 * @return 一个对象，包含中间代码的头部分数据流图的部分 head（bss、data、fparam、flocal等），及数据流图 CFG
 */
Reg_Allocator.prototype.splitIR = function(IR) {
    const IRLength = IR.length;

    const head = new Array();
    const headSet = new Set(['bss', 'data', 'fparam', 'flocal', 'func']);
    const otherIR = new Array(); // 除去 head 以外的中间代码
    const record = new Map(); // 记录数据流图开始和结束的节点
    const startSet = new Set(['label']); // 记录导致数据流图开始的中间代码
    const endSet = new Set(['goto', 'jg', 'jge', 'jl', 'jle', 'je', 'jne', 'ret']); // 记录导致数据流图结尾的中间代码
    const splitRange = new Array(); // 记录数据流图的划分情况

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
    for(i = 1; i < otherLength; i++) {
        if(record.has(i)) {
            if(endSet.has(record.get(i))) { // 当前中间代码应该为数据流图中某一块的结尾
                if(startIndex <= i) {
                    splitRange.push([startIndex, i]);
                    startIndex = i + 1;
                }  
            } else { // 当前中间代码应该为数据流图中某一块的开头
                if(startIndex <= i-1) {
                    splitRange.push([startIndex, i-1]);
                    startIndex = i;
                }
            }
        }
    }

    console.log(IR);
    console.log(record);
    console.log(otherIR);
    console.log(splitRange);
};

module.exports = Reg_Allocator;