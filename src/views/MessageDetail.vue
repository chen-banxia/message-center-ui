<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessageStore } from '../stores/messageStore'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()

// 消息ID
const messageId = computed(() => parseInt(route.params.id))

// 当前消息
const message = computed(() => {
  return messageStore.messages.find(msg => msg.id === messageId.value) || null
})

// 加载状态
const loading = ref(false)

// 加载消息
const loadMessage = () => {
  loading.value = true
  
  // 实际项目中应从API获取消息详情
  setTimeout(() => {
    // 如果消息不存在，则加载消息列表
    if (messageStore.messages.length === 0) {
      messageStore.loadMessages()
    }
    
    // 标记为已读
    if (message.value && !message.value.read) {
      messageStore.markAsRead(messageId.value)
    }
    
    loading.value = false
  }, 500)
}

// 返回消息列表
const goBack = () => {
  router.push('/messages')
}

// 获取消息类型标签样式
const getTypeTagStyle = computed(() => {
  if (!message.value) return {}
  return {
    backgroundColor: message.value.type.color + '20',
    color: message.value.type.color,
    borderColor: message.value.type.color
  }
})

onMounted(() => {
  loadMessage()
})
</script>

<template>
  <div class="message-detail-container" v-loading="loading">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <div class="page-header">
          <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
          <h2 class="page-title">消息详情</h2>
        </div>
      </el-col>
    </el-row>
    
    <el-card v-if="message" shadow="hover" class="message-card">
      <div class="message-header">
        <h1 class="message-title">
          {{ message.title }}
          <el-icon v-if="message.important" color="#E6A23C" class="star-icon"><Star /></el-icon>
        </h1>
        <div class="message-meta">
          <el-tag :style="getTypeTagStyle" effect="plain" class="type-tag">
            {{ message.type.name }}
          </el-tag>
          <span class="sender">发送者：{{ message.sender }}</span>
          <span class="time">发送时间：{{ message.sendTime }}</span>
        </div>
      </div>
      
      <el-divider />
      
      <div class="message-content">
        {{ message.content }}
      </div>
      
      <el-divider />
      
      <div class="message-actions">
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </div>
    </el-card>
    
    <el-empty v-else description="消息不存在或已被删除"></el-empty>
  </div>
</template>

<style scoped>
.message-detail-container {
  padding-bottom: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 0 15px;
  color: #303133;
}

.message-card {
  margin-bottom: 20px;
}

.message-header {
  margin-bottom: 20px;
}

.message-title {
  font-size: 20px;
  margin: 0 0 15px 0;
  color: #303133;
  display: flex;
  align-items: center;
}

.star-icon {
  margin-left: 10px;
}

.message-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.type-tag {
  margin-right: 15px;
}

.sender {
  margin-right: 15px;
}

.message-content {
  line-height: 1.6;
  color: #606266;
  margin: 20px 0;
  white-space: pre-line;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .message-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .type-tag,
  .sender {
    margin-bottom: 5px;
  }
}
</style> 