import Layout from '../components/Layout';
import ImageViewer from '../components/ImageViewer';
import DragImageUpload from '../components/DragImageUpload';

import {post, get} from './request.js';

let components = [Layout, DragImageUpload, ImageViewer];

const install = function(Vue, opts = {}) {
  components.forEach(comp => Vue.component(comp.name, comp));

  Vue.prototype.$get = get;
  Vue.prototype.$post = post;
}

export default {install};