<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessageStore, useInitStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()
const initStore = useInitStore()

// 控制侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 获取路由菜单
const routes = computed(() => {
  return router.options.routes
    .find(route => route.path === '/')
    .children.filter(route => !route.meta?.hidden)
})

// 获取当前激活的菜单
const activeMenu = computed(() => {
  return '/' + route.path.split('/')[1]
})

// 获取未读消息数量
const unreadCount = computed(() => messageStore.unreadCount)

// 处理消息图标点击
const handleNotificationClick = () => {
  router.push('/messages')
}

// 初始化数据
onMounted(() => {
  // 使用统一的初始化方法，正确的方法名是initializeAll
  initStore.initializeAll()
})
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar-container">
      <div class="logo-container">
        <img src="../assets/logo.svg" class="logo" alt="Logo" />
        <span v-show="!isCollapse">消息中心系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item v-for="route in routes" :key="route.path" :index="route.path">
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <template #title>{{ route.meta.title }}</template>
          <el-badge v-if="route.name === 'messages' && unreadCount > 0" :value="unreadCount" class="menu-badge" />
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主体区域 -->
    <el-container class="main-container">
      <!-- 头部 -->
      <el-header class="header-container">
        <div class="header-left">
          <el-icon class="toggle-button" @click="toggleSidebar">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-badge :value="unreadCount > 0 ? unreadCount : ''" class="notification-badge">
            <el-icon class="notification-icon" @click="handleNotificationClick"><Bell /></el-icon>
          </el-badge>
          
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="router.push('/login')">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="content-container">
        <router-view />
      </el-main>
      
      <!-- 页脚 -->
      <el-footer class="footer-container">
        <div>© 2023 消息中心系统 - 企业级消息通知平台</div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.sidebar-container {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
  height: 100%;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  padding: 0 10px;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.sidebar-menu {
  border-right: none;
  height: calc(100% - 60px);
}

.menu-badge {
  position: absolute;
  right: 20px;
  top: 15px;
}

.main-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header-container {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-button {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
}

.header-right {
  display: flex;
  align-items: center;
}

.notification-badge {
  margin-right: 20px;
}

.notification-icon {
  font-size: 20px;
  cursor: pointer;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
}

.content-container {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  background-color: #f0f2f5;
}

.footer-container {
  text-align: center;
  color: #606266;
  font-size: 14px;
  padding: 15px 0;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar-container {
    position: fixed;
    z-index: 1001;
    height: 100%;
  }
  
  .main-container {
    margin-left: 64px;
  }
  
  .username {
    display: none;
  }
}
</style> 