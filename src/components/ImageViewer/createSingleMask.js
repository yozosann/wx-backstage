// 创建单例
import {getSingle} from './design-mode.js';

// 创建mask
function createMask() {
    let mask = document.createElement('div');

    mask.style.position = 'fixed';
    mask.style.left = '0';
    mask.style.top = '0';
    mask.style.width = '100%';
    mask.style.height = '100%';
    mask.style.backgroundColor = 'black';
    mask.style.opacity = '.7';
    mask.style.zIndex = '2015';
    forbidScroll(mask);

    return mask;
}

function forbidScroll(counter) {
    let isIE = navigator.userAgent.match(/MSIE (\d)/i);
    isIE = isIE ? isIE[1] : undefined;
    let isFF = /FireFox/i.test(navigator.userAgent);

    // 鼠标滚轮事件
    // 传统浏览器使用MouseWheel事件
    if (isIE < 9) {
        counter.attachEvent('onmousewheel', function() {
            // console.log('ie');
            // 阻止浏览器默认方法
            return false;
        });
        // 除火狐外的现代浏览器也使用MouseWheel事件
    } else if (!isFF) {
        counter.addEventListener(
            'mousewheel',
            function(e) {
                // 阻止浏览器默认方法
                e.preventDefault();
                // console.log(v);
            },
            false
        );
        // 奇葩的火狐使用DOMMouseScroll事件
    } else {
        counter.addEventListener(
            'DOMMouseScroll',
            function(e) {
                // 阻止浏览器默认方法
                e.preventDefault();
                // console.log('ff');
            },
            false
        );
        // window.addEventListener('scroll', this.pe);
    }
}

export default getSingle(createMask);
