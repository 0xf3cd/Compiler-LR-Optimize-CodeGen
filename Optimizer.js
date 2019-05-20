const globalVars = new Set();
const isGlobal = function(varName) {
    return globalVars.has(varName);
};

/**
 * 代码优化器类
 * @class
 */
class Optimizer {
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
 */
Optimizer.prototype._optimizeGlobal = function(globalIR) {
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
 */
Optimizer.prototype._optimizeFunc = function(funcIR) {
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
 */
Optimizer.prototype._constantFolding = function(IR) {
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
 */
Optimizer.prototype.optimizeGlobal = function(globalIR) {
    let IR = globalIR;
    let changeNum = 0;
    let replaceMap = new Map();

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
        }
    }
    
    return {
        IR: IR,
        replaceMap: replaceMap
    };
};

/**
 * 将函数中间代码进行优化
 * @public
 * @param {Array} funcIR
 * @param {Array} globalReplaceMap
 */
Optimizer.prototype.optimizeFunc = function(funcIR, globalReplaceMap) {
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
            }
        }
        
        newFuncIR.push(optimizedFunc);
    }

    return newFuncIR;
};

/**
 * 将中间代码进行优化
 * @public
 * @param {Array} funcIR
 */
Optimizer.prototype.optimize = function(IR) {
    const optimizedGlobal = this.optimizeGlobal(IR.global);

    for(let eachIR of optimizedGlobal.IR) {
        if(eachIR[0] === 'data' || eachIR[0] === 'bss') {
            globalVars.add(eachIR[1]);
        }
    }

    const globalReplaceMap = optimizedGlobal.replaceMap;
    const optimizedFunc = this.optimizeFunc(IR.funcs, globalReplaceMap);

    return {
        global: optimizedGlobal.IR,
        funcs: optimizedFunc,
        funcVarNum: IR.funcVarNum
    };
};

module.exports = Optimizer;