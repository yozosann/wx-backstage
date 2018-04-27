<template>
  <Layout>
    <div slot="content">
      111
    </div>
  </Layout>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1"
    };
  },
  created() {
    this.$get({url: '/api/ssss'}).then(data => {
      console.log(data);
    });
  },
  methods: {
    handleSelect() {}
  }
};
</script>

<style rel="stylesheet/scss" scoped>
h1 {
  font-size: 20px;
}
</style>
