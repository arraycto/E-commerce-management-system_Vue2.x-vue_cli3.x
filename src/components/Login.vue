<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单区域 -->
      <!-- ref(reference引用)定义的是整个表单的引用对象 该对象可以调用resetFields()方法充值表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 注意！！！！prop的名字要与输入框中用v-model绑定的属性名一致 否则可能验证失败！！！
            如果输入框中绑定的叫username 表单验证的属性prop也要取名为username
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!-->
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="loginPreValidation">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法 不能取username以外的名字
        //取名字要和input中取的名字一致
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度只能设置 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        // 验证密码是否合法 不能取password以外的名字
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 4,
            max: 16,
            message: '密码长度应该为 4 到 16 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },

  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    //在点击登录后发送请求前现在前端对表单中的信息进行预验证
    loginPreValidation() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (valid === false) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status != 200) {
          //Element 为 Vue.prototype 添加了全局方法 $message。
          //$message下提供有一系列弹框方法可以使用如error(),success()
          //只需要调这些方法然后提供一个提示信息就可以弹框成功
          return this.$message.error('登陆失败!')
        } else {
          this.$message.success('登陆成功！')
          console.log(res.data.token)
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('home')
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff0f5;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
