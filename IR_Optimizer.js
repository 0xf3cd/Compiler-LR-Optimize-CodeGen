const globalVars = new Set();
const isGlobal = function(varName) {
    return globalVars.has(varName);
};

/**
 * 代码优化器类
 * 进行常量折叠、常量传播、复写传播、部分死代码消除等优化
 * 也进行一部分的窥孔优化，删去一部分无用的标签
 * 进行简单的优化，不将中间代码转换为数据流图
 * @class
 */
class IR_Optimizer {
    constructor() {
        /**
         * 记录中间代码中的全局变量部分
         * @private
         * @type {Array}
         */
        // this._optimizedFuncIR = new Array();
    }
}

/**
 * 具体执行全局中间代码优化的函数
 * @private
 * @param {Array} globalIR
 * @return 优化后的全局中间代码
 */
IR_Optimizer.prototype._optimizeGlobal = function(globalIR) {
    const continueSet = new Set(['bss', 'data']);
    const bss = new Set();
    const data = new Set();
    const assignMap = new Map();
    const calcMap = new Map();
    const replaceMap = new Map();
    const dataValue = new Map();

    const IRlength = globalIR.length;
    let i = 0;
    while(i < IRlength) {
        const eachStat = globalIR[i];
        if(!continueSet.has(eachStat[0])) {
            break;
        }

        if(eachStat[0] === 'bss') {
            bss.add(eachStat[1]);
        }

        if(eachStat[0] === 'data') {
            data.add(eachStat[1]);

            if(dataValue.has(eachStat[2])) {
                replaceMap.set(eachStat[1], dataValue.get(eachStat[2]));
            } else {
                dataValue.set(eachStat[2], eachStat[1]);
            }
        }

        i++;
    }

    for(let each of bss) {
        assignMap.set(each, new Set());
        calcMap.set(each, new Set());
    }

    while(true) {
        if(i === IRlength) {
            break;
        }

        const eachStat = globalIR[i];
        if(eachStat[0] === 'assign') {
            const from = eachStat[1];
            const to = eachStat[3];
            // to := from;

            assignMap.get(to).add(from);
        } else {
            const to = eachStat[3];
            if(assignMap.has(to)) {
                calcMap.get(to).add(eachStat[0]);
            }
        }

        i++;
    }

    // console.log(assignMap);
    for(let [k, v] of assignMap) {
        // console.log(v.size);
        if(v.size == 1) { // 如果某个局部变量只有一次赋值
            const name = v.values().next().value;
            if(!isNaN(parseInt(name))) {
                replaceMap.set(k, name); // 如果给局部变量赋值为常数
            } else {
                if(assignMap.has(name) && assignMap.get(name).size === 0 
                   && calcMap.has(name) && calcMap.get(name).size === 1) {
                    replaceMap.set(k, name);
                }
            }
        }
    }

    const replaceNum = replaceMap.size;
    const newIR = new Array();

    for(let each of globalIR) {
        each = new Array(...each);
        if(each[0] === 'bss') {
            if(replaceMap.has(each[1])) {
                continue;
            }
        } else if (each[0] === 'data') { 
            if(replaceMap.has(each[1])) {
                continue;
            }
        } else if (each[0] === 'assign') {
            if(replaceMap.has(each[3]) && replaceMap.get(each[3]) === each[1]) {
                continue;
            }
        }

        for(let i = 1; i < 4; i++) {
            if(replaceMap.has(each[i])) {
                each[i] = replaceMap.get(each[i]);
            }
        }
    
        newIR.push(each);
    }

    return {
        newIR: newIR,
        replaceNum: replaceNum,
        replaceMap: replaceMap
    };
};

/**
 * 具体优化函数中间代码的函数
 * @private
 * @param {Array} funcIR
 * @return 优化后的全局中间代码，以及相关的优化信息
 */
