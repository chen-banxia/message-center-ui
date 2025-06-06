<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMessageStore } from '../stores/messageStore'

const messageStore = useMessageStore()

// 渠道列表
const channels = computed(() => messageStore.channels)

// 表格加载状态
const loading = ref(false)
// 渠道对话框可见性
const channelDialogVisible = ref(false)
// 当前编辑的渠道
const currentChannel = ref({
  id: null,
  name: '',
  type: '',
  status: 'enabled',
  config: {},
  priority: 0,
  retryTimes: 3,
  retryInterval: 60,
  rateLimit: 100,
  vendor: '',
  tags: []
})
// 对话框模式：新增/编辑
const dialogMode = ref('add')
// 测试对话框可见性
const testDialogVisible = ref(false)
// 测试表单
const testForm = ref({
  recipient: '',
  subject: '',
  content: ''
})
// 测试结果
const testResult = ref({
  success: false,
  message: '',
  time: 0
})
// 测试加载状态
const testLoading = ref(false)

// 搜索关键字
const searchKeyword = ref('')
// 类型筛选
const typeFilter = ref('all')
// 状态筛选
const statusFilter = ref('all')

// 渠道类型选项
const channelTypeOptions = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'wechat', label: '微信' },
  { value: 'dingtalk', label: '钉钉' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'internal', label: '站内信' }
]

// 筛选后的渠道列表
const filteredChannels = computed(() => {
  let result = [...channels.value]
  
  // 按关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(channel => 
      channel.name.toLowerCase().includes(keyword) || 
      channel.vendor.toLowerCase().includes(keyword)
    )
  }
  
  // 按类型筛选
  if (typeFilter.value !== 'all') {
    result = result.filter(channel => channel.type === typeFilter.value)
  }
  
  // 按状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter(channel => channel.status === statusFilter.value)
  }
  
  return result
})

// 加载渠道列表
const loadChannels = () => {
  loading.value = true
  
  // 实际项目中应从API获取
  setTimeout(() => {
    messageStore.loadChannels()
    loading.value = false
  }, 500)
}

// 打开新增渠道对话框
const openAddDialog = () => {
  dialogMode.value = 'add'
  currentChannel.value = {
    id: null,
    name: '',
    type: '',
    status: 'enabled',
    config: {},
    priority: 1,
    retryTimes: 3,
    retryInterval: 60,
    rateLimit: 100,
    vendor: '',
    tags: []
  }
  channelDialogVisible.value = true
}

// 打开编辑渠道对话框
const openEditDialog = (channel) => {
  dialogMode.value = 'edit'
  currentChannel.value = JSON.parse(JSON.stringify(channel))
  channelDialogVisible.value = true
}

// 保存渠道
const saveChannel = () => {
  // 表单验证
  if (!currentChannel.value.name || !currentChannel.value.type) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  // 实际项目中应调用API保存
  if (dialogMode.value === 'add') {
    // 模拟添加
    const newChannel = {
      ...currentChannel.value,
      id: messageStore.channels.length + 1
    }
    messageStore.channels.push(newChannel)
    ElMessage.success('渠道添加成功')
  } else {
    // 模拟更新
    const index = messageStore.channels.findIndex(c => c.id === currentChannel.value.id)
    if (index !== -1) {
      messageStore.channels[index] = { ...currentChannel.value }
      ElMessage.success('渠道更新成功')
    }
  }
  
  channelDialogVisible.value = false
}

// 切换渠道状态
const toggleChannelStatus = (channel) => {
  const newStatus = channel.status === 'enabled' ? 'disabled' : 'enabled'
  const index = messageStore.channels.findIndex(c => c.id === channel.id)
  
  if (index !== -1) {
    messageStore.channels[index].status = newStatus
    
    ElMessage.success(`渠道已${newStatus === 'enabled' ? '启用' : '禁用'}`)
  }
}

// 打开测试对话框
const openTestDialog = (channel) => {
  // 设置当前测试的渠道
  currentChannel.value = JSON.parse(JSON.stringify(channel))
  
  // 重置测试表单
  testForm.value = {
    recipient: '',
    subject: '测试消息',
    content: '这是一条测试消息，请勿回复。'
  }
  
  // 重置测试结果
  testResult.value = {
    success: false,
    message: '',
    time: 0
  }
  
  testDialogVisible.value = true
}

