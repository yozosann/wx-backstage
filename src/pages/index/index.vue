<template>
  <Layout>
    <div slot="content" class="content">
      <div class="img-upload">
        <DragImageUpload v-model="imgArray"></DragImageUpload>
      </div>
    </div>
  </Layout>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1",
      imgArray: []
    };
  },
  created() {
    
  },
  methods: {
    handleSelect() {}
  }
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.content {
  .img-upload {
    width: 1000px;
  }
}
</style>
