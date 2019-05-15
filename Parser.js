// LR Parser 类

const LR = require('./LR.js');

// 工具函数
/**
 * deepCopy 函数说明: 进行深拷贝，将 oldObject 深拷贝至 newObject
 * 可以对传入参数中的数组和对象递归进行深拷贝
 * @param {*} oldObject
 * @return {Object}: 一个值与 oldObject 相同的对象
 */
const deepCopy = function(oldObject) {
	if(typeof(oldObject) !== 'object' && Array.isArray(oldObject) !== true) {
		return oldObject;
	}
	let newObject;

	if(Array.isArray(oldObject)) {
		newObject = new Array();
		for(let each of oldObject) {
			if(typeof(each) === 'object' || Array.isArray(each)) {
				newObject.push(deepCopy(each));
			} else {
				newObject.push(each);
			}
		}
	} else {
		newObject = new Object();
		for(let each in oldObject) {
			if(oldObject[each] === null || oldObject[each] === undefined) {
				newObject[each] = oldObject[each];
			} else if(typeof(oldObject[each]) === 'object' && !oldObject[each].length) {
				newObject[each] = deepCopy(oldObject[each]);
			} else {
				newObject[each] = oldObject[each];
			}
		}
	}
	
	return newObject;
};



// 语法分析过程中记录一步操作的类 Record
/**
 * 记录语法分析中每一步的类
 * @class 
 */
class Record {
    constructor() {
        /**
         * 所在行号
         * @public
         * @type {number}
         */
        this.lineNum = -1;

        /**
         * 读取的 token 的值，如 int { ) ; a 100 等
         * @public
         * @type {string}
         */
        this.tokenValue = null;

        /**
         * 读取的 token 的种别码
         * @public         
         * @type {number}
         */
        this.tokenType = null;

        /**
         * 读取的 token 所对应的终结符名称，如 a -> ID、100 -> num 等
         * @public
         * @type {string}
         */
        this.symbolName = null;

        /**
         * 这一步语法分析的结果，如 r1 s13 acc err 等
         * 若为空表示错误！
         * @public
         * @type {string}
         */
        this.parseResult = null;

        /**
         * 这一步使用的产生式的左部，即产生式左部变元的名称
         * @public
         * @type {string}
         */
        this.productionLeft = null;

        /**
         * 这一步使用的产生式的右部，即一串变元和终结符，使用字符串数组记录
         * @public
         * @type {Array.<string>}
         */
        this.productionRight = new Array();

        /**
         * 此时的状态栈情况，使用整数数组记录
         * @public
         * @type {Array.<number>}
         */
        this.stateStack = new Array();

        /**
         * 此时的符号栈情况，使用字符串数组记录
         * @public
         * @type {Array.<string>}
         */
        this.symbolStack = new Array();
    }
};

/**
 * save 方法: 将动态链接库传来的 jssnapshot 结构体转化为 Record 对象
 * @public
 * @param {Object} jss
 * @return {void}
 */
Record.prototype.save = function(jss) {
    this.lineNum = jss.token.line_num;
    this.tokenValue = jss.token.value.toString();
    this.tokenType = jss.token.type;
    this.symbolName = jss.symbol_name.toString();
    this.parseResult = jss.au.toString();
    this.productionLeft = jss.production_left.toString();

    this.productionRight = jss.production_right.toString().split(' ');
    this.productionRight.pop();

    this.stateStack = jss.state_stack.toString().split(' ');
    this.stateStack.pop();
    for(let i = 0; i < this.stateStack.length; i++) {
        this.stateStack[i] = Number(this.stateStack[i]);
    }

    this.symbolStack = jss.symbol_stack.toString().split(' ');
    this.symbolStack.pop();
};



// 语法分析树的结点类 Node
/**
 * 语法分析树的结点类，结点可以代表变元或是终结符
 * 计划使用穿线表记录语法分析树
 * @class
 */
class Node {
    constructor() {
        /**
         * 记录结点名字
         * @public
         * @type {string}
         */
        this.name = null;

        /**
         * 记录结点的值
         * 对于变元结点，其值为 0；对于终结符结点，其值为终结符编号
         * @public
         * @type {number}
         */
        this.no = 0;

        /**
         * 利用数组记录儿子结点
         * 是否为终结符可以由儿子个数判断，即 this._sons.length
         * @public
         * @type {Array.<Object>}
         */
        this.sons = new Array();

        /**
         * 指向父亲结点的引用
         * @public
         * @type {Object}
         */
        this.parent = null;

        /**
         * 记录某个结点生发出下一级节点时使用的产生式的右部
         * @public
         * @type {Array.<string>}
         */
        this.productionRight = null;
    }
};



// 语法分析器类
/**
 * js 中的语法分析器类，里面调用了 LR 模块
 * @class
 */
class Parser {
    constructor() {
        /**
         * 语法描述文件的位置，赋了初值
         * @private
         * @type {string}
         */
        this._grammarDir = __dirname + '/Grammar/Grammar.txt';

        /**
         * 待分析源代码文件的位置，赋了初值
         * @private
         * @type {string}
         */
        this._sourceDir = __dirname + '/Source/Example.cmm';

        /**
         * 指示当前状况
         * -1 未初始化
         * 0 初始化完毕，但未完成分析
         * 1 已经完成且分析成功
         * -2 已经完成分析但出错，出错的原因记录于 this._records 数组中最后一项中
         * @private
         * @type {number}
         */
        this._parserState = -1;

        /**
         * 记录分析情况，存放的即为 Record 对象
         * @private
         * @type {Object.<Record>}
         */
        this._records = new Array();

        /**
         * 记录分析过程中某个时刻最顶层的结点
         * @private
         * @type {Array.<Object>}
         */
        this._topNodes = new Array();
    }
};

