<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
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
  tags: [],
  paramMapping: {},
  availableTime: {
    workDays: [1, 2, 3, 4, 5],
    timeRanges: [{ start: '00:00', end: '23:59' }]
  },
  monitorMetrics: {
    availability: 100,
    successRate: 100,
    avgResponseTime: 0
  }
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
// 标签筛选
const tagFilter = ref([])

// 获取所有标签
const allTags = computed(() => {
  const tagSet = new Set()
  channels.value.forEach(channel => {
    if (channel.tags && channel.tags.length) {
      channel.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet)
})

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
  
  // 按标签筛选
  if (tagFilter.value.length > 0) {
    result = result.filter(channel => 
      channel.tags && 
      channel.tags.some(tag => tagFilter.value.includes(tag))
    )
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
    tags: [],
    paramMapping: {},
    availableTime: {
      workDays: [1, 2, 3, 4, 5],
      timeRanges: [{ start: '00:00', end: '23:59' }]
    },
    monitorMetrics: {
      availability: 100,
      successRate: 100,
      avgResponseTime: 0
    }
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

// 获取成功率颜色
const getSuccessRateColor = (rate) => {
  if (rate >= 95) return '#67C23A' // 绿色
  if (rate >= 80) return '#E6A23C' // 黄色
  return '#F56C6C' // 红色
}

// 获取参数显示名称
const getParamLabel = (paramKey, paramType) => {
  if (!paramKey) return '-'
  
  if (paramType === 'standard') {
    const param = getParamMappingForm().standardParams.find(p => p.key === paramKey)
    return param ? param.label : paramKey
  }
  
  const channelParams = {
    email: getParamMappingForm().channelSpecificParams.email || [],
    sms: getParamMappingForm().channelSpecificParams.sms || [],
    wechat: getParamMappingForm().channelSpecificParams.wechat || [],
    dingtalk: getParamMappingForm().channelSpecificParams.dingtalk || [],
    webhook: getParamMappingForm().channelSpecificParams.webhook || [],
    internal: getParamMappingForm().channelSpecificParams.internal || []
  }
  
  const param = channelParams[paramType]?.find(p => p.key === paramKey)
  return param ? param.label : paramKey
}

// 获取参数值（用于测试对话框中的参数映射预览）
const getParamValue = (paramKey, formData) => {
  switch (paramKey) {
    case 'recipient': return formData.recipient
    case 'subject': return formData.subject
    case 'content': return formData.content
    default: return '-'
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

// 获取参数映射配置表单
const getParamMappingForm = () => {
  // 系统标准参数列表
  const standardParams = [
    { key: 'recipient', label: '接收者', description: '消息接收者的标识符' },
    { key: 'subject', label: '主题', description: '消息的主题或标题' },
    { key: 'content', label: '内容', description: '消息的正文内容' },
    { key: 'attachment', label: '附件', description: '消息的附件' },
    { key: 'importance', label: '重要性', description: '消息的重要级别' },
    { key: 'template_id', label: '模板ID', description: '消息模板的标识符' },
    { key: 'url', label: '链接', description: '消息中的可点击链接' }
  ]
  
  // 各渠道的特定参数
  const channelSpecificParams = {
    email: [
      { key: 'to_email', label: '收件人邮箱', description: '接收者的邮箱地址' },
      { key: 'cc', label: '抄送', description: '抄送邮箱列表' },
      { key: 'bcc', label: '密送', description: '密送邮箱列表' },
      { key: 'subject', label: '邮件主题', description: '邮件的标题' },
      { key: 'html_body', label: 'HTML正文', description: '邮件的HTML格式正文' },
      { key: 'text_body', label: '纯文本正文', description: '邮件的纯文本格式正文' },
      { key: 'attachments', label: '附件列表', description: '邮件的附件列表' }
    ],
    sms: [
      { key: 'phone_number', label: '手机号码', description: '接收者的手机号码' },
      { key: 'content', label: '短信内容', description: '短信的文本内容' },
      { key: 'template_code', label: '模板编码', description: '短信服务商的模板编码' },
      { key: 'template_param', label: '模板参数', description: '短信模板的参数' }
    ],
    wechat: [
      { key: 'open_id', label: '微信OpenID', description: '接收者的微信OpenID' },
      { key: 'template_id', label: '模板ID', description: '微信模板消息的模板ID' },
      { key: 'first_data', label: '首行数据', description: '模板消息的首行数据' },
      { key: 'remark', label: '备注', description: '模板消息的备注内容' },
      { key: 'url', label: '跳转链接', description: '点击消息后的跳转链接' },
      { key: 'mini_program', label: '小程序信息', description: '关联的小程序信息' }
    ],
    dingtalk: [
      { key: 'user_id', label: '用户ID', description: '钉钉用户的唯一标识' },
      { key: 'msg_type', label: '消息类型', description: '钉钉消息的类型' },
      { key: 'title', label: '标题', description: '消息的标题' },
      { key: 'text', label: '文本内容', description: '消息的文本内容' },
      { key: 'markdown', label: 'Markdown内容', description: '消息的Markdown内容' }
    ],
    webhook: [
      { key: 'payload', label: '请求数据', description: 'Webhook请求的数据体' },
      { key: 'headers', label: '请求头', description: 'Webhook请求的头信息' }
    ],
    internal: [
      { key: 'user_id', label: '用户ID', description: '系统内部用户的唯一标识' },
      { key: 'title', label: '标题', description: '站内信的标题' },
      { key: 'content', label: '内容', description: '站内信的内容' },
      { key: 'type', label: '类型', description: '站内信的类型' },
      { key: 'link', label: '链接', description: '相关的链接地址' }
    ]
  }
  
  return {
    standardParams,
    channelSpecificParams: channelSpecificParams[currentChannel.value.type] || []
  }
}

// 初始化参数映射
const initParamMapping = () => {
  // 如果当前渠道没有参数映射，则初始化默认映射
  if (!currentChannel.value.paramMapping) {
    currentChannel.value.paramMapping = {}
  }
  
  // 获取默认映射
  const defaultMapping = getDefaultParamMapping(currentChannel.value.type)
  
  // 在编辑模式下，保留现有映射，只添加缺失的默认映射
  if (dialogMode.value === 'edit') {
    // 合并默认映射和现有映射，保留用户设置的映射
    Object.keys(defaultMapping).forEach(key => {
      if (!currentChannel.value.paramMapping[key]) {
        currentChannel.value.paramMapping[key] = defaultMapping[key]
      }
    })
  } else {
    // 新增模式下，使用默认映射
    currentChannel.value.paramMapping = { ...defaultMapping }
  }
}

// 获取默认参数映射
const getDefaultParamMapping = (channelType) => {
  switch (channelType) {
    case 'email':
      return {
        recipient: 'to_email',
        subject: 'subject',
        content: 'html_body',
        attachment: 'attachments'
      }
    case 'sms':
      return {
        recipient: 'phone_number',
        content: 'content',
        template_id: 'template_code'
      }
    case 'wechat':
      return {
        recipient: 'open_id',
        subject: 'first_data',
        content: 'remark',
        url: 'url'
      }
    case 'dingtalk':
      return {
        recipient: 'user_id',
        subject: 'title',
        content: 'text'
      }
    case 'webhook':
      return {
        content: 'payload'
      }
    case 'internal':
      return {
        recipient: 'user_id',
        subject: 'title',
        content: 'content'
      }
    default:
      return {}
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
  
  // 保存当前的参数映射
  const oldMapping = { ...currentChannel.value.paramMapping }
  
  // 初始化新的参数映射
  initParamMapping()
  
  // 如果是编辑模式且渠道类型改变，尝试保留兼容的参数映射
  if (dialogMode.value === 'edit') {
    const newParams = getParamMappingForm().channelSpecificParams
    const newParamKeys = newParams.map(p => p.key)
    
    // 检查旧映射中的值是否在新渠道参数中存在
    Object.keys(oldMapping).forEach(standardKey => {
      const targetParam = oldMapping[standardKey]
      if (newParamKeys.includes(targetParam)) {
        // 如果目标参数在新渠道类型中也存在，则保留映射
        currentChannel.value.paramMapping[standardKey] = targetParam
      }
    })
  }
}

// 标签输入相关
const inputTagVisible = ref(false)
const inputTagValue = ref('')
const tagInputRef = ref(null)

// 显示标签输入框
const showTagInput = () => {
  inputTagVisible.value = true
  nextTick(() => {
    tagInputRef.value.focus()
  })
}

// 确认标签输入
const handleTagConfirm = () => {
  if (inputTagValue.value) {
    if (!currentChannel.value.tags) {
      currentChannel.value.tags = []
    }
    // 检查标签是否已存在
    if (!currentChannel.value.tags.includes(inputTagValue.value)) {
      currentChannel.value.tags.push(inputTagValue.value)
    }
  }
  inputTagVisible.value = false
  inputTagValue.value = ''
}

// 清除参数映射
const clearParamMapping = (key) => {
  if (currentChannel.value.paramMapping && key in currentChannel.value.paramMapping) {
    // 使用Vue的响应式API删除属性
    delete currentChannel.value.paramMapping[key]
    // 强制更新
    currentChannel.value = { ...currentChannel.value }
  }
}

// 重置所有参数映射为默认值
const resetAllParamMappings = () => {
  const defaultMapping = getDefaultParamMapping(currentChannel.value.type)
  currentChannel.value.paramMapping = { ...defaultMapping }
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
        <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <el-select 
            v-model="tagFilter" 
            placeholder="标签筛选" 
            class="filter-select"
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="action-buttons">
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
        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              type="info"
              effect="plain"
              size="small"
              class="channel-tag"
            >
              {{ tag }}
            </el-tag>
            <span v-if="!row.tags || row.tags.length === 0">-</span>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="重试策略" width="120" align="center">
          <template #default="{ row }">
            <el-tooltip :content="`重试${row.retryTimes}次，间隔${row.retryInterval}秒`" placement="top">
              <span>{{ row.retryTimes }}次/{{ row.retryInterval }}秒</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="监控指标" width="150" align="center">
          <template #default="{ row }">
            <el-tooltip v-if="row.monitorMetrics" placement="top">
              <template #content>
                <div>可用性: {{ row.monitorMetrics.availability }}%</div>
                <div>成功率: {{ row.monitorMetrics.successRate }}%</div>
                <div>平均响应: {{ row.monitorMetrics.avgResponseTime }}ms</div>
              </template>
              <div class="metrics-indicator">
                <el-progress 
                  type="dashboard" 
                  :percentage="row.monitorMetrics?.successRate || 100" 
                  :color="getSuccessRateColor(row.monitorMetrics?.successRate || 100)"
                  :width="40"
                  :stroke-width="6"
                />
              </div>
            </el-tooltip>
            <span v-else>-</span>
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
        
        <el-form-item label="标签">
          <el-tag
            v-for="tag in currentChannel.tags"
            :key="tag"
            closable
            class="edit-tag"
            @close="currentChannel.tags.splice(currentChannel.tags.indexOf(tag), 1)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputTagVisible"
            ref="tagInputRef"
            v-model="inputTagValue"
            class="input-new-tag"
            size="small"
            @keyup.enter="handleTagConfirm"
            @blur="handleTagConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
            + 新增标签
          </el-button>
        </el-form-item>
        
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

        <el-divider>参数映射</el-divider>
        
        <template v-if="currentChannel.type">
          <div class="param-mapping-header">
            <p class="param-mapping-desc">参数映射用于将标准参数转换为渠道特定参数，使业务系统可以使用统一的参数格式发送消息</p>
            <el-button 
              type="primary" 
              size="small" 
              plain
              @click="resetAllParamMappings"
            >
              恢复默认映射
            </el-button>
          </div>
          
          <el-table :data="getParamMappingForm().standardParams" border style="width: 100%; margin-bottom: 20px;">
            <el-table-column prop="label" label="标准参数" width="120" />
            <el-table-column prop="description" label="参数描述" width="200" />
            <el-table-column label="映射到渠道参数" min-width="200">
              <template #default="{ row }">
                <el-select 
                  v-model="currentChannel.paramMapping[row.key]" 
                  placeholder="请选择映射参数"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="param in getParamMappingForm().channelSpecificParams"
                    :key="param.key"
                    :label="`${param.label} (${param.key})`"
                    :value="param.key"
                  />
                </el-select>
                <div class="param-mapping-status" v-if="currentChannel.paramMapping[row.key]">
                  <el-tag size="small" type="success">
                    已映射到: {{ getParamLabel(currentChannel.paramMapping[row.key], currentChannel.type) }}
                  </el-tag>
                </div>
                <div class="param-mapping-status" v-else>
                  <el-tag size="small" type="info">未映射</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  text
                  @click="currentChannel.paramMapping[row.key] = getDefaultParamMapping(currentChannel.type)[row.key] || ''"
                  :disabled="!getDefaultParamMapping(currentChannel.type)[row.key]"
                >
                  重置默认
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  text
                  @click="clearParamMapping(row.key)"
                  :disabled="!currentChannel.paramMapping[row.key]"
                >
                  清除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
        
        <el-empty v-else description="请先选择渠道类型" :image-size="100" />
        
        <el-divider>可用时间</el-divider>
        
        <el-form-item label="工作日">
          <el-checkbox-group v-model="currentChannel.availableTime.workDays">
            <el-checkbox :label="1">周一</el-checkbox>
            <el-checkbox :label="2">周二</el-checkbox>
            <el-checkbox :label="3">周三</el-checkbox>
            <el-checkbox :label="4">周四</el-checkbox>
            <el-checkbox :label="5">周五</el-checkbox>
            <el-checkbox :label="6">周六</el-checkbox>
            <el-checkbox :label="7">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="时间段">
          <div v-for="(range, index) in currentChannel.availableTime.timeRanges" :key="index" class="time-range-item">
            <el-time-picker
              v-model="range.start"
              format="HH:mm"
              placeholder="开始时间"
              style="width: 120px; margin-right: 10px;"
            />
            <span class="time-range-separator">至</span>
            <el-time-picker
              v-model="range.end"
              format="HH:mm"
              placeholder="结束时间"
              style="width: 120px; margin-left: 10px; margin-right: 10px;"
            />
            <el-button 
              type="danger" 
              icon="Delete" 
              circle 
              size="small"
              @click="currentChannel.availableTime.timeRanges.splice(index, 1)"
              v-if="currentChannel.availableTime.timeRanges.length > 1"
            />
          </div>
          <div class="add-time-range">
            <el-button 
              type="primary" 
              plain 
              size="small" 
              @click="currentChannel.availableTime.timeRanges.push({ start: '00:00', end: '23:59' })"
            >
              添加时间段
            </el-button>
          </div>
        </el-form-item>
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
      width="600px"
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
        
        <el-collapse>
          <el-collapse-item title="参数映射预览">
            <div class="param-mapping-preview">
              <p class="mapping-title">标准参数将被映射为以下渠道特定参数：</p>
              
              <el-empty 
                v-if="!currentChannel.paramMapping || Object.keys(currentChannel.paramMapping).length === 0" 
                description="未配置参数映射" 
                :image-size="80" 
              />
              
              <el-table 
                v-else
                :data="Object.keys(currentChannel.paramMapping).map(key => ({
                  standardKey: key,
                  standardLabel: getParamLabel(key, 'standard'),
                  targetKey: currentChannel.paramMapping[key],
                  targetLabel: getParamLabel(currentChannel.paramMapping[key], currentChannel.type),
                  value: getParamValue(key, testForm)
                }))"
                border 
                size="small"
                style="width: 100%"
              >
                <el-table-column label="标准参数" prop="standardLabel" width="120" />
                <el-table-column label="映射到渠道参数" prop="targetLabel" width="150" />
                <el-table-column label="实际值">
                  <template #default="{ row }">
                    <span class="param-value">{{ row.value || '-' }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
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

/* 参数映射样式 */
.param-mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.param-mapping-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

.param-mapping-preview {
  padding: 10px 0;
}

.mapping-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.param-mapping-value {
  margin-top: 5px;
  color: #909399;
}

.param-value {
  color: #409EFF;
  word-break: break-all;
}

.param-mapping-status {
  margin-top: 5px;
}

/* 时间段样式 */
.time-range-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.time-range-separator {
  margin: 0 10px;
  color: #909399;
}

.add-time-range {
  margin-top: 10px;
}

/* 监控指标样式 */
.metrics-indicator {
  display: flex;
  justify-content: center;
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

.channel-tag {
  margin-right: 5px;
}

.edit-tag {
  margin-right: 10px;
  margin-bottom: 5px;
}

.button-new-tag {
  margin-bottom: 5px;
}

.input-new-tag {
  width: 150px;
  margin-right: 10px;
  margin-bottom: 5px;
  display: inline-block;
  vertical-align: bottom;
}
</style> 