// 执行渠道测试
const runChannelTest = () => {
  // 表单验证
  if (!testForm.value.recipient) {
    ElMessage.warning('请填写接收者')
    return
  }
  
  testLoading.value = true
  testResult.value = {
    success: false,
    message: '',
    time: 0
  }
  
  // 模拟测试请求
  const startTime = Date.now()
  setTimeout(() => {
    // 随机测试结果
    const success = Math.random() > 0.3
    const endTime = Date.now()
    
    testResult.value = {
      success: success,
      message: success ? '消息发送成功' : '消息发送失败，请检查配置',
      time: endTime - startTime
    }
    
    testLoading.value = false
  }, 1500)
}

// 获取渠道类型显示名称
const getChannelTypeName = (type) => {
  const option = channelTypeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

// 获取渠道类型图标
const getChannelTypeIcon = (type) => {
  switch (type) {
    case 'email': return 'Message'
    case 'sms': return 'ChatDotRound'
    case 'wechat': return 'ChatLineRound'
    case 'dingtalk': return 'Bell'
    case 'webhook': return 'Link'
    case 'internal': return 'Notification'
    default: return 'More'
  }
}

// 获取渠道配置表单
const getChannelConfigForm = () => {
  switch (currentChannel.value.type) {
    case 'email':
      return [
        { key: 'host', label: 'SMTP服务器', type: 'input', required: true },
        { key: 'port', label: '端口', type: 'number', required: true },
        { key: 'username', label: '用户名', type: 'input', required: true },
        { key: 'password', label: '密码', type: 'password', required: true },
        { key: 'ssl', label: '使用SSL', type: 'switch', required: false },
        { key: 'from', label: '发件人', type: 'input', required: true }
      ]
    case 'sms':
      return [
        { key: 'accessKey', label: 'AccessKey', type: 'input', required: true },
        { key: 'secretKey', label: 'SecretKey', type: 'password', required: true },
        { key: 'signName', label: '签名', type: 'input', required: true },
        { key: 'region', label: '区域', type: 'input', required: false }
      ]
    case 'wechat':
      return [
        { key: 'appId', label: 'AppID', type: 'input', required: true },
        { key: 'appSecret', label: 'AppSecret', type: 'password', required: true },
        { key: 'templateId', label: '模板ID', type: 'input', required: true }
      ]
    case 'dingtalk':
      return [
        { key: 'accessToken', label: 'AccessToken', type: 'input', required: true },
        { key: 'secret', label: '加签密钥', type: 'password', required: false }
      ]
    case 'webhook':
      return [
        { key: 'url', label: 'Webhook URL', type: 'input', required: true },
        { key: 'method', label: '请求方法', type: 'select', options: ['POST', 'GET'], required: true },
        { key: 'headers', label: '请求头', type: 'textarea', required: false },
        { key: 'timeout', label: '超时时间(秒)', type: 'number', required: false }
      ]
    default:
      return []
  }
}

// 初始化渠道配置
const initChannelConfig = () => {
  const configFields = getChannelConfigForm()
  const config = {}
  
  configFields.forEach(field => {
    if (!currentChannel.value.config[field.key]) {
      if (field.type === 'switch') {
        config[field.key] = false
      } else if (field.type === 'number') {
        config[field.key] = 0
      } else if (field.type === 'select' && field.options) {
        config[field.key] = field.options[0]
      } else {
        config[field.key] = ''
      }
    } else {
      config[field.key] = currentChannel.value.config[field.key]
    }
  })
  
  currentChannel.value.config = config
}

// 监听渠道类型变化
const handleChannelTypeChange = () => {
  initChannelConfig()
}

onMounted(() => {
  // 确保数据已加载
  if (messageStore.channels.length === 0) {
    loadChannels()
  }
})
</script>

<template>
  <div class="channels-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">通知渠道管理</h2>
      </el-col>
    </el-row>
    
    <!-- 筛选工具栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索渠道名称..."
            clearable
            prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <el-select v-model="typeFilter" placeholder="渠道类型" class="filter-select">
            <el-option label="全部类型" value="all" />
            <el-option
              v-for="option in channelTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <el-select v-model="statusFilter" placeholder="渠道状态" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="10" :xl="10" class="action-buttons">
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>新增渠道
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 渠道列表 -->
    <el-card shadow="hover" class="channel-list-card">
      <el-table
        v-loading="loading"
        :data="filteredChannels"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="渠道名称" min-width="150">
          <template #default="{ row }">
            <div class="channel-name">
              <el-icon>
                <component :is="getChannelTypeIcon(row.type)" />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="渠道类型" width="120">
          <template #default="{ row }">
            {{ getChannelTypeName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="vendor" label="供应商" width="150" />
        <el-table-column label="优先级" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="light">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
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
              @click="toggleChannelStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="warning"
              size="small"
              text
              @click="openTestDialog(row)"
              :disabled="row.status !== 'enabled'"
            >
              测试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 渠道编辑对话框 -->
    <el-dialog
      v-model="channelDialogVisible"
      :title="dialogMode === 'add' ? '新增渠道' : '编辑渠道'"
      width="70%"
      destroy-on-close
    >
      <el-form :model="currentChannel" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="渠道名称" required>
              <el-input v-model="currentChannel.name" placeholder="请输入渠道名称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="渠道类型" required>
              <el-select 
                v-model="currentChannel.type" 
                placeholder="请选择渠道类型" 
                style="width: 100%"
                @change="handleChannelTypeChange"
              >
                <el-option
                  v-for="option in channelTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="渠道状态">
              <el-select v-model="currentChannel.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="供应商">
              <el-input v-model="currentChannel.vendor" placeholder="请输入供应商" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <el-form-item label="优先级">
              <el-input-number v-model="currentChannel.priority" :min="1" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <el-form-item label="重试次数">
              <el-input-number v-model="currentChannel.retryTimes" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <el-form-item label="重试间隔(秒)">
              <el-input-number v-model="currentChannel.retryInterval" :min="1" :max="3600" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider>渠道配置</el-divider>
        
        <template v-if="currentChannel.type">
          <el-form-item 
            v-for="field in getChannelConfigForm()" 
            :key="field.key"
            :label="field.label"
            :required="field.required"
          >
            <el-input 
              v-if="field.type === 'input'" 
              v-model="currentChannel.config[field.key]" 
              :placeholder="`请输入${field.label}`"
            />
            <el-input 
              v-else-if="field.type === 'password'" 
              v-model="currentChannel.config[field.key]" 
              :placeholder="`请输入${field.label}`"
              type="password"
              show-password
            />
            <el-input-number 
              v-else-if="field.type === 'number'" 
              v-model="currentChannel.config[field.key]" 
              :placeholder="`请输入${field.label}`"
              style="width: 100%"
            />
            <el-switch 
              v-else-if="field.type === 'switch'" 
              v-model="currentChannel.config[field.key]" 
            />
            <el-select 
              v-else-if="field.type === 'select'" 
              v-model="currentChannel.config[field.key]" 
              :placeholder="`请选择${field.label}`"
              style="width: 100%"
            >
              <el-option
                v-for="option in field.options"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
            <el-input 
              v-else-if="field.type === 'textarea'" 
              v-model="currentChannel.config[field.key]" 
              :placeholder="`请输入${field.label}`"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </template>
        
        <el-empty v-else description="请先选择渠道类型" :image-size="100" />
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="channelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChannel">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 渠道测试对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="渠道测试"
      width="500px"
      destroy-on-close
    >
      <div class="test-channel-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="渠道名称">{{ currentChannel.name }}</el-descriptions-item>
          <el-descriptions-item label="渠道类型">{{ getChannelTypeName(currentChannel.type) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <el-divider>测试参数</el-divider>
      
      <el-form :model="testForm" label-width="80px">
        <el-form-item label="接收者" required>
          <el-input v-model="testForm.recipient" :placeholder="`请输入${currentChannel.type === 'email' ? '邮箱' : currentChannel.type === 'sms' ? '手机号' : '接收者ID'}`" />
        </el-form-item>
        
        <el-form-item label="主题" v-if="currentChannel.type !== 'sms'">
          <el-input v-model="testForm.subject" placeholder="请输入消息主题" />
        </el-form-item>
        
        <el-form-item label="内容">
          <el-input v-model="testForm.content" type="textarea" :rows="3" placeholder="请输入消息内容" />
        </el-form-item>
      </el-form>
      
      <div v-if="testResult.message" class="test-result">
        <el-alert
          :title="testResult.message"
          :type="testResult.success ? 'success' : 'error'"
          :closable="false"
          show-icon
        >
          <template v-if="testResult.time" #default>
            <div>耗时: {{ testResult.time }}ms</div>
          </template>
        </el-alert>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="testDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="runChannelTest" :loading="testLoading">开始测试</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.channels-container {
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

.channel-list-card {
  margin-bottom: 20px;
}

.channel-list-card :deep(.el-card__body) {
  padding: 0;
}

.channel-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-channel-info {
  margin-bottom: 20px;
}

.test-result {
  margin-top: 20px;
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