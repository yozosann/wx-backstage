<template>
  <div class="wrapper">
    <template v-if="error">密码不对</template>
    <el-card class="card" v-else>
      <el-form :model="ruleForm2" status-icon :rules="rules2" ref="ruleForm2" label-width="100px" class="demo-ruleForm">
        <el-form-item label="账号" prop="userId">
          <el-input v-model="ruleForm2.userId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input type="password" v-model="ruleForm2.pass" auto-complete="off"></el-input>
        </el-form-item>
        <!-- <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off"></el-input>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm2')">提交</el-button>
          <el-button @click="resetForm('ruleForm2')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
const CryptoJS = require("crypto-js");
import { getItem } from "utils/cookies"
import { toLink } from "utils"

export default {
  data() {
    const validateUserId = (rule, value, callback) => {
      if (!/[a-zA-Z0-9_]{5,14}/.test(value)) {
        callback(new Error("账号格式错误"));
      } else {
        callback();
      }
    };
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleForm2.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      error: false,
      ruleForm2: {
        userId: "",
        pass: "",
        // checkPass: "",
      },
      rules2: {
        userId: [{ validator: validateUserId, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        // checkPass: [{ validator: validatePass2, trigger: "blur" }],
      }
    };
  },
  methods: {
    async login() {
      let userId = this.ruleForm2.userId;
      let cipher = CryptoJS.AES.encrypt(this.ruleForm2.pass, 'yozo').toString();

      try {
        let data = await this.$post({url: "/api/login", body: {
          userId, cipher
        }});

        if(data) {
          toLink('/manage.html');
        } else {
          this.error = true;
        }
        
      } catch(e) {
        console.warn(e);
      }
      
      // toLink('/login.html');
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          await this.login()
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
.wrapper {
  width: 100%;
  .card {
    width: 400px;
    margin: 200px auto;
  }
}
</style>