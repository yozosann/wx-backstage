<template>
    <div class="wrapper" ref="wrapper" :style="{ padding: '0 ' + margin + 'px ' + margin + 'px 0'}">
        <transition-group
            v-on:enter="enter"
            v-on:leave="leave"
            v-on:after-leave="afterLeave"
            name="list"
            tag="span"
        >
            <template v-if="attchedTextHeight">
                <div 
                    class="img-area"
                    style="font-size:0;"
                    :style="{ margin: margin + 'px 0 0 ' + margin + 'px', width: itemWidth + 'px', height: itemHeight + attchedTextHeight + 'px' , paddingTop: itemWidth + 'px'}"
                    v-for="(img, index) in imgArray"
                    :key="img.id"
                    @mousedown.stop="beginDrag(img, index, $event)"
                    @mouseup.prevent.stop="stopDrag()"
                    :class="{dragging: img.isDrag}"
                >
                    <img class="show-img has-text" :src="img.showUrl" @click="zoomImage(index)" draggable="false">
                    <div :style="{height:attchedTextHeight + 'px', width:'100%', lineHeight:attchedTextHeight + 'px', position:'relative'}">
                        <slot :index="index"></slot>
                    </div>
                </div>
            </template>
            <template v-else>
                <div
                    class="img-area"
                    :style="{ margin: margin + 'px 0 0 ' + margin + 'px', height:itemHeight + 'px', width: itemWidth + 'px'}"
                    v-for="(img, index) in imgArray"
                    :key="img.id"
                    @mousedown.stop="beginDrag(img, index, $event)"
                    @mouseup.prevent.stop="stopDrag()"
                    :class="{dragging: img.isDrag}"
                >
                    <img class="show-img" :src="img.showUrl" @click="zoomImage(index)" draggable="false">
                    <div class="tool-box" v-show="!showOnly">
                        <i class="fa fa-pencil-square-o btn-zoom" @click="modifyImg(index)"></i>
                        <ValidateImageInput
                            class="hidden-input"
                            :validateCallback="validateCallback"
                            :callback="callback"
                            :isValidate="isValidate"
                            :maxPic="maxPic"
                            :validateRule="validateRule"
                            ref="hiddenInput"
                            @getUrl="editImageObj"
                        ></ValidateImageInput>
                        <i class="fa fa-close btn-delete" @click="removeImage(index)"></i>
                    </div>
                </div>
            </template>
            <div v-if="!showOnly && !isMaxPic" class="add-img" :style="{ margin: margin + 'px 0 0 ' + margin + 'px', height:itemHeight + 'px', width: itemWidth + 'px'}" key="add">
                <i class="fa fa-plus"></i>
                <span v-if="pending">图片上传中…</span>
                <span v-if="!pending">{{desc}}</span>
                <ValidateImageInput
                    class="input-upload"
                    :validateCallback="validateCallback"
                    :callback="callback"
                    :isValidate="isValidate"
                    :maxPic="maxPic"
                    :validateRule="validateRule"
                    :mode="'multiple'"
                    :currentLength="imgArray.length"
                    ref="hiddenInput"
                    @getUrl="addImageObj"
                ></ValidateImageInput>
            </div>
        </transition-group>
        <Layer :showModal="showModal" :imgArray="imgArray" :currentIndex.sync="currentIndex" @close="currentIndex = -1; showModal = false"></Layer>
    </div>
</template>

<script>
import dragItem from './drag-item.js';
import ValidateImageInput from './ValidateImageInput';
import Layer from '../ImageViewer';
import loadingGif from './loading.gif';

const ADD = 'add';
const MODIFY = 'modify';

