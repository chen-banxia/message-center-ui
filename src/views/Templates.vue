<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMessageStore } from '../stores/messageStore'

const messageStore = useMessageStore()

// 模板列表
const templates = computed(() => messageStore.templates)
// 消息类型列表
const messageTypes = computed(() => messageStore.messageTypes)

// 表格加载状态
const loading = ref(false)
// 模板对话框可见性
const templateDialogVisible = ref(false)
// 当前编辑的模板
const currentTemplate = ref({
  id: null,
  name: '',
  code: '',
  type: '',
  status: 'draft',
  content: {
    email: '',
    sms: '',
    internal: '',
    wechat: ''
  },
  variables: []
})
// 对话框模式：新增/编辑
const dialogMode = ref('add')
// 当前激活的标签页
const activeTab = ref('email')
// 变量输入
const newVariable = ref('')

// 搜索关键字
const searchKeyword = ref('')
// 状态筛选
const statusFilter = ref('all')

// 筛选后的模板
const filteredTemplates = computed(() => {
  let result = [...templates.value]
  
  // 按关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(template => 
      template.name.toLowerCase().includes(keyword) || 
      template.code.toLowerCase().includes(keyword)
    )
  }
  
  // 按状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter(template => template.status === statusFilter.value)
  }
  
  return result
})

// 加载模板列表
const loadTemplates = () => {
  loading.value = true
  
  // 实际项目中应从API获取
  setTimeout(() => {
    messageStore.loadTemplates()
    loading.value = false
  }, 500)
}

// 打开新增模板对话框
const openAddDialog = () => {
  dialogMode.value = 'add'
  currentTemplate.value = {
    id: null,
    name: '',
    code: '',
    type: '',
    status: 'draft',
    content: {
      email: '',
      sms: '',
      internal: '',
      wechat: ''
    },
    variables: []
  }
  templateDialogVisible.value = true
}

// 打开编辑模板对话框
const openEditDialog = (template) => {
  dialogMode.value = 'edit'
  currentTemplate.value = JSON.parse(JSON.stringify(template))
  templateDialogVisible.value = true
}

// 保存模板
const saveTemplate = () => {
  // 表单验证
  if (!currentTemplate.value.name || !currentTemplate.value.code || !currentTemplate.value.type) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  // 实际项目中应调用API保存
  if (dialogMode.value === 'add') {
    // 模拟添加
    const newTemplate = {
      ...currentTemplate.value,
      id: messageStore.templates.length + 1
    }
    messageStore.templates.push(newTemplate)
    ElMessage.success('模板添加成功')
  } else {
    // 模拟更新
    const index = messageStore.templates.findIndex(t => t.id === currentTemplate.value.id)
    if (index !== -1) {
      messageStore.templates[index] = { ...currentTemplate.value }
      ElMessage.success('模板更新成功')
    }
  }
  
  templateDialogVisible.value = false
}

// 添加变量
const addVariable = () => {
  if (!newVariable.value) return
  
  if (!currentTemplate.value.variables.includes(newVariable.value)) {
    currentTemplate.value.variables.push(newVariable.value)
    newVariable.value = ''
  }
}

// 删除变量
const removeVariable = (variable) => {
  const index = currentTemplate.value.variables.indexOf(variable)
  if (index !== -1) {
    currentTemplate.value.variables.splice(index, 1)
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'draft': return 'info'
    case 'review': return 'warning'
    case 'published': return 'success'
    case 'disabled': return 'danger'
    default: return 'info'
  }
}

// 获取状态显示文本
const getStatusText = (status) => {
  switch (status) {
    case 'draft': return '草稿'
    case 'review': return '审核中'
    case 'published': return '已发布'
    case 'disabled': return '已禁用'
    default: return '未知'
  }
}

// 获取消息类型名称
const getTypeName = (typeId) => {
  const type = messageTypes.value.find(t => t.id === typeId)
  return type ? type.name : '未知类型'
}

