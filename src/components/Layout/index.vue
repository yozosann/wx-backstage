<template>
  <div class="menu-wrapper">
    <div class="hidden" @dblclick="goLogin"></div>
    <el-menu :default-active="'' + activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item v-for="item in menuArray" v-if="(+item.activeIndex!==2 || showManage)" :key="item.activeIndex" :index="item.path">{{item.name}}</el-menu-item>
    </el-menu>
    <slot name="content"></slot>
  </div>
</template>

<script>
import menu from './menuData';
import { toLink } from "utils";
import { getItem } from "utils/cookies"

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
      activeIndex,menuArray,
      showManage: false
    };
  },
  created() {
    let data = getItem('isyozo');
    if(data === 'yes') {
      this.showManage = true;
    }
  },
  methods: {
    goLogin() {
      toLink('/login.html');
    },
    handleSelect(url) {
      toLink(url);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.menu-wrapper {
  position: relative;
  h1 {
    font-size: 20px;
  }
  .hidden {
    z-index: 999;
    position: absolute;
    top: 10px;
    right: 30px;
    background-color:cadetblue;
    background-clip:content-box;
    padding: 10px;
    height: 2px;
    width: 2px;
  }
}
</style>
