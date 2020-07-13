function a(age){
    console.log(age);
    var age = 20;
    console.log(age);
    function age() {
    }
    console.log(age);
}
a(18);
// 1.a()执行之前 创建 AO 对象:
// AO{

// }
// 2.将函数内所有的形参和变量声明储存到ao对象中
// AO{
//     age: undefined
// }
// 3. 形参和实参进行统一
// AO{
//     age:18
// }
// 4.将所有的函数声明的函数名作为ao对象中的key，函数整体内容作为value，存储到ao对象中
// AO{
//     age:function age() {}
// }
// 5.赋值
// AO{
//     age:20
// }
// 6. 执行阶段 function age() {} 创建一个 AO对象
// 7.第七行的 console.log(age) 查找当前作用域内的 AO对象