import Layout from '../components/Layout/index.vue';
import {post, get} from './request.js';

const install = function(Vue, opts = {}) {
  Vue.component(Layout.name, Layout);
  Vue.prototype.$get = get;
  Vue.prototype.$post = post;
}

export default {install};