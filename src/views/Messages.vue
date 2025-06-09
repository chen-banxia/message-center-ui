<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore, useMessageTypeStore } from '@/stores'

const router = useRouter()
const messageStore = useMessageStore()
const messageTypeStore = useMessageTypeStore()

// 搜索关键字
const searchKeyword = ref('')
// 当前选中的消息类型
const activeType = ref('all')
// 当前选中的消息状态
const activeStatus = ref('all')
// 表格加载状态
const tableLoading = ref(false)
// 批量选择的消息
const selectedMessages = ref([])
// 每页显示数量
const pageSize = ref(10)
// 当前页码
const currentPage = ref(1)

// 筛选后的消息列表
const filteredMessages = computed(() => {
  let result = [...messageStore.messages]
  
  // 按类型筛选
  if (activeType.value !== 'all') {
    result = result.filter(msg => msg.type.id === parseInt(activeType.value))
  }
  
  // 按状态筛选
  if (activeStatus.value === 'read') {
    result = result.filter(msg => msg.read)
  } else if (activeStatus.value === 'unread') {
    result = result.filter(msg => !msg.read)
  }
  
  // 按关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(msg => 
      msg.title.toLowerCase().includes(keyword) || 
      msg.content.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 分页后的消息
const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMessages.value.slice(start, end)
})

// 总消息数
const totalMessages = computed(() => {
  return filteredMessages.value.length
})

// 查看消息详情
const viewMessage = (message) => {
  // 标记为已读
  messageStore.markAsRead(message.id)
  // 跳转到详情页
  router.push(`/messages/${message.id}`)
}

// 标记消息为已读
const markAsRead = (messageId) => {
  messageStore.markAsRead(messageId)
}

// 批量标记为已读
const markSelectedAsRead = () => {
  selectedMessages.value.forEach(messageId => {
    messageStore.markAsRead(messageId)
  })
  selectedMessages.value = []
}

// 标记所有为已读
const markAllAsRead = () => {
  messageStore.markAllAsRead()
}

// 加载消息列表
const loadMessages = () => {
  tableLoading.value = true
  
  // 实际项目中应调用API
  setTimeout(() => {
    messageStore.loadMessages()
    // 确保消息类型数据已加载
    if (messageTypeStore.messageTypes.length === 0) {
      messageTypeStore.loadMessageTypes()
    }
    tableLoading.value = false
  }, 500)
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

// 格式化时间
const formatTime = (time) => {
  return time
}

onMounted(() => {
  // 确保数据已加载
  if (messageStore.messages.length === 0) {
    loadMessages()
  }
})
</script>

<template>
  <div class="messages-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">消息中心</h2>
      </el-col>
    </el-row>
    
    <!-- 筛选工具栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索消息..."
            clearable
            prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-select v-model="activeType" placeholder="消息类型" class="filter-select">
            <el-option label="全部类型" value="all" />
            <el-option
              v-for="type in messageTypeStore.messageTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id.toString()"
            >
              <div class="type-option">
                <el-tag :color="type.color" effect="plain" size="small">{{ type.name }}</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-select v-model="activeStatus" placeholder="消息状态" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="已读" value="read" />
            <el-option label="未读" value="unread" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="24" :lg="6" :xl="6" class="action-buttons">
          <el-button type="primary" @click="markAllAsRead" :disabled="messageStore.unreadCount === 0">
            全部已读
          </el-button>
          <el-button type="success" @click="markSelectedAsRead" :disabled="selectedMessages.length === 0">
            标记已读
          </el-button>
          <el-button type="info" @click="$router.push('/scheduled-messages')">
            定时与批量发送
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 消息列表 -->
    <el-card shadow="hover" class="message-list-card">
      <el-table
        v-loading="tableLoading"
        :data="paginatedMessages"
        style="width: 100%"
        @selection-change="val => selectedMessages = val.map(item => item.id)"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.read ? 'info' : 'danger'"
              effect="plain"
              size="small"
            >
              {{ row.read ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="重要性" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.important" color="#E6A23C"><Star /></el-icon>
            <el-icon v-else><StarFilled style="visibility: hidden" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag
              :style="{ backgroundColor: row.type.color + '20', color: row.type.color, borderColor: row.type.color }"
              effect="plain"
            >
              {{ row.type.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div 
              class="message-title" 
              :class="{ 'unread': !row.read }"
              @click="viewMessage(row)"
            >
              {{ row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sender" label="发送者" width="120" />
        <el-table-column prop="sendTime" label="发送时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.sendTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click="viewMessage(row)"
            >
              查看
            </el-button>
            <el-button
              v-if="!row.read"
              type="success"
              size="small"
              text
              @click="markAsRead(row.id)"
            >
              标为已读
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalMessages"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.messages-container {
  padding-bottom: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  padding: 15px;
}

.filter-select {
  width: 100%;
}

.type-option {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.message-list-card {
  margin-bottom: 20px;
}

.message-list-card :deep(.el-card__body) {
  padding: 0;
}

.message-title {
  cursor: pointer;
  color: #606266;
}

.message-title:hover {
  color: #409EFF;
}

.message-title.unread {
  font-weight: bold;
  color: #303133;
}

.pagination-container {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-buttons {
    justify-content: flex-start;
    margin-top: 15px;
  }
  
  .filter-select {
    margin-bottom: 10px;
  }
}
</style> 