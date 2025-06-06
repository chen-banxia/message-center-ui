<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <div class="error-divider"></div>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-message">抱歉，您访问的页面不存在或已被删除</p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  color: #409EFF;
  margin: 0;
  line-height: 1;
}

.error-divider {
  width: 80px;
  height: 2px;
  background-color: #dcdfe6;
  margin: 20px auto;
}

.error-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin: 0 0 30px 0;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 20px;
  }
  
  .error-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 