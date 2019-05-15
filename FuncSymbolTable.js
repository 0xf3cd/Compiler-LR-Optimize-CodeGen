// 函数符号表类

/**
 * 函数符号表内的项
 * @class
 */
class FuncItem {
    constructor() {
        /**
         * 函数名
         * @public
         * @type {string}
         */
        this.funcName = null;

        /**
         * 返回值类型
         * @public
         * @type {string}
         */
        this.returnType = null;

        /**
         * 参数类型
         * @public
         * @type {Array.<string>}
         */
        this.paramType = new Array();

        /**
         * 参数名
         * @public
         * @type {Array.<string>}
         */
        this.paramName = new Array();
    }
}

/**
 * 函数符号表类，用于记录函数的细节
 * @class
 */
class FuncSymbolTable {
    constructor() {
        /**
         * 储存表项的表格
         * @private
         * @type {Array.<FuncItem>}
         */
        this._table = new Array();
    }
}

/**
 * 检查函数表中是否有对应的函数
 * @public
 * @param {string} funcName 函数名
 * @param {Array.<string>} paramType 函数参数类型数组
 * @return {boolean} 
 */
FuncSymbolTable.prototype.hasFunc = function(funcName, paramType) {
    for(let i = 0; i < this._table.length; i++) { // 遍历函数表
        const each = this._table[i];
        let isTypeSame = true;

        // if(returnType !== each.returnType) {
        //     continue;
        // }
        if(funcName !== each.funcName) {
            continue;
        }
        if(paramType.length !== each.paramType.length) {
            continue;
        }

        for(let i = 0; i < paramType.length; i++) {
            if(paramType[i] !== each.paramType[i]) {
                isTypeSame = false;
                break;
            }
        }
        if(isTypeSame === false) {
            continue;
        }

        return true;
    }

    return false;
};

/**
 * 得到函数的返回类型，若不存在函数则返回 null
 * @public
 * @param {string} funcName 函数名
 * @return {string}
 */
FuncSymbolTable.prototype.getReturnType = function(funcName) {
    for(let i = 0; i < this._table.length; i++) { // 遍历函数表
        const each = this._table[i];
        if(funcName === each.funcName) {
            return each.returnType;
        }
    }
    return null;
};

/**
 * 在函数表中添加一项
 * @public
 * @param {string} funcName 函数名
 * @param {string} returnType 返回值类型
 * @param {Array.<string>} paramType 函数参数类型数组
 * @param {Array.<string>} paramName 函数参数名数组
 */
FuncSymbolTable.prototype.append = function(funcName, returnType, paramType, paramName) {
    let newItem = new FuncItem();
    newItem.funcName = funcName;
    newItem.returnType = returnType;

    for(let each of paramType) {
        newItem.paramType.push(each);
    }
    
    for(let each of paramName) {
        newItem.paramName.push(each);
    }

    this._table.push(newItem);
};

// const F = new FuncSymbolTable();

// F.append('write', 'void', ['int'], ['a']);
// F.append('write2', 'void', ['float'], ['a']);

// console.log(F.hasFunc('write', 'void', ['int']));
// console.log(F.hasFunc('write', 'void', ['float']));
// console.log(F.hasFunc('write2', 'void', ['int']));
// console.log(F.hasFunc('write2', 'void', ['float']));
// console.log();

module.exports = FuncSymbolTable;