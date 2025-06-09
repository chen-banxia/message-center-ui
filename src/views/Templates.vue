<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useTemplateStore, useMessageTypeStore, useChannelStore } from '@/stores'
import { 
  Plus, 
  Delete, 
  Search, 
  Edit, 
  ArrowDown, 
  Download, 
  Upload, 
  Check, 
  Close 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const templateStore = useTemplateStore()
const messageTypeStore = useMessageTypeStore()
const channelStore = useChannelStore()

// 模板列表
const templates = computed(() => templateStore.templates)
// 消息类型列表
const messageTypes = computed(() => messageTypeStore.messageTypes)
// 通知渠道列表
const channels = computed(() => channelStore.channels)

// 表格加载状态
const loading = ref(false)
// 模板对话框可见性
const templateDialogVisible = ref(false)
// 当前编辑的模板
const currentTemplate = reactive({
  id: '',
  templateName: '',
  templateCode: '',
  templateType: '',
  supportChannels: [],
  description: '',
  createdBy: '',
  createdTime: '',
  updatedTime: '',
  status: 'draft',
  content: {},
  variableConfig: []
})

// 模板类型选项
const templateTypeOptions = [
  { value: 'notification', label: '通知' },
  { value: 'alert', label: '警告' },
  { value: 'reminder', label: '提醒' },
  { value: 'marketing', label: '营销' },
  { value: 'system', label: '系统' }
]

// 通知渠道选项
const channelOptions = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'app_push', label: 'App推送' },
  { value: 'wechat', label: '微信' },
  { value: 'web_notification', label: '网站通知' }
]

// 活动的标签页
const activeTab = ref('basic')

// 内容类型相关
const activeContentType = ref('')
const contentTypeDialog = ref(false)
const newContentType = ref({ name: '', id: '' })

// 获取当前内容类型列表
const currentContentTypes = computed(() => {
  return Object.keys(currentTemplate.content).map(id => {
    return {
      id,
      name: getContentTypeName(id)
    };
  });
})

// 变量相关
const addVariableDialog = ref(false);
const currentVariable = ref({
  name: '',
  dataType: 'string',
  required: false,
  description: '',
  validationRule: '',
  maxLength: null,
  format: '',
  example: ''
});
const currentVariableIndex = ref(-1);

// 变量相关
const showVariableHighlight = ref(true)

// 搜索关键字
const searchKeyword = ref('')
// 状态筛选
const statusFilter = ref('all')
// 类型筛选
const typeFilter = ref('all')

// 分页相关变量
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 状态选项
const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'review', label: '审核中' },
  { value: 'published', label: '已发布' },
  { value: 'disabled', label: '已禁用' }
];

// 通过类型值获取类型名称
function getTemplateTypeName(type) {
  const typeOption = templateTypeOptions.find(t => t.value === type);
  return typeOption ? typeOption.label : type;
}

// 通过渠道数组获取渠道名称列表
function getChannelNames(channels) {
  if (!channels || channels.length === 0) return '无';
  
  return channels.map(channelId => {
    const channel = channelOptions.find(c => c.value === channelId);
    return channel ? channel.label : channelId;
  }).join('、');
}

// 获取状态标签类型
function getStatusType(status) {
  switch (status) {
    case 'draft': return 'info';
    case 'review': return 'warning';
    case 'published': return 'success';
    case 'disabled': return 'danger';
    default: return 'info';
  }
}

// 获取状态名称
function getStatusName(status) {
  const statusOption = statusOptions.find(s => s.value === status);
  return statusOption ? statusOption.label : status;
}

// 搜索表单
const searchForm = ref({
  name: '',
  code: '',
  type: '',
  status: ''
});

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  return templateStore.templates.filter(template => {
    const nameMatch = !searchForm.value.name || 
      template.templateName.toLowerCase().includes(searchForm.value.name.toLowerCase());
    
    const codeMatch = !searchForm.value.code || 
      template.templateCode.toLowerCase().includes(searchForm.value.code.toLowerCase());
    
    const typeMatch = !searchForm.value.type || 
      template.templateType === searchForm.value.type;
    
    const statusMatch = !searchForm.value.status || 
      template.status === searchForm.value.status;
    
    return nameMatch && codeMatch && typeMatch && statusMatch;
  });
});

