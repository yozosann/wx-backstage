import Vue from 'vue';
import Element from 'element-ui';
import moment from 'moment/min/moment.min';
import globalPlugin from './globalPlugin';

Vue.use(Element);
Vue.use(globalPlugin);

window.Vue = Vue;
window.moment = moment;
