<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useChannelStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'

const channelStore = useChannelStore()

// 标准参数列表
const standardParams = ref([])
// 表格加载状态
const loading = ref(false)
// 参数对话框可见性
const paramDialogVisible = ref(false)
// 当前编辑的参数
const currentParam = ref({
  id: null,
  key: '',
  label: '',
  description: '',
  type: 'string',
  required: false,
  defaultValue: '',
  validationRules: {},
  appliedChannels: []
})
// 对话框模式：新增/编辑
const dialogMode = ref('add')
// 搜索关键字
const searchKeyword = ref('')
// 类型筛选
const typeFilter = ref('all')
// 渠道筛选
const channelFilter = ref([])

// 分页相关变量
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 参数类型选项
const paramTypeOptions = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
  { value: 'array', label: '数组' },
  { value: 'object', label: '对象' },
  { value: 'date', label: '日期' },
  { value: 'email', label: '邮箱' },
  { value: 'phone', label: '手机号' },
  { value: 'url', label: 'URL' }
]

// 获取所有渠道类型
const channelTypes = computed(() => {
  return [
    { value: 'email', label: '邮件' },
    { value: 'sms', label: '短信' },
    { value: 'wechat', label: '微信' },
    { value: 'dingtalk', label: '钉钉' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'internal', label: '站内信' }
  ]
})

// 默认映射配置对话框可见性
const mappingDialogVisible = ref(false)
// 当前编辑的默认映射配置
const currentMappingConfig = ref({
  standardParam: null,
  mappings: {}
})

// 各渠道特定参数
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

// 默认映射关系表
const defaultMappings = ref([])

// 监听 channelStore 中的默认参数映射配置变化
const initDefaultMappings = async () => {
  // 如果 store 中已有数据，直接使用
  if (channelStore.defaultParamMappings && channelStore.defaultParamMappings.length > 0) {
    console.log('从 store 中获取默认映射配置:', channelStore.defaultParamMappings)
    defaultMappings.value = JSON.parse(JSON.stringify(channelStore.defaultParamMappings))
  } else {
    // 否则加载数据
    console.log('加载默认映射配置')
    await channelStore.loadDefaultParamMappings()
    defaultMappings.value = JSON.parse(JSON.stringify(channelStore.defaultParamMappings))
  }
  console.log('初始化后的默认映射:', defaultMappings.value)
}

// 筛选后的参数列表
const filteredParams = computed(() => {
  let result = [...standardParams.value]
  
  // 按关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(param => 
      param.key.toLowerCase().includes(keyword) || 
      param.label.toLowerCase().includes(keyword) ||
      param.description.toLowerCase().includes(keyword)
    )
  }
  
  // 按类型筛选
  if (typeFilter.value !== 'all') {
    result = result.filter(param => param.type === typeFilter.value)
  }
  
  // 按渠道筛选
  if (channelFilter.value.length > 0) {
    result = result.filter(param => 
      param.appliedChannels && 
      param.appliedChannels.some(channel => channelFilter.value.includes(channel))
    )
  }
  
  // 更新总数
  pagination.value.total = result.length
  
  return result
})

// 分页后的参数列表
const paginatedParams = computed(() => {
  // 分页处理
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredParams.value.slice(start, end)
})

// 处理分页变化
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.currentPage = 1
}

// 加载标准参数列表
const loadStandardParams = () => {
  loading.value = true
  
  // 模拟从API获取数据
  setTimeout(() => {
    standardParams.value = [
      {
        id: 1,
        key: 'recipient',
        label: '接收者',
        description: '消息接收者的标识符',
        type: 'string',
        required: true,
        defaultValue: '',
        validationRules: {
          required: true,
          message: '接收者不能为空'
        },
        appliedChannels: ['email', 'sms', 'wechat', 'dingtalk', 'internal']
      },
      {
        id: 2,
        key: 'subject',
        label: '主题',
        description: '消息的主题或标题',
        type: 'string',
        required: true,
        defaultValue: '',
        validationRules: {
          required: true,
          message: '主题不能为空'
        },
        appliedChannels: ['email', 'wechat', 'dingtalk', 'internal']
      },
      {
        id: 3,
        key: 'content',
        label: '内容',
        description: '消息的正文内容',
        type: 'string',
        required: true,
        defaultValue: '',
        validationRules: {
          required: true,
          message: '内容不能为空'
        },
        appliedChannels: ['email', 'sms', 'wechat', 'dingtalk', 'webhook', 'internal']
      },
      {
        id: 4,
        key: 'attachment',
        label: '附件',
        description: '消息的附件',
        type: 'array',
        required: false,
        defaultValue: '[]',
        validationRules: {},
        appliedChannels: ['email']
      },
      {
        id: 5,
        key: 'importance',
        label: '重要性',
        description: '消息的重要级别',
        type: 'string',
        required: false,
        defaultValue: 'normal',
        validationRules: {
          enum: ['high', 'normal', 'low']
        },
        appliedChannels: ['email', 'internal']
      },
      {
        id: 6,
        key: 'template_id',
        label: '模板ID',
        description: '消息模板的标识符',
        type: 'string',
        required: false,
        defaultValue: '',
        validationRules: {},
        appliedChannels: ['email', 'sms', 'wechat']
      },
      {
        id: 7,
        key: 'url',
        label: '链接',
        description: '消息中的可点击链接',
        type: 'url',
        required: false,
        defaultValue: '',
        validationRules: {
          pattern: /^https?:\/\/.+/,
          message: '请输入有效的URL'
        },
        appliedChannels: ['email', 'wechat', 'dingtalk', 'internal']
      }
    ]
    
    loading.value = false
    
    // 初始化默认映射配置
    initDefaultMappings()
  }, 500)
}

