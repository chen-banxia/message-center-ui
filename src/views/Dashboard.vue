<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { useMessageStore } from '../stores/messageStore'
import * as echarts from 'echarts'

const messageStore = useMessageStore()

// 统计数据
const stats = reactive({
  totalMessages: 0,
  unreadMessages: 0,
  systemCount: 0,
  templateCount: 0,
  channelCount: 0
})

// 图表实例
let messageChart = null
let channelChart = null

// 加载统计数据
const loadStats = () => {
  // 实际项目中应从API获取
  stats.totalMessages = messageStore.messages.length
  stats.unreadMessages = messageStore.unreadCount
  stats.systemCount = messageStore.systems.length
  stats.templateCount = messageStore.templates.length
  stats.channelCount = messageStore.channels.length
}

// 初始化消息类型分布图表
const initMessageTypeChart = () => {
  const chartDom = document.getElementById('messageTypeChart')
  messageChart = echarts.init(chartDom)
  
  // 统计各类型消息数量
  const typeStats = {}
  messageStore.messages.forEach(msg => {
    const typeName = msg.type
    if (typeStats[typeName]) {
      typeStats[typeName].value++
    } else {
      // 获取对应类型的颜色
      const typeObj = messageStore.messageTypes.find(t => t.name === typeName)
      const color = typeObj ? typeObj.color : '#409EFF'
      
      typeStats[typeName] = {
        value: 1,
        name: typeName,
        itemStyle: { color }
      }
    }
  })
  
  const option = {
    title: {
      text: '消息类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: Object.keys(typeStats)
    },
    series: [
      {
        name: '消息数量',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: Object.values(typeStats),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  messageChart.setOption(option)
}

// 初始化通知渠道状态图表
const initChannelStatusChart = () => {
  const chartDom = document.getElementById('channelStatusChart')
  channelChart = echarts.init(chartDom)
  
  // 统计各渠道状态
  const enabledCount = messageStore.channels.filter(c => c.status === 'enabled').length
  const disabledCount = messageStore.channels.filter(c => c.status === 'disabled').length
  
  const option = {
    title: {
      text: '通知渠道状态',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['启用', '禁用']
    },
    series: [
      {
        name: '渠道状态',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [
          { value: enabledCount, name: '启用', itemStyle: { color: '#67C23A' } },
          { value: disabledCount, name: '禁用', itemStyle: { color: '#909399' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  channelChart.setOption(option)
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
  if (messageChart) {
    messageChart.resize()
  }
  if (channelChart) {
    channelChart.resize()
  }
}

// 最近活动列表
const activities = ref([
  { 
    content: '系统管理员创建了新的消息模板', 
    timestamp: '2023-10-12 10:30:00',
    type: 'primary',
    icon: 'Files'
  },
  { 
    content: 'ERP系统发送了一条告警消息', 
    timestamp: '2023-10-12 09:15:00',
    type: 'danger',
    icon: 'Warning'
  },
  { 
    content: '新增了钉钉通知渠道', 
    timestamp: '2023-10-11 16:45:00',
    type: 'success',
    icon: 'Share'
  },
  { 
    content: '更新了系统维护通知模板', 
    timestamp: '2023-10-11 14:20:00',
    type: 'info',
    icon: 'Edit'
  },
  { 
    content: '接入了人事系统', 
    timestamp: '2023-10-10 11:05:00',
    type: 'warning',
    icon: 'Connection'
  }
])

onMounted(() => {
  // 确保数据已加载
  if (messageStore.messages.length === 0) {
    messageStore.initData()
  }
  
  // 加载统计数据
  loadStats()
  
  // 初始化图表
  setTimeout(() => {
    initMessageTypeChart()
    initChannelStatusChart()
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  }, 500)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  if (messageChart) {
    messageChart.dispose()
    messageChart = null
  }
  
  if (channelChart) {
    channelChart.dispose()
    channelChart = null
  }
})
</script>

<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">控制台</h2>
      </el-col>
    </el-row>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background-color: #409EFF;">
            <el-icon><Message /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">消息总数</div>
            <div class="stat-value">{{ stats.totalMessages }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background-color: #F56C6C;">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">未读消息</div>
            <div class="stat-value">{{ stats.unreadMessages }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background-color: #67C23A;">
            <el-icon><Files /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">消息模板</div>
            <div class="stat-value">{{ stats.templateCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background-color: #E6A23C;">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">接入系统</div>
            <div class="stat-value">{{ stats.systemCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="chart-card">
          <div id="messageTypeChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="chart-card">
          <div id="channelStatusChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近活动 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card shadow="hover" class="activity-card">
          <template #header>
            <div class="card-header">
              <h3>最近活动</h3>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :type="activity.type"
              :timestamp="activity.timestamp"
              :hollow="true"
            >
              <div class="activity-content">
                <el-icon class="activity-icon"><component :is="activity.icon" /></el-icon>
                <span>{{ activity.content }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding-bottom: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  height: 100%;
  margin-bottom: 20px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  padding: 15px;
  width: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  height: 350px;
}

.chart-card :deep(.el-card__body) {
  height: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.activity-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.activity-content {
  display: flex;
  align-items: center;
}

.activity-icon {
  margin-right: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .chart-card {
    height: 300px;
  }
}
</style> 