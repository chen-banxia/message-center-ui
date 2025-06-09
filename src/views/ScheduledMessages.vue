<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMessageStore, useMessageTypeStore } from '@/stores'

const messageStore = useMessageStore()
const messageTypeStore = useMessageTypeStore()

// 表格数据
const tableData = ref([])
// 表格加载状态
const tableLoading = ref(false)
// 批量选择的消息
const selectedMessages = ref([])
// 每页显示数量
const pageSize = ref(10)
// 当前页码
const currentPage = ref(1)
// 总消息数
const totalMessages = ref(0)
// 搜索条件
const searchForm = reactive({
  keyword: '',
  status: 'all',
  type: 'all',
  dateRange: []
})
// 表单弹窗可见性
const dialogVisible = ref(false)
// 批量发送弹窗可见性
const batchDialogVisible = ref(false)
// 当前编辑的消息
const currentMessage = reactive({
  id: null,
  title: '',
  content: '',
  type: '',
  recipients: [],
  scheduledTime: '',
  status: '待发送'
})
// 批量发送表单
const batchForm = reactive({
  title: '',
  content: '',
  type: '',
  recipientFile: null,
  scheduledTime: '',
  immediatelyDispatch: true
})
// 表单规则
const rules = reactive({
  title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择消息类型', trigger: 'change' }],
  recipients: [{ required: true, message: '请选择接收者', trigger: 'change' }]
})
// 批量表单规则
const batchRules = reactive({
  title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择消息类型', trigger: 'change' }],
  recipientFile: [{ required: true, message: '请上传接收者文件', trigger: 'change' }]
})
// 接收者选项
const recipientOptions = ref([
  { value: 1, label: '张三' },
  { value: 2, label: '李四' },
  { value: 3, label: '王五' },
  { value: 4, label: '销售部' },
  { value: 5, label: '技术部' },
  { value: 6, label: '管理层' }
])

// 表单引用
const formRef = ref(null)
const batchFormRef = ref(null)

// 初始化函数
onMounted(() => {
  loadData()
  if (messageTypeStore.messageTypes.length === 0) {
    messageTypeStore.loadMessageTypes()
  }
})

// 加载数据
const loadData = () => {
  tableLoading.value = true
  
  // 模拟数据 - 实际项目中应从API获取
  setTimeout(() => {
    tableData.value = [
      {
        id: 101,
        title: '系统维护通知',
        type: { id: 1, name: '系统通知', color: '#409EFF' },
        recipientCount: 125,
        status: '待发送',
        scheduledTime: '2023-11-20 22:00:00',
        createTime: '2023-11-15 10:30:00',
        creator: '系统管理员'
      },
      {
        id: 102,
        title: '员工培训通知',
        type: { id: 4, name: '会议通知', color: '#E6A23C' },
        recipientCount: 45,
        status: '已发送',
        scheduledTime: '2023-11-16 09:00:00',
        createTime: '2023-11-14 16:45:00',
        creator: '人力资源部'
      },
      {
        id: 103,
        title: '年终奖发放通知',
        type: { id: 1, name: '系统通知', color: '#409EFF' },
        recipientCount: 200,
        status: '已取消',
        scheduledTime: '2023-12-31 10:00:00',
        createTime: '2023-11-10 14:20:00',
        creator: '财务部'
      },
      {
        id: 104,
        title: '客户满意度调查',
        type: { id: 2, name: '工作提醒', color: '#67C23A' },
        recipientCount: 500,
        status: '待发送',
        scheduledTime: '2023-11-25 09:00:00',
        createTime: '2023-11-18 11:30:00',
        creator: '市场部'
      },
      {
        id: 105,
        title: '系统更新提醒',
        type: { id: 1, name: '系统通知', color: '#409EFF' },
        recipientCount: 150,
        status: '待发送',
        scheduledTime: '2023-11-22 20:00:00',
        createTime: '2023-11-17 09:45:00',
        creator: 'IT部门'
      }
    ]
    totalMessages.value = tableData.value.length
    tableLoading.value = false
  }, 500)
}

// 筛选后的数据
const filteredData = computed(() => {
  let result = [...tableData.value]
  
  // 关键字搜索
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) || 
      item.creator.toLowerCase().includes(keyword)
    )
  }
  
  // 状态筛选
  if (searchForm.status !== 'all') {
    result = result.filter(item => item.status === searchForm.status)
  }
  
  // 类型筛选
  if (searchForm.type !== 'all') {
    result = result.filter(item => item.type.id === parseInt(searchForm.type))
  }
  
  // 日期筛选
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    // 实际项目中应处理日期比较
  }
  
  return result
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 打开新增弹窗
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  resetForm()
  // 填充表单数据
  Object.assign(currentMessage, {
    id: row.id,
    title: row.title,
    content: '这是消息内容示例，实际应从API获取',
    type: row.type.id,
    recipients: [1, 4], // 示例数据
    scheduledTime: row.scheduledTime,
    status: row.status
  })
  dialogVisible.value = true
}

// 打开批量发送弹窗
const handleBatchSend = () => {
  resetBatchForm()
  batchDialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(currentMessage, {
    id: null,
    title: '',
    content: '',
    type: '',
    recipients: [],
    scheduledTime: '',
    status: '待发送'
  })
}

// 重置批量表单
const resetBatchForm = () => {
  if (batchFormRef.value) {
    batchFormRef.value.resetFields()
  }
  Object.assign(batchForm, {
    title: '',
    content: '',
    type: '',
    recipientFile: null,
    scheduledTime: '',
    immediatelyDispatch: true
  })
}

