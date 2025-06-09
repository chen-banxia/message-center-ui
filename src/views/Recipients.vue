<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 接收者列表
const recipients = ref([
  {
    id: 1,
    type: 'personal',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    userId: 'user001',
    wechatId: 'wx_001',
    dingtalkId: 'dt_001',
    department: '技术部',
    status: 'enabled',
    createTime: '2023-05-10 10:00:00',
    subscriptions: [1, 3],
    blockedTypes: [2],
    subscriptionSettings: [
      { typeId: 1, channels: ['email', 'sms', 'wechat'] },
      { typeId: 3, channels: ['email', 'app'] }
    ]
  },
  {
    id: 2,
    type: 'personal',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    userId: 'user002',
    wechatId: 'wx_002',
    dingtalkId: 'dt_002',
    department: '产品部',
    status: 'enabled',
    createTime: '2023-05-11 11:00:00',
    subscriptions: [1, 2],
    blockedTypes: [],
    subscriptionSettings: [
      { typeId: 1, channels: ['email'] },
      { typeId: 2, channels: ['email', 'sms'] }
    ]
  },
  {
    id: 3,
    type: 'personal',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    userId: 'user003',
    wechatId: 'wx_003',
    dingtalkId: 'dt_003',
    department: '市场部',
    status: 'disabled',
    createTime: '2023-05-12 12:00:00',
    subscriptions: [],
    blockedTypes: [1, 2, 3],
    subscriptionSettings: []
  },
  {
    id: 4,
    type: 'group',
    name: '技术团队',
    members: [1, 2],
    status: 'enabled',
    createTime: '2023-05-13 13:00:00',
    subscriptions: [1, 2],
    blockedTypes: [],
    subscriptionSettings: [
      { typeId: 1, channels: ['email'] },
      { typeId: 2, channels: ['email'] }
    ]
  },
  {
    id: 5,
    type: 'group',
    name: '产品团队',
    members: [2, 3],
    status: 'enabled',
    createTime: '2023-05-14 14:00:00',
    subscriptions: [3],
    blockedTypes: [1],
    subscriptionSettings: [
      { typeId: 3, channels: ['email', 'dingtalk'] }
    ]
  }
])

// 消息类型列表
const messageTypes = ref([
  { id: 1, name: '系统通知', icon: 'Bell', color: '#409EFF' },
  { id: 2, name: '告警消息', icon: 'Warning', color: '#F56C6C' },
  { id: 3, name: '营销消息', icon: 'Promotion', color: '#67C23A' },
  { id: 4, name: '任务提醒', icon: 'Calendar', color: '#E6A23C' },
  { id: 5, name: '账户安全', icon: 'Lock', color: '#909399' }
])

// 通知渠道列表
const notificationChannels = ref([
  { id: 'email', name: '邮件', icon: 'Message' },
  { id: 'sms', name: '短信', icon: 'ChatDotRound' },
  { id: 'app', name: '站内信', icon: 'Bell' },
  { id: 'wechat', name: '微信', icon: 'ChatLineRound' },
  { id: 'dingtalk', name: '钉钉', icon: 'PhoneFilled' }
])

