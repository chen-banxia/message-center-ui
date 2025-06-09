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
    typeDistribution: []
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
    getTypeDistribution
  }
}) 