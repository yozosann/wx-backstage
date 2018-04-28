export default class dragLayer {
    constructor() {
        this.element = null;

        this.endX = 0;
        this.endY = 0;
        this.lastX = 0;
        this.lastY = 0;
    }

    setEndPos(x, y) {
        this.endX = x;
        this.endY = y;
    }

    init(item, nowX, nowY) {
        this.element = item;
        this.lastX = nowX;
        this.lastY = nowY;

        this.element.style.position = 'absolute';
        return Promise.resolve(this.element);
    }

    move(nowX, nowY) {
        let moveX, moveY;
        moveX = nowX - this.lastX;
        moveY = nowY - this.lastY;

        this.lastX = nowX;
        this.lastY = nowY;

        this.element.style.left = (this.endX += moveX) + 'px';
        this.element.style.top = (this.endY += moveY) + 'px';
        return Promise.resolve(this.element);
    }

    clear() {
        if (this.element) {
            this.element.style.position = 'static';
            this.endX = 0;
            this.endY = 0;
        }
        return Promise.resolve(this.element);
    }
}
