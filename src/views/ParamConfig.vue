<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useMessageStore } from '../stores/messageStore'

const messageStore = useMessageStore()

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
  
  return result
})

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
  
  // 实际项目中应调用API保存
  if (dialogMode.value === 'add') {
    // 模拟添加
    const newParam = {
      ...currentParam.value,
      id: standardParams.value.length + 1
    }
    standardParams.value.push(newParam)
    ElMessage.success('参数添加成功')
  } else {
    // 模拟更新
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
    `确定要删除参数"${param.label}"吗？删除后可能影响现有的参数映射。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中应调用API删除
    const index = standardParams.value.findIndex(p => p.id === param.id)
    if (index !== -1) {
      standardParams.value.splice(index, 1)
      ElMessage.success('参数删除成功')
    }
  }).catch(() => {
    // 取消删除
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

onMounted(() => {
  // 加载标准参数
  loadStandardParams()
})
</script>

<template>
  <div class="param-config-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">标准参数配置</h2>
      </el-col>
    </el-row>
    
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
        :data="filteredParams"
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
        <el-table-column label="操作" width="180" fixed="right">
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
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
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