IR_Optimizer.prototype._optimizeFunc = function(funcIR) {
    const continueSet = new Set(['func', 'fparam', 'flocal']);
    const fparam = new Set();
    const flocal = new Set();
    const assignMap = new Map();
    const calcMap = new Map();
    const replaceMap = new Map();

    const IRlength = funcIR.length;
    let i = 0;
    while(true) {
        const eachStat = funcIR[i];
        if(!continueSet.has(eachStat[0])) {
            break;
        }

        if(eachStat[0] === 'fparam') {
            fparam.add(eachStat[1]);
        } else if(eachStat[0] === 'flocal') {
            flocal.add(eachStat[1]);
        }

        i++;
    }

    for(let each of new Set([...fparam, ...flocal])) {
        assignMap.set(each, new Set());
        calcMap.set(each, new Set());
    }

    while(true) {
        if(i === IRlength) {
            break;
        }

        const eachStat = funcIR[i];
        if(eachStat[0] === 'assign') {
            const from = eachStat[1];
            const to = eachStat[3];
            // to := from;

            if(isGlobal(to)) {
                i++;
                continue;
            }

            assignMap.get(to).add(from);
        } else {
            const to = eachStat[3];
            if(isGlobal(to)) {
                i++;
                continue;
            }

            if(assignMap.has(to)) {
                calcMap.get(to).add(eachStat[0]);
            }
        }

        i++;
    }

    for(let [k, v] of assignMap) {
        // console.log(v.size);
        if(!fparam.has(k) && v.size == 1) { // 如果某个局部变量只有一次赋值
            const name = v.values().next().value;
            if(!isNaN(parseInt(name))) {
                replaceMap.set(k, name); // 如果给局部变量赋值为常数
            } else {
                if(assignMap.get(name).size === 0 && calcMap.get(name).size === 1) {
                    replaceMap.set(k, name);
                } else if(assignMap.get(name).size === 0 && calcMap.get(name).size === 0 && fparam.has(name)) {
                    replaceMap.set(k, name);
                }
            }
        }
    }

    const replaceNum = replaceMap.size;
    const newIR = new Array();

    for(let each of funcIR) {
        each = new Array(...each);
        if(each[0] === 'flocal') {
            if(replaceMap.has(each[1])) {
                continue;
            }
        } else if (each[0] === 'assign') {
            if(replaceMap.has(each[3]) && replaceMap.get(each[3]) === each[1]) {
                continue;
            }
        }

        for(let i = 1; i < 4; i++) {
            if(replaceMap.has(each[i])) {
                each[i] = replaceMap.get(each[i]);
            }
        }
    
        newIR.push(each);
    }

    // console.log(assignMap);
    // console.log(calcMap);
    // console.log(replaceMap);
    // console.log(funcIR);
    // console.log(newIR);
    // console.log();

    return {
        newIR: newIR,
        replaceNum: replaceNum
    };
};

/**
 * 将一部分中间代码进行常量折叠
 * @private
 * @param {Array} IR
 * @return 优化后的中间代码，及进行常量折叠优化的情况
 */
IR_Optimizer.prototype._constantFolding = function(IR) {
    let count = 0;
    const newIR = new Array();
    for(let each of IR) {
        if(!isNaN(parseInt(each[1])) && !isNaN(parseInt(each[2]))) {
            const p1 = parseInt(each[1]);
            const p2 = parseInt(each[2]);
            let ans;
            if(each[0] === '+') {
                ans = p1 + p2;
            } else if(each[0] === '-') {
                ans = p1 - p2;
            } else if(each[0] === '*') {
                ans = p1 * p2;
            } else if(each[0] === '/') {
                if(p1 < 0) {
                    if(p2 < 0) {
                        p1 = -p1;
                        p2 = -p2;
                        ans = Math.floor(p1/p2);
                    } else {
                        p1 = -p1;
                        ans = -Math.floor(p1/p2);
                    }
                } else {
                    if(p2 < 0) {
                        p2 = -p2;
                        ans = -Math.floor(p1/p2);
                    } else {
                        ans = Math.floor(p1/p2);
                    }
                }
            } else {
                newIR.push(each);
                continue;
            }

            count++;
            newIR.push(['assign', ans.toString(), '', each[3]]);
            continue;
        }
        newIR.push(each);
    }

    return {
        IR: newIR,
        foldCount: count
    };
};