export default {
    name: 'DragImageUpload',
    components: {
        ValidateImageInput,
        Layer
    },
    props: {
        value: {
            type: Array,
            required: true,
            default() {
                return [];
            }
        },
        desc: {
            type: String,
            default() {
                return '添加图片';
            }
        },
        validateCallback: {
            type: Function
        },
        callback: {
            type: Function
        },
        // 默认不裁剪
        ratio: {
            type: Number,
            default: -1
        },
        isValidate: {
            //是否开启图片校验
            type: Boolean,
            default: true
        },
        maxPic: {
            type: Number /*多图模式下控制最多上传的图片张数*/,
            default: 9
        },
        validateRule: {
            type: Object,
            default: function() {
                return {
                    width: 750,
                    height: 750,
                    maxSize: 300, //单位kb
                    picFormat: [] //图片格式
                };
            }
        },
        // 样式属性
        // 图片与图片之间的边距，及图片与边框之间的边距
        margin: {
            type: [Number, String],
            default: 10
        },
        // 宽高比
        aspectRatio: {
            type: [Number, String],
            default: '4:3'
        },
        // 行数量
        rowCount: {
            type: [Number, String],
            default: 4
        },

        // 浏览模式
        showOnly: {
            type: Boolean,
            default: false
        },

        // 浏览但可拖拽排序
        showOnlyButDrag: {
            type: Boolean,
            default: false
        },

        // 图片可带文字
        attchedTextHeight: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            id: 12,
            timer: null,
            dragItem: null,
            showModal: false,
            // 显示点击放大后的图片的序号
            currentIndex: 0,
            // 正在编辑的图片序号
            editIndex: null,
            // 为每个dev设置不同的key
            imgId: 0,
            // 图片的url数组
            imgArray: [],
            pending: false,
            // 判断是拖拽事件 还是点击事件
            isDrag: false,
            // 初始化之后，imgArray改变才向父组件提交变化
            isInit: true,
            itemWidth: 0,
            itemHeight: 0,
            isResizing: false,
            isFirstResize: true,
            loadingGif
        };
    },
    mounted() {
        this.imgArray = this.value.map(url => {
            return this.createImgObj(url);
        });
        this.isInit = false;
        this.getItemWidthAndHeight();

        window.addEventListener('resize', () => {
            if (this.isFirstResize) {
                this.getItemWidthAndHeight();
                this.isResizing = true;
                setTimeout(() => {
                    this.isResizing = false;
                }, 500);
            } else {
                if (!this.isResizing) {
                    this.getItemWidthAndHeight();
                    this.isResizing = true;
                    setTimeout(() => {
                        this.isResizing = false;
                    }, 500);
                }
            }
        });

        document.body.addEventListener('mousemove', event => this.dragging(event));
    },

    watch: {
        imgArray: {
            handler: function() {
                if (!this.isInit) {
                    this.$emit('input', this.formatImgArr());
                }
            },
            deep: true
        }
    },

    computed: {
        currentImage() {
            if (this.imgArray.length == 0) return {url: null, id: -1};
            return this.imgArray[typeof this.currentIndex === 'number' ? this.currentIndex : 0];
        },
        isMaxPic() {
            return this.imgArray.length >= this.maxPic;
        }
    },

    methods: {
        getItemWidthAndHeight() {
            if (this.$refs.wrapper && this.$refs.wrapper.clientWidth) {
                let wrapperWidth = this.$refs.wrapper.clientWidth;
                // let wrapperWidth = +this.$refs.wrapper.style.maxWidth.split('').reverse().slice(2).reverse().join('');
                this.itemWidth = (wrapperWidth - +this.margin * (this.rowCount + 1)) / this.rowCount;

                if (typeof this.aspectRatio == 'string') {
                    let ratio = this.aspectRatio.split(':');
                    this.itemHeight = this.itemWidth / ratio[0] * ratio[1];
                } else if (typeof this.aspectRatio == 'number') {
                    this.itemHeight = this.itemWidth / this.aspectRatio;
                }
            } else {
                // 避免第一帧没有渲染 wrapper
                setTimeout(this.getItemWidthAndHeight, 0);
            }
        },

        formatImgArr() {
            return this.imgArray.map(img => {
                return img.url;
            });
        },

        createImgObj(url) {
            let newImg = new Object();
            let image = new Image();
            image.src = url;
            // 当图片加载完时，采用正确图片
            image.onload = function() {
                newImg.showUrl = url;
            };

            newImg.url = url;
            newImg.showUrl = this.loadingGif;
            newImg.id = this.imgId++;
            return newImg;
        },

        // 开始拖动 （按下0.5s后开始拖动）
        beginDrag(item, index, event) {
            if (event.button === 2 || this.showOnly && !this.showOnlyButDrag) return;

            let target = event.currentTarget;
            this.timer = setTimeout(() => {
                this.$set(item, 'isDrag', true);

                this.dragItem = new dragItem(this.$refs.wrapper, this.imgArray, item, index, this);

                this.dragItem.init(target, event);
            }, 500);
            event.stopPropagation();
            event.preventDefault();
        },

        // 拖动中
        dragging(event) {
            this.dragItem && this.dragItem.move(event.clientX, event.clientY);
        },

        // 拖动结束
        stopDrag() {
            this.timer && clearTimeout(this.timer);
            if (this.dragItem) {
                this.dragItem.redraw(this.createImgObj);
                this.isDrag = true;
            }
            this.dragItem = null;
            console.log('stop');
        },

        modifyImg(index) {
            this.editIndex = index;
            this.$refs.hiddenInput[0].$el.click();
        },

        zoomImage(index) {
            if (this.isDrag) {
                this.isDrag = false;
                return;
            }
            let img = this.imgArray[typeof index === 'number' ? index : 0];
            this.currentIndex = index;
            if (img.url) {
                this.showModal = true;
            }
        },
        removeImage(index) {
            setTimeout(() => {
                this.imgArray.splice(index, 1);
            });
        },
        editImageObj(url) {
            this.imgArray[this.editIndex].url = url;
            this.imgArray[this.editIndex].showUrl = url;
        },
        addImageObj(url) {
            this.imgArray.push(this.createImgObj(url));
        },
        // 动画效果
        // beforeEnter(el) {
        //   el.style.opacity = 0;
        // },
        enter: function(el, done) {
            el.style.width = this.itemWidth + 'px';
            el.style.opacity = 1;
            setTimeout(done, 1000);
        },
        leave: function(el, done) {
            el.style.transition = 'all 1s';
            el.style.opacity = 0;
            el.style.width = 0;
            setTimeout(done, 1000);
        },
        afterLeave: function(el) {
            el.style.transition = '';
        }
    }
};
</script>