/**
 * 设置新的语法描述文件地址
 * @public
 * @param {string} newDir
 */
Parser.prototype.setGrammar = function(newDir) {
    this._grammarDir = newDir;
};

/**
 * 设置新的源文件地址
 * @public
 * @param {string} newDir
 */
Parser.prototype.setSource = function(newDir) {
    this._sourceDir = newDir;
};

/**
 * 初始化语法分析器
 * @public
 */
Parser.prototype.initialize = function() {
    LR.setGrammar(this._grammarDir);
    LR.setSource(this._sourceDir);
    LR.initialize();

    if(LR.isInitialized()) {
        this._parserState = 0;
    }
};

/**
 * 重置一切 回到最初的状态
 * @public
 */
Parser.prototype.reset = function() {
    this._grammarDir = __dirname + '/Grammar/Grammar.txt';
    this._sourceDir = __dirname + '/Source/Example.cmm';
    this._parserState = -1;
    this._records = new Array();
    this._topNodes = new Array();
    // this._parseTree = null;
    LR.reset();
};

/**
 * 返回语法分析器的当前状态
 * -1 未初始化
 * 0 初始化完毕，但未完成分析 
 * 1 已经完成且分析成功
 * -2 已经完成分析但出错，出错的原因记录于 this._records 数组中最后一项中
 * @public
 * @return {number}
 */
Parser.prototype.checkParserState = function() {
    return this._parserState;
};

/**
 * 返回记录分析情况的数组
 * @public
 * @return {Array.<Record>}
 */
Parser.prototype.getRecords = function() {
    let records = new Array();
    for(let each of this._records) { 
        // 进行深度拷贝，避免外部修改对内部造成的影响
        records.push(deepCopy(each));
    }
    return records;
};

/**
 * 返回语法分析树
 * @public
 * @return {Object}
 */
Parser.prototype.getParseTree = function() {
    // return deepCopy(this._parseTree);
    return deepCopy(this._topNodes[0]);
};

/**
 * 返回文法是否为 LR0 文法
 * @public
 * @return {boolean}
 */
Parser.prototype.isLR0 = function() {
    if(this._parserState === -1 || LR.isLR0() <= 0) {
        return false;
    } else {
        return true;
    }
};

/**
 * 返回文法是否为 SLR1 文法
 * @public
 * @return {boolean}
 */
Parser.prototype.isSLR1 = function() {
    if(this._parserState === -1 || LR.isSLR1() <= 0) {
        return false;
    } else {
        return true;
    }
};

/**
 * 进行下一步分析，并返回对应的 Record
 * @public
 * @return {Object}
 */
Parser.prototype.getNext = function() {
    if(this._parserState < 0) {
        // 如果分析出错或未初始化 则直接返回
        return null;
    }

    let jss = LR.getNext();
    if(jss.au.slice(0, 3) === 'acc') {
        jss.au = 'acc';
        // console.log('acc');
        this._parserState = 1;
    } else if(jss.au[0] !== 'r' && jss.au[0] !== 's') {
        // console.log('error');
        jss.au = 'error';
        this._parserState = -2;
        const errorInfo = `Error ${jss.error} occured in "${this._sourceDir}" line ${jss.token.line_num}`;
        throw new Error(errorInfo);
    }

    let record = new Record();
    record.save(jss);
    this._records.push(record);

    if(this._parserState === 0) {
        this._modifyParseTree(record);
    }
    
    return deepCopy(record);
};

/**
 * 调整语法分析树
 * @private
 * @param {Object} rcd 一个 Record 对象
 */
Parser.prototype._modifyParseTree = function(rcd) {
    if(rcd.parseResult[0] === 's') {
        // 需要进行移进
        let newNode = new Node();
        newNode.name = rcd.tokenValue;
        newNode.no = rcd.tokenType; // 创建终结符结点

        this._topNodes.push(newNode);
    } else if(rcd.parseResult[0] === 'r') {
        // 需要进行规约
        let newNode = new Node();
        newNode.name = rcd.productionLeft; // 创建变元结点
        newNode.productionRight = rcd.productionRight;

        let sonAmounts = rcd.productionRight.length;

        if(sonAmounts === 1 && rcd.productionRight[0] === 'ε') {
            // 如果产生式右部为 空串
            let epsilon = new Node();
            epsilon.name = 'ε';
            epsilon.no = 29;// TODO: 之后可以考虑根据文法描述文件而自动改变
            epsilon.parent = newNode;
            newNode.sons.push(epsilon);
        } else {
            let tempSave = new Array();
            for(let i = 0; i < sonAmounts; i++) {
                tempSave.unshift(this._topNodes.pop()); 
            }

            for(let each of tempSave) {
                each.parent = newNode; // 将所有待移除的结点的父亲“指针”设置好
            }
            for(let each of tempSave) {
                newNode.sons.push(each);
            }
        }

        this._topNodes.push(newNode);
    } else {
        return;
    }
};



// 示例程序
// let P = new Parser();
// P.initialize();
// while(true) {
//     let record = P.getNext();

//     if(record.parseResult === 'error' || record.parseResult === 'acc') {
//         break;
//     }
// }
// P.reset();
// P.initialize();
// while(true) {
//     let record = P.getNext();

//     console.log(record.parseResult);
//     console.log(record.stateStack);
//     console.log(record.symbolStack);
//     console.log();

//     if(record.parseResult === 'error' || record.parseResult === 'acc') {
//         break;
//     }
// }

// let t = P.getParseTree();
// // console.log(t); //S
// // console.log(t.sons[0]); //A
// // console.log(t.sons[0].sons[2]); //B
// console.log(t.sons[0].sons[2].sons[0]); //C

module.exports = Parser;