// 部门列表
const departments = ref([
  { id: 1, name: '技术部' },
  { id: 2, name: '产品部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '销售部' },
  { id: 5, name: '人事部' }
])

// 表格加载状态
const loading = ref(false)
// 接收者对话框可见性
const recipientDialogVisible = ref(false)
// 当前编辑的接收者
const currentRecipient = ref({
  id: null,
  type: 'personal',
  name: '',
  email: '',
  phone: '',
  userId: '',
  wechatId: '',
  dingtalkId: '',
  department: '',
  status: 'enabled',
  members: [],
  subscriptions: [],
  blockedTypes: [],
  subscriptionSettings: []
})
// 对话框模式：新增/编辑
const dialogMode = ref('add')
// 当前激活的标签页
const activeTab = ref('basic')

// 搜索关键字
const searchKeyword = ref('')
// 类型筛选
const typeFilter = ref('all')
// 状态筛选
const statusFilter = ref('all')
// 部门筛选
const departmentFilter = ref('all')

// 分页相关变量
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 筛选后的接收者列表
const filteredRecipients = computed(() => {
  let result = [...recipients.value]
  
  // 按关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(recipient => 
      recipient.name.toLowerCase().includes(keyword) || 
      (recipient.email && recipient.email.toLowerCase().includes(keyword)) ||
      (recipient.phone && recipient.phone.includes(keyword))
    )
  }
  
  // 按类型筛选
  if (typeFilter.value !== 'all') {
    result = result.filter(recipient => recipient.type === typeFilter.value)
  }
  
  // 按状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter(recipient => recipient.status === statusFilter.value)
  }
  
  // 按部门筛选
  if (departmentFilter.value !== 'all') {
    result = result.filter(recipient => 
      recipient.type === 'personal' && recipient.department === departmentFilter.value
    )
  }
  
  // 更新总数
  pagination.value.total = result.length
  
  return result
})

