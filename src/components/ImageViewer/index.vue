<template>
    <div class="zy-layer" v-show="showModal" @click="close">
        <div class="icon-wrapper icon-wrapper-left" @click="prevent($event)">
            <i class="fa fa-chevron-left" :class="{hidden: !showPre}" @click.stop="switchPre"></i>
        </div>
        <div class="icon-wrapper icon-wrapper-right" @click="prevent($event)">
            <i class="fa fa-chevron-right" :class="{hidden: !showNext}" @click.stop="switchNext"></i>
        </div>
        <div class="zy-img_wrapper" @click="prevent($event)" :style="{ width: actualWidth + 'px', height: actualHeight + 'px'}">
            <transition name="move" mode="out-in">
                <img
                    v-if="currentImage.url"
                    class="zy-img"
                    ref="img"
                    :src="currentImage.url || currentImage"
                    :key="currentIndex"
                    :style="{cursor: isMove ? 'move' : 'default', transform: 'rotate(' + rotateDeg + 'deg)' }"
                    @mousedown.stop="beginDrag($event)"
                    @mouseup.prevent.stop="stopDrag()"
                    draggable="false"
                >
            </transition>
        </div>
        <div class="zy-top_banner" @mouseenter="dropDown" @mouseleave="dropUp" @click="prevent($event)">
            <div class="drop_banner">
                <div class="zy-mask" style="opacity: 0.5"></div>
                <span class="number">
                    <span class="current-number">{{currentIndex + 1 }}</span>
                    <span class="total-number">{{ '／' + imgArray.length}}</span>
                </span>
            </div>
            <i class="fa fa-close" @click="close"></i>
        </div>
        <div class="zy-tool_bar" @click="prevent($event)" v-show="isUseTool">
            <div class="zy-mask" style="opacity: 0.2"></div>
            <div class="tool-wrapper">
                <i class="zy-tool_buttom fa fa-search-plus" @click="zoom(0.1)"></i>
                <i class="zy-tool_buttom fa fa-search-minus" @click="zoom(-0.1)"></i>
                <i class="zy-tool_buttom fa fa-rotate-left" @click="rotate(-90)"></i>
                <i class="zy-tool_buttom fa fa-rotate-right" @click="rotate(90)"></i>
                <button class="zy-tool_buttom reset-button" @click.prevent="reset">恢复</button>
            </div>
        </div>
    </div>
</template>

<script>
import dragLayer from './drag-layer';
import createSingleMask from './createSingleMask';
import {Tween} from './Tween';
import {fnBefore} from './design-mode.js';

