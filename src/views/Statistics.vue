<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStatisticsStore } from '@/stores'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'

const statisticsStore = useStatisticsStore()

// 加载状态
const loading = ref(false)
// 时间维度
const timeDimension = ref('daily')
// 当前选中的系统
const selectedSystem = ref('all')
// 当前选中的消息类型
const selectedType = ref('all')
// 当前选中的渠道
const selectedChannel = ref('all')
// 时间范围
const dateRange = ref([])

// 统计数据
const statistics = reactive({
  dailyStats: [],
  weeklyStats: [],
  monthlyStats: [],
  yearlyStats: [],
  systemDistribution: [],
  typeDistribution: [],
  channelDistribution: [],
  failureReasons: [],
  avgResponseTime: [],
  peakTimeDistribution: [],
  recipientActivity: []
})

// 图表实例
let trendChart = null
let distributionChart = null
let failureChart = null
let responseTimeChart = null
let peakTimeChart = null
let activityChart = null

// 按时间维度获取数据
const getStatsByTimeDimension = computed(() => {
  switch (timeDimension.value) {
    case 'daily':
      return statistics.dailyStats
    case 'weekly':
      return statistics.weeklyStats
    case 'monthly':
      return statistics.monthlyStats
    case 'yearly':
      return statistics.yearlyStats
    default:
      return []
  }
})

// 初始化加载数据
const loadStatistics = async () => {
  loading.value = true
  try {
    await statisticsStore.loadStatistics()
    
    // 更新统计数据
    statistics.dailyStats = statisticsStore.getDailyStats()
    statistics.weeklyStats = statisticsStore.getWeeklyStats()
    statistics.monthlyStats = statisticsStore.getMonthlyStats()
    statistics.yearlyStats = statisticsStore.getYearlyStats()
    statistics.systemDistribution = statisticsStore.getSystemDistribution()
    statistics.typeDistribution = statisticsStore.getTypeDistribution()
    statistics.channelDistribution = statisticsStore.getChannelDistribution()
    statistics.failureReasons = statisticsStore.getFailureReasons()
    statistics.avgResponseTime = statisticsStore.getAvgResponseTime()
    statistics.peakTimeDistribution = statisticsStore.getPeakTimeDistribution()
    statistics.recipientActivity = statisticsStore.getRecipientActivity()
    
    console.log('统计数据加载完成')
    
    // 初始化图表
    initCharts()
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 按日期范围筛选数据
const filterByDateRange = () => {
  if (!dateRange.value || dateRange.value.length < 2) {
    ElMessage.warning('请选择日期范围')
    return
  }
  
  const startDate = dateRange.value[0]
  const endDate = dateRange.value[1]
  
  statisticsStore.loadStatisticsByDateRange(startDate, endDate)
  loadStatistics()
}

// 导出统计数据
const exportData = async (format) => {
  try {
    const result = await statisticsStore.exportStatisticsData(format)
    if (result.success) {
      ElMessage.success(`导出成功，文件已准备好下载`)
      // 实际项目中，应该触发文件下载
      // window.open(result.url, '_blank')
    }
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

// 初始化图表
const initCharts = () => {
  setTimeout(() => {
    initTrendChart()
    initDistributionChart()
    initFailureReasonsChart()
    initResponseTimeChart()
    initPeakTimeChart()
    initActivityChart()
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  }, 300)
}

// 初始化趋势图表
const initTrendChart = () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) {
    console.error('找不到图表DOM元素: trendChart')
    return
  }
  
  trendChart = echarts.init(chartDom)
  updateTrendChart()
}

// 更新趋势图表
const updateTrendChart = () => {
  if (!trendChart) return
  
  const data = getStatsByTimeDimension.value
  const xAxisData = data.map(item => {
    if (timeDimension.value === 'daily') return item.date
    if (timeDimension.value === 'weekly') return item.week
    if (timeDimension.value === 'monthly') return item.month
    if (timeDimension.value === 'yearly') return item.year
    return ''
  })
  
  const totalData = data.map(item => item.total)
  const successData = data.map(item => item.success)
  const failedData = data.map(item => item.failed)
  
  const option = {
    title: {
      text: '消息发送趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['总量', '成功', '失败'],
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: timeDimension.value === 'monthly' ? 45 : 0,
        interval: timeDimension.value === 'daily' ? 'auto' : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总量',
        type: 'line',
        smooth: true,
        data: totalData,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '成功',
        type: 'line',
        smooth: true,
        data: successData,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '失败',
        type: 'line',
        smooth: true,
        data: failedData,
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化分布图表
const initDistributionChart = () => {
  const chartDom = document.getElementById('distributionChart')
  if (!chartDom) {
    console.error('找不到图表DOM元素: distributionChart')
    return
  }
  
  distributionChart = echarts.init(chartDom)
  updateDistributionChart()
}

// 更新分布图表
const updateDistributionChart = () => {
  if (!distributionChart) return
  
  let data = []
  let title = ''
  
  // 根据当前选中的维度获取数据
  if (selectedChannel.value !== 'all') {
    title = '渠道分布'
    data = statistics.channelDistribution
  } else if (selectedSystem.value !== 'all') {
    title = '系统分布'
    data = statistics.systemDistribution
  } else if (selectedType.value !== 'all') {
    title = '类型分布'
    data = statistics.typeDistribution
  } else {
    // 默认显示类型分布
    title = '消息类型分布'
    data = statistics.typeDistribution
  }
  
  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '消息数量',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: data.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: item.color ? { color: item.color } : undefined
        })),
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
  
  distributionChart.setOption(option)
}

// 初始化失败原因图表
const initFailureReasonsChart = () => {
  const chartDom = document.getElementById('failureReasonsChart')
  if (!chartDom) {
    console.error('找不到图表DOM元素: failureReasonsChart')
    return
  }
  
  failureChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '失败原因分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: statistics.failureReasons.map(item => item.reason)
    },
    series: [
      {
        name: '失败数量',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: statistics.failureReasons.map(item => ({
          name: item.reason,
          value: item.count
        })),
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
  
  failureChart.setOption(option)
}

// 初始化响应时间图表
const initResponseTimeChart = () => {
  const chartDom = document.getElementById('responseTimeChart')
  if (!chartDom) {
    console.error('找不到图表DOM元素: responseTimeChart')
    return
  }
  
  responseTimeChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '平均响应时间(秒)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statistics.avgResponseTime.map(item => item.channel)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '响应时间',
        type: 'bar',
        data: statistics.avgResponseTime.map(item => ({
          value: item.time,
          itemStyle: {
            color: item.time > 1.5 ? '#F56C6C' : item.time > 1.0 ? '#E6A23C' : '#67C23A'
          }
        }))
      }
    ]
  }
  
  responseTimeChart.setOption(option)
}

