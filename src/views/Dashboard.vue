<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { useMessageStore, useMessageTypeStore, useTemplateStore, useChannelStore, useSystemStore, useStatisticsStore } from '@/stores'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'

const router = useRouter()
const messageStore = useMessageStore()
const messageTypeStore = useMessageTypeStore()
const templateStore = useTemplateStore()
const channelStore = useChannelStore()
const systemStore = useSystemStore()
const statisticsStore = useStatisticsStore()

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
  stats.systemCount = systemStore.systems.length
  stats.templateCount = templateStore.templates.length
  stats.channelCount = channelStore.channels.length
}

// 初始化消息类型分布图表
const initMessageTypeChart = () => {
  const chartDom = document.getElementById('messageTypeChart')
  if (!chartDom) {
    console.error('找不到图表DOM元素: messageTypeChart')
    return
  }
  
  messageChart = echarts.init(chartDom)
  
  // 统计各类型消息数量
  const typeStats = {}
  messageStore.messages.forEach(msg => {
    // 检查类型是对象还是字符串
    const typeName = typeof msg.type === 'object' ? msg.type.name : msg.type
    const typeColor = typeof msg.type === 'object' ? msg.type.color : null
    
    if (typeStats[typeName]) {
      typeStats[typeName].value++
    } else {
      // 如果消息类型中没有颜色，尝试从messageTypes中获取
      let color = typeColor
      if (!color) {
        const typeObj = messageTypeStore.messageTypes.find(t => t.name === typeName)
        color = typeObj ? typeObj.color : '#409EFF'
      }
      
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
  if (!chartDom) {
    console.error('找不到图表DOM元素: channelStatusChart')
    return
  }
  
  channelChart = echarts.init(chartDom)
  
  // 统计各渠道状态
  const enabledCount = channelStore.channels.filter(c => c.status === 'enabled').length
  const disabledCount = channelStore.channels.filter(c => c.status === 'disabled').length
  
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

// 异常预警
const anomalyAlerts = ref([])
const activeAnomalyCount = ref(0)

// 跳转到异常预警页面
const goToAnomalyAlerts = () => {
  router.push('/alerts')
}

// 加载异常预警数据
const loadAnomalyAlerts = async () => {
  try {
    await statisticsStore.loadStatistics()
    anomalyAlerts.value = statisticsStore.getAnomalyAlerts()
    activeAnomalyCount.value = anomalyAlerts.value.filter(alert => alert.status === 'active').length
  } catch (error) {
    console.error('加载异常预警数据失败:', error)
  }
}

onMounted(() => {
  try {
    console.log('Dashboard mounted, 正在加载数据...')
    
    // 确保所有数据已加载
    if (messageStore.messages.length === 0 || 
        messageTypeStore.messageTypes.length === 0 || 
        channelStore.channels.length === 0) {
      // 加载所有必要的数据
      messageStore.loadMessages()
      messageTypeStore.loadMessageTypes()
      channelStore.loadChannels()
      systemStore.loadSystems()
      templateStore.loadTemplates()
      statisticsStore.loadStatistics()
    }
    
    // 加载统计数据
    loadStats()
    console.log('统计数据已加载:', stats)
    
    // 加载异常预警数据
    loadAnomalyAlerts()
    
    // 初始化图表
    setTimeout(() => {
      try {
        console.log('开始初始化图表...')
        console.log('消息数据:', messageStore.messages.length)
        console.log('渠道数据:', channelStore.channels.length)
        
        if (messageStore.messages.length > 0) {
          initMessageTypeChart()
        } else {
          console.warn('消息数据为空，跳过消息类型图表初始化')
        }
        
        if (channelStore.channels.length > 0) {
          initChannelStatusChart()
        } else {
          console.warn('渠道数据为空，跳过渠道状态图表初始化')
        }
        
        // 监听窗口大小变化
        window.addEventListener('resize', handleResize)
      } catch (error) {
        console.error('图表初始化出错:', error)
      }
    }, 1000) // 增加延迟时间，确保DOM已完全渲染
  } catch (error) {
    console.error('Dashboard 挂载过程出错:', error)
  }
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
    
    <!-- 异常预警卡片 -->
    <el-row :gutter="20" v-if="activeAnomalyCount > 0" class="alert-row">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card shadow="hover" class="alert-card">
          <div class="alert-header">
            <div class="alert-title">
              <el-icon><Warning /></el-icon>
              <span>系统异常预警</span>
            </div>
            <el-button type="primary" link @click="goToAnomalyAlerts">查看详情</el-button>
          </div>
          <div class="alert-content">
            <div class="alert-count">
              <span class="count-value">{{ activeAnomalyCount }}</span>
              <span class="count-text">个活跃预警</span>
            </div>
            <div class="alert-list">
              <div v-for="alert in anomalyAlerts.slice(0, 3)" :key="alert.id" class="alert-item" v-if="alert.status === 'active'">
                <el-tag 
                  :type="alert.level === 'high' ? 'danger' : alert.level === 'medium' ? 'warning' : 'info'" 
                  size="small" 
                  class="alert-tag"
                >
                  {{ alert.level === 'high' ? '高' : alert.level === 'medium' ? '中' : '低' }}
                </el-tag>
                <span class="alert-item-title">{{ alert.title }}</span>
              </div>
            </div>
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

.alert-row {
  margin-bottom: 20px;
}

.alert-card {
  background-color: #FEF0F0;
  border-color: #FCDEE0;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.alert-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #F56C6C;
}

.alert-title .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.alert-content {
  display: flex;
  align-items: center;
}

.alert-count {
  margin-right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background-color: rgba(245, 108, 108, 0.1);
  border-radius: 4px;
}

.count-value {
  font-size: 24px;
  font-weight: bold;
  color: #F56C6C;
}

.count-text {
  font-size: 14px;
  color: #606266;
}

.alert-list {
  flex: 1;
}

.alert-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.alert-tag {
  margin-right: 8px;
}

.alert-item-title {
  font-size: 14px;
  color: #606266;
}
</style> 