export default {
    name: 'ImageViewer',
    props: {
        showModal: {
            type: Boolean,
            default: true,
            required: true
        },
        imgArray: {
            type: Array,
            required: true
        },
        currentIndex: {
            type: Number,
            default: 0,
            required: true
        },
        // 是否需要使用工具栏
        isUseTool: {
            type: Boolean,
            default: true
        },
        // 图片宽度最大时能够占的窗口比例
        maxWidthRatio: {
            type: Number,
            default: 0.85
        },
        // 图片高度最大时能够占的窗口比例
        maxHeightRatio: {
            type: Number,
            default: 0.8
        }
    },
    data() {
        return {
            mask: null,
            dropTimer: null,
            commands: {
                '37': 'switchPre',
                '39': 'switchNext'
            },
            currentWidth: 0,
            currentHeight: 0,
            windowWidth: 0,
            windowHeight: 0,
            setWidth: 0,
            setHeight: 0,
            zoomRatio: 1,
            rotateDeg: 0,

            dragLayer: new dragLayer()
        };
    },
    watch: {
        // 维护一个全局的mask， showModal控制是否加入在body中
        showModal(newVal) {
            if (newVal && this.mask) {
                document.body.appendChild(this.mask);
            } else if (!newVal && this.mask) {
                this.mask.parentNode.removeChild(this.mask);
            }
        }
    },
    computed: {
        currentImage() {
            if (this.imgArray && this.imgArray.length && this.currentIndex != -1) {
                let index = this.currentIndex || 0;

                let img = new Image();
                img.src = this.imgArray[index].url || this.imgArray[index];

                img.onload = function() {
                    this.currentWidth = img.width;
                    this.currentHeight = img.height;
                    this.imgRatioControl();
                }.bind(this);

                return this.imgArray[index];
            } else {
                return {
                    url: null,
                    id: -1
                };
            }
        },

        showPre() {
            return this.imgArray.length > 1 && this.currentIndex != 0;
        },

        showNext() {
            return this.imgArray.length > 1 && this.currentIndex != this.imgArray.length - 1;
        },

        isOverWidth() {
            return this.currentWidth > this.maxWidthRatio * this.windowWidth;
        },

        isOverHeight() {
            return this.currentHeight > this.maxHeightRatio * this.windowHeight;
        },

        isWidthOverHeight() {
            return this.currentWidth / this.windowWidth >= this.currentHeight / this.windowHeight;
        },

        // 宽高比
        whRatio() {
            return this.currentWidth / this.currentHeight;
        },

        // 当缩放比例大于1时， 才允许拖拽
        isMove() {
            return this.zoomRatio > 1;
        },

        actualWidth() {
            return this.zoomRatio * this.setWidth;
        },

        actualHeight() {
            return this.zoomRatio * this.setHeight;
        }
    },
    methods: {
        // 图片尺寸根据窗口尺寸的变化
        imgRatioControl(isResize) {
            // 获取窗口高度和宽度
            this.getWindowSize();

            // 如果图片宽高都超过窗口宽高限制
            if (this.isOverWidth && this.isOverHeight) {
                // 如果宽度超出的比例 大于 高度超过的比例
                if (this.isWidthOverHeight) {
                    // 按宽度比例缩放
                    this.setImgSize(this.maxWidthRatio * this.windowWidth, 'auto', isResize);
                } else {
                    // 按高度比例缩放
                    this.setImgSize('auto', this.maxHeightRatio * this.windowHeight, isResize);
                }
            } else if (this.isOverWidth) {
                // 如果图片宽超过窗口宽限制， 但高度没有超
                // 按宽度比例缩放
                this.setImgSize(this.maxWidthRatio * this.windowWidth, 'auto', isResize);
            } else if (this.isOverHeight) {
                // 如果图片高超过窗口高限制， 但宽度没有超
                // 按高度比例缩放
                this.setImgSize('auto', this.maxHeightRatio * this.windowHeight, isResize);
            } else {
                // 如果图片宽高都没有超过窗口宽高限制
                // 不缩放
                this.setImgSize(this.currentWidth, this.currentHeight, isResize);
            }
        },

        // resize时的渐变效果
        createStep(currentWidth, currentHeight, endWidth, endHeight, time, gradual) {
            let that = this;
            let progress = 0,
                times = time / 16.667;

            let current = {
                width: currentWidth,
                height: currentHeight
            };

            return function step() {
                progress++;

                let width = gradual(progress, current.width, endWidth - currentWidth, times);
                let height = gradual(progress, current.height, endHeight - currentHeight, times);
                that.setWidth = width;
                that.setHeight = height;

                if (progress < times) {
                    requestAnimationFrame(step);
                }
            };
        },

        // 如果是resize，尺寸改变时就加上过渡效果
        setImgSize(width, height, isResize) {
            if (!(width > 0) && height > 0) {
                width = height * this.whRatio;
            }

            if (!(height > 0) && width > 0) {
                height = width / this.whRatio;
            }

            if (isResize) {
                if (this.setWidth === width) return;
                let step = this.createStep(this.setWidth, this.setHeight, width, height, 700, Tween.Quad.easeOut);
                requestAnimationFrame(step);
            } else {
                this.setWidth = width;
                this.setHeight = height;
            }
        },
        getWindowSize() {
            this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
            this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        },
        makeCommand(receiver, state) {
            return receiver[state];
        },
        prevent(event) {
            window.event ? (window.event.cancelBubble = true) : event.stopPropagation();
        },
        close() {
            // 将工具栏的缩放比例，选装角度重置。
            this.$emit('close');
        },
        dropDown() {
            document.querySelector('.drop_banner').style.top = '0';
        },
        dropUp() {
            this.dropTimer && clearTimeout(this.dropTimer);

            this.dropTimer = setTimeout(() => {
                document.querySelector('.drop_banner').style.top = '-64px';
                clearTimeout(this.dropTimer);
            }, 2000);
        },
        switchPre() {
            // 将图片替换操作移动到下一轮事件循环
            setTimeout(() => {
                let currentIndex = this.currentIndex - 1;
                currentIndex = currentIndex < 0 ? 0 : currentIndex;
                this.$emit('update:currentIndex', currentIndex);
            }, 0);
        },
        switchNext() {
            setTimeout(() => {
                let currentIndex = this.currentIndex + 1;
                currentIndex = currentIndex > this.imgArray.length - 1 ? this.imgArray.length - 1 : currentIndex;
                this.$emit('update:currentIndex', currentIndex);
            }, 0);
        },
        zoom(ratio) {
            // 非reset缩放
            this.zoomRatio = +(this.zoomRatio + ratio).toFixed(1);
            this.zoomRatio = this.zoomRatio > 2 ? 2 : this.zoomRatio;
            this.zoomRatio = this.zoomRatio < 0.1 ? 0.1 : this.zoomRatio;

            if (this.zoomRatio <= 1) {
                this.dragLayer.clear();
            }
        },
        rotate(deg) {
            this.rotateDeg += deg;
        },
        // 恢复初始状态
        reset() {
            // 重置旋转和缩放比例
            this.zoomRatio = 1;
            this.rotateDeg = 0;

            // 重置img的position属性
            this.dragLayer.clear();
        },
        // 开始拖动
        beginDrag(event) {
            if (!this.isMove) return;

            this.isMouseDown = true;

            let img = this.$refs.img;
            this.dragLayer.init(img, event.clientX, event.clientY);

            event.stopPropagation();
            event.preventDefault();
        },
        // 拖动中
        dragging(event) {
            if (!this.isMove || !this.isMouseDown) return;
            this.dragLayer.move(event.clientX, event.clientY);
        },
        // 拖动结束
        stopDrag() {
            this.isMouseDown = false;
        },

        // AOP函数注册，将需要执行的 '某函数' 的' 函数数组' 注册 '该函数'
        initAOP(before, fns) {
            for (let i = 0, fn; (fn = fns[i++]); ) {
                this[fn] = fnBefore(this[fn], before);
            }
        }
    },
    mounted() {
        // 将需要执行reset函数对应字符串传入
        this.initAOP(this.reset, ['close', 'switchPre', 'switchNext']);

        // 创建单例灰色层
        this.mask = createSingleMask();
        this.showModal && document.body.appendChild(this.mask);

        // 监听左右键切换图片
        document.body.addEventListener('keydown', event => {
            if (!this.showModal) {
                return;
            }
            let keyCode = event.keyCode,
                command = this.makeCommand(this, this.commands[keyCode]);
            command && command();
            event.preventDefault();
        });

        // 只在当resize结束时 执行一次过渡动画变换
        let lastTimer;
        window.addEventListener('resize', () => {
            if (!this.showModal) {
                return;
            }

            if (lastTimer) {
                clearTimeout(lastTimer);
                lastTimer = null;
            }

            lastTimer = setTimeout(() => {
                this.reset();
                this.imgRatioControl(true);
            }, 300);
        });

        document.body.addEventListener('mousemove', event => this.dragging(event));
    }
};
</script>

