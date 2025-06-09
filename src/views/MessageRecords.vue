<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMessageStore, useMessageTypeStore } from '@/stores'

const router = useRouter()
const messageStore = useMessageStore()
const messageTypeStore = useMessageTypeStore()

// 表格数据
const tableData = ref([])
// 表格加载状态
const tableLoading = ref(false)
// 批量选择的记录
const selectedRecords = ref([])
// 每页显示数量
const pageSize = ref(10)
// 当前页码
const currentPage = ref(1)
// 总记录数
const totalRecords = ref(0)
// 详情弹窗可见性
const detailDialogVisible = ref(false)
// 当前查看的记录详情
const currentRecord = reactive({
  id: null,
  title: '',
  content: '',
  sourceSystem: '',
  messageType: '',
  templateId: '',
  variables: '',
  recipients: [],
  channels: [],
  status: '',
  createTime: '',
  sendTime: '',
  retryCount: 0,
  failReason: '',
  priority: 0,
  scheduledTime: ''
})

// 搜索条件
const searchForm = reactive({
  keyword: '',
  status: 'all',
  sourceSystem: 'all',
  messageType: 'all',
  dateRange: []
})

// 获取系统列表 (模拟数据)
const systemOptions = ref([
  { value: '1', label: '订单系统' },
  { value: '2', label: '用户系统' },
  { value: '3', label: '库存系统' },
  { value: '4', label: '支付系统' },
  { value: '5', label: '物流系统' }
])

// 渠道类型选项
const channelOptions = ref([
  { value: '1', label: '短信' },
  { value: '2', label: '邮件' },
  { value: '3', label: '站内信' },
  { value: '4', label: '微信' },
  { value: '5', label: '钉钉' }
])

