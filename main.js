const Parser = require('./Parser.js');
const IR_Gen = require('./IR_Generator.js');
const CodeGen = require('./CodeGen.js');
const fs = require('fs');
const child_process = require('child_process');
const spawnSync = child_process.spawnSync;
const execSync = child_process.execSync;

const srcFileDir = './Source/Example.cmm';
const nasmFileDir = './Result/Example.asm';
const oFileDir = nasmFileDir.substring(0, nasmFileDir.length-4) + '.o';
const exeFileDir = './Result/Example';

let P = new Parser();
let I = new IR_Gen();
let CG = new CodeGen();

P.setGrammar('./Grammar/Grammar.txt');
P.setSource(srcFileDir);
P.initialize();

I.setProdNoFilePath('./Grammar/Production-No.txt');
I.readProdNoFile();

// console.log(P.isSLR1());

while(true) {
    let record = P.getNext();

    I.analyze(record);
    // console.log(record.parseResult);
    // console.log(record.stateStack);
    // console.log(record.symbolStack);
    // console.log();

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

CG.initialize(IR);
CG.translate();
const nasm = CG.showNasm(); // 汇编代码
// console.log(nasm);

fs.writeFileSync(nasmFileDir, nasm);
spawnSync('nasm', ['-f macho64', nasmFileDir], {});
execSync(`ld -macosx_version_min 10.7.0 -lSystem -o ${exeFileDir} ${oFileDir}`);