#include "LR_Wrap.h"

#ifndef GRAMMAR
#define GRAMMAR
#include "Grammar.h"
#endif

#ifndef LR_
#define LR_
#include "LR.h"
#endif

#ifndef SYMBOL
#define SYMBOL
#include "Symbol.h"
#endif

#include <vector>
#include <list>
#include <string>

using namespace std;

LR *L = nullptr;
bool initialized = false;
char *grammar_dir = nullptr;
char *source_dir = nullptr;
snapshot ss;
string au_string;
string w_value;
Symbol ss_symbol;
Symbol ss_prod_left;
string mvs_origin;
string mls_origin;
string mli_origin;

/* 私有函数开始 */
/* 将 vector<Symbol> 转换为 string，再转换为 char*
 */
char *modifyVectorSymbol(vector<Symbol> &v) {
    vector<Symbol>::iterator it;
    string origin = "";
    for(it = v.begin(); it != v.end(); it++) {
        origin += it -> name;
        origin += ' ';
    }
    mvs_origin = origin;
    return (char *)(mvs_origin.c_str());
}

/* 将 list<Symbol> 转换为 string，再转换为 char*
 */
char *modifyListSymbol(list<Symbol> &l) {
    list<Symbol>::iterator it;
    string origin = "";
    for(it = l.begin(); it != l.end(); it++) {
        origin += it -> name;
        origin += ' ';
    }
    mls_origin = origin;
    return (char *)(mls_origin.c_str());
}

/* 将 list<int> 转换为 string，再转换为 char*
 */
char *modifyListInt(list<int> &l) {
    list<int>::iterator it;
    string origin = "";
    for(it = l.begin(); it != l.end(); it++) {
        origin += to_string(*it);
        origin += ' ';
    }
    mli_origin = origin;
    return (char *)(mli_origin.c_str());
}

/* 将 word 转换为 js_word 形式
 */
js_word modifyWord(word w) {
    js_word jw;
    w_value = w.value;
    jw.value = (char *)((w_value).c_str()); // string -> char *
    jw.type = w.type;
    jw.line_num = w.line_num;
    jw.start_char_num = w.start_char_num;
    jw.end_char_num = w.end_char_num;

    return jw;
}

/* 将 snapshot 转换为 js_snapshot 形式
 */
js_snapshot modifySnapshot(snapshot ss) {
    js_snapshot jss;

    ss_symbol = ss.symbol;
    ss_prod_left = ss.production.left;
    
    au_string = ss.au.first + to_string(ss.au.second);
    jss.au = (char *)(au_string.c_str()); // au -> char*
    jss.token = modifyWord(ss.token);
    jss.symbol_name = (char *)(ss_symbol.name.c_str()); // string -> char*
    jss.symbol_no = ss.symbol.no;
    jss.production_left = (char *)(ss_prod_left.name.c_str()); // string -> char*
    jss.production_right = modifyVectorSymbol(ss.production.right);
    jss.error = ss.error;
    jss.symbol_stack = modifyListSymbol(ss.symbol_stack);
    jss.state_stack = modifyListInt(ss.state_stack);

    return jss;
}

/* 私有函数结束 */
/* 以下为暴露给 Js 的函数 */

/* 设置文法描述文件的地址
 */
void setGrammar(char *new_grammar_dir) {
    grammar_dir = new_grammar_dir;
}

/* 设置源代码文件地址
 */
void setSource(char *new_grammar_dir) {
    source_dir = new_grammar_dir;
}

/* 重置一切
 */
void reset() {
    if(L == nullptr) {
        delete L;
        L = nullptr;
    }
    initialized = false;
    grammar_dir = nullptr;
    source_dir = nullptr;
}

/* 初始化
 * Parser 内存空间申请失败，返回 -2
 * 初始化失败（文件读取失败或文法配置不正确），返回 -1
 * 正常，返回 0
 */
int initialize() {
    L = new(nothrow) LR;
    if(L == nullptr) {
        return -2;
    }

    if(!L -> initialize(grammar_dir, source_dir)) {
        return -1;
    }

    L -> generateItems(); //拆分产生式为项目
    L -> generateAllClosure(); //生成闭包及 GO(I, X)
    L -> generateSLR1ACTION();
    L -> generateGOTO();
    initialized = true;
    return 0;
}

/* 返回是否初始化
 * true: 1 false: 0 
 */
int isInitialized() {
    return initialized? 1: 0;
}

/* 返回是否为 LR(0) 文法
 * 未初始化返回 -1
 * true: 1 false: 0 
 */
int isLR0() {
    if(!initialized) {
        return -1;
    } else {
        return L -> isLR0()? 1: 0;
    }
}

/* 返回是否为 SLR(1) 文法
 * 未初始化返回 -1
 * true: 1 false: 0 
 */
int isSLR1() {
    if(!initialized) {
        return -1;
    } else {
        return L -> isSLR1()? 1: 0;
    }
}

/* 进行下一次的 LR 分析
 * 返回一个 js_snapshot 结构体
 * 没有添加额外的检查，所以调用前一定要保证已经进行过初始化操作
 */
js_snapshot getNext() {
    ss = L -> getNext();
    js_snapshot jss = modifySnapshot(ss);
    
    return jss;
}

/* 在命令行中测试语法分析
 */
void test_analyze() {
    snapshot ss;

    while(true) {
        ss = L -> getNext();
        cout << ss.au.first << ss.au.second << endl;
        cout << ss.token.value << endl;
        cout << ss.production << endl;
        cout << ss.error << endl;
        cout << endl;

        if(ss.error < 0 || ss.error == 3) {
            break;
        }
    }
}