/**
 * 将全局中间代码进行优化
 * @public
 * @param {Array} globalIR
 * @return 优化后的全局中间代码，及优化过程的相关情况
 */
IR_Optimizer.prototype.optimizeGlobal = function(globalIR) {
    let IR = globalIR;
    let changeNum = 0;
    let replaceMap = new Map();

    let totalCount = 0; // 记录进行优化的次数

    if(globalIR.length === 0) {
        return {
            IR: globalIR,
            replaceMap: replaceMap
        };
    }

    while(true) {
        const result = this._optimizeGlobal(IR);
        IR = result.newIR;
        changeNum = result.replaceNum;

        const values = new Set();
        for(let [k, v] of replaceMap) {
            values.add(v);
        }

        const tempMap = result.replaceMap;
        for(let [k, v] of tempMap) {
            if(values.has(k)) {
                for(let [k_, v_] of replaceMap) {
                    if(v_ === k) {
                        replaceMap.set(k_, v);
                    }
                }
            } else {
                replaceMap.set(k, v);
            }
        }

        const foldedResult = this._constantFolding(IR);
        IR = foldedResult.IR;
        changeNum += foldedResult.foldCount;

        if(changeNum === 0) {
            break;
        } else {
            totalCount += changeNum;
        }
    }
    
    return {
        IR: IR,
        replaceMap: replaceMap,
        count: totalCount
    };
};

/**
 * 将函数中间代码进行优化
 * @public
 * @param {Array} funcIR
 * @param {Array} globalReplaceMap
 * @return 优化后的函数中间代码
 */
IR_Optimizer.prototype.optimizeFunc = function(funcIR, globalReplaceMap) {
    const replacedFuncIR = new Array();
    for(let eachFunc of funcIR) {
        eachFunc = new Array(...eachFunc);
        for(let i = 0; i < eachFunc.length; i++) {
            for(let j = 0; j < 4; j++) {
                const item = eachFunc[i][j];
                if(globalReplaceMap.has(item)) {
                    eachFunc[i][j] =  globalReplaceMap.get(item);
                }
            }
        }

        replacedFuncIR.push(eachFunc);
    }

    let totalCount = 0; // 记录进行优化的次数

    const newFuncIR = new Array();
    for(let eachFunc of replacedFuncIR) {
        let optimizedFunc = eachFunc;
        let changeNum = 0;
        while(true) {
            const result = this._optimizeFunc(optimizedFunc);
            optimizedFunc = result.newIR;
            changeNum = result.replaceNum;

            const foldedResult = this._constantFolding(optimizedFunc);
            optimizedFunc = foldedResult.IR;
            changeNum += foldedResult.foldCount;

            if(changeNum === 0) {
                break;
            } else {
                totalCount += changeNum;
            }
        }
        
        newFuncIR.push(optimizedFunc);
    }

    // return newFuncIR;
    return {
        IR: newFuncIR,
        count: totalCount
    };
};

/**
 * 消除一部分死代码
 * 消除 if(18 > 0) {x} 这种情况下产生的死代码
 * @private
 * @param {Array} IR
 * @return 消除部分死代码后的中间代码，及优化情况
 */
IR_Optimizer.prototype._eliminateDeadCode = function(IR) {
    const cmpIR = new Set(['jg', 'jge', 'jl', 'jle', 'je', 'jne']);
    const newIR = new Array();
    let count = 0;
    
    IR.forEach(ir => {
        if(!cmpIR.has(ir[0])) {
            newIR.push(ir);
            return;
        }

        const v1 = parseInt(ir[1]);
        const v2 = parseInt(ir[2]);
        if(isNaN(v1) || isNaN(v2)) {
            newIR.push(ir);
            return;
        }

        // 至此，这条比较指令两个比较数都为常数
        count++;
        let cmpResult;
        switch(ir[0]) {
            case('jg'): {
                cmpResult = v1 > v2? true: false;
                break;
            }
            case('jge'): {
                cmpResult = v1 >= v2? true: false;
                break;
            }
            case('jl'): {
                cmpResult = v1 < v2? true: false;
                break;
            }
            case('jle'): {
                cmpResult = v1 <= v2? true: false;
                break;
            }
            case('je'): {
                cmpResult = v1 === v2? true: false;
                break;
            }
            case('jne'): {
                cmpResult = v1 !== v2? true: false;
                break;
            }
        }

        // console.log(cmpResult);
        if(cmpResult) {
            newIR.push(['goto', '', '', ir[3]]);
        }
    });

    return {
        IR: newIR,
        eliminateNum: count
    };
};

