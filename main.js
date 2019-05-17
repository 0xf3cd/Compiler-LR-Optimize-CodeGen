const Parser = require('./Parser.js');
const IR_Gen = require('./IR_Generator.js');
const CodeGen = require('./CodeGen.js');

let P = new Parser();
let I = new IR_Gen();
let CG = new CodeGen();

P.setGrammar('./Grammar/Grammar.txt');
P.setSource('./Source/Example.cmm');
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

const IR = I.getIR();
// console.log(IR);

CG.initialize(IR);
CG.translate();
const nasm = CG.showNasm();
console.log(nasm);

// I.outputIR();

// console.log(`LR0: ${P.isLR0()}`);
// console.log();
// console.log(`SLR1: ${P.isSLR1()}`);
// console.log();

// let t = P.getParseTree();
// console.log(t); //S