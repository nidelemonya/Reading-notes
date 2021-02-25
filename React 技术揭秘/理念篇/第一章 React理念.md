## React 理念

### React 理念

React 是用 JavaScript 构建**快速响应**的大型 Web 应用程序的首选方式

快速响应

- 速度快 
- 响应自然

### 理解“速度快”

由于jsx 语法灵活 在编译时无法区分可能变化的部分，所以为了速度快需要在运行时作出更多努力。

比如

- 使用`PureComponent`或`React.memo`构建组件。
- 使用`shouldComponentUpdate`生命周期钩子。
- 渲染列表时使用`key。`
- 使用`useCallback`和`useMemo`缓存函数和变量。

这是由开发者来显式的告诉 React 哪些组件不需要重复计算，可以复用。

### 理解“响应自然”

即将人机交互研究的结果整合到真实的 UI 中。

React 将同步的更新变为可中断的异步更新，为浏览器留出时间渲染UI，让输入不卡顿，体验自然。

在浏览器每一帧的时间中， 预留一些时间给JS线程，React 利用这部分时间更新组件(初试时间为 5ms)

当预留的时间不够用时，React 将线程控制权交还给浏览器使其有时间渲染UI，React则等待下一帧时间到来继续被中断的工作。

## 老的React架构

### React15架构

React15架构可以分为两层：

- Reconciler (协调器)——负责找出变化的组件
- Renderer (渲染器)——负责将变化的组件渲染到页面上

### Reconciler (协调器)

在 React 中可以通过 `this.setState`、`this.forceUpdate`、`ReactDOM.render`等API 触发更新。

每当有更新发生时，Reconciler 会做出如下工作：

- 调用函数组件，或class组件的 render 方法，将返回的JSX转换为虚拟DOM
- 将虚拟DOM和上次更新时的虚拟DOM对比
- 通过对比找出本次更新中变化的虚拟DOM
- 通知Renderer将变化的虚拟DOM渲染到页面上

### Renderer (渲染器)

不同的平台有不同的Renderer 。在浏览器环境渲染的 Renderer 

-- ReactDOM。

还有

- ReactNative 渲染器，渲染App原生组件
- ReactTest 渲染器，渲染出纯JS对象用于测试
- ReactArt 渲染器，渲染到Canvas，SVG 或VML(IE8)

### React15架构的缺点

Mount 的组件会调用mountComponent，update的组件会调用updateComponent。这两个方法都会递归更新子组件。

主流的浏览器刷新频率为60HZ，即每(1000ms/60HZ) 16.6ms浏览器刷新一次。GUI渲染线程和JS线程是互斥的。所以J**S脚本执行和浏览器布局，绘制不能同时进行。**

在每16.6ms时间内，需要完成如下工作：

```
JS脚本执行 ---- 样式布局 ---- 样式绘制
```

当JS执行时间过长，超出了16.6ms，这次刷新就没有时间执行样式布局和样式绘制了。这时，用户交互就会卡顿。

## 新的React架构

### React16架构

- Scheduler (调度器) —— 调度任务的优先级，高优任务优先进入**Reconciler**
- Reconciler (协调器) —— 负责找出变化的组件
- Renderer (渲染器) —— 负责将变化的组件渲染到页面上

### Scheduler (调度器)

以浏览器是否有剩余时间作为任务中断的标准，需要一种机制，当浏览器有剩余时间时通知我们。

基于部分浏览器实现的API，requestIdleCallback。但是由于一下原因，React 放弃使用：

- 浏览器兼容性
- 触发频率不稳定，受很多因素影响。切换tab后，之前tab注册的requestIdleCallback触发的频率会变得很低。

所以React实现了功能更完备的requestIdleCallback ployfill，这就是Scheduler。包括空闲时触发回调，提供多种调度优先级。

### Reconciler (协调器)

更新工作由递归变成了可以中断的循环过程。每次循环都会调用 shouldYield 判断当前是否有剩余时间。