// 初始化峰值时段图表
const initPeakTimeChart = () => {
  const chartDom = document.getElementById('peakTimeChart')
  if (!chartDom) {
    console.error('找不到图表DOM元素: peakTimeChart')
    return
  }
  
  peakTimeChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '消息发送高峰时段',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statistics.peakTimeDistribution.map(item => item.hour)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '消息数量',
        type: 'bar',
        data: statistics.peakTimeDistribution.map(item => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  
  peakTimeChart.setOption(option)
}

// 初始化接收者活跃度图表
const initActivityChart = () => {
  const chartDom = document.getElementById('activityChart')
  if (!chartDom) {
    console.error('找不到图表DOM元素: activityChart')
    return
  }
  
  activityChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '接收者活跃度',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['接收总量', '阅读率(%)', '平均阅读时间(秒)'],
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statistics.recipientActivity.map(item => item.name)
    },
    yAxis: [
      {
        type: 'value',
        name: '数量/百分比',
        min: 0,
        max: function (value) {
          return Math.ceil(value.max / 100) * 100
        }
      },
      {
        type: 'value',
        name: '时间(秒)',
        min: 0,
        max: 5
      }
    ],
    series: [
      {
        name: '接收总量',
        type: 'bar',
        data: statistics.recipientActivity.map(item => item.totalReceived)
      },
      {
        name: '阅读率(%)',
        type: 'bar',
        data: statistics.recipientActivity.map(item => item.readRate)
      },
      {
        name: '平均阅读时间(秒)',
        type: 'line',
        yAxisIndex: 1,
        data: statistics.recipientActivity.map(item => item.avgReadTime)
      }
    ]
  }
  
  activityChart.setOption(option)
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
  trendChart && trendChart.resize()
  distributionChart && distributionChart.resize()
  failureChart && failureChart.resize()
  responseTimeChart && responseTimeChart.resize()
  peakTimeChart && peakTimeChart.resize()
  activityChart && activityChart.resize()
}

