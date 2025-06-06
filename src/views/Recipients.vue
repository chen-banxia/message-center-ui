<script setup>
import { ref, onMounted, computed } from 'vue'

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
    createTime: '2023-05-10 10:00:00'
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
    createTime: '2023-05-11 11:00:00'
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
    createTime: '2023-05-12 12:00:00'
  },
  {
    id: 4,
    type: 'group',
    name: '技术团队',
    members: [1, 2],
    status: 'enabled',
    createTime: '2023-05-13 13:00:00'
  },
  {
    id: 5,
    type: 'group',
    name: '产品团队',
    members: [2, 3],
    status: 'enabled',
    createTime: '2023-05-14 14:00:00'
  }
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
  members: []
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
  
  return result
})

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
    members: []
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
        :data="filteredRecipients"
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
        
        <el-tab-pane label="订阅设置" name="subscription" :disabled="dialogMode === 'add'">
          <el-empty description="暂无订阅设置，请先保存基本信息" v-if="dialogMode === 'add'" />
          <div v-else class="subscription-settings">
            <p class="subscription-tip">在这里可以设置接收者订阅的消息类型和接收渠道</p>
            
            <!-- 订阅设置表单将在实际项目中实现 -->
            <el-empty description="订阅设置功能开发中..." />
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