/**
 * 进行一部分窥孔优化
 * 删除连续出现的标签
 * @private
 * @param {Array} IR
 * @return 优化后的中间代码，及优化情况
 */
IR_Optimizer.prototype._peepholeOptimize = function(IR) {
    const newIR = new Array();
    const replaceMap = new Map(); // 记录标签替换的情况
    const redundantLine = new Set(); // 记录需要删去的标签所在行数
    
    // 窥孔窗口大小为 2
    for(let i = 0; i < IR.length-1; i++) {
        if(IR[i][0] === 'label' && IR[i+1][0] === 'label') {
            const l1 = IR[i][3];
            const l2 = IR[i+1][3];

            replaceMap.set(l2, l1);
            redundantLine.add(i+1);
        }
    }

    for(let i = 0; i < IR.length; i++) {
        if(redundantLine.has(i)) {
            continue;
        }

        newIR.push(IR[i]);
    }

    while(true) {
        let count = 0;

        for(let [k, v] of replaceMap) {
            if(replaceMap.has(v)) {
                replaceMap.set(k, replaceMap.get(v));
                count++;
            }
        }

        if(count === 0) {
            break;
        }
    }

    for(let i = 0; i < newIR.length; i++) {
        for(let j = 0; j < 4; j++) {
            if(replaceMap.has(newIR[i][j])) {
                newIR[i][j] = replaceMap.get(newIR[i][j]);
            }
        }
    }

    // if(replaceMap.size !== 0) {
    //     console.log(replaceMap);
    // }

    return {
        IR: newIR,
        count: redundantLine.size
    };
};

/**
 * 将中间代码进行优化
 * @public
 * @param {Array} funcIR
 * @return 进行优化后的代码，以及优化的情况
 */
IR_Optimizer.prototype.optimize = function(IR) {
    let optimizedGlobal = IR.global;
    let globalReplaceMap;
    let optimizedFunc = IR.funcs;

    let totalCount = 0; // 记录进行优化的次数

    while(true) {
        const optimizedGlobalRes = this.optimizeGlobal(optimizedGlobal);
        globalReplaceMap = optimizedGlobalRes.replaceMap;

        totalCount += optimizedGlobalRes.count;

        const optimizedFuncRes = this.optimizeFunc(optimizedFunc, globalReplaceMap);
        optimizedFunc = optimizedFuncRes.IR;
        totalCount += optimizedFuncRes.count;

        let count = 0;
        let result;

        result = this._eliminateDeadCode(optimizedGlobalRes.IR);
        optimizedGlobal = result.IR;
        count += result.eliminateNum;

        result = this._peepholeOptimize(optimizedGlobal);
        optimizedGlobal = result.IR;
        count += result.count;

        const newOptimizedFunc = new Array();
        for(let each of optimizedFunc) {
            result = this._eliminateDeadCode(each);
            count += result.eliminateNum;

            result = this._peepholeOptimize(result.IR);
            newOptimizedFunc.push(result.IR);
            count += result.count;
        }

        // for(let each of newOptimizedFunc) {
        //     if(each[0][3] === '_main') {
        //         console.log(each);
        //     }
        // }

        optimizedFunc = newOptimizedFunc;

        if(count === 0) {
            break;
        } else {
            // optimizedGlobal = optimizedGlobal.IR;
            totalCount += count;
        }
    }

    for(let eachIR of optimizedGlobal) {
        if(eachIR[0] === 'data' || eachIR[0] === 'bss') {
            globalVars.add(eachIR[1]);
        }
    }
    
    return {
        global: optimizedGlobal,
        funcs: optimizedFunc,
        funcVarNum: IR.funcVarNum,
        count: totalCount
    };
};

module.exports = IR_Optimizer;