// 切换时间维度
const changeTimeDimension = (dimension) => {
  timeDimension.value = dimension
  updateTrendChart()
}

// 切换分布维度
const changeDistributionDimension = () => {
  updateDistributionChart()
}

// 初始化
onMounted(() => {
  loadStatistics()
})

// 组件卸载前清理
const onBeforeUnmount = () => {
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  trendChart && trendChart.dispose()
  distributionChart && distributionChart.dispose()
  failureChart && failureChart.dispose()
  responseTimeChart && responseTimeChart.dispose()
  peakTimeChart && peakTimeChart.dispose()
  activityChart && activityChart.dispose()
}
</script>

<template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">统计分析</h2>
      </el-col>
    </el-row>
    
    <!-- 筛选和操作栏 -->
    <el-row :gutter="20" class="filter-row">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card shadow="never">
          <div class="filter-container">
            <div class="filter-item time-dimension">
              <span class="filter-label">时间维度:</span>
              <el-radio-group v-model="timeDimension" @change="changeTimeDimension">
                <el-radio-button label="daily">日</el-radio-button>
                <el-radio-button label="weekly">周</el-radio-button>
                <el-radio-button label="monthly">月</el-radio-button>
                <el-radio-button label="yearly">年</el-radio-button>
              </el-radio-group>
            </div>
            
            <div class="filter-item date-range">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
              <el-button type="primary" @click="filterByDateRange" :icon="Search">查询</el-button>
            </div>
            
            <div class="filter-item dimension-filter">
              <el-select v-model="selectedSystem" placeholder="选择系统" @change="changeDistributionDimension" clearable>
                <el-option label="全部系统" value="all" />
                <el-option
                  v-for="item in statistics.systemDistribution"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
              
              <el-select v-model="selectedType" placeholder="选择消息类型" @change="changeDistributionDimension" clearable>
                <el-option label="全部类型" value="all" />
                <el-option
                  v-for="item in statistics.typeDistribution"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
              
              <el-select v-model="selectedChannel" placeholder="选择渠道" @change="changeDistributionDimension" clearable>
                <el-option label="全部渠道" value="all" />
                <el-option
                  v-for="item in statistics.channelDistribution"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </div>
            
            <div class="filter-item export-buttons">
              <el-dropdown @command="exportData">
                <el-button type="success" :icon="Download">
                  导出数据<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="excel">导出Excel</el-dropdown-item>
                    <el-dropdown-item command="csv">导出CSV</el-dropdown-item>
                    <el-dropdown-item command="pdf">导出PDF</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <!-- 数据展示区域 -->
    <template v-else>
      <!-- 趋势图 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-card shadow="hover" class="chart-card">
            <div id="trendChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 分布图和失败原因图 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover" class="chart-card">
            <div id="distributionChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover" class="chart-card">
            <div id="failureReasonsChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 响应时间和峰值时段图 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover" class="chart-card">
            <div id="responseTimeChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover" class="chart-card">
            <div id="peakTimeChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 接收者活跃度图 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-card shadow="hover" class="chart-card">
            <div id="activityChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<style scoped>
.statistics-container {
  padding-bottom: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.filter-row {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filter-label {
  margin-right: 10px;
  font-weight: 500;
}

.time-dimension {
  margin-right: 20px;
}

.date-range .el-date-editor {
  margin-right: 10px;
}

.dimension-filter {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  height: 400px;
}

.chart-card :deep(.el-card__body) {
  height: 100%;
  padding: 10px;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 350px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .dimension-filter {
    flex-direction: column;
  }
  
  .chart-card {
    height: 350px;
  }
}
</style> 