// 分页后的接收者列表
const paginatedRecipients = computed(() => {
  // 分页处理
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredRecipients.value.slice(start, end)
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

// 获取消息类型名称
const getMessageTypeName = (typeId) => {
  const type = messageTypes.value.find(t => t.id === typeId)
  return type ? type.name : '未知类型'
}

// 获取渠道名称
const getChannelName = (channelId) => {
  const channel = notificationChannels.value.find(c => c.id === channelId)
  return channel ? channel.name : '未知渠道'
}

// 获取类型颜色
const getMessageTypeColor = (typeId) => {
  const type = messageTypes.value.find(t => t.id === typeId)
  return type ? type.color : '#909399'
}

// 获取类型图标
const getMessageTypeIcon = (typeId) => {
  const type = messageTypes.value.find(t => t.id === typeId)
  return type ? type.icon : 'InfoFilled'
}

// 加载接收者列表
const loadRecipients = () => {
  loading.value = true
  
  // 实际项目中应从API获取
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 打开新增接收者对话框
const openAddDialog = () => {
  dialogMode.value = 'add'
  currentRecipient.value = {
    id: null,
    type: 'personal',
    name: '',
    email: '',
    phone: '',
    userId: '',
    wechatId: '',
    dingtalkId: '',
    department: '',
    status: 'enabled',
    members: [],
    subscriptions: [],
    blockedTypes: [],
    subscriptionSettings: []
  }
  activeTab.value = 'basic'
  recipientDialogVisible.value = true
}

// 打开编辑接收者对话框
const openEditDialog = (recipient) => {
  dialogMode.value = 'edit'
  currentRecipient.value = JSON.parse(JSON.stringify(recipient))
  activeTab.value = 'basic'
  recipientDialogVisible.value = true
}

// 保存接收者
const saveRecipient = () => {
  // 表单验证
  if (!currentRecipient.value.name) {
    ElMessage.warning('请填写接收者名称')
    return
  }
  
  if (currentRecipient.value.type === 'personal') {
    if (!currentRecipient.value.email && !currentRecipient.value.phone && !currentRecipient.value.userId) {
      ElMessage.warning('请至少填写一种联系方式')
      return
    }
  } else if (currentRecipient.value.type === 'group' && (!currentRecipient.value.members || currentRecipient.value.members.length === 0)) {
    ElMessage.warning('请至少选择一个成员')
    return
  }
  
  // 实际项目中应调用API保存
  if (dialogMode.value === 'add') {
    // 模拟添加
    const newRecipient = {
      ...currentRecipient.value,
      id: recipients.value.length + 1,
      createTime: new Date().toLocaleString()
    }
    recipients.value.push(newRecipient)
    ElMessage.success('接收者添加成功')
  } else {
    // 模拟更新
    const index = recipients.value.findIndex(r => r.id === currentRecipient.value.id)
    if (index !== -1) {
      recipients.value[index] = { ...currentRecipient.value }
      ElMessage.success('接收者更新成功')
    }
  }
  
  recipientDialogVisible.value = false
}

// 切换接收者状态
const toggleRecipientStatus = (recipient) => {
  const newStatus = recipient.status === 'enabled' ? 'disabled' : 'enabled'
  const index = recipients.value.findIndex(r => r.id === recipient.id)
  
  if (index !== -1) {
    recipients.value[index].status = newStatus
    
    ElMessage.success(`接收者已${newStatus === 'enabled' ? '启用' : '禁用'}`)
  }
}

// 获取成员名称
const getMemberName = (memberId) => {
  const member = recipients.value.find(r => r.id === memberId && r.type === 'personal')
  return member ? member.name : `未知成员(${memberId})`
}

// 获取可选成员列表
const availableMembers = computed(() => {
  return recipients.value
    .filter(r => r.type === 'personal' && r.status === 'enabled')
    .map(r => ({ value: r.id, label: r.name }))
})

// 监听接收者类型变化
const handleRecipientTypeChange = () => {
  if (currentRecipient.value.type === 'group') {
    currentRecipient.value.email = ''
    currentRecipient.value.phone = ''
    currentRecipient.value.userId = ''
    currentRecipient.value.wechatId = ''
    currentRecipient.value.dingtalkId = ''
    currentRecipient.value.department = ''
    
    if (!currentRecipient.value.members) {
      currentRecipient.value.members = []
    }
  } else {
    currentRecipient.value.members = []
  }
}

// 添加订阅
const addSubscription = (typeId) => {
  if (!currentRecipient.value.subscriptions.includes(typeId)) {
    // 添加到订阅列表
    currentRecipient.value.subscriptions.push(typeId)
    
    // 从屏蔽列表中移除
    currentRecipient.value.blockedTypes = currentRecipient.value.blockedTypes.filter(id => id !== typeId)
    
    // 添加默认设置
    if (!currentRecipient.value.subscriptionSettings.find(s => s.typeId === typeId)) {
      currentRecipient.value.subscriptionSettings.push({
        typeId,
        channels: ['email'] // 默认使用邮件渠道
      })
    }
  }
}

// 添加屏蔽
const addBlockedType = (typeId) => {
  if (!currentRecipient.value.blockedTypes.includes(typeId)) {
    // 添加到屏蔽列表
    currentRecipient.value.blockedTypes.push(typeId)
    
    // 从订阅列表中移除
    currentRecipient.value.subscriptions = currentRecipient.value.subscriptions.filter(id => id !== typeId)
    
    // 移除相关订阅设置
    currentRecipient.value.subscriptionSettings = currentRecipient.value.subscriptionSettings.filter(s => s.typeId !== typeId)
  }
}

// 移除订阅
const removeSubscription = (typeId) => {
  currentRecipient.value.subscriptions = currentRecipient.value.subscriptions.filter(id => id !== typeId)
  currentRecipient.value.subscriptionSettings = currentRecipient.value.subscriptionSettings.filter(s => s.typeId !== typeId)
}

// 移除屏蔽
const removeBlockedType = (typeId) => {
  currentRecipient.value.blockedTypes = currentRecipient.value.blockedTypes.filter(id => id !== typeId)
}

// 更新订阅渠道
const updateSubscriptionChannels = (typeId, channels) => {
  const index = currentRecipient.value.subscriptionSettings.findIndex(s => s.typeId === typeId)
  if (index !== -1) {
    currentRecipient.value.subscriptionSettings[index].channels = [...channels]
  } else if (channels.length > 0) {
    currentRecipient.value.subscriptionSettings.push({
      typeId,
      channels: [...channels]
    })
  }
}

// 检查类型是否已订阅
const isTypeSubscribed = (typeId) => {
  return currentRecipient.value.subscriptions.includes(typeId)
}

// 检查类型是否已屏蔽
const isTypeBlocked = (typeId) => {
  return currentRecipient.value.blockedTypes.includes(typeId)
}

// 获取订阅类型的渠道设置
const getTypeChannels = (typeId) => {
  const setting = currentRecipient.value.subscriptionSettings.find(s => s.typeId === typeId)
  return setting ? setting.channels : []
}

// 同步企业通讯录
const syncFromDirectory = () => {
  ElMessage.info('正在从企业通讯录同步接收者信息...')
  loading.value = true
  
  // 模拟同步过程
  setTimeout(() => {
    // 实际项目中应调用API同步数据
    ElMessage.success('同步完成，新增3个接收者')
    loading.value = false
  }, 2000)
}

onMounted(() => {
  loadRecipients()
})
</script>

<template>
  <div class="recipients-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">接收者管理</h2>
      </el-col>
    </el-row>
    
    <!-- 筛选工具栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索接收者名称、邮箱或手机..."
            clearable
            prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <el-select v-model="typeFilter" placeholder="接收者类型" class="filter-select">
            <el-option label="全部类型" value="all" />
            <el-option label="个人" value="personal" />
            <el-option label="群组" value="group" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <el-select v-model="departmentFilter" placeholder="所属部门" class="filter-select">
            <el-option label="全部部门" value="all" />
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="10" :xl="10" class="action-buttons">
          <el-button type="success" @click="syncFromDirectory" :loading="loading">
            <el-icon><RefreshRight /></el-icon>同步通讯录
          </el-button>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>新增接收者
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 接收者列表 -->
    <el-card shadow="hover" class="recipient-list-card">
      <el-table
        v-loading="loading"
        :data="paginatedRecipients"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'personal' ? 'primary' : 'success'" effect="plain">
              {{ row.type === 'personal' ? '个人' : '群组' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column label="联系方式" min-width="200">
          <template #default="{ row }">
            <template v-if="row.type === 'personal'">
              <div v-if="row.email" class="contact-item">
                <el-icon><Message /></el-icon>
                <span>{{ row.email }}</span>
              </div>
              <div v-if="row.phone" class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>{{ row.phone }}</span>
              </div>
            </template>
            <template v-else>
              <el-tag v-for="memberId in row.members" :key="memberId" class="member-tag">
                {{ getMemberName(memberId) }}
              </el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120">
          <template #default="{ row }">
            {{ row.type === 'personal' ? row.department : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="订阅/屏蔽" width="180">
          <template #default="{ row }">
            <div class="subscription-preview">
              <div v-if="row.subscriptions && row.subscriptions.length > 0">
                <span class="subscription-label">订阅:</span>
                <el-tag 
                  v-for="typeId in row.subscriptions.slice(0, 2)" 
                  :key="`sub-${typeId}`"
                  size="small"
                  effect="plain"
                  :style="{ color: getMessageTypeColor(typeId), borderColor: getMessageTypeColor(typeId) }"
                  class="type-tag"
                >
                  {{ getMessageTypeName(typeId) }}
                </el-tag>
                <el-tag 
                  v-if="row.subscriptions.length > 2" 
                  size="small" 
                  effect="plain"
                  class="type-tag"
                >
                  +{{ row.subscriptions.length - 2 }}
                </el-tag>
              </div>
              <div v-if="row.blockedTypes && row.blockedTypes.length > 0">
                <span class="subscription-label">屏蔽:</span>
                <el-tag 
                  v-for="typeId in row.blockedTypes.slice(0, 2)" 
                  :key="`block-${typeId}`"
                  size="small"
                  effect="plain"
                  type="info"
                  class="type-tag"
                >
                  {{ getMessageTypeName(typeId) }}
                </el-tag>
                <el-tag 
                  v-if="row.blockedTypes.length > 2" 
                  size="small" 
                  effect="plain"
                  type="info"
                  class="type-tag"
                >
                  +{{ row.blockedTypes.length - 2 }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="light">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
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
              @click="toggleRecipientStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
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
    
    <!-- 接收者编辑对话框 -->
    <el-dialog
      v-model="recipientDialogVisible"
      :title="dialogMode === 'add' ? '新增接收者' : '编辑接收者'"
      width="70%"
      destroy-on-close
    >
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="currentRecipient" label-width="100px">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item label="接收者名称" required>
                  <el-input v-model="currentRecipient.name" placeholder="请输入接收者名称" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item label="接收者类型" required>
                  <el-select 
                    v-model="currentRecipient.type" 
                    placeholder="请选择接收者类型" 
                    style="width: 100%"
                    @change="handleRecipientTypeChange"
                  >
                    <el-option label="个人" value="personal" />
                    <el-option label="群组" value="group" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item label="状态">
                  <el-select v-model="currentRecipient.status" placeholder="请选择状态" style="width: 100%">
                    <el-option label="启用" value="enabled" />
                    <el-option label="禁用" value="disabled" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" v-if="currentRecipient.type === 'personal'">
                <el-form-item label="所属部门">
                  <el-select v-model="currentRecipient.department" placeholder="请选择部门" style="width: 100%">
                    <el-option
                      v-for="dept in departments"
                      :key="dept.id"
                      :label="dept.name"
                      :value="dept.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <template v-if="currentRecipient.type === 'personal'">
              <el-divider>联系方式</el-divider>
              
              <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                  <el-form-item label="邮箱">
                    <el-input v-model="currentRecipient.email" placeholder="请输入邮箱地址" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                  <el-form-item label="手机号">
                    <el-input v-model="currentRecipient.phone" placeholder="请输入手机号" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                  <el-form-item label="用户ID">
                    <el-input v-model="currentRecipient.userId" placeholder="请输入用户ID（站内信）" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                  <el-form-item label="微信ID">
                    <el-input v-model="currentRecipient.wechatId" placeholder="请输入微信OpenID" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                  <el-form-item label="钉钉ID">
                    <el-input v-model="currentRecipient.dingtalkId" placeholder="请输入钉钉ID" />
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
            
            <template v-else>
              <el-divider>群组成员</el-divider>
              
              <el-form-item label="选择成员" required>
                <el-select
                  v-model="currentRecipient.members"
                  multiple
                  filterable
                  placeholder="请选择群组成员"
                  style="width: 100%"
                >
                  <el-option
                    v-for="member in availableMembers"
                    :key="member.value"
                    :label="member.label"
                    :value="member.value"
                  />
                </el-select>
              </el-form-item>
              
              <div class="selected-members" v-if="currentRecipient.members && currentRecipient.members.length > 0">
                <div class="selected-members-title">已选成员：</div>
                <el-tag
                  v-for="memberId in currentRecipient.members"
                  :key="memberId"
                  closable
                  @close="currentRecipient.members = currentRecipient.members.filter(id => id !== memberId)"
                  class="member-tag"
                >
                  {{ getMemberName(memberId) }}
                </el-tag>
              </div>
            </template>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="订阅设置" name="subscription">
          <div class="subscription-settings">
            <p class="subscription-tip">在这里可以设置接收者订阅的消息类型和接收渠道</p>
            
            <el-divider content-position="left">消息订阅</el-divider>
            
            <el-row :gutter="20" class="subscription-row">
              <el-col :span="24">
                <div class="message-types-container">
                  <div 
                    v-for="type in messageTypes" 
                    :key="type.id"
                    class="message-type-card"
                    :class="{
                      'type-subscribed': isTypeSubscribed(type.id),
                      'type-blocked': isTypeBlocked(type.id)
                    }"
                  >
                    <div class="type-header" :style="{ backgroundColor: isTypeSubscribed(type.id) ? type.color : '#f0f0f0' }">
                      <el-icon><component :is="type.icon" /></el-icon>
                      <span>{{ type.name }}</span>
                    </div>
                    <div class="type-actions">
                      <el-radio-group 
                        :model-value="isTypeSubscribed(type.id) ? 'subscribe' : isTypeBlocked(type.id) ? 'block' : 'neutral'"
                        @change="(val) => {
                          if (val === 'subscribe') {
                            addSubscription(type.id);
                          } else if (val === 'block') {
                            addBlockedType(type.id);
                          } else {
                            removeSubscription(type.id);
                            removeBlockedType(type.id);
                          }
                        }"
                      >
                        <el-radio label="subscribe">订阅</el-radio>
                        <el-radio label="neutral">无设置</el-radio>
                        <el-radio label="block">屏蔽</el-radio>
                      </el-radio-group>
                    </div>
                    <div class="type-channels" v-if="isTypeSubscribed(type.id)">
                      <div class="channels-title">接收渠道：</div>
                      <el-checkbox-group 
                        :model-value="getTypeChannels(type.id)"
                        @update:model-value="(val) => updateSubscriptionChannels(type.id, val)"
                      >
                        <el-checkbox 
                          v-for="channel in notificationChannels" 
                          :key="channel.id" 
                          :label="channel.id"
                        >
                          <el-icon><component :is="channel.icon" /></el-icon>
                          {{ channel.name }}
                        </el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
            
            <el-divider content-position="left">订阅摘要</el-divider>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <h4>已订阅消息类型</h4>
                <el-empty description="暂无订阅类型" v-if="currentRecipient.subscriptions.length === 0" />
                <el-table v-else :data="currentRecipient.subscriptions.map(id => ({
                  id,
                  name: getMessageTypeName(id),
                  color: getMessageTypeColor(id),
                  icon: getMessageTypeIcon(id),
                  channels: getTypeChannels(id)
                }))" style="width: 100%">
                  <el-table-column prop="name" label="消息类型">
                    <template #default="{ row }">
                      <div class="type-name-cell">
                        <el-icon><component :is="row.icon" /></el-icon>
                        <span>{{ row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="接收渠道">
                    <template #default="{ row }">
                      <el-tag 
                        v-for="channelId in row.channels" 
                        :key="channelId"
                        type="success"
                        effect="plain"
                        size="small"
                        class="channel-tag"
                      >
                        {{ getChannelName(channelId) }}
                      </el-tag>
                      <span v-if="row.channels.length === 0">无</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
              <el-col :span="12">
                <h4>已屏蔽消息类型</h4>
                <el-empty description="暂无屏蔽类型" v-if="currentRecipient.blockedTypes.length === 0" />
                <el-table v-else :data="currentRecipient.blockedTypes.map(id => ({
                  id,
                  name: getMessageTypeName(id),
                  color: getMessageTypeColor(id),
                  icon: getMessageTypeIcon(id)
                }))" style="width: 100%">
                  <el-table-column prop="name" label="消息类型">
                    <template #default="{ row }">
                      <div class="type-name-cell">
                        <el-icon><component :is="row.icon" /></el-icon>
                        <span>{{ row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button 
                        type="danger" 
                        size="small"
                        text
                        @click="removeBlockedType(row.id)"
                      >
                        移除屏蔽
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="recipientDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRecipient">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.recipients-container {
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
  gap: 10px;
  margin-top: 10px;
}

.recipient-list-card {
  margin-bottom: 20px;
}

.recipient-list-card :deep(.el-card__body) {
  padding: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.member-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.selected-members {
  margin-top: 10px;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.selected-members-title {
  margin-bottom: 10px;
  color: #606266;
}

.subscription-tip {
  color: #909399;
  margin-bottom: 20px;
}

.subscription-preview {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.subscription-label {
  color: #606266;
  margin-right: 5px;
}

.type-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.channel-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.message-types-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.message-type-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.message-type-card.type-subscribed {
  border-color: #67c23a;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.message-type-card.type-blocked {
  border-color: #909399;
  background-color: #f8f8f8;
}

.type-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: #f0f0f0;
  color: #fff;
  font-weight: bold;
}

.type-header .el-icon {
  font-size: 18px;
}

.type-actions {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.type-channels {
  padding: 15px;
}

.channels-title {
  margin-bottom: 10px;
  color: #606266;
}

.type-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-name-cell .el-icon {
  font-size: 16px;
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
  
  .message-types-container {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    justify-content: center;
  }
}
</style> 