// 分页后的模板列表
const paginatedTemplates = computed(() => {
  // 更新总数
  pagination.value.total = filteredTemplates.value.length;
  
  // 分页处理
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return filteredTemplates.value.slice(start, end);
});

// 搜索模板
function searchTemplates() {
  // 重置分页到第一页
  pagination.value.currentPage = 1;
}

// 重置搜索条件
function resetSearch() {
  searchForm.value = {
    name: '',
    code: '',
    type: '',
    status: ''
  };
  // 重置分页到第一页
  pagination.value.currentPage = 1;
}

// 处理分页变化
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val;
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pagination.value.pageSize = val;
  pagination.value.currentPage = 1;
}

// 删除模板
function handleDelete(template) {
  ElMessageBox.confirm(
    `确定要删除模板 "${template.templateName}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    templateStore.deleteTemplate(template.id);
    ElMessage.success('模板已删除');
  }).catch(() => {
    // 用户取消
  });
}

// 获取内容类型名称
function getContentTypeName(typeId) {
  // 先尝试从通知渠道中匹配
  const channel = channelOptions.find(ch => ch.value === typeId)
  if (channel) return channel.label
  
  // 如果不是预定义的通知渠道，则直接返回ID
  return typeId
}

// 获取内容类型输入框占位符
function getContentTypePlaceholder(typeId) {
  return `请输入${getContentTypeName(typeId)}模板内容...`
}

// 打开添加内容类型对话框
function openContentTypeDialog() {
  newContentType.value = { id: '' };
  contentTypeDialog.value = true;
}

// 添加内容类型
function addContentType() {
  if (!newContentType.value.id) {
    ElMessage.warning('请选择内容类型');
    return;
  }
  
  if (currentTemplate.content[newContentType.value.id]) {
    ElMessage.warning('该内容类型已存在');
    return;
  }
  
  // 添加到内容对象中
  currentTemplate.content[newContentType.value.id] = '';
  
  // 设置为当前活动的内容类型
  activeContentType.value = newContentType.value.id;
  
  // 关闭对话框
  contentTypeDialog.value = false;
  
  ElMessage.success('内容类型添加成功');
}

// 移除内容类型
function removeContentType(typeId) {
  ElMessageBox.confirm(
    `确定要删除 "${getContentTypeName(typeId)}" 类型的内容吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 删除该内容类型
    delete currentTemplate.content[typeId]
    
    // 如果当前活动的是被删除的内容类型，则重置
    if (activeContentType.value === typeId) {
      const keys = Object.keys(currentTemplate.content)
      activeContentType.value = keys.length > 0 ? keys[0] : ''
    }
    
    ElMessage.success('内容类型删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 插入变量
function insertVariable(variableName, contentTypeId) {
  if (!contentTypeId || !currentTemplate.content[contentTypeId]) {
    return
  }
  
  const textarea = document.querySelector('.content-textarea textarea')
  if (textarea) {
    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd
    const currentContent = currentTemplate.content[contentTypeId]
    const variableText = `{${variableName}}`
    
    // 在光标位置插入变量
    currentTemplate.content[contentTypeId] = 
      currentContent.substring(0, startPos) + 
      variableText + 
      currentContent.substring(endPos)
    
    // 设置焦点并将光标移动到插入变量之后
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(startPos + variableText.length, startPos + variableText.length)
    }, 50)
  } else {
    // 如果找不到textarea，则简单地在末尾追加
    currentTemplate.content[contentTypeId] += `{${variableName}}`
  }
}

// 获取模板预览内容（高亮变量）
function getTemplatePreview(content) {
  if (!content) return ''
  
  if (showVariableHighlight.value) {
    // 高亮显示变量
    return content.replace(/\{([^{}]+)\}/g, '<span style="background-color: #f0f9eb; color: #67c23a; padding: 0 4px; border-radius: 2px; font-weight: bold;">{$1}</span>')
  } else {
    // 使用模拟数据替换变量
    let previewContent = content
    currentTemplate.variableConfig.forEach(variable => {
      const regex = new RegExp(`\\{${variable.name}\\}`, 'g')
      previewContent = previewContent.replace(regex, variable.example || `[${variable.description || variable.name}]`)
    })
    return previewContent
  }
}

// 初始化模板数据（示例）
function initTemplateData() {
  // 模拟获取模板数据
  currentTemplate.id = 'TPL202306001'
  currentTemplate.templateName = '订单确认通知'
  currentTemplate.templateCode = 'ORDER_CONFIRM'
  currentTemplate.templateType = 'notification'
  currentTemplate.supportChannels = ['email', 'sms', 'app_push']
  currentTemplate.description = '用户下单后发送订单确认信息'
  currentTemplate.createdBy = 'admin'
  currentTemplate.createdTime = '2023-06-15 14:30:25'
  currentTemplate.updatedTime = '2023-06-16 09:15:30'
  currentTemplate.status = 'published'
  
  // 内容示例
  currentTemplate.content = {
    email: '尊敬的{userName}，您的订单 {orderNo} 已确认，金额：{amount}元，下单时间：{orderTime}，预计发货时间：{shipTime}。感谢您的购买！',
    sms: '【信立集团】尊敬的{userName}，您的订单{orderNo}已确认，金额{amount}元，下单时间{orderTime}，预计发货{shipTime}。',
    app_push: '订单确认通知：您的订单 {orderNo} 已确认，预计{shipTime}发货。'
  }
  
  // 变量配置示例
  currentTemplate.variableConfig = [
    {
      name: "userName",
      dataType: "string",
      required: true,
      description: "用户姓名",
      validationRule: "",
      maxLength: 50,
      example: "张三"
    },
    {
      name: "orderNo",
      dataType: "string",
      required: true,
      description: "订单号",
      validationRule: "^[A-Z0-9]{8,15}$",
      example: "ORD20230615001"
    },
    {
      name: "amount",
      dataType: "number",
      required: true,
      description: "金额",
      format: "0,0.00",
      example: "199.99"
    },
    {
      name: "orderTime",
      dataType: "date",
      required: true,
      description: "下单时间",
      format: "yyyy-MM-dd HH:mm:ss",
      example: "2023-06-15 14:30:25"
    },
    {
      name: "shipTime",
      dataType: "date",
      required: false,
      description: "预计发货时间",
      format: "yyyy-MM-dd",
      example: "2023-06-18"
    }
  ]
  
  // 设置默认活动内容类型
  if (Object.keys(currentTemplate.content).length > 0) {
    activeContentType.value = Object.keys(currentTemplate.content)[0]
  }
}

// 初始化数据
initTemplateData()

// 打开新增模板对话框
function openAddDialog() {
  // 重置当前模板数据
  Object.assign(currentTemplate, {
    id: '',
    templateName: '',
    templateCode: '',
    templateType: '',
    supportChannels: [],
    description: '',
    createdBy: 'current_user',
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
    status: 'draft',
    content: {},
    variableConfig: []
  });
  
  activeTab.value = 'basic';
  activeContentType.value = '';
  templateDialogVisible.value = true;
}

// 打开编辑模板对话框
function openEditDialog(template) {
  // 深拷贝模板数据以避免直接修改原始数据
  Object.assign(currentTemplate, JSON.parse(JSON.stringify(template)));
  
  // 确保内容对象存在
  if (!currentTemplate.content) {
    currentTemplate.content = {};
  }
  
  // 确保变量配置数组存在
  if (!currentTemplate.variableConfig) {
    currentTemplate.variableConfig = [];
  }
  
  templateDialogVisible.value = true;
  activeTab.value = 'basic';
  
  // 如果有内容，默认选择第一个内容类型
  const contentKeys = Object.keys(currentTemplate.content);
  activeContentType.value = contentKeys.length > 0 ? contentKeys[0] : '';
}

// 发布模板
function publishTemplate(template) {
  ElMessageBox.confirm(
    `确定要发布模板 "${template.templateName}" 吗？`,
    '发布确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    templateStore.publishTemplate(template.id);
    ElMessage.success('模板已发布');
  }).catch(() => {
    // 用户取消
  });
}

