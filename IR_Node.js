/**
 * 带属性的结点类（属性用于语义分析）
 * @class
 */
class Node {
    constructor() {
        /**
         * 结点名
         * 如 'S' '<FuncDecl>' '<Stmt>'
         * @public
         * @type {string}
         */
        this.name = '';

        /**
         * 中间代码，对应 .xlsx 中的 IR
         * @public
         * @type {Array}
         */
        this.IR = new Array();

        /**
         * 变量值，对应 val
         * 以字符串的形式储存，可以是数也可以是变量名，如 '1.5' '10' 'a'
         * @public
         * @type {string}
         */
        this.val = '';

        /**
         * 变量种类，对应 valType
         * 如 'int' 'float' 
         * @public
         * @type {string}
         */
        this.valType = '';

        /**
         * 函数返回值类型，对应 returnType
         * 'int' 'float' 'void'
         * @public
         * @type {string}
         */
        this.returnType  = '';

        /**
         * 函数形参名，对应 paramName
         * @public
         * @type {Array.<string>}
         */
        this.paramName = new Array();

        /**
         * 函数形参类型，对应 paramType
         * @public
         * @type {Array.<string>}
         */
        this.paramType = new Array();

        /**
         * 内部变量声明数，对应 innerVarAmount
         * @public
         * @type {number}
         */
        this.innerVarAmount = 0;

        /**
         * 函数调用时形参，对应 args
         * @public
         * @type {Array.<string>}
         */
        this.args = new Array();

        /**
         * 函数调用时形参类型，对应 argType
         * @public
         * @type {Array.<string>}
         */
        this.argType = new Array();
    }
}

module.exports = Node;