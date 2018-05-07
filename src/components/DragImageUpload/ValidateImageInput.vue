<template>
    <input
        type="file"
        ref="fileInput"
        name="file"
        @change="onFileChange($event)"
        accept="image/*"
        :multiple="mode==='multiple'"
    >
</template>

<script>
import upload from "utils/imageUpload";

export default {
  props: {
    mode: {
      type: String,
      default: "single"
    },
    validateCallback: {
      type: Function
    },
    callback: {
      type: Function
    },
    isValidate: {
      //是否开启图片校验
      type: Boolean
    },
    maxPic: {
      type: Number /*多图模式下控制最多上传的图片张数*/
    },
    validateRule: {
      type: Object
    },
    // 默认不裁剪
    ratio: {
      type: Number,
      default: -1
    },
    currentLength: {
      type: Number
    }
  },
  computed: {
    remainLength() {
      return this.maxPic - this.currentLength;
    }
  },
  methods: {
    // 图片校验函数
    validateImage(file) {
      // 自定义校验
      if (this.validateCallback) {
        return new Promise((res, rej) => {
          this.validateCallback(file, () => {
            res();
          });
        });
      } else if (this.isValidate && this.validateRule) {
        return new Promise((res, rej) => {
          let url = window.URL.createObjectURL(file);
          let image = new Image();
          image.src = url;
          image.onload = () => {
            let errorMessage = "";
            if (
              this.validateRule.picFormat &&
              this.validateRule.picFormat.length
            ) {
              let format = this.validateRule.picFormat.join("|");
              let reg = new RegExp("^image/(" + format + ")");
              if (!reg.test(file.type)) {
                errorMessage += "图片格式不符合要求\n";
              }
            } else {
              if (!/^image\/(png|jpe?g|gif)/.test(file.type)) {
                errorMessage += "图片格式不符合要求\n";
              }
            }
            if (file.size > this.validateRule.maxSize * 1024) {
              errorMessage += `上传图片超过${this.validateRule.maxSize}kb\n`;
            }
            if (
              (this.validateRule.width &&
                image.width != this.validateRule.width) ||
              (this.validateRule.height &&
                image.height != this.validateRule.height) ||
              (this.validateRule.minWidth &&
                image.width < this.validateRule.minWidth) ||
              (this.validateRule.maxWidth &&
                image.width > this.validateRule.maxWidth) ||
              (this.validateRule.minHeight &&
                image.height < this.validateRule.minHeight) ||
              (this.validateRule.maxHeight &&
                image.height > this.validateRule.maxHeight)
            ) {
              errorMessage += "上传图片宽高不符合要求\n";
            }

            if (errorMessage) {
              return rej(errorMessage);
            } else {
              return res();
            }
          };
        });
      } else {
        return Promise.resolve();
      }
    },

    errorMessage: (msgArr, prefix = "以下信息有误: ") => {
      let uniqueMsgArr = [];
      for (let i = 0; i < msgArr.length; i++) {
        if (msgArr[i] && uniqueMsgArr.indexOf(msgArr[i]) === -1) {
          uniqueMsgArr.push(msgArr[i]);
        }
      }
      let parsedMsg = uniqueMsgArr
        .map((item, index) => {
          return index + 1 + " ) " + item;
        })
        .join(" \n ");

      return prefix + parsedMsg;
    },

    // 添加图片函数
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      if (files.length > this.remainLength) {
        this.$message.error(
          "选择图片数过多，超出剩余上传数量：" + this.remainLength
        );
        e.target.value = "";
        return;
      }

      for (let i = 0, file; (file = files[i++]); ) {
        this.validateImage(file)
          .then(() => {
            upload(file)
              .then(data => {
                this.$emit("getUrl", data.url);

                if (this.callback) this.callback(data.url);
              })
              .catch(err => {
                console.warn(err);

                this.$message({
                  type: "error",
                  message: "第" + i + "张" + (err.message || "图片上传失败")
                });
              });
          })
          .catch(err => {
            console.warn(err);
            this.$notify.error({
              title: "错误：" + file.name,
              message: this.errorMessage(err.split("\n"), "错误详情："),
              duration: 5000
            });
          });
      }

      e.target.value = "";
    }
  }
};
</script>

<style lang="scss">
.el-notification__closeBtn {
  top: 5px;
  right: 5px;
}
</style>