<style lang="scss">
.wrapper {
    border: 1px solid #dfe6ec;
    position: relative;
    text-align: left;

    .add-img {
        margin: 10px 0 0 10px;
        cursor: pointer;
        line-height: 120px;

        input {
            z-index: 1;
            opacity: 0;
            // 出现cursor效果
            font-size: 0;
            top: 0;
            left: 0;
            position: absolute;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }
    }

    .add-img,
    .img-area {
        width: 160px;
        height: 120px;
        position: relative;
        display: inline-flex;
        overflow: hidden;
        border: 1px solid #eee;
        text-align: center;
        vertical-align: top;
        color: #999;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        will-change: left, top;
        .show-img {
            cursor: zoom-in;
            max-width: 100%;
            max-height: 100%;
            display: block;

            &.has-text {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
            }
        }
    }

    .tool-box {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 20%;
        display: table;
        text-align: center;
        background: #fff;
        opacity: 0.6;

        .hidden-input {
            position: absolute;
            z-index: -10;
            font-size: 0;
            left: 0;
            right: 0;
            height: 0;
            width: 0;
        }

        i {
            $padding: 5%;

            display: table-cell;
            vertical-align: middle;
            text-align: left;
            width: 50%;
            font-size: 100%;
            color: #777;
            cursor: pointer;
            -ms-text-size-adjust: none;
            -webkit-text-size-adjust: none;
            &:hover {
                color: #333;
            }
            &:first-child {
                padding-right: $padding;
                text-align: right;
            }
            &:last-child {
                padding-left: $padding;
            }
        }
    }

    .list-enter-active {
        transition: all 1s;
    }
    .list-enter {
        opacity: 0;
        width: 0;
        margin-left: 0;
    }

    .list-move {
        transition: transform 1s;
    }

    .dragging {
        animation: shake 2s normal infinite;
    }
}

@keyframes shake {
    0%,
    100% {
        transform: rotate(0deg);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
        transform: rotate(5deg);
    }
    20%,
    40%,
    60%,
    80% {
        transform: rotate(-5deg);
    }
}
</style>
