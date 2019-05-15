const ffi = require('ffi');
const ref = require('ref');
const ref_struct = require('ref-struct');

const js_word = ref_struct({
    value: 'string',
    type: 'int',
    line_num: 'int',
    start_char_num: 'int',
    end_char_num: 'int'
});

const js_snapshot = ref_struct({
    au: 'string',
    token: js_word,
    symbol_name: 'string',
    symbol_no: 'int',
    production_left: 'string',
    production_right: 'string',
    error: 'int',
    symbol_stack: 'string',
    state_stack: 'string'
});

let dll = ffi.Library(__dirname + '/DyLib/LR', {
    'setGrammar': ['void', ['string']],
    'setSource': ['void', ['string']],
    'reset': ['string', []],
    'initialize': ['int', []],
    'isInitialized': ['int', []],
    'isLR0': ['int', []],
    'isSLR1': ['int', []],
    'getNext': [js_snapshot, []],
    'test_analyze': ['void', []],
});

const setGrammar = function(new_dir) {
    dll.setGrammar(new_dir);
};

const setSource = function(new_dir) {
    dll.setSource(new_dir);
};

const reset = function() {
    dll.reset();
};

const initialize = function() {
    return dll.initialize();
};

const isInitialized = function() {
    return dll.isInitialized();
};

const isLR0 = function() {
    return dll.isLR0();
};

const isSLR1 = function() {
    return dll.isSLR1();
};

const getNext = function() {
    return dll.getNext();
};

module.exports = {
    'setGrammar': setGrammar,
    'setSource': setSource,
    'reset': reset,
    'initialize': initialize,
    'isInitialized': isInitialized,
    'isLR0': isLR0,
    'isSLR1': isSLR1,
    'getNext': getNext
};