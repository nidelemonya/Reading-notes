## 理解Buffer
### Buffer 结构
Buffer 是一个像Array的对象,主要用于操作字节。

模块结构 
 - 无须通过require()即可使用

Buffer 对象
- 中文字在UTF-8编码下占用3个元素, 字母和半角标点符号占用1个元素.
- 字母和半角标点符号占用1个元素.
- 给Buffer 的元素赋值，buf[10]=100;如果给元素的赋值小于0,就将该值逐次增加256,直到得到一个0到255之间的整数.如果给元素得到的数值大于255,就将该值逐次减256,直到得到一个0到255区间内的数值.如果是小数, 舍弃小数部分,只保留整数部分.

Buffer 内存分配
- Node 采用了slab分配机制.slab是一种动态内存管理机制 -> 就是一块申请好的固定大小的内存区域.
- 3种状态:full, partial, empty
- Node 以 8KB 为界限来区分Buffer 是大对象还是小对象。<8KB 小对象,>8KB 大对象。

### Buffer 的转换
目前支持的字符串编码类型
- ASCII
- UTF-8
- UTF-16LE/UCS-2
- Base64
- Binary
- Hex

字符串转 Buffer
- 主要通过构造函数完成    new Buffer(str,[encoding]); encoding参数不传递时,默认按UTF-8编码进行转码和存储. 1个Buffer 对象可以存储不同编码类型的字符串转码的值, 使用write()方法
    ```js
    buf.write(string,[offset],[length],[encoding])
    ```
    反转回字符串时需要注意。

Buffer转字符串
```js
buf.toString([encoding],[start],[end])
```

Buffer 不支持的编码类型，提供了1个 isEncoding()函数来判断编码是否支持转换。
```js
Buffer.isEncoding(encoding)
```

### Buffer 的拼接
Buffer 通常是以一段一段的方式传输，例如我们常用的chunk对象就是Buffer对象。如果输入流中有宽字节编码, 就会产生 '?' 乱码符号。
```js
data +=chunk => data = data.toString() + chunk.toString()
```
乱码是如何产生的?
- buf.toString() 方法默认以UTF-8编码,中文字在UTF-8占3个字节。对于任意长度的Buffer来说, 宽字节字符串都有可能存在被截断的情况。

setEncoding()与 string_decoder()
- string_decoder模块只能处理UTF-8, Base64 和 UCS-2/UTF-16LE 这三种编码

正确拼接Buffer
```js
1.js
```

Buffer.concat()方法
### Buffer 与性能
### 总结