onMounted(() => {
  // 确保数据已加载
  if (messageStore.templates.length === 0) {
    loadTemplates()
  }
  
  if (messageStore.messageTypes.length === 0) {
    messageStore.loadMessageTypes()
  }
})
</script>

<template>
  <div class="templates-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">消息模板管理</h2>
      </el-col>
    </el-row>
    
    <!-- 筛选工具栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称或编码..."
            clearable
            prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-select v-model="statusFilter" placeholder="模板状态" class="filter-select">
            <el-option label="全部状态" value="all" />
            <el-option label="草稿" value="draft" />
            <el-option label="审核中" value="review" />
            <el-option label="已发布" value="published" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" :lg="12" :xl="12" class="action-buttons">
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>新增模板
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 模板列表 -->
    <el-card shadow="hover" class="template-list-card">
      <el-table
        v-loading="loading"
        :data="filteredTemplates"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="模板名称" min-width="180" />
        <el-table-column prop="code" label="模板编码" width="180" />
        <el-table-column label="消息类型" width="120">
          <template #default="{ row }">
            {{ getTypeName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
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
              v-if="row.status === 'draft'"
              type="success"
              size="small"
              text
            >
              提交审核
            </el-button>
            <el-button
              v-if="row.status === 'published'"
              type="danger"
              size="small"
              text
            >
              禁用
            </el-button>
            <el-button
              v-if="row.status === 'disabled'"
              type="info"
              size="small"
              text
            >
              启用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="dialogMode === 'add' ? '新增模板' : '编辑模板'"
      width="70%"
      destroy-on-close
    >
      <el-form :model="currentTemplate" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="模板名称" required>
              <el-input v-model="currentTemplate.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="模板编码" required>
              <el-input v-model="currentTemplate.code" placeholder="请输入模板编码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="消息类型" required>
              <el-select v-model="currentTemplate.type" placeholder="请选择消息类型" style="width: 100%">
                <el-option
                  v-for="type in messageTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="状态">
              <el-select v-model="currentTemplate.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="审核中" value="review" />
                <el-option label="已发布" value="published" />
                <el-option label="已禁用" value="disabled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider>模板内容</el-divider>
        
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="邮件模板" name="email">
            <el-form-item>
              <el-input
                v-model="currentTemplate.content.email"
                type="textarea"
                :rows="8"
                placeholder="请输入邮件模板内容，支持HTML格式"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="短信模板" name="sms">
            <el-form-item>
              <el-input
                v-model="currentTemplate.content.sms"
                type="textarea"
                :rows="8"
                placeholder="请输入短信模板内容，注意控制字数"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="站内信模板" name="internal">
            <el-form-item>
              <el-input
                v-model="currentTemplate.content.internal"
                type="textarea"
                :rows="8"
                placeholder="请输入站内信模板内容"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="微信模板" name="wechat">
            <el-form-item>
              <el-input
                v-model="currentTemplate.content.wechat"
                type="textarea"
                :rows="8"
                placeholder="请输入微信模板内容"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
        
        <el-divider>变量设置</el-divider>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="添加变量">
              <div class="variable-input">
                <el-input v-model="newVariable" placeholder="输入变量名称，如：userName" />
                <el-button type="primary" @click="addVariable">添加</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <div class="variable-tags">
              <el-tag
                v-for="variable in currentTemplate.variables"
                :key="variable"
                closable
                @close="removeVariable(variable)"
                class="variable-tag"
              >
                {{ variable }}
              </el-tag>
              <el-empty v-if="currentTemplate.variables.length === 0" description="暂无变量" :image-size="60" />
            </div>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.templates-container {
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

.template-list-card {
  margin-bottom: 20px;
}

.template-list-card :deep(.el-card__body) {
  padding: 0;
}

.variable-input {
  display: flex;
  gap: 10px;
}

.variable-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  min-height: 60px;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.variable-tag {
  margin-right: 0;
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
  
  .variable-input {
    flex-direction: column;
  }
}
</style> 