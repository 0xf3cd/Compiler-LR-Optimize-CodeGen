const Parser = require('./Parser.js');
const IR_Gen = require('./IR_Generator.js');
const Gen_CFG = require('./Gen_CFG.js'); 
const IR_Optimizer_Global = require('./IR_Optimizer_Global.js');
const IR_Optimizer_CFG = require('./IR_Optimizer_CFG.js');
const Reg_Allocator = require('./Reg_Allocator.js');
const CodeGen = require('./CodeGen.js');
const ASM_Peephole_Optimizer = require('./ASM_Peephole_Optimizer.js');
const fs = require('fs');
const child_process = require('child_process');
const spawnSync = child_process.spawnSync;
const execSync = child_process.execSync;

const srcFileDir = './Source/Example.cmm';
const nasmFileDir = './Result/Example.asm';
const oFileDir = nasmFileDir.substring(0, nasmFileDir.length-4) + '.o';
const exeFileDir = './Result/Example';

const P = new Parser(); // 进行语法分析
const I = new IR_Gen(); // 进行语义分析及中间代码生成
const GC = new Gen_CFG();
const IOG = new IR_Optimizer_Global(); // 对中间代码进行常量折叠、常量传播、复写传播、部分死代码消除等优化，也进行一部分窥孔优化
const IOC = new IR_Optimizer_CFG(); // 分析控制流图进行中间代码优化
const RA = new Reg_Allocator(); // 进行寄存器分配
const CG = new CodeGen(); // 由中间代码生成目标代码
const APO = new ASM_Peephole_Optimizer(); // 对目标代码进行窥孔优化

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

let IR = I.getIR();
// console.log(IR.funcs);

let optimizedIR_Global = IR; // = IOG.optimize(IR);
let optimizedIR_CFG; // = IOC.optimize(optimizedIR_Global);
let optimizedIR;
while(true) {
    optimizedIR_CFG = IOC.optimize(optimizedIR_Global);
    optimizedIR_Global = IOG.optimize(optimizedIR_CFG);

    const count = optimizedIR_Global.count + optimizedIR_CFG.count;
    // console.log(count);
    if(count === 0) {
        optimizedIR = optimizedIR_Global;
        break;
    }
}

// console.log(IR.funcs[1]);
// console.log(optimizedIR_Global.funcs[1]);
// console.log(optimizedIR_CFG.funcs[1]);

// console.log(IR.funcVarNum);
// console.log(optimizedIR_Global.funcVarNum);
// console.log(optimizedIR_CFG.funcVarNum);

const allocRes = RA.allocateReg(optimizedIR);
// console.log(allocRes.get('_main'));

CG.initialize(optimizedIR, allocRes);
CG.translate();
const nasm = CG.showNasm(); // 汇编代码
// console.log(nasm);

const newNasm = APO.splitASM(nasm);

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