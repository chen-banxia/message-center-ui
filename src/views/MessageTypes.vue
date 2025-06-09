<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMessageTypeStore, useChannelStore, useTemplateStore } from '@/stores'

const messageTypeStore = useMessageTypeStore()
const channelStore = useChannelStore()
const templateStore = useTemplateStore()

// 消息类型列表
const messageTypes = computed(() => messageTypeStore.messageTypes)

// 表格加载状态
const loading = ref(false)
// 类型对话框可见性
const typeDialogVisible = ref(false)
// 当前编辑的类型
const currentType = ref({
  id: null,
  name: '',
  description: '',
  defaultChannels: [],
  defaultTemplate: null,
  status: 'enabled',
  icon: '',
  color: '#409EFF'
})
// 对话框模式：新增/编辑
const dialogMode = ref('add')

// 搜索关键字
const searchKeyword = ref('')
// 状态筛选
const statusFilter = ref('all')

// 颜色选项
const colorOptions = [
  { color: '#409EFF', name: '蓝色' },
  { color: '#67C23A', name: '绿色' },
  { color: '#E6A23C', name: '黄色' },
  { color: '#F56C6C', name: '红色' },
  { color: '#909399', name: '灰色' },
  { color: '#8E44AD', name: '紫色' },
  { color: '#16A085', name: '青色' },
  { color: '#D35400', name: '橙色' }
]

// 图标选项
const iconOptions = [
  'Bell',
  'Message',
  'ChatDotRound',
  'ChatLineRound',
  'Warning',
  'InfoFilled',
  'CircleCheck',
  'CircleClose',
  'Notification',
  'Star'
]

// 筛选后的类型列表
const filteredTypes = computed(() => {
  let result = [...messageTypes.value]
  
  // 按关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(type => 
      type.name.toLowerCase().includes(keyword) || 
      type.description.toLowerCase().includes(keyword)
    )
  }
  
  // 按状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter(type => type.status === statusFilter.value)
  }
  
  return result
})

// 加载消息类型列表
const loadMessageTypes = () => {
  loading.value = true
  
  // 实际项目中应从API获取
  setTimeout(() => {
    messageTypeStore.loadMessageTypes()
    
    // 确保其他相关数据已加载
    if (channelStore.channels.length === 0) {
      channelStore.loadChannels()
    }
    if (templateStore.templates.length === 0) {
      templateStore.loadTemplates()
    }
    
    loading.value = false
  }, 500)
}

// 打开新增类型对话框
const openAddDialog = () => {
  dialogMode.value = 'add'
  currentType.value = {
    id: null,
    name: '',
    description: '',
    defaultChannels: [],
    defaultTemplate: null,
    status: 'enabled',
    icon: 'Bell',
    color: '#409EFF'
  }
  typeDialogVisible.value = true
}

// 打开编辑类型对话框
const openEditDialog = (type) => {
  dialogMode.value = 'edit'
  currentType.value = JSON.parse(JSON.stringify(type))
  typeDialogVisible.value = true
}

// 保存消息类型
const saveMessageType = () => {
  // 表单验证
  if (!currentType.value.name) {
    ElMessage.warning('请填写类型名称')
    return
  }
  
  if (dialogMode.value === 'add') {
    // 使用store的addMessageType方法
    messageTypeStore.addMessageType(currentType.value)
    ElMessage.success('消息类型添加成功')
  } else {
    // 使用store的updateMessageType方法
    messageTypeStore.updateMessageType(currentType.value.id, currentType.value)
    ElMessage.success('消息类型更新成功')
  }
  
  typeDialogVisible.value = false
}

// 切换消息类型状态
const toggleTypeStatus = (type) => {
  const newStatus = type.status === 'enabled' ? 'disabled' : 'enabled'
  messageTypeStore.updateMessageType(type.id, { status: newStatus })
  ElMessage.success(`消息类型已${newStatus === 'enabled' ? '启用' : '禁用'}`)
}

