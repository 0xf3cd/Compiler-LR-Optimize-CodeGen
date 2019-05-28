const Parser = require('./Parser.js');
const IR_Gen = require('./IR_Generator.js');
const IR_Optimizer_Global = require('./IR_Optimizer_Global.js');
const IR_Optimizer_CFG = require('./IR_Optimizer_CFG.js');
const CodeGen = require('./CodeGen.js');
const fs = require('fs');
const child_process = require('child_process');
const spawnSync = child_process.spawnSync;
const execSync = child_process.execSync;

const srcFileDir = './Source/Example.cmm';
const nasmFileDir = './Result/Example.asm';
const oFileDir = nasmFileDir.substring(0, nasmFileDir.length-4) + '.o';
const exeFileDir = './Result/Example';

let P = new Parser(); // 进行语法分析
let I = new IR_Gen(); // 进行语义分析及中间代码生成
let IOG = new IR_Optimizer_Global(); // 对中间代码进行常量折叠、常量传播、复写传播、部分死代码消除等优化，也进行一部分窥孔优化
let IOC = new IR_Optimizer_CFG(); // 分析控制流图进行中间代码优化
let CG = new CodeGen(); // 由中间代码生成目标代码

P.setGrammar('./Grammar/Grammar.txt');
P.setSource(srcFileDir);
P.initialize();

I.setProdNoFilePath('./Grammar/Production-No.txt');
I.readProdNoFile();

while(true) {
    let record = P.getNext();
    I.analyze(record);

    if(record.parseResult === 'error' || record.parseResult === 'acc') {
        break;
    }
}

// console.log(`LR0: ${P.isLR0()}`);
// console.log();
// console.log(`SLR1: ${P.isSLR1()}`);
// console.log();

// let t = P.getParseTree();
// console.log(t); //S

const IR = I.getIR();
// console.log(IR.funcs);

let optimizedIR_Global = IOG.optimize(IR);
// console.log(optimizedIR_Global.global);
console.log(optimizedIR_Global.count);

let optimizedIR_CFG = IOC.optimize(optimizedIR_Global);
console.log(optimizedIR_CFG.count);

optimizedIR_Global = IOG.optimize(optimizedIR_CFG);
console.log(optimizedIR_Global.count);

optimizedIR_CFG = IOC.optimize(optimizedIR_Global);
console.log(optimizedIR_CFG.count);

optimizedIR_Global = IOG.optimize(optimizedIR_CFG);
console.log(optimizedIR_Global.count);

optimizedIR_CFG = IOC.optimize(optimizedIR_Global);
console.log(optimizedIR_CFG.count);

console.log(IR.funcs[0]);
// console.log(optimizedIR_Global.funcs[0]);
console.log(optimizedIR_CFG.funcs[0]);

// console.log(IR.funcVarNum);
// console.log(optimizedIR_Global.funcVarNum);
// console.log(optimizedIR_CFG.funcVarNum);

CG.initialize(optimizedIR_CFG);
CG.translate();
const nasm = CG.showNasm(); // 汇编代码
// console.log(nasm);

fs.writeFileSync(nasmFileDir, nasm);
spawnSync('nasm', ['-f macho64', nasmFileDir], {});
execSync(`ld -macosx_version_min 10.7.0 -lSystem -o ${exeFileDir} ${oFileDir}`);

// for(let each of IR.funcs) {
//     if(each[0][3] === '_main') {
//         console.log(each);
//     }
// }

// for(let each of optimizedIR.funcs) {
//     if(each[0][3] === '_main') {
//         console.log(each);
//     }
// }

// for(let each of optimizedIR.funcs) {
//     if(each[0][3] === '_mul2') {
//         const each_ = each.filter(x => new Set(['fparam', 'flocal']).has(x[0]));
//         console.log(each);
//         console.log(each_);
//     }
// }

// console.log(IR.global);
// console.log(optimizedIR.global);