// 打开新增参数对话框
const openAddDialog = () => {
  dialogMode.value = 'add'
  currentParam.value = {
    id: null,
    key: '',
    label: '',
    description: '',
    type: 'string',
    required: false,
    defaultValue: '',
    validationRules: {},
    appliedChannels: []
  }
  paramDialogVisible.value = true
}

// 打开编辑参数对话框
const openEditDialog = (param) => {
  dialogMode.value = 'edit'
  currentParam.value = JSON.parse(JSON.stringify(param))
  paramDialogVisible.value = true
}

// 保存参数
const saveParam = () => {
  // 表单验证
  if (!currentParam.value.key || !currentParam.value.label) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  if (dialogMode.value === 'add') {
    // 添加新参数
    const newParam = {
      ...currentParam.value,
      id: standardParams.value.length + 1
    }
    standardParams.value.push(newParam)
    ElMessage.success('参数添加成功')
  } else {
    // 更新参数
    const index = standardParams.value.findIndex(p => p.id === currentParam.value.id)
    if (index !== -1) {
      standardParams.value[index] = { ...currentParam.value }
      ElMessage.success('参数更新成功')
    }
  }
  
  paramDialogVisible.value = false
}

// 删除参数
const deleteParam = (param) => {
  ElMessageBox.confirm(
    `确定要删除参数"${param.label}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = standardParams.value.findIndex(p => p.id === param.id)
    if (index !== -1) {
      standardParams.value.splice(index, 1)
      ElMessage.success('参数删除成功')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 获取参数类型显示名称
const getParamTypeName = (type) => {
  const option = paramTypeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

// 获取渠道类型显示名称
const getChannelTypeName = (type) => {
  const option = channelTypes.value.find(opt => opt.value === type)
  return option ? option.label : type
}

// 获取验证规则显示文本
const getValidationRuleText = (rules) => {
  if (!rules || Object.keys(rules).length === 0) {
    return '无'
  }
  
  const texts = []
  
  if (rules.required) {
    texts.push('必填')
  }
  
  if (rules.enum) {
    texts.push(`枚举值: ${rules.enum.join(', ')}`)
  }
  
  if (rules.min !== undefined) {
    texts.push(`最小值: ${rules.min}`)
  }
  
  if (rules.max !== undefined) {
    texts.push(`最大值: ${rules.max}`)
  }
  
  if (rules.pattern) {
    texts.push('正则匹配')
  }
  
  return texts.join(', ')
}

// 打开参数映射配置对话框
const openMappingDialog = (param) => {
  // 初始化当前映射配置
  currentMappingConfig.value = {
    standardParam: param,
    mappings: {}
  }
  
  // 从默认映射配置中获取该参数的映射关系
  const existingMapping = defaultMappings.value.find(m => m.standardParam.id === param.id)
  
  if (existingMapping) {
    // 如果已有映射配置，复制一份以便编辑
    currentMappingConfig.value = JSON.parse(JSON.stringify(existingMapping))
    
    // 确保所有渠道都有配置对象
    channelTypes.value.forEach(channel => {
      if (!currentMappingConfig.value.mappings[channel.value]) {
        currentMappingConfig.value.mappings[channel.value] = {
          paramKey: '',
          description: '',
          isRequired: param.required
        }
      }
    })
  } else {
    // 如果没有已存在的映射，为所有渠道初始化一个空的映射配置
    channelTypes.value.forEach(channel => {
      const isApplied = param.appliedChannels && param.appliedChannels.includes(channel.value)
      currentMappingConfig.value.mappings[channel.value] = {
        paramKey: '',
        description: '',
        isRequired: isApplied ? param.required : false
      }
    })
  }
  
  // 打印调试信息，便于确认映射关系
  console.log('当前参数映射配置:', currentMappingConfig.value)
  
  mappingDialogVisible.value = true
}

// 保存参数映射配置
const saveMappingConfig = async () => {
  try {
    // 清理空的映射关系，只保留有参数映射的渠道
    const cleanedMappings = {}
    Object.keys(currentMappingConfig.value.mappings).forEach(channel => {
      if (currentMappingConfig.value.mappings[channel] && 
          currentMappingConfig.value.mappings[channel].paramKey) {
        cleanedMappings[channel] = currentMappingConfig.value.mappings[channel]
      }
    })
    
    // 创建要保存的映射配置
    const configToSave = {
      standardParam: currentMappingConfig.value.standardParam,
      mappings: cleanedMappings
    }
    
    // 查找是否已存在该参数的映射配置
    const index = defaultMappings.value.findIndex(m => 
      m.standardParam.id === currentMappingConfig.value.standardParam.id
    )
    
    // 创建新的映射数组，避免直接修改引用
    const updatedMappings = JSON.parse(JSON.stringify(defaultMappings.value))
    
    if (index !== -1) {
      // 更新现有配置
      updatedMappings[index] = configToSave
    } else {
      // 添加新配置
      updatedMappings.push(configToSave)
    }
    
    // 更新到 channelStore
    const result = channelStore.updateDefaultParamMappings(updatedMappings)
    
    if (result) {
      // 更新本地数据
      defaultMappings.value = JSON.parse(JSON.stringify(updatedMappings))
      
      ElMessage.success('参数映射配置已保存')
      mappingDialogVisible.value = false
      
      // 打印保存后的映射列表，便于确认
      console.log('保存后的映射列表:', defaultMappings.value)
    }
  } catch (error) {
    console.error('保存映射配置失败:', error)
    ElMessage.error('保存映射配置失败')
  }
}

// 获取渠道特定参数选项
const getChannelParamOptions = (channelType) => {
  return channelSpecificParams[channelType] || []
}

// 导出映射配置
const exportMappingConfig = () => {
  if (!defaultMappings.value || defaultMappings.value.length === 0) {
    ElMessage.warning('没有可导出的映射配置')
    return
  }
  
  try {
    // 创建 JSON 字符串
    const configData = JSON.stringify(defaultMappings.value, null, 2)
    
    // 创建 Blob 对象
    const blob = new Blob([configData], { type: 'application/json' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `param_mappings_${new Date().toISOString().slice(0, 10)}.json`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('配置导出成功')
  } catch (error) {
    console.error('导出配置失败:', error)
    ElMessage.error('导出配置失败')
  }
}

// 导入映射配置
const importMappingConfig = (file) => {
  if (!file || !file.raw) {
    ElMessage.error('请选择有效的配置文件')
    return
  }
  
  const reader = new FileReader()
  
  reader.onload = async (e) => {
    try {
      // 解析 JSON 数据
      const importedData = JSON.parse(e.target.result)
      
      // 验证数据格式
      if (!Array.isArray(importedData)) {
        throw new Error('导入的数据格式不正确')
      }
      
      // 检查每个映射配置
      for (const mapping of importedData) {
        if (!mapping.standardParam || !mapping.mappings) {
          throw new Error('映射配置格式不正确')
        }
      }
      
      // 更新映射配置
      if (channelStore.updateDefaultParamMappings(importedData)) {
        defaultMappings.value = JSON.parse(JSON.stringify(importedData))
        ElMessage.success('配置导入成功')
      } else {
        throw new Error('更新配置失败')
      }
    } catch (error) {
      console.error('导入配置失败:', error)
      ElMessage.error(`导入配置失败: ${error.message}`)
    }
  }
  
  reader.onerror = () => {
    ElMessage.error('读取文件失败')
  }
  
  reader.readAsText(file.raw)
}

onMounted(async () => {
  // 加载标准参数列表
  loadStandardParams()
  
  // 加载默认参数映射配置
  try {
    await initDefaultMappings()
    console.log('默认映射配置初始化完成')
  } catch (error) {
    console.error('加载默认映射配置失败:', error)
    ElMessage.error('加载默认映射配置失败')
  }
})
</script>

<template>
  <div class="param-config-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">标准参数配置</h2>
      </el-col>
    </el-row>
    
    <!-- 标签页 -->
    <el-tabs type="border-card">
      <el-tab-pane label="参数管理">
        <!-- 筛选工具栏 -->
        <el-card shadow="hover" class="filter-card">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索参数名称..."
                clearable
                prefix-icon="Search"
              />
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
              <el-select v-model="typeFilter" placeholder="参数类型" class="filter-select">
                <el-option label="全部类型" value="all" />
                <el-option
                  v-for="option in paramTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8">
              <el-select 
                v-model="channelFilter" 
                placeholder="适用渠道" 
                class="filter-select"
                multiple
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option
                  v-for="option in channelTypes"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="action-buttons">
              <el-button type="primary" @click="openAddDialog">
                <el-icon><Plus /></el-icon>新增参数
              </el-button>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 参数列表 -->
        <el-card shadow="hover" class="param-list-card">
          <el-table
            v-loading="loading"
            :data="paginatedParams"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="参数标识" min-width="120">
              <template #default="{ row }">
                <el-tag type="info" effect="plain">{{ row.key }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="label" label="参数名称" min-width="120" />
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag>{{ getParamTypeName(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="必填" width="80" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.required" color="#67C23A"><Check /></el-icon>
                <el-icon v-else color="#909399"><Close /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="defaultValue" label="默认值" width="120" />
            <el-table-column label="验证规则" min-width="150">
              <template #default="{ row }">
                <span>{{ getValidationRuleText(row.validationRules) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="适用渠道" min-width="200">
              <template #default="{ row }">
                <el-tag
                  v-for="channel in row.appliedChannels"
                  :key="channel"
                  size="small"
                  class="channel-tag"
                >
                  {{ getChannelTypeName(channel) }}
                </el-tag>
                <span v-if="!row.appliedChannels || row.appliedChannels.length === 0">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="260" fixed="right">
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
                  type="danger"
                  size="small"
                  text
                  @click="deleteParam(row)"
                >
                  删除
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  text
                  @click="openMappingDialog(row)"
                >
                  默认映射
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页组件 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="默认映射配置">
        <el-card shadow="hover" class="mapping-config-card">
          <div class="mapping-header">
            <div class="mapping-title">
              <h3>标准参数默认映射关系</h3>
              <p class="mapping-desc">配置标准参数在各个渠道中的默认映射关系，新建渠道时将使用这些默认映射</p>
            </div>
            <div class="mapping-actions">
              <el-button 
                type="success" 
                size="small" 
                @click="exportMappingConfig"
                :disabled="!defaultMappings || defaultMappings.length === 0"
              >
                <el-icon><Download /></el-icon>导出配置
              </el-button>
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".json"
                @change="importMappingConfig"
              >
                <el-button type="primary" size="small">
                  <el-icon><Upload /></el-icon>导入配置
                </el-button>
              </el-upload>
            </div>
          </div>
          
          <el-table
            v-loading="!defaultMappings || defaultMappings.length === 0"
            :data="defaultMappings"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
            border
          >
            <el-table-column label="参数标识" width="150">
              <template #default="{ row }">
                <el-tag type="info" effect="plain">{{ row.standardParam.key }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column v-for="channel in channelTypes" :key="channel.value" :label="channel.label" min-width="150">
              <template #default="{ row }">
                <div class="mapping-cell">
                  <el-tag 
                    v-if="row.mappings && row.mappings[channel.value] && row.mappings[channel.value].paramKey" 
                    type="success" 
                    effect="light"
                  >
                    {{ getChannelParamOptions(channel.value).find(p => p.key === row.mappings[channel.value].paramKey)?.label || row.mappings[channel.value].paramKey }}
                  </el-tag>
                  <span v-else class="no-mapping">未映射</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click="openMappingDialog(row.standardParam)"
                >
                  编辑映射
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="mapping-tips">
            <el-alert
              title="默认映射说明"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>1. 默认映射关系将在创建新渠道时自动应用</p>
                <p>2. 修改默认映射不会影响已有渠道的映射配置</p>
                <p>3. 可以通过导出/导入功能备份或迁移配置</p>
              </template>
            </el-alert>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 参数编辑对话框 -->
    <el-dialog
      v-model="paramDialogVisible"
      :title="dialogMode === 'add' ? '新增标准参数' : '编辑标准参数'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="currentParam" label-width="100px">
        <el-form-item label="参数标识" required>
          <el-input 
            v-model="currentParam.key" 
            placeholder="请输入参数标识，如recipient" 
            :disabled="dialogMode === 'edit'"
          />
        </el-form-item>
        
        <el-form-item label="参数名称" required>
          <el-input v-model="currentParam.label" placeholder="请输入参数名称，如接收者" />
        </el-form-item>
        
        <el-form-item label="参数描述">
          <el-input v-model="currentParam.description" placeholder="请输入参数描述" />
        </el-form-item>
        
        <el-form-item label="参数类型">
          <el-select v-model="currentParam.type" style="width: 100%">
            <el-option
              v-for="option in paramTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="是否必填">
          <el-switch v-model="currentParam.required" />
        </el-form-item>
        
        <el-form-item label="默认值">
          <el-input v-model="currentParam.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        
        <el-form-item label="适用渠道">
          <el-checkbox-group v-model="currentParam.appliedChannels">
            <el-checkbox 
              v-for="option in channelTypes" 
              :key="option.value" 
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-divider>验证规则</el-divider>
        
        <el-form-item label="必填验证" v-if="currentParam.required">
          <el-input v-model="currentParam.validationRules.message" placeholder="请输入错误提示信息" />
        </el-form-item>
        
        <template v-if="currentParam.type === 'string'">
          <el-form-item label="最小长度">
            <el-input-number v-model="currentParam.validationRules.minLength" :min="0" style="width: 100%" />
          </el-form-item>
          
          <el-form-item label="最大长度">
            <el-input-number v-model="currentParam.validationRules.maxLength" :min="0" style="width: 100%" />
          </el-form-item>
        </template>
        
        <template v-if="currentParam.type === 'number'">
          <el-form-item label="最小值">
            <el-input-number v-model="currentParam.validationRules.min" style="width: 100%" />
          </el-form-item>
          
          <el-form-item label="最大值">
            <el-input-number v-model="currentParam.validationRules.max" style="width: 100%" />
          </el-form-item>
        </template>
        
        <el-form-item label="枚举值" v-if="['string', 'number'].includes(currentParam.type)">
          <el-input 
            v-model="currentParam.validationRules.enumString" 
            placeholder="请输入枚举值，多个值用逗号分隔" 
            @input="(val) => currentParam.validationRules.enum = val ? val.split(',').map(v => v.trim()) : []"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paramDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveParam">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 默认映射编辑对话框 -->
    <el-dialog
      v-model="mappingDialogVisible"
      title="编辑默认映射配置"
      width="700px"
      destroy-on-close
    >
      <div class="mapping-dialog-header">
        <h3>参数标识: {{ currentMappingConfig.standardParam.key }}</h3>
        <p class="mapping-dialog-desc">为该参数配置在各个渠道中的默认映射关系</p>
      </div>
      
      <el-form :model="currentMappingConfig" label-width="120px">
        <el-form-item 
          v-for="channel in channelTypes" 
          :key="channel.value" 
          :label="channel.label"
        >
          <el-select 
            v-model="currentMappingConfig.mappings[channel.value].paramKey" 
            placeholder="请选择映射参数"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="param in getChannelParamOptions(channel.value)"
              :key="param.key"
              :label="`${param.label} (${param.key})`"
              :value="param.key"
            >
              <div class="param-option">
                <span>{{ param.label }} ({{ param.key }})</span>
                <el-tooltip :content="param.description" placement="right">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="mappingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMappingConfig">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.param-config-container {
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

.param-list-card {
  margin-bottom: 20px;
}

.param-list-card :deep(.el-card__body) {
  padding: 0;
}

.channel-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.mapping-config-card {
  margin-bottom: 20px;
}

.mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.mapping-title h3 {
  margin-top: 0;
  margin-bottom: 8px;
}

.mapping-desc {
  color: #606266;
  margin: 0;
}

.mapping-actions {
  display: flex;
  gap: 10px;
}

.mapping-cell {
  display: flex;
  align-items: center;
}

.no-mapping {
  color: #909399;
  font-size: 13px;
}

.mapping-tips {
  margin-top: 20px;
}

.mapping-dialog-header {
  margin-bottom: 20px;
}

.mapping-dialog-header h3 {
  margin-top: 0;
  margin-bottom: 8px;
}

.mapping-dialog-desc {
  color: #606266;
  margin: 0;
}

.param-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  
  .mapping-header {
    flex-direction: column;
  }
  
  .mapping-actions {
    margin-top: 10px;
  }
  
  .pagination-container {
    justify-content: center;
  }
}
</style>