// 加载数据
function loadData() {
  loading.value = true;
  
  // 加载必要数据
  const loadTemplatesPromise = new Promise(resolve => {
    templateStore.loadTemplates();
    resolve();
  });
  
  const loadTypesPromise = new Promise(resolve => {
    if (messageTypeStore.messageTypes.length === 0) {
      messageTypeStore.loadMessageTypes();
    }
    resolve();
  });
  
  const loadChannelsPromise = new Promise(resolve => {
    if (channelStore.channels.length === 0) {
      channelStore.loadChannels();
    }
    resolve();
  });
  
  Promise.all([loadTemplatesPromise, loadTypesPromise, loadChannelsPromise])
    .then(() => {
      loading.value = false;
    })
    .catch(error => {
      console.error('加载数据出错:', error);
      loading.value = false;
    });
}

// 复制模板
function copyTemplate(template) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  newTemplate.templateName = `${newTemplate.templateName} (复制)`;
  newTemplate.templateCode = `${newTemplate.templateCode}_COPY`;
  newTemplate.status = 'draft';
  newTemplate.createdTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
  newTemplate.updatedTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
  
  templateStore.addTemplate(newTemplate);
  ElMessage.success('模板已复制');
}

// 添加或更新模板
function saveTemplate() {
  // 表单验证
  if (!currentTemplate.templateName || !currentTemplate.templateCode || !currentTemplate.templateType) {
    ElMessage.warning('请填写必填字段');
    return;
  }
  
  if (currentTemplate.id) {
    // 更新模板
    templateStore.updateTemplate(currentTemplate.id, currentTemplate);
    ElMessage.success('模板已更新');
  } else {
    // 添加新模板
    templateStore.addTemplate(currentTemplate);
    ElMessage.success('模板已添加');
  }
  
  templateDialogVisible.value = false;
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 数据类型选项
const dataTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: '日期', value: 'date' },
  { label: '数组', value: 'array' },
  { label: '对象', value: 'object' }
]

