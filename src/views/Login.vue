<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 加载状态
const loading = ref(false)
// 错误信息
const errorMessage = ref('')

// 登录方法
const handleLogin = () => {
  // 表单验证
  if (!loginForm.username || !loginForm.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  
  // 模拟登录请求
  setTimeout(() => {
    // 实际项目中应调用登录API
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      // 登录成功
      router.push('/')
    } else {
      // 登录失败
      errorMessage.value = '用户名或密码错误'
    }
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">消息中心系统</h2>
        <p class="login-subtitle">企业级消息通知平台</p>
      </div>
      
      <el-form :model="loginForm" class="login-form">
        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
          class="login-error"
        />
        
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            prefix-icon="Lock"
            type="password"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="remember-row">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <el-link type="primary">忘记密码？</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} 消息中心系统</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.login-error {
  margin-bottom: 20px;
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-button {
  width: 100%;
  padding: 12px 0;
}

.login-footer {
  text-align: center;
  color: #909399;
  font-size: 12px;
}

/* 响应式调整 */
@media (max-width: 500px) {
  .login-card {
    width: 90%;
    padding: 30px 20px;
  }
}
</style> 