// 创建单例
export function getSingle(fn) {
    let result;
    return function() {
        return result || (result = fn.apply(this, arguments));
    };
}

// 高频延迟执行
export function throttle(fn, interval) {
    let _self = fn, // 保存休要被延迟执行的函数引用
        timer, // 定时器
        firstTime = true; // 是否第一次调用

    return function() {
        let args = arguments,
            _me = this;

        if (firstTime) {
            _self.apply(_me, args);
            return (firstTime = false);
        }

        if (timer) {
            return false;
        }

        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            _self.apply(_me, args);
        }, interval || 500);
    };
}

// AOP 之前执行 （本来应该执行的函数，在本函数之前执行的函数）
export function fnBefore(fn, before) {
    return function() {
        // 返回了包含原函数和新函数的代理函数
        before.apply(this, arguments);
        return fn.apply(this, arguments); // 执行原函数
    };
}
