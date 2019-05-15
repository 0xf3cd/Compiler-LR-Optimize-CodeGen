#ifndef GRAMMAR
#define GRAMMAR
#include "Grammar.h"
#endif

#ifndef LR_
#define LR_
#include "LR.h"
#endif

/*
struct word {
	string value;
	int type;
	int line_num;
	int start_char_num;
	int end_char_num;
};

struct action_unit {
    string first;
    int second;
};

struct snapshot {
    action_unit au;
    word token;
    Symbol symbol;
    Production production;
    int error;
    list<Symbol> symbol_stack;
    list<int> state_stack;
};

*/

//C type required in node-ffi
//no string or bool


/*
 * type 为种别码
 * 0 - 30 为正常取值，
 * -1 表示之前已经读取到了 '#'，
 * -2 表示源文件已经读取完毕，
 * -3 表示这一次扫描过程中发现不合法的单词，
 * -4 表示之前的扫描过程中出现过不合法的单词，
 * -5 表示出现不合法的字符
 */
struct js_word {
	char *value;
	int type;
	int line_num;
	int start_char_num;
	int end_char_num;
};

/* error 值的意义
 * -2 语法分析出错
 * -1 词法分析出错
 * 0 没有使用这个值
 * 1 这一步使用移进
 * 2 这一步使用规约
 * 3 分析成功
 */
struct js_snapshot {
    char *au;
    js_word token;
    char *symbol_name;
    int symbol_no;
    char *production_left;
    char *production_right;
    int error;
    char *symbol_stack;
    char *state_stack;
};

extern "C" {
    /* 设置文法描述文件的地址
     */
    void setGrammar(char *new_grammar_dir);

    /* 设置源代码文件地址
     */
    void setSource(char *new_grammar_dir);

    /* 重置一切
     */
    void reset();

    /* 初始化
     * Parser 内存空间申请失败，返回 -2
     * 初始化失败（文件读取失败或文法配置不正确），返回 -1
     * 正常，返回 0
     */
    int initialize();

    /* 返回是否初始化
     * true: 1 false: 0 
     */
    int isInitialized();

    /* 返回是否为 LR(0) 文法
     * 未初始化返回 -1
     * true: 1 false: 0 
     */
    int isLR0();

    /* 返回是否为 SLR(1) 文法
     * 未初始化返回 -1
     * true: 1 false: 0 
     */
    int isSLR1();

    /* 进行下一次的 LR 分析
     * 返回一个 js_snapshot 结构体
     * 没有添加额外的检查，所以调用前一定要保证已经进行过初始化操作
     */
    js_snapshot getNext();

    /* 在命令行中测试语法分析
     */
    void test_analyze();
}