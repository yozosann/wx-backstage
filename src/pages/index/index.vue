<template>
  <Layout>
    <div slot="content" class="content">
      <div class="img-setting">
        <h4>首页图片设置</h4>
        <div class="img-upload">
          <DragImageUpload ref="upload" v-if="inited" :maxPic="5" :rowCount="5" :aspectRatio="1"  v-model="imgArray"></DragImageUpload>
        </div>
        <div class="button-wrapper">
          <el-button size="small" type="primary" @click="save">保存</el-button>
          <el-button size="small" @click="reset">重置</el-button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
export default {
  data() {
    return {
      inited: false,
      imgArray: [],
      imgArrayCopy: [] 
    };
  },
  created() {
    this.getImages();
  },
  methods: {
    async getImages() {
      let data = await this.$get({url: "/api/getImages"});
      this.imgArrayCopy = this.imgArray = data.images.map(item => item.url);
      this.inited = true;
    },
    async save() {
      try {
        let data = await this.$post({url: "/api/saveImages", body:this.imgArray});
        this.$message({
          type: 'success',
          message: '上传成功'
        })
      } catch(err) {
        console.warn(err);
        this.$message({
          type: 'error',
          message: err.message || '上传图片失败'
        })
      }
    },
    reset() {
      this.$refs.upload.outsideChange(this.imgArrayCopy);
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.content {
  padding: 20px;
  .img-setting {
    h4 {
      margin: 5px 0px;
    }
    .img-upload {
      width: 900px;;
    }
    .button-wrapper {
      margin-top: 10px;
    }
  }
}
</style>
