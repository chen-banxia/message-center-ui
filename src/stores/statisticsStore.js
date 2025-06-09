import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStatisticsStore = defineStore('statistics', () => {
  // 状态
  const statistics = ref({
    total: 0,
    unread: 0,
    success: 0,
    failed: 0,
    pending: 0,
    todayCount: 0,
    weeklyData: [],
    channelDistribution: [],
    systemDistribution: [],
    typeDistribution: [],
    anomalyAlerts: [],
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
    yearlyStats: [],
    failureReasons: [],
    avgResponseTime: [],
    peakTimeDistribution: [],
    recipientActivity: []
  })
  const loading = ref(false)
  const error = ref(null)

  // 加载统计数据
  const loadStatistics = () => {
    loading.value = true
    error.value = null
    
    // 模拟数据
    setTimeout(() => {
      statistics.value = {
        total: 1256,
        unread: 28,
        success: 1203,
        failed: 15,
        pending: 38,
        todayCount: 86,
        weeklyData: [
          { date: '周一', count: 120 },
          { date: '周二', count: 132 },
          { date: '周三', count: 101 },
          { date: '周四', count: 134 },
          { date: '周五', count: 90 },
          { date: '周六', count: 30 },
          { date: '周日', count: 20 }
        ],
        channelDistribution: [
          { name: '邮件', value: 512 },
          { name: '短信', value: 316 },
          { name: '微信', value: 201 },
          { name: '站内信', value: 189 },
          { name: '钉钉', value: 38 }
        ],
        systemDistribution: [
          { name: 'ERP系统', value: 485 },
          { name: 'CRM系统', value: 342 },
          { name: 'OA系统', value: 217 },
          { name: '监控平台', value: 178 },
          { name: '人事系统', value: 34 }
        ],
        typeDistribution: [
          { name: '系统通知', value: 389, color: '#409EFF' },
          { name: '工作提醒', value: 427, color: '#67C23A' },
          { name: '告警信息', value: 185, color: '#F56C6C' },
          { name: '会议通知', value: 126, color: '#E6A23C' },
          { name: '运营活动', value: 129, color: '#909399' }
        ],
        anomalyAlerts: [
          { 
            id: 1, 
            title: '短信发送失败率过高', 
            description: '过去1小时内短信发送失败率达到8.5%，超过预警阈值5%', 
            level: 'high', 
            type: 'channel',
            channelName: '短信',
            timestamp: '2023-10-15 09:23:45',
            status: 'active',
            metric: 'failureRate',
            value: 8.5,
            threshold: 5
          },
          { 
            id: 2, 
            title: 'ERP系统消息量异常增高', 
            description: 'ERP系统消息发送量在30分钟内增长250%，可能存在异常', 
            level: 'medium', 
            type: 'system',
            systemName: 'ERP系统',
            timestamp: '2023-10-15 10:15:30',
            status: 'active',
            metric: 'volumeGrowth',
            value: 250,
            threshold: 150
          },
          { 
            id: 3, 
            title: '钉钉渠道响应时间过长', 
            description: '钉钉消息发送平均响应时间达到2.8秒，超过预警阈值2秒', 
            level: 'low', 
            type: 'channel',
            channelName: '钉钉',
            timestamp: '2023-10-15 08:45:12',
            status: 'resolved',
            metric: 'responseTime',
            value: 2.8,
            threshold: 2
          },
          { 
            id: 4, 
            title: '告警类消息未读率过高', 
            description: '告警类消息未读率达到45%，超过预警阈值30%', 
            level: 'high', 
            type: 'messageType',
            typeName: '告警信息',
            timestamp: '2023-10-15 07:30:00',
            status: 'active',
            metric: 'unreadRate',
            value: 45,
            threshold: 30
          },
          { 
            id: 5, 
            title: '消息队列积压异常', 
            description: '当前消息队列积压数量为235条，超过预警阈值200条', 
            level: 'medium', 
            type: 'system',
            systemName: '消息中心',
            timestamp: '2023-10-15 11:05:22',
            status: 'active',
            metric: 'queueBacklog',
            value: 235,
            threshold: 200
          }
        ],
        dailyStats: generateDailyStats(),
        weeklyStats: generateWeeklyStats(),
        monthlyStats: generateMonthlyStats(),
        yearlyStats: generateYearlyStats(),
        failureReasons: [
          { reason: '接收者不存在', count: 45, percentage: 35 },
          { reason: '渠道服务器错误', count: 32, percentage: 25 },
          { reason: '消息内容格式错误', count: 23, percentage: 18 },
          { reason: '发送频率限制', count: 15, percentage: 12 },
          { reason: '其他原因', count: 13, percentage: 10 }
        ],
        avgResponseTime: [
          { channel: '邮件', time: 1.8 },
          { channel: '短信', time: 0.9 },
          { channel: '微信', time: 1.2 },
          { channel: '站内信', time: 0.1 },
          { channel: '钉钉', time: 1.5 }
        ],
        peakTimeDistribution: [
          { hour: '00:00', count: 22 },
          { hour: '01:00', count: 15 },
          { hour: '02:00', count: 11 },
          { hour: '03:00', count: 8 },
          { hour: '04:00', count: 5 },
          { hour: '05:00', count: 7 },
          { hour: '06:00', count: 13 },
          { hour: '07:00', count: 25 },
          { hour: '08:00', count: 65 },
          { hour: '09:00', count: 120 },
          { hour: '10:00', count: 132 },
          { hour: '11:00', count: 125 },
          { hour: '12:00', count: 85 },
          { hour: '13:00', count: 65 },
          { hour: '14:00', count: 115 },
          { hour: '15:00', count: 135 },
          { hour: '16:00', count: 138 },
          { hour: '17:00', count: 125 },
          { hour: '18:00', count: 98 },
          { hour: '19:00', count: 75 },
          { hour: '20:00', count: 65 },
          { hour: '21:00', count: 55 },
          { hour: '22:00', count: 45 },
          { hour: '23:00', count: 30 }
        ],
        recipientActivity: [
          { name: '研发部', totalReceived: 342, readRate: 85, avgReadTime: 2.5 },
          { name: '市场部', totalReceived: 256, readRate: 78, avgReadTime: 3.2 },
          { name: '销售部', totalReceived: 215, readRate: 92, avgReadTime: 1.8 },
          { name: '财务部', totalReceived: 187, readRate: 96, avgReadTime: 1.5 },
          { name: '人事部', totalReceived: 156, readRate: 90, avgReadTime: 2.0 },
          { name: '行政部', totalReceived: 135, readRate: 88, avgReadTime: 2.2 },
          { name: '运维部', totalReceived: 125, readRate: 95, avgReadTime: 1.0 },
          { name: '客服部', totalReceived: 110, readRate: 89, avgReadTime: 1.9 }
        ]
      }
      loading.value = false
    }, 300)
    
    // 实际项目中应使用axios请求
    // axios.get('/api/statistics')
    //   .then(response => {
    //     statistics.value = response.data
    //   })
    //   .catch(err => {
    //     error.value = err.message
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  // 按日期范围加载统计数据
  const loadStatisticsByDateRange = (startDate, endDate) => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      // 生成模拟数据 - 根据日期范围生成
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
      
      // 生成每日数据
      const dailyData = []
      let total = 0
      
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() + i)
        
        // 生成随机数量
        const count = Math.floor(Math.random() * 100 + 50)
        total += count
        
        dailyData.push({
          date: currentDate.toISOString().split('T')[0],
          count: count
        })
      }
      
      // 更新统计数据
      statistics.value = {
        ...statistics.value,
        total: total,
        success: Math.floor(total * 0.95),
        failed: Math.floor(total * 0.02),
        pending: Math.floor(total * 0.03),
        dailyData: dailyData
      }
      
      loading.value = false
    }, 500)
    
    // 实际项目中应使用axios请求
    // axios.get(`/api/statistics?startDate=${startDate}&endDate=${endDate}`)
    //   .then(response => {
    //     statistics.value = response.data
    //   })
    //   .catch(err => {
    //     error.value = err.message
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  // 按系统统计
  const loadStatisticsBySystem = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      const systemDistribution = [
        { name: 'ERP系统', value: 485 },
        { name: 'CRM系统', value: 342 },
        { name: 'OA系统', value: 217 },
        { name: '监控平台', value: 178 },
        { name: '人事系统', value: 34 }
      ]
      
      statistics.value = {
        ...statistics.value,
        systemDistribution
      }
      
      loading.value = false
    }, 300)
  }

  // 按消息类型统计
  const loadStatisticsByType = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      const typeDistribution = [
        { name: '系统通知', value: 389, color: '#409EFF' },
        { name: '工作提醒', value: 427, color: '#67C23A' },
        { name: '告警信息', value: 185, color: '#F56C6C' },
        { name: '会议通知', value: 126, color: '#E6A23C' },
        { name: '运营活动', value: 129, color: '#909399' }
      ]
      
      statistics.value = {
        ...statistics.value,
        typeDistribution
      }
      
      loading.value = false
    }, 300)
  }

  // 获取今日发送统计
  const getTodayStatistics = () => {
    return {
      count: statistics.value.todayCount,
      success: Math.floor(statistics.value.todayCount * 0.95),
      failed: Math.floor(statistics.value.todayCount * 0.02),
      pending: Math.floor(statistics.value.todayCount * 0.03)
    }
  }

  // 获取周数据统计
  const getWeeklyStatistics = () => {
    return statistics.value.weeklyData
  }

  // 获取渠道分布统计
  const getChannelDistribution = () => {
    return statistics.value.channelDistribution
  }

  // 获取系统分布统计
  const getSystemDistribution = () => {
    return statistics.value.systemDistribution || []
  }

  // 获取类型分布统计
  const getTypeDistribution = () => {
    return statistics.value.typeDistribution || []
  }

  // 获取异常预警数据
  const getAnomalyAlerts = () => {
    return statistics.value.anomalyAlerts || []
  }

  // 根据ID获取预警详情
  const getAlertById = (alertId) => {
    return statistics.value.anomalyAlerts.find(alert => alert.id === alertId)
  }

  // 更新预警状态
  const updateAlertStatus = (alertId, newStatus) => {
    const index = statistics.value.anomalyAlerts.findIndex(alert => alert.id === alertId)
    if (index !== -1) {
      statistics.value.anomalyAlerts[index].status = newStatus
      return true
    }
    return false
  }

  // 添加预警规则
  const addAlertRule = (rule) => {
    // 实际项目中应调用API存储规则
    console.log('添加预警规则:', rule)
    return { success: true, ruleId: Date.now() }
  }

  // 更新预警规则
  const updateAlertRule = (ruleId, ruleData) => {
    // 实际项目中应调用API更新规则
    console.log('更新预警规则:', ruleId, ruleData)
    return { success: true }
  }

  // 删除预警规则
  const deleteAlertRule = (ruleId) => {
    // 实际项目中应调用API删除规则
    console.log('删除预警规则:', ruleId)
    return { success: true }
  }

  // 新增统计分析模块方法
  // 获取每日统计数据
  const getDailyStats = () => {
    return statistics.value.dailyStats || []
  }

  // 获取每周统计数据
  const getWeeklyStats = () => {
    return statistics.value.weeklyStats || []
  }

  // 获取每月统计数据
  const getMonthlyStats = () => {
    return statistics.value.monthlyStats || []
  }

  // 获取每年统计数据
  const getYearlyStats = () => {
    return statistics.value.yearlyStats || []
  }

  // 获取失败原因分布
  const getFailureReasons = () => {
    return statistics.value.failureReasons || []
  }

  // 获取平均响应时间
  const getAvgResponseTime = () => {
    return statistics.value.avgResponseTime || []
  }

  // 获取峰值时段分布
  const getPeakTimeDistribution = () => {
    return statistics.value.peakTimeDistribution || []
  }

  // 获取接收者活跃度
  const getRecipientActivity = () => {
    return statistics.value.recipientActivity || []
  }

  // 导出统计数据
  const exportStatisticsData = (format) => {
    // 实际项目中应调用后端API导出数据
    console.log(`导出统计数据，格式: ${format}`)
    return { success: true, url: `https://example.com/export/statistics.${format}` }
  }

  // 辅助函数：生成每日统计数据
  function generateDailyStats() {
    const result = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      const total = Math.floor(Math.random() * 500) + 100
      const success = Math.floor(total * (0.9 + Math.random() * 0.1))
      const failed = total - success
      
      result.push({
        date: date.toISOString().split('T')[0],
        total: total,
        success: success,
        failed: failed,
        successRate: Math.round(success / total * 100)
      })
    }
    return result.reverse()
  }

  // 生成每周统计数据
  function generateWeeklyStats() {
    const result = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i * 7)
      
      const total = Math.floor(Math.random() * 3000) + 1000
      const success = Math.floor(total * (0.9 + Math.random() * 0.1))
      const failed = total - success
      
      result.push({
        week: `第${date.getWeek()}周`,
        total: total,
        success: success,
        failed: failed,
        successRate: Math.round(success / total * 100)
      })
    }
    return result.reverse()
  }

  // 生成每月统计数据
  function generateMonthlyStats() {
    const result = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      
      const total = Math.floor(Math.random() * 12000) + 5000
      const success = Math.floor(total * (0.9 + Math.random() * 0.1))
      const failed = total - success
      
      result.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        total: total,
        success: success,
        failed: failed,
        successRate: Math.round(success / total * 100)
      })
    }
    return result.reverse()
  }

  // 生成每年统计数据
  function generateYearlyStats() {
    const result = []
    const today = new Date()
    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setFullYear(today.getFullYear() - i)
      
      const total = Math.floor(Math.random() * 150000) + 50000
      const success = Math.floor(total * (0.9 + Math.random() * 0.1))
      const failed = total - success
      
      result.push({
        year: date.getFullYear().toString(),
        total: total,
        success: success,
        failed: failed,
        successRate: Math.round(success / total * 100)
      })
    }
    return result.reverse()
  }

  // 扩展Date对象以获取当前周数
  Date.prototype.getWeek = function() {
    const firstDayOfYear = new Date(this.getFullYear(), 0, 1)
    const pastDaysOfYear = (this - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  return {
    statistics,
    loading,
    error,
    loadStatistics,
    loadStatisticsByDateRange,
    loadStatisticsBySystem,
    loadStatisticsByType,
    getTodayStatistics,
    getWeeklyStatistics,
    getChannelDistribution,
    getSystemDistribution,
    getTypeDistribution,
    getAnomalyAlerts,
    getAlertById,
    updateAlertStatus,
    addAlertRule,
    updateAlertRule,
    deleteAlertRule,
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getYearlyStats,
    getFailureReasons,
    getAvgResponseTime,
    getPeakTimeDistribution,
    getRecipientActivity,
    exportStatisticsData
  }
}) 