// 获取渠道名称
const getChannelName = (channelId) => {
  const channel = channelStore.channels.find(c => c.id === channelId)
  return channel ? channel.name : `未知渠道(${channelId})`
}

// 获取模板名称
const getTemplateName = (templateId) => {
  const template = templateStore.templates.find(t => t.id === templateId)
  return template ? template.name : `未知模板(${templateId})`
}

// 获取可选渠道列表
const availableChannels = computed(() => {
  return channelStore.channels
    .filter(c => c.status === 'enabled')
    .map(c => ({ value: c.id, label: c.name }))
})

// 获取可选模板列表
const availableTemplates = computed(() => {
  return templateStore.templates
    .filter(t => t.status === 'published')
    .map(t => ({ value: t.id, label: t.name }))
})

onMounted(() => {
  // 确保数据已加载
  if (messageTypeStore.messageTypes.length === 0) {
    loadMessageTypes()
  }
})
</script>

<template>
  <div class="message-types-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">消息类型管理</h2>
      </el-col>
    </el-row>
    
    <!-- 筛选工具栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索类型名称或描述..."
            clearable
            prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-select v-model="statusFilter" placeholder="类型状态" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" :lg="12" :xl="12" class="action-buttons">
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>新增类型
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 类型列表 -->
    <el-card shadow="hover" class="type-list-card">
      <el-table
        v-loading="loading"
        :data="filteredTypes"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="类型名称" min-width="150">
          <template #default="{ row }">
            <div class="type-name">
              <el-icon :style="{ color: row.color }">
                <component :is="row.icon" />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="light">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              :type="row.status === 'enabled' ? 'danger' : 'success'"
              size="small"
              text
              @click="toggleTypeStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 类型编辑对话框 -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="dialogMode === 'add' ? '新增消息类型' : '编辑消息类型'"
      width="70%"
      destroy-on-close
    >
      <el-form :model="currentType" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="类型名称" required>
              <el-input v-model="currentType.name" placeholder="请输入类型名称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="状态">
              <el-select v-model="currentType.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="类型描述">
          <el-input v-model="currentType.description" placeholder="请输入类型描述" type="textarea" :rows="2" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="图标">
              <el-select v-model="currentType.icon" placeholder="请选择图标" style="width: 100%">
                <el-option
                  v-for="icon in iconOptions"
                  :key="icon"
                  :label="icon"
                  :value="icon"
                >
                  <div class="icon-option">
                    <el-icon><component :is="icon" /></el-icon>
                    <span>{{ icon }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="颜色">
              <el-select v-model="currentType.color" placeholder="请选择颜色" style="width: 100%">
                <el-option
                  v-for="option in colorOptions"
                  :key="option.color"
                  :label="option.name"
                  :value="option.color"
                >
                  <div class="color-option">
                    <div class="color-block" :style="{ backgroundColor: option.color }"></div>
                    <span>{{ option.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider>默认配置</el-divider>
        
        <el-form-item label="默认渠道">
          <el-select
            v-model="currentType.defaultChannels"
            multiple
            filterable
            placeholder="请选择默认渠道"
            style="width: 100%"
          >
            <el-option
              v-for="channel in availableChannels"
              :key="channel.value"
              :label="channel.label"
              :value="channel.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="默认模板">
          <el-select
            v-model="currentType.defaultTemplate"
            filterable
            clearable
            placeholder="请选择默认模板"
            style="width: 100%"
          >
            <el-option
              v-for="template in availableTemplates"
              :key="template.value"
              :label="template.label"
              :value="template.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="typeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMessageType">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.message-types-container {
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

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.type-list-card {
  margin-bottom: 20px;
}

.type-list-card :deep(.el-card__body) {
  padding: 0;
}

.type-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-block {
  width: 16px;
  height: 16px;
  border-radius: 2px;
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