```js
/** @noinline */
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

那么React16是如何解决中断更新时DOM渲染不完全的问题呢？

在React16中，Reconciler 与 Renderer 不再是交替工作。当Scheduler将任务交给Reconciler后，Reconciler会为变化的虚拟DOM打上代表增/删/更新的标记，类似这样：

```js
export const Placement = /*             */ 0b0000000000010;
export const Update = /*                */ 0b0000000000100;
export const PlacementAndUpdate = /*    */ 0b0000000000110;
export const Deletion = /*              */ 0b0000000001000;
```

整个Scheduler 与 Reconciler 的工作都在内存中进行。只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer。

### Renderer (渲染器)

Renderer根据Reconciler为虚拟DOM打的标记，同步执行对应的DOM操作。

### 总结

`Reconciler`内部采用了`Fiber`的架构。

## Fiber 架构的心智模型

我们在 React 中做的就是践行`代数效应`

### 什么是代数效应

代数效应是函数式编程中的一个概念，用于将副作用从函数调用中分离。简单来说就是实现纯函数(一个函数的返回结果只依赖于它的参数，并且在执行过程里面没有副作用，我们就把这个函数叫做纯函数)

代数效应能够将副作用从函数逻辑中分离，使函数关注点保持纯粹。

### 代数效应在React中的应用

最明显的例子就是 Hook。

对于类似 useState，useReducer，useRef 这样的 Hook，我们不需要关注 FunctionComponent的state 在 Hook 中是如何保存的，React 会为我们处理。

### 代数效应与Generator

从 React15 到 React16，协调器 重构的一大目的是：将老的同步更新的架构变为异步可中断更新。

异步可中断更新可以理解为：更新在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时恢复之前执行的中间状态。

类似于 Generator 迭代器，但是还是被放弃了。

- 类似 async，Generator 也是传染性的，使用了 Generator 则上下文的其他函数也需要作出改变。负担重。
- Generator 执行的中间状态是上下文关联的。

### 代数效应与Fiber

Fiber 叫做 纤程，与进程 (Process) 线程 (Thread) 协程 (Coroutine) 同为程序执行过程。

在 JS 中，协程的实现便是 Generator。

我们可以将 纤程 (Fiber) 协程 (Generator) 理解为 代数效应 思想在 JS 中的体现。

React Fiber 可以理解为：

React 内部实现的一套状态更新机制。支持任务不同优先级，可中断与恢复，并且恢复后可以复用之前的中间状态。

## Fiber 架构的实现原理

### Fiber 的起源

在 React 15 及以前，Reconciler 采用递归的方式创建虚拟 DOM，递归过程是不能中断的。如果组件树层级很深，递归会占用很多时间，造成卡顿。

为了解决这个问题，React16 将**递归的无法中断的更新**重构为**异步的可中断更新**，由于曾经用于递归的**虚拟DOM**数据结构已经无法满足需要。于是，全新的 Fiber 架构应运而生。

### Fiber 的含义

包含三层含义：

1. 作为架构来说，之前 `React15` 的 `Reconciler` 采用递归的方式执行，数据保存在递归调用栈中，被称为 `stack Reconciler`。`React16` 的 `Reconciler`基于 `Fiber 节点`实现，被称为 `Fiber Reconciler` 。
2. 作为静态的数据结构来说，每个`Fiber 节点`对应一个 `React element`，保存了该组件的类型（函数组件/类组件/原生组件...） 对应的DOM节点等信息。
3. 作为动态的工作单元来说，每个`Fiber节点`保存了本次更新中该组件改变的状态，要执行的工作（需要被删除/被插入页面中/被更新...）

### Fiber 的结构

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // 作为静态数据结构的属性
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // 用于连接其他Fiber节点形成Fiber树
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  // 作为动态的工作单元的属性
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;
}
```

#### 作为架构来说

每个Fiber节点有个对应的 `React element`, 多个 `Fiber节点`靠如下三个属性：

```js
// 指向父级Fiber节点
this.return = null;
// 指向子Fiber节点
this.child = null;
// 指向右边第一个兄弟Fiber节点
```

举个例子 为**单链表**

```js
function App() {
  return (
    <div>
      i am
      <span>KaSong</span>
    </div>
  )
}
```

![Fiber树结构](https://react.iamkasong.com/img/fiber.png)

#### 作为静态的数据结构

作为一种静态的数据结构，保存了组件相关的信息：

```js
// Fiber对应组件的类型 Function/Class/Host...
this.tag = tag;
// key属性
this.key = key;
// 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
this.elementType = null;
// 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
this.type = null;
// Fiber对应的真实DOM节点
this.stateNode = null;
```

#### 作为动态的工作单元

```js
// 保存本次更新造成的状态改变相关信息
this.pendingProps = pendingProps;
this.memoizedProps = null;
this.updateQueue = null;
this.memoizedState = null;
this.dependencies = null;

this.mode = mode;

// 保存本次更新会造成的DOM操作
this.effectTag = NoEffect;
this.nextEffect = null;

this.firstEffect = null;
this.lastEffect = null;
```

保存调度优先级相关的信息

```js
// 调度优先级相关
this.lanes = NoLanes;
this.childLanes = NoLanes;
```

## Fiber架构的工作原理

`Fiber节点`可以保存对应的 `DOM节点`。

`Fiber节点`构成的`Fiber树`就对应 `DOM树`。

如何更新`DOM`?  -> 双缓存。

### 什么是"双缓存"

当我们用 `canvas`绘制动画，每一帧绘制前都会调用`ctx.clearRect`清楚上一帧的画面。

如果当前帧画面计算量比较大，导致清楚上一帧画面到绘制当前帧之前有较长间隙，就会出现白屏。

为了解决这个问题，我们可以在内存中绘制当前帧动画，绘制完毕后直接用当前帧替换上一帧画面，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。

**在内存中构建并直接替换**的技术叫做双缓存。

`React`使用“双缓存”来完成`Fiber树`的构建与替换--对应着`DOM树`的创建与更新。

### 双缓存Fiber树

在 `React` 中最多会同时存在两棵` Fiber 树`。当前屏幕上显示内容对应的`Fiber树`称为`current Fiber`树，正在内存中构建的 `Fiber树`称为`workInProgress Fiber 树`。

`current Fiber树`中的`Fiber节点`被称为`current fiber`，`workInProgress Fiber树`中的`Fiber节点`被称为`workInProgress fiber`，他们通过`alternate`属性连接。

```js
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

`React`应用的根节点通过`current`指针在不同`Fiber树`的`rootFiber`间切换来实现`Fiber树`的切换。

当`workInProgress Fiber树`构建完成交给`Renderer`渲染在页面上后，应用根节点的`current`指针指向`workInProgress Fiber树`，此时`workInProgress Fiber树`就变为`current Fiber树`。

每次状态更新都会产生新的`workInProgress Fiber树`，通过`current`与`workInProgress`的替换，完成`DOM`更新。

接下来我们以具体例子讲解`mount时`、`update时`的构建/替换流程。

### mount时



