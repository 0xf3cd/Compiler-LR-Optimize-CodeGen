const Parser = require('./Parser.js');
const IR = require('./IR_Generator.js');

let P = new Parser();
let I = new IR();

P.setGrammar('./Grammar/Grammar.txt');
P.setSource('./Source/Example.cmm');
P.initialize();

I.setProdNoFilePath('./Grammar/Production-No.txt');
I.setIRPath('./IR.ll');
I.readProdNoFile();

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
I.showIR();
// I.outputIR();

// console.log(`LR0: ${P.isLR0()}`);
// console.log();
// console.log(`SLR1: ${P.isSLR1()}`);
// console.log();

// let t = P.getParseTree();
// console.log(t); //S