// 初始化
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
        id: 1001,
        title: '订单确认通知',
        content: '您的订单 #12345 已确认，预计3天内发货',
        sourceSystem: { id: '1', name: '订单系统' },
        messageType: { id: 1, name: '系统通知', color: '#409EFF' },
        templateId: 'TPL_ORDER_CONFIRM',
        variables: { orderNo: '12345', deliveryDays: 3 },
        recipients: [{ id: 1, name: '张三', type: '个人' }],
        channels: [{ id: '1', name: '短信' }],
        status: '发送成功',
        createTime: '2023-10-15 09:30:00',
        sendTime: '2023-10-15 09:30:05',
        retryCount: 0,
        failReason: '',
        priority: 2,
        scheduledTime: null
      },
      {
        id: 1002,
        title: '支付成功通知',
        content: '您已成功支付订单 #67890，金额 ¥199.00',
        sourceSystem: { id: '4', name: '支付系统' },
        messageType: { id: 1, name: '系统通知', color: '#409EFF' },
        templateId: 'TPL_PAYMENT_SUCCESS',
        variables: { orderNo: '67890', amount: 199.00 },
        recipients: [{ id: 2, name: '李四', type: '个人' }],
        channels: [{ id: '1', name: '短信' }, { id: '3', name: '站内信' }],
        status: '发送成功',
        createTime: '2023-10-16 14:20:00',
        sendTime: '2023-10-16 14:20:03',
        retryCount: 0,
        failReason: '',
        priority: 1,
        scheduledTime: null
      },
      {
        id: 1003,
        title: '库存不足警告',
        content: '商品"iPhone 14 Pro"库存低于警戒线，当前库存: 5',
        sourceSystem: { id: '3', name: '库存系统' },
        messageType: { id: 3, name: '告警信息', color: '#F56C6C' },
        templateId: 'TPL_INVENTORY_ALERT',
        variables: { productName: 'iPhone 14 Pro', inventory: 5 },
        recipients: [{ id: 5, name: '库存管理组', type: '群组' }],
        channels: [{ id: '5', name: '钉钉' }],
        status: '发送成功',
        createTime: '2023-10-17 10:15:00',
        sendTime: '2023-10-17 10:15:02',
        retryCount: 0,
        failReason: '',
        priority: 0,
        scheduledTime: null
      },
      {
        id: 1004,
        title: '账户异常登录提醒',
        content: '您的账户于2023-10-18 03:25在异常地点(上海)登录，如非本人操作请立即修改密码',
        sourceSystem: { id: '2', name: '用户系统' },
        messageType: { id: 3, name: '告警信息', color: '#F56C6C' },
        templateId: 'TPL_SECURITY_ALERT',
        variables: { loginTime: '2023-10-18 03:25', location: '上海' },
        recipients: [{ id: 3, name: '王五', type: '个人' }],
        channels: [{ id: '1', name: '短信' }, { id: '2', name: '邮件' }],
        status: '发送失败',
        createTime: '2023-10-18 03:26:00',
        sendTime: '2023-10-18 03:26:10',
        retryCount: 3,
        failReason: '短信服务异常',
        priority: 0,
        scheduledTime: null
      },
      {
        id: 1005,
        title: '物流配送通知',
        content: '您的订单 #54321 已发货，物流单号: SF1234567890，预计明天送达',
        sourceSystem: { id: '5', name: '物流系统' },
        messageType: { id: 1, name: '系统通知', color: '#409EFF' },
        templateId: 'TPL_DELIVERY_NOTICE',
        variables: { orderNo: '54321', trackingNo: 'SF1234567890', deliveryDate: '明天' },
        recipients: [{ id: 1, name: '张三', type: '个人' }],
        channels: [{ id: '3', name: '站内信' }, { id: '4', name: '微信' }],
        status: '待发送',
        createTime: '2023-10-19 15:40:00',
        sendTime: null,
        retryCount: 0,
        failReason: '',
        priority: 2,
        scheduledTime: '2023-10-19 16:00:00'
      }
    ]
    totalRecords.value = tableData.value.length
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
      item.content.toLowerCase().includes(keyword) ||
      (typeof item.variables === 'object' && JSON.stringify(item.variables).toLowerCase().includes(keyword))
    )
  }
  
  // 状态筛选
  if (searchForm.status !== 'all') {
    result = result.filter(item => item.status === searchForm.status)
  }
  
  // 来源系统筛选
  if (searchForm.sourceSystem !== 'all') {
    result = result.filter(item => item.sourceSystem.id === searchForm.sourceSystem)
  }
  
  // 消息类型筛选
  if (searchForm.messageType !== 'all') {
    result = result.filter(item => item.messageType.id === parseInt(searchForm.messageType))
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

// 查看详情
const viewDetail = (row) => {
  // 填充详情数据
  Object.assign(currentRecord, {
    id: row.id,
    title: row.title,
    content: row.content,
    sourceSystem: row.sourceSystem.name,
    messageType: row.messageType.name,
    templateId: row.templateId,
    variables: JSON.stringify(row.variables, null, 2),
    recipients: row.recipients,
    channels: row.channels,
    status: row.status,
    createTime: row.createTime,
    sendTime: row.sendTime || '未发送',
    retryCount: row.retryCount,
    failReason: row.failReason || '无',
    priority: row.priority,
    scheduledTime: row.scheduledTime || '无'
  })
  detailDialogVisible.value = true
}

// 重新发送
const resendMessage = (row) => {
  ElMessageBox.confirm(
    `确定要重新发送消息"${row.title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟重发操作
    row.status = '发送中'
    setTimeout(() => {
      row.status = '发送成功'
      row.retryCount += 1
      row.sendTime = new Date().toLocaleString()
      row.failReason = ''
      ElMessage.success('消息已重新发送')
    }, 1000)
  }).catch(() => {})
}

// 删除记录
const deleteRecord = (row) => {
  ElMessageBox.confirm(
    `确定要删除消息记录"${row.title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 模拟删除操作
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success('记录已删除')
  }).catch(() => {})
}

// 批量删除
const batchDelete = () => {
  if (selectedRecords.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRecords.value.length} 条记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 模拟批量删除
    tableData.value = tableData.value.filter(
      item => !selectedRecords.value.includes(item.id)
    )
    selectedRecords.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
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
    sourceSystem: 'all',
    messageType: 'all',
    dateRange: []
  })
}

// 导出记录
const exportRecords = () => {
  ElMessage.success('导出功能开发中，即将支持导出为Excel文件')
}
</script>

