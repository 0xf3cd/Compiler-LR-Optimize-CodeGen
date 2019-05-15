// 变量符号表

/**
 * 符号表项
 * @class
 */
class VarItem {
    constructor() {
        /**
         * 变量名
         * @public
         * @type {string}
         */
        this.varName = null;

        /**
         * 变量类型
         * @public
         * @type {string}
         */
        this.varType = null;

        /**
         * 是否为全局变量
         * @public
         * @type {boolean}
         */
        this.isGlobal = false;
    }
}

/**
 * 符号表
 * @class
 */
class VarSymbolTable {
    constructor() {
        /**
         * 表名
         * @private
         * @type {string}
         */
        this._tableName = 'default';

        /**
         * 记录变量名的数组
         * @private
         * @type {Array.<VarItem>}
         */
        this._table = new Array();
    }
}

/**
 * 设置表名
 * @public
 * @param {string} newName
 */
VarSymbolTable.prototype.setTableName = function(newName) {
    this._tableName = newName;
};

/**
 * 获取表名
 * @public
 * @return {string}
 */
VarSymbolTable.prototype.getTableName = function() {
    return this._tableName;
};

/**
 * 插入变量
 * @public
 * @param {string} varName
 * @param {string} varType
 */
VarSymbolTable.prototype.append = function(varName, varType) {
    let newVar = new VarItem();

    newVar.varName = varName;
    newVar.varType = varType;

    this._table.push(newVar);
};

/**
 * 移除变量
 * @public
 * @return {VarItem}
 */
VarSymbolTable.prototype.remove = function() {
    const removedItem = this._table.pop();
    return removedItem;
};

/**
 * 查询是否有某名字的变量
 * @public
 * @param {string} varName
 * @return {boolean} 
 */
VarSymbolTable.prototype.hasVar = function(varName) {
    for(let each of this._table) {
        if(each.varName === varName) {
            return true;
        }
    }
    return false;
};

/**
 * 查询是否有某名字的变量的类型
 * @public
 * @param {string} varName
 * @return {string} 返回变量的类型，未找到返回 null
 */
VarSymbolTable.prototype.getVarType = function(varName) {
    for(let each of this._table) {
        if(each.varName === varName) {
            return each.varType;
        }
    }
    return null;
};

/**
 * 将某个变量置为全局变量
 * @public
 * @param {string} varName
 */
VarSymbolTable.prototype.setGlobal = function(varName) {
    for(let each of this._table) {
        if(each.varName === varName) {
            each.isGlobal = true;
        }
    }
};

/**
 * 查询某个变量是否为全局变量
 * 如果不存在这个变量返回 null
 * @public
 * @param {string} varName
 * @return {boolean}
 */
VarSymbolTable.prototype.isGlobal = function(varName) {
    for(let each of this._table) {
        if(each.varName === varName) {
            return each.isGlobal;
        }
    }
    return null;
};

// const V = new VarSymbolTable();

// V.setTableName('global');
// console.log(V.getTableName());
// V.append('a', 'int');
// V.append('b', 'float');
// console.log(V.hasVar('a'));
// console.log(V.hasVar('c'));
// console.log(V.getVarType('b'));
// console.log(V.getVarType('d'));
// console.log();

module.exports = VarSymbolTable;