/**
 * 目标代码的窥孔优化
 * @class
 */
class ASM_Peephole_Optimizer {
    constructor() {

    }
}

// 将汇编代码拆分成数组（按标签和跳转指令划分）
ASM_Peephole_Optimizer.prototype.splitASM = function(nasm) {
    const splitNasm = nasm.split('\n');
    const nasmLength = splitNasm.length;
    const optimizeSet = new Set();

    for(let i = 0; i < nasmLength; i++) {
        if(splitNasm[i].indexOf('mov') !== -1) {
            const ops = splitNasm[i].split('\t')[3].split(', ');
            const op1 = ops[0];
            const op2 = ops[1];
            if(op1 === op2) {
                optimizeSet.add(i);
            }
        }
    }


    while(true) {
        const optimizeSize = optimizeSet.size;
        for(let i = 0; i < nasmLength-1; i++) {
            if(splitNasm[i] === splitNasm[i+1]) {
                optimizeSet.add(i+1);
            }
    
            if(splitNasm[i].indexOf('mov') !== -1 && splitNasm[i+1].indexOf('mov') !== -1) {
                const ops = splitNasm[i].split('\t')[3].split(', ');
                const op1 = ops[0];
                const op2 = ops[1];
    
                const ops_ = splitNasm[i+1].split('\t')[3].split(', ');
                const op1_ = ops_[0];
                const op2_ = ops_[1];
    
                if((op1 === op1_ && op2 === op2_) || 
                   (op1 === op2_ && op2 === op1_)) {
                    optimizeSet.add(i+1);
                }
    
                if(op1 === op2_ && op1 === 'rbx') {
                    splitNasm[i] = `\tmov\t\t${op1_}, ${op2}`;
                    optimizeSet.add(i+1);
                }
            }
        }

        if(optimizeSet.size === optimizeSize) {
            // 没有新的优化产生
            break;
        }
    }
    

    let newNasm = '';
    for(let i = 0; i < nasmLength; i++) {
        if(!optimizeSet.has(i)) {
            newNasm += splitNasm[i] + '\n';
        }
    }

    // console.log(optimizeSet);
    return newNasm;
};

module.exports = ASM_Peephole_Optimizer;