// 获取变量示例显示值
const getVariableExampleDisplay = (variable) => {
  if (!variable.example) return ''
  
  if (variable.dataType === 'array' || variable.dataType === 'object') {
    return typeof variable.example === 'string' ? 
      variable.example : 
      JSON.stringify(variable.example, null, 2)
  }
  
  return variable.example.toString()
}

// 获取数据类型标签类型
const getDataTypeTagType = (dataType) => {
  switch (dataType) {
    case 'string': return 'info'
    case 'number': return 'success'
    case 'boolean': return 'warning'
    case 'date': return 'primary'
    case 'array': return 'danger'
    case 'object': return 'success'
    default: return 'info'
  }
}

// 添加变量
function addVariable() {
  addVariableDialog.value = true;
  currentVariableIndex.value = -1;
  currentVariable.value = {
    name: '',
    dataType: 'string',
    required: false,
    description: '',
    validationRule: '',
    maxLength: null,
    format: '',
    example: ''
  };
}

// 编辑变量
function editVariable(variable) {
  const index = currentTemplate.variableConfig.findIndex(v => v.name === variable.name);
  if (index !== -1) {
    currentVariableIndex.value = index;
    currentVariable.value = JSON.parse(JSON.stringify(variable));
    addVariableDialog.value = true;
  }
}