// 保存消息
const saveMessage = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 模拟保存操作
      ElMessage.success(`${currentMessage.id ? '更新' : '创建'}定时消息成功！`)
      dialogVisible.value = false
      loadData()
    }
  })
}

// 保存批量发送
const saveBatchSend = () => {
  batchFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟保存操作
      ElMessage.success('批量消息已创建成功！')
      batchDialogVisible.value = false
      loadData()
    }
  })
}

// 取消发送
const cancelScheduled = (row) => {
  ElMessageBox.confirm(
    `确定要取消消息"${row.title}"的定时发送吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟取消操作
    row.status = '已取消'
    ElMessage.success('已取消定时发送')
  }).catch(() => {})
}

// 立即发送
const sendNow = (row) => {
  ElMessageBox.confirm(
    `确定要立即发送消息"${row.title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟发送操作
    row.status = '已发送'
    ElMessage.success('消息已发送')
  }).catch(() => {})
}

// 删除消息
const deleteMessage = (row) => {
  ElMessageBox.confirm(
    `确定要删除消息"${row.title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 模拟删除操作
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success('消息已删除')
  }).catch(() => {})
}

// 批量删除
const batchDelete = () => {
  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请选择要删除的消息')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedMessages.value.length} 条消息吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 模拟批量删除
    tableData.value = tableData.value.filter(
      item => !selectedMessages.value.includes(item.id)
    )
    selectedMessages.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

// 上传前验证
const beforeUpload = (file) => {
  const isCSV = file.type === 'text/csv'
  const isExcel = file.type === 'application/vnd.ms-excel' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  
  if (!isCSV && !isExcel) {
    ElMessage.error('只能上传 CSV 或 Excel 文件!')
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('文件大小不能超过 2MB!')
    return false
  }
  
  return true
}

// 文件上传成功
const handleUploadSuccess = (response) => {
  batchForm.recipientFile = response
  ElMessage.success('文件上传成功')
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

// 重置搜索条件
const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: 'all',
    type: 'all',
    dateRange: []
  })
}
</script>

<template>
  <div class="scheduled-messages-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">定时发送与批量发送</h2>
      </el-col>
    </el-row>
    
    <!-- 搜索栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :model="searchForm" label-width="80px" size="default" inline>
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="标题/创建人" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="全部" value="all" />
            <el-option label="待发送" value="待发送" />
            <el-option label="已发送" value="已发送" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="全部" value="all" />
            <el-option
              v-for="type in messageTypeStore.messageTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 工具栏 -->
    <el-card shadow="hover" class="action-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增定时消息
          </el-button>
          <el-button type="success" @click="handleBatchSend">
            <el-icon><Upload /></el-icon> 批量发送
          </el-button>
          <el-button type="danger" @click="batchDelete" :disabled="selectedMessages.length === 0">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 消息列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        v-loading="tableLoading"
        :data="paginatedData"
        style="width: 100%"
        @selection-change="val => selectedMessages = val.map(item => item.id)"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="消息标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="消息类型" width="120">
          <template #default="{ row }">
            <el-tag
              :style="{ backgroundColor: row.type.color + '20', color: row.type.color, borderColor: row.type.color }"
              effect="plain"
            >
              {{ row.type.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recipientCount" label="接收者数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '待发送' ? 'warning' : row.status === '已发送' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scheduledTime" label="定时发送时间" width="160" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '待发送'" type="primary" size="small" @click="sendNow(row)">
              立即发送
            </el-button>
            <el-button v-if="row.status === '待发送'" type="warning" size="small" @click="cancelScheduled(row)">
              取消发送
            </el-button>
            <el-button v-if="row.status === '待发送'" type="info" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteMessage(row)">
              删除
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
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 定时消息表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentMessage.id ? '编辑定时消息' : '新增定时消息'"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="currentMessage"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="currentMessage.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="currentMessage.content"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
          />
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="currentMessage.type" placeholder="请选择消息类型" style="width: 100%">
            <el-option
              v-for="type in messageTypeStore.messageTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="接收者" prop="recipients">
          <el-select
            v-model="currentMessage.recipients"
            multiple
            filterable
            collapse-tags
            placeholder="请选择接收者"
            style="width: 100%"
          >
            <el-option
              v-for="item in recipientOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="定时发送">
          <el-date-picker
            v-model="currentMessage.scheduledTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMessage">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量发送弹窗 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量发送消息"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="batchFormRef"
        :model="batchForm"
        :rules="batchRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="batchForm.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="batchForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
          />
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="batchForm.type" placeholder="请选择消息类型" style="width: 100%">
            <el-option
              v-for="type in messageTypeStore.messageTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="接收者文件" prop="recipientFile">
          <el-upload
            class="upload-demo"
            action="https://api.example.com/upload"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :show-file-list="true"
          >
            <el-button type="primary">上传接收者文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传CSV或Excel文件，文件大小不超过2MB。
                <el-link type="primary" :underline="true">下载模板</el-link>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-radio-group v-model="batchForm.immediatelyDispatch">
            <el-radio :label="true">立即发送</el-radio>
            <el-radio :label="false">定时发送</el-radio>
          </el-radio-group>
          <el-date-picker
            v-if="!batchForm.immediatelyDispatch"
            v-model="batchForm.scheduledTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%; margin-top: 10px;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBatchSend">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.scheduled-messages-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.filter-card,
.action-card,
.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-table :deep(.el-button) {
  padding: 4px 8px;
  margin-right: 5px;
}

.upload-demo {
  width: 100%;
}

.upload-demo .el-upload {
  width: 100%;
}

.upload-demo .el-button {
  margin-right: 10px;
}

.el-form-item {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .el-form-item {
    margin-right: 0;
  }
}
</style> 