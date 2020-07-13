// LHS RHS 变量查找 就在那一行相关
function foo(a) {
    var b = a;
    return a + b;
}
// Left Hand Search
var c = foo(2);
// LHS 3 处 c=...; a=2; b=
// RHS 4 处 =a; return a + b; =foo(2)
// console.log(c);