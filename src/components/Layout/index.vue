<template>
  <div>
    <el-menu :default-active="'' + activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item v-for="item in menuArray" :key="item.activeIndex" :index="item.path">{{item.name}}</el-menu-item>
    </el-menu>
    <slot name="content"></slot>
  </div>
</template>

<script>
import menu from './menuData';
import { toLink } from "utils";

let menuArray = Object.entries(menu).reduce((pre, curr) => {
  let o = {...curr[1]};
  o.path = curr[0];
  pre.push(o);
  return pre;
},[])

let activeIndex = window.location.pathname;

export default {
  name: 'Layout',
  data() {
    return {
      activeIndex,menuArray
    };
  },
  methods: {
    handleSelect(url) {
      toLink(url);
    }
  }
};
</script>

<style rel="stylesheet/scss" scoped>
h1 {
  font-size: 20px;
}
</style>