<style lang="scss">
$fa-color: white;
$fa-opacity: 0.6;
$fa-hover-opacity: 0.9;

@mixin none-select {
    -moz-user-select: none;
    -khtml-user-select: none;
    user-select: none;
}

.zy-layer {
    z-index: 2017;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    position: fixed;
    overflow: auto;
    margin: 0;

    .icon-wrapper {
        $margin: 3%;

        position: absolute;
        z-index: 99;
        top: 45%;
        height: 50px;
        line-height: 50px;
        width: 50px;

        &.icon-wrapper-left {
            left: $margin;
        }

        &.icon-wrapper-right {
            right: $margin;
        }
        .fa {
            cursor: pointer;
            padding: 10px;
            font-size: 30px;
            color: white;
            opacity: 0.6;

            &.fa-chevron-left {
                animation: move1 0.8s alternate infinite;
            }

            &.fa-chevron-right {
                animation: move2 0.8s alternate infinite;
            }

            &.hidden {
                visibility: hidden;
            }
        }
    }

    @keyframes move1 {
        from {
            transform: translateX(-10px);
        }

        to {
            transform: translateX(10px);
        }
    }

    @keyframes move2 {
        from {
            transform: translateX(10px);
        }

        to {
            transform: translateX(-10px);
        }
    }

    .zy-img_wrapper {
        position: absolute;
        top: 47%;
        left: 50%;
        transform: translate(-50%, -50%);

        .zy-img {
            height: 100%;
            width: 100%;
        }

        .move-enter-active {
            transition: all 0.8s ease;
        }

        .move-enter {
            transform: translateY(-12px);
            opacity: 0;
        }
    }

    .zy-top_banner {
        position: fixed;
        z-index: 2018;
        top: 0;
        left: 0;
        width: 100%;
        height: 64px;

        .drop_banner {
            position: absolute;
            top: -64px;
            left: 0;
            height: 64px;
            line-height: 64px;
            width: 100%;
            transition: top 0.6s ease;
            text-align: center;
            font-size: 0;

            .number {
                color: white;
                opacity: 1;
                font-size: 20px;
                .current-number {
                    font-size: 34px;
                    color: #3cd088;
                    margin-right: 11px;
                }
            }
        }

        .fa-close {
            position: absolute;
            right: 5%;
            top: 50%;
            margin-top: -15px;
            padding: 2px;
            font-size: 30px;
            opacity: $fa-opacity;
            color: $fa-color;
            cursor: pointer;
            transition: opacity 0.3s;

            &:hover {
                opacity: $fa-hover-opacity;
            }
        }
    }

    .zy-tool_bar {
        position: fixed;
        z-index: 2018;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 900px;
        height: 80px;

        .tool-wrapper {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 0;
            line-height: 0px;

            .fa {
                font-size: 36px;
                color: $fa-color;
                opacity: $fa-opacity;
                margin-right: 24px;

                &:nth-child(2),
                &:nth-child(4) {
                    margin-right: 56px;
                }

                &:hover {
                    cursor: pointer;
                    opacity: $fa-hover-opacity;
                }

                @media screen and (max-width: 710px) {
                    font-size: 20px !important;
                    margin-right: 10px !important;
                }
            }

            @mixin button-size($buttom-height, $icon-size) {
                margin-top: ($icon-size - $buttom-height)/2 + 1;
                height: $buttom-height;
                line-height: $buttom-height - 4;
            }

            .reset-button {
                vertical-align: top;
                @include button-size(28px, 36px);
                background-color: transparent;
                color: $fa-color;
                padding: 1px 16px;
                border: 1px solid $fa-color;
                border-radius: 5px;
                opacity: $fa-opacity;
                font-size: 16px;
                @include none-select;

                &:hover {
                    cursor: pointer;
                    opacity: $fa-hover-opacity;
                }

                &:focus {
                    outline: none;
                }

                @media screen and (max-width: 710px) {
                    @include button-size(20px, 20px);
                    padding: 1px 6px !important;
                }
            }
        }
    }

    .zy-mask {
        position: absolute;
        z-index: -1;
        background-color: black;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }
}
</style>