// 删除变量
function deleteVariable(index) {
  ElMessageBox.confirm(
    `确定要删除变量 "${currentTemplate.variableConfig[index].name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    currentTemplate.variableConfig.splice(index, 1);
    ElMessage.success('变量删除成功');
  }).catch(() => {
    // 取消删除
  });
}

// 保存变量
function saveVariable() {
  if (!currentVariable.value.name) {
    ElMessage.warning('变量名称不能为空');
    return;
  }
  
  // 检查变量名是否已存在（新增时）
  if (currentVariableIndex.value === -1) {
    const existingIndex = currentTemplate.variableConfig.findIndex(v => v.name === currentVariable.value.name);
    if (existingIndex !== -1) {
      ElMessage.warning('变量名称已存在');
      return;
    }
  }
  
  if (currentVariableIndex.value === -1) {
    // 新增变量
    currentTemplate.variableConfig.push(JSON.parse(JSON.stringify(currentVariable.value)));
  } else {
    // 更新变量
    currentTemplate.variableConfig[currentVariableIndex.value] = JSON.parse(JSON.stringify(currentVariable.value));
  }
  
  addVariableDialog.value = false;
  ElMessage.success('变量保存成功');
}

// 获取格式占位符提示
function getFormatPlaceholder() {
  if (currentVariable.value.dataType === 'date') {
    return 'yyyy-MM-dd HH:mm:ss';
  } else if (currentVariable.value.dataType === 'number') {
    return '0,0.00';
  }
  return '';
}

// 获取格式提示
function getFormatHint() {
  if (currentVariable.value.dataType === 'date') {
    return '日期格式示例：yyyy-MM-dd（年-月-日）, HH:mm:ss（时:分:秒）';
  } else if (currentVariable.value.dataType === 'number') {
    return '数字格式示例：0,0.00（千分位分隔，保留2位小数）';
  }
  return '';
}

onMounted(() => {
  loadData();
})
</script>

<template>
  <div class="template-container">
    <div class="template-header">
      <h2>消息模板管理</h2>
    </div>
    
    <el-card shadow="never" class="template-list-card">
      <div class="search-form-container">
        <el-form :inline="true" class="search-form">
          <el-form-item label="模板名称">
            <el-input v-model="searchForm.name" placeholder="模板名称" clearable />
          </el-form-item>
          <el-form-item label="模板编码">
            <el-input v-model="searchForm.code" placeholder="模板编码" clearable />
          </el-form-item>
          <el-form-item label="消息类型">
            <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 150px">
              <el-option
                v-for="type in templateTypeOptions"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 150px">
              <el-option
                v-for="status in statusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchTemplates" :icon="Search">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div class="form-actions">
          <el-button type="primary" @click="openAddDialog" :icon="Plus">新增模板</el-button>
        </div>
      </div>
      
      <el-table
        :data="paginatedTemplates"
        style="width: 100%"
        v-loading="loading"
        border
        stripe
        highlight-current-row
      >
        <el-table-column prop="templateName" label="模板名称" min-width="150" />
        <el-table-column prop="templateCode" label="模板编码" min-width="150" />
        <el-table-column label="消息类型" min-width="100">
          <template #default="scope">
            {{ getTemplateTypeName(scope.row.templateType) }}
          </template>
        </el-table-column>
        <el-table-column label="支持渠道" min-width="180">
          <template #default="scope">
            {{ getChannelNames(scope.row.supportChannels) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column label="更新时间" min-width="180">
          <template #default="scope">
            {{ scope.row.updatedTime || scope.row.createdTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="openEditDialog(scope.row)" :icon="Edit">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)" :icon="Delete">删除</el-button>
            </el-button-group>
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
    
    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="currentTemplate.id ? '编辑模板' : '新增模板'"
      width="80%"
      destroy-on-close
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form label-width="100px">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item label="模板名称" required>
                  <el-input v-model="currentTemplate.templateName" placeholder="请输入模板名称" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item label="模板编码" required>
                  <el-input v-model="currentTemplate.templateCode" placeholder="请输入模板编码" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item label="消息类型" required>
                  <el-select v-model="currentTemplate.templateType" placeholder="请选择消息类型" style="width: 100%">
                    <el-option
                      v-for="type in templateTypeOptions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item label="状态">
                  <el-select v-model="currentTemplate.status" placeholder="请选择状态" style="width: 100%">
                    <el-option
                      v-for="status in statusOptions"
                      :key="status.value"
                      :label="status.label"
                      :value="status.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-form-item label="适用渠道">
                  <el-checkbox-group v-model="currentTemplate.supportChannels">
                    <el-checkbox 
                      v-for="channel in channelOptions" 
                      :key="channel.value" 
                      :label="channel.value"
                    >
                      {{ channel.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-form-item label="描述">
                  <el-input 
                    v-model="currentTemplate.description" 
                    type="textarea" 
                    :rows="3" 
                    placeholder="请输入模板描述"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="模板内容" name="content">
            <div class="template-content-container">
              <div class="template-types-section">
                <div class="section-header">
                  <h4>模板类型</h4>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="openContentTypeDialog"
                    :icon="Plus"
                  >
                    添加类型
                  </el-button>
                </div>
                
                <el-card shadow="hover" class="content-types-card">
                  <el-empty 
                    v-if="currentContentTypes.length === 0" 
                    description="暂无内容类型" 
                    :image-size="60" 
                  />
                  
                  <el-menu
                    v-else
                    :default-active="activeContentType"
                    class="content-types-menu"
                    @select="(index) => activeContentType = index"
                  >
                    <el-menu-item 
                      v-for="type in currentContentTypes" 
                      :key="type.id"
                      :index="type.id"
                    >
                      <template #title>
                        <div class="menu-item-content">
                          <span>{{ type.name }}</span>
                          <el-button 
                            type="danger" 
                            size="small" 
                            circle 
                            :icon="Delete"
                            @click.stop="removeContentType(type.id)"
                          ></el-button>
                        </div>
                      </template>
                    </el-menu-item>
                  </el-menu>
                </el-card>
              </div>
              
              <div class="template-editor-section">
                <div v-if="!activeContentType" class="no-content-selected">
                  <el-empty description="请选择或添加一个内容类型" />
                </div>
                
                <el-card v-else shadow="hover" class="editor-card">
                  <template #header>
                    <div class="editor-header">
                      <h4>{{ getContentTypeName(activeContentType) }} 模板内容</h4>
                      <div class="editor-actions">
                        <el-tooltip content="点击插入变量" placement="top">
                          <el-dropdown 
                            trigger="click" 
                            @command="(variable) => insertVariable(variable, activeContentType)"
                          >
                            <el-button type="primary" size="small" plain>
                              插入变量 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                            </el-button>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item 
                                  v-for="variable in currentTemplate.variableConfig" 
                                  :key="variable.name"
                                  :command="variable.name"
                                >
                                  {{ variable.name }}
                                  <span class="variable-type-hint">({{ variable.description || variable.dataType }})</span>
                                </el-dropdown-item>
                                <el-dropdown-item 
                                  v-if="currentTemplate.variableConfig.length === 0"
                                  disabled
                                >
                                  暂无变量
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </el-tooltip>
                      </div>
                    </div>
                  </template>
                  
                  <el-alert
                    title="使用 {变量名} 的格式插入变量，例如 {userName}"
                    type="info"
                    :closable="false"
                    show-icon
                    style="margin-bottom: 15px;"
                  />
                  
                  <el-input
                    v-model="currentTemplate.content[activeContentType]"
                    type="textarea"
                    :rows="12"
                    :placeholder="getContentTypePlaceholder(activeContentType)"
                    class="content-textarea"
                  />
                  
                  <div class="preview-section" v-if="currentTemplate.content[activeContentType]">
                    <div class="preview-header">
                      <h5>预览效果</h5>
                      <el-switch 
                        v-model="showVariableHighlight"
                        active-text="高亮变量"
                        inactive-text="正常显示"
                      />
                    </div>
                    <div 
                      class="preview-content"
                      :class="{'highlight-variables': showVariableHighlight}"
                      v-html="getTemplatePreview(currentTemplate.content[activeContentType])"
                    ></div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
        
        <el-tab-pane label="变量配置" name="variables">
          <el-button type="primary" :icon="Plus" @click="addVariable">新增变量</el-button>
          
          <el-table
            :data="currentTemplate.variableConfig"
            style="width: 100%; margin-top: 15px;"
            border
            stripe
          >
            <el-table-column prop="name" label="变量名称" width="180" />
            <el-table-column prop="dataType" label="数据类型" width="100">
              <template #default="scope">
                <el-tag>{{ scope.row.dataType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="150" />
            <el-table-column prop="required" label="是否必填" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.required ? 'danger' : 'info'">
                  {{ scope.row.required ? '必填' : '选填' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="example" label="示例值" min-width="150" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.example || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button-group>
                  <el-button size="small" @click="editVariable(scope.row)" :icon="Edit">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteVariable(scope.$index)" :icon="Delete">删除</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 内容类型选择对话框 -->
    <el-dialog
      v-model="contentTypeDialog"
      title="添加内容类型"
      width="500px"
      destroy-on-close
    >
      <el-form>
        <el-form-item label="选择内容类型" label-width="120px">
          <el-select v-model="newContentType.id" placeholder="请选择内容类型" style="width: 100%">
            <el-option
              v-for="channel in channelOptions"
              :key="channel.value"
              :label="channel.label"
              :value="channel.value"
              :disabled="currentTemplate.content && currentTemplate.content[channel.value] !== undefined"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="contentTypeDialog = false">取消</el-button>
          <el-button type="primary" @click="addContentType">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 变量编辑对话框 -->
    <el-dialog
      v-model="addVariableDialog"
      :title="currentVariableIndex === -1 ? '新增变量' : '编辑变量'"
      width="600px"
    >
      <el-form :model="currentVariable" label-width="100px">
        <el-form-item label="变量名称" required>
          <el-input v-model="currentVariable.name" placeholder="请输入变量名称，如userName" />
        </el-form-item>
        
        <el-form-item label="数据类型" required>
          <el-select v-model="currentVariable.dataType" placeholder="请选择数据类型" style="width: 100%">
            <el-option label="文本" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="日期" value="date" />
            <el-option label="数组" value="array" />
            <el-option label="对象" value="object" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="变量描述">
          <el-input v-model="currentVariable.description" placeholder="请输入变量描述" />
        </el-form-item>
        
        <el-form-item label="是否必填">
          <el-switch v-model="currentVariable.required" />
        </el-form-item>
        
        <el-form-item label="示例值">
          <el-input v-model="currentVariable.example" placeholder="请输入示例值" />
        </el-form-item>
        
        <el-form-item label="验证规则" v-if="currentVariable.dataType === 'string'">
          <el-input v-model="currentVariable.validationRule" placeholder="请输入正则表达式" />
        </el-form-item>
        
        <el-form-item label="最大长度" v-if="currentVariable.dataType === 'string'">
          <el-input-number v-model="currentVariable.maxLength" :min="0" />
        </el-form-item>
        
        <el-form-item label="格式" v-if="['date', 'number'].includes(currentVariable.dataType)">
          <el-input v-model="currentVariable.format" :placeholder="getFormatPlaceholder()" />
          <div class="format-hint">{{ getFormatHint() }}</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addVariableDialog = false">取消</el-button>
          <el-button type="primary" @click="saveVariable">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.template-container {
  padding: 20px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.template-list-card {
  margin-bottom: 20px;
}

.search-form-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.search-form {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-left: 10px;
}

.content-types-menu {
  border-right: none;
}

.menu-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.template-content-container {
  display: flex;
  gap: 20px;
}

.template-types-section {
  width: 250px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
}

.content-types-card {
  margin-bottom: 20px;
}

.template-editor-section {
  flex: 1;
}

.no-content-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.editor-card {
  width: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h4 {
  margin: 0;
}

.content-textarea {
  margin-bottom: 20px;
}

.preview-section {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.preview-header h5 {
  margin: 0;
}

.preview-content {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
  min-height: 100px;
}

.highlight-variables {
  background-color: #f0f0f0;
}

.variable-type-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 5px;
}

.format-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 15px 15px;
}
</style> 