<template>
  <div class="message-records-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">消息发送记录</h2>
      </el-col>
    </el-row>
    
    <!-- 搜索栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :model="searchForm" label-width="80px" size="default" inline>
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="标题/内容/变量" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="全部" value="all" />
            <el-option label="待发送" value="待发送" />
            <el-option label="发送中" value="发送中" />
            <el-option label="发送成功" value="发送成功" />
            <el-option label="发送失败" value="发送失败" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源系统">
          <el-select v-model="searchForm.sourceSystem" placeholder="全部" clearable>
            <el-option label="全部" value="all" />
            <el-option
              v-for="item in systemOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="searchForm.messageType" placeholder="全部" clearable>
            <el-option label="全部" value="all" />
            <el-option
              v-for="type in messageTypeStore.messageTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
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
          <el-button type="danger" @click="batchDelete" :disabled="selectedRecords.length === 0">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
          <el-button type="success" @click="exportRecords">
            <el-icon><Download /></el-icon> 导出记录
          </el-button>
          <el-button type="info" @click="$router.push('/scheduled-messages')">
            <el-icon><Timer /></el-icon> 定时发送管理
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 记录列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        v-loading="tableLoading"
        :data="paginatedData"
        style="width: 100%"
        @selection-change="val => selectedRecords = val.map(item => item.id)"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="消息标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="消息类型" width="100">
          <template #default="{ row }">
            <el-tag
              :style="{ backgroundColor: row.messageType.color + '20', color: row.messageType.color, borderColor: row.messageType.color }"
              effect="plain"
            >
              {{ row.messageType.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源系统" width="100">
          <template #default="{ row }">
            {{ row.sourceSystem.name }}
          </template>
        </el-table-column>
        <el-table-column label="接收者" width="100">
          <template #default="{ row }">
            <el-tooltip
              :content="row.recipients.map(r => r.name).join(', ')"
              placement="top"
              :hide-after="0"
            >
              <span>{{ row.recipients.length }}个接收者</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="发送渠道" width="100">
          <template #default="{ row }">
            <el-tooltip
              :content="row.channels.map(c => c.name).join(', ')"
              placement="top"
              :hide-after="0"
            >
              <span>{{ row.channels.length }}个渠道</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="
              row.status === '发送成功' ? 'success' : 
              row.status === '发送失败' ? 'danger' : 
              row.status === '发送中' ? 'warning' : 
              'info'
            ">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="
              row.priority === 0 ? 'danger' : 
              row.priority === 1 ? 'warning' : 
              'info'
            ">
              {{ row.priority === 0 ? '高' : row.priority === 1 ? '中' : '低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="sendTime" label="发送时间" width="160">
          <template #default="{ row }">
            {{ row.sendTime || '未发送' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.status === '发送失败' || row.status === '待发送'"
              type="success" 
              size="small" 
              @click="resendMessage(row)"
            >
              重发
            </el-button>
            <el-button type="danger" size="small" @click="deleteRecord(row)">
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
    
    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="消息发送详情"
      width="700px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="消息ID">{{ currentRecord.id }}</el-descriptions-item>
        <el-descriptions-item label="消息标题">{{ currentRecord.title }}</el-descriptions-item>
        <el-descriptions-item label="消息内容">{{ currentRecord.content }}</el-descriptions-item>
        <el-descriptions-item label="来源系统">{{ currentRecord.sourceSystem }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">{{ currentRecord.messageType }}</el-descriptions-item>
        <el-descriptions-item label="模板ID">{{ currentRecord.templateId }}</el-descriptions-item>
        <el-descriptions-item label="变量数据">
          <pre class="json-code">{{ currentRecord.variables }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="接收者">
          <el-tag 
            v-for="recipient in currentRecord.recipients" 
            :key="recipient.id"
            class="recipient-tag"
            type="info"
          >
            {{ recipient.name }} ({{ recipient.type }})
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送渠道">
          <el-tag 
            v-for="channel in currentRecord.channels" 
            :key="channel.id"
            class="channel-tag"
            type="success"
          >
            {{ channel.name }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送状态">{{ currentRecord.status }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRecord.createTime }}</el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ currentRecord.sendTime }}</el-descriptions-item>
        <el-descriptions-item label="重试次数">{{ currentRecord.retryCount }}</el-descriptions-item>
        <el-descriptions-item label="失败原因">{{ currentRecord.failReason }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ currentRecord.priority === 0 ? '高' : currentRecord.priority === 1 ? '中' : '低' }}
        </el-descriptions-item>
        <el-descriptions-item label="定时发送">{{ currentRecord.scheduledTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.message-records-container {
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

.json-code {
  margin: 0;
  background-color: #f8f8f8;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 120px;
  overflow-y: auto;
}

.recipient-tag,
.channel-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .el-form-item {
    margin-right: 0;
  }
}
</style> 