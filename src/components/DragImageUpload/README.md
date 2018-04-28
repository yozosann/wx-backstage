## DragImageUpload 组件介绍

### 依赖：

* Layer 组件
* ValidateImageInput 组件（图片上传验证组件）

### 作用：

* 上传图片并显示图片 preview
* 拖动图片进行排序，排序顺序反应到图片数组中
* 查看图片大图功能

#### 使用方式 v-model 绑定图片数组，组件外部控制组件宽度，设置图片与图片，图片与边框间间距， 设置图片 preview 框宽高比，设置 rowCount 行数量。图片将自动计算大小并排列。

### 参数介绍（详细见代码 index.vue）：

* margin：图片与图片，图片与边框间间距，默认 10px
* aspectRatio：宽高比，可以支持小数形式，可以支持‘4:3’这样的字符串模式，默认 4:3
* rowCount：行数量，每行最多容纳的图片数量，默认 4
* desc：添加图片的文案
  #### 验证相关：
* validateCallback：验证函数
* Callback：验证后的回掉函数
* ratio：是否裁剪，默认不裁剪
* isValidate：是否开启图片校验，默认开启
* maxPic：最大图片数，默认 9
* validateRule：验证规则，默认同 ImageUpload 组件

## ValidateImageInput 组件介绍

### 依赖：services/imageUpload.js

### 作用：上传图片（可以多张），并验证图片。

### 参数介绍（详细见代 ValidateImageInput.vue）

* validateCallback：验证函数
* Callback：验证后的回掉函数
* ratio：是否裁剪，默认不裁剪
* isValidate：是否开启图片校验，默认开启
* maxPic：最大图片数，默认 9
* validateRule：验证规则，默认同 ImageUpload 组件
* mode：默认只能上传单张，传入'multiple'可上传多张
* currentLength：如果为多张上传模式，比如传入当前图片数组的图片数
