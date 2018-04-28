export default class dragItem {
    constructor(wrapper, data, item, index, vue) {
        this.vue = vue
        this.wrapper = wrapper;
        this.data = data;

        this.currentItem = item;
        this.currentIndex = index;
        this.movingDom = null;

        this.offsetX = 0;
        this.offsetY = 0;
        this.beginX = 0;
        this.beginY = 0;
        this.endX = 0;
        this.endY = 0;

        this.nextDom = null;
        this.styleNodeValue = '';

        this.rowCount = 0;
        this.itemWidth = 0;
        this.itemHeight = 0;
    }

    getComputedStyle(prop) {
        if (window.getComputedStyle) {
            this.getComputedStyle = function(prop) {
                return getComputedStyle(this.movingDom, null)[prop];
            };
        } else {
            this.getComputedStyle = function(prop) {
                return this.movingDom.currentStyle[prop];
            };
        }

        return this.getComputedStyle(prop);
    }

    // 初始位置信息
    init(element, event) {
        let rect = element.getBoundingClientRect();

        this.styleNodeValue = element.getAttribute('style');

        element.style.cursor = 'move';
        element.querySelector('img').style.cursor = 'move';
        element.style.zIndex = '999';
        element.style.position = 'fixed';
        element.style.opacity = '0.7';

        this.offsetX = 0.5 * element.offsetWidth;
        this.offsetY = 0.5 * element.offsetHeight;
        this.beginX = rect.left;
        this.beginY = rect.top;
        this.movingDom = element;

        this.itemMarginLeft = +this.getComputedStyle('marginLeft')
            .split('')
            .reverse()
            .slice(2)
            .reverse()
            .join('');
        this.itemWidth = this.movingDom.offsetWidth + this.itemMarginLeft;
        this.itemHeight =
            this.movingDom.offsetHeight +
            +this.getComputedStyle('marginTop')
                .split('')
                .reverse()
                .slice(2)
                .reverse()
                .join('');
        this.rowCount = Math.floor(this.wrapper.offsetWidth / this.itemWidth);

        if ((this.currentIndex + 1) % this.rowCount !== 0 && element.nextElementSibling) {
            this.initNextElementAni(element.nextElementSibling);
        }
        this.move(event.clientX, event.clientY);
    }

    // 初始移动项后一个节点的动画效果
    initNextElementAni(element) {
        this.nextDom = element;
        this.nextDom.style.marginLeft = this.itemWidth + 'px';
        setTimeout(() => {
            this.nextDom.style.transition = 'margin-left 1s';
            this.nextDom.style.marginLeft = this.itemMarginLeft + 'px';
        }, 0);
    }

    // 拖动结束后 清除节点被设置的style
    clearElementAni(element) {
        let prop = document.createAttribute('style');
        prop.nodeValue = this.styleNodeValue;
        element.attributes.setNamedItem(prop);
    }

    // 将移动项拖出容器之外时，默认图片不执行换序移动
    offsideCheck() {
        let wrapperRect = this.wrapper.getBoundingClientRect();
        let rect = this.movingDom.getBoundingClientRect();

        return rect.top < wrapperRect.top - this.movingDom.offsetHeight || rect.left < wrapperRect.left - this.movingDom.offsetWidth || rect.top > wrapperRect.top + this.wrapper.offsetHeight || rect.left > wrapperRect.left + this.wrapper.offsetWidth;
    }

    // 删除移动中的项
    deleteItem() {
        this.movingDom.style.display = 'none';
        this.data.splice(this.currentIndex, 1);
    }

    // 移动项重绘
    redraw(createObj) {
        let oldIndex = this.currentIndex,
            newIndex;

        if (this.offsideCheck()) {
            newIndex = oldIndex; // 如果超过容器边框
        } else {
            // 如果没有超过容器边框
            let x1 = this.beginX,
                x2 = this.endX,
                y1 = this.beginY,
                y2 = this.endY;

            let offsetX = x2 - x1 > 0 ? Math.floor((x2 - x1) / this.itemWidth) + 1 : Math.ceil((x2 - x1) / this.itemWidth);
            let offsetY = Math.round((y2 - y1) / this.itemHeight);

            newIndex = oldIndex + offsetY * this.rowCount + offsetX;

            newIndex = newIndex > this.data.length ? this.data.length : newIndex < 0 ? 0 : newIndex;
        }

        // 删除本身移动的项
        this.deleteItem();

        // 拖动结束后 清除后一个节点被设置的style
        this.nextDom && this.clearElementAni(this.nextDom);

        // 第二轮事件循环在新的位置添加项
        setTimeout(() => {
            this.data.splice(newIndex, 0, createObj(this.currentItem.url));
            this.vue.$emit('orderChange', newIndex, this.currentIndex);
        }, 0);
    }

    // 移动项移动
    move(x, y) {
        this.endX = x - this.offsetX;
        this.endY = y - this.offsetY;

        this.movingDom.style.left = this.endX + 'px';
        this.movingDom.style.top = this.endY + 'px';
    }
}
