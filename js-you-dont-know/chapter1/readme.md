## 作用域是什么

- react mvvm setState state 状态机制
    变量 程序的状态 声明空间 (闭包， 作用域， 变量查找， 变量提升) 储存值修改
- 赋值过程
    var a = 2; 它是怎么运行的？
    var 关键字 identified 标识符  = 运算符 2 value literal
    1. 高级语言
        无法理解，即无法执行

### 编译原理
语言执行的底层， 
操作系统 -> 编译原理
引擎 v8 编译器 解释器
- 分词/词法分析阶段
    [var, a, =, 2]
    token 语法错误
    最后成为二进制文件
- 语法分析阶段
    语法树 
    数据结构 + 算法
    编译器也是一段代码 运行
    <div></div> 形成 Dom 树
    AST Abstract Syntax Tree
- 代码生成
    js 运行时编译
    Java C++ 预编译
    编译器 (Compiler)
    解释器 (Interpreter)
    JIT 即时编译器