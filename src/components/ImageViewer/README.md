## Layer 组件介绍

### 作用：用于点击图片 preview 后，查看图片大图。提供图片基础操作如：放大、缩小、旋转、左右图片切换。

### 参数介绍（详细见代码 index.vue）：

* showModal：外部控制是否显示 Layer 的变量，Boolean
* imgArry：显示图片的数组，Array
* currentIndex：当前显示图片在图片数组中的 Index，Number
* isUseTool：是否使用工具栏（放大缩小旋转），Boolean
* maxWidthRatio： 图片宽度最大时能够占的窗口比例，Number（0.85）
* maxHeightRatio：图片高度最大时能够占的窗口比例，Number（0.8）
