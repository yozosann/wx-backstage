import Vue from 'vue';
import Element from 'element-ui';
import moment from 'moment/min/moment.min';
import globalPlugin from './globalPlugin';

import 'font-awesome/css/font-awesome.css';

Vue.use(Element);
Vue.use(globalPlugin);

window.Vue = Vue;
window.moment = moment;
