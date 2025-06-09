import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export const useMessageStore = defineStore('message', () => {
  // 状态
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)
  const unreadCount = ref(0)

  // 模拟数据 - 实际项目中应从API获取
  const mockMessages = [
    {
      id: 1,
      title: '系统维护通知',
      content: '系统将于2023年10月15日22:00-次日02:00进行维护升级，请提前做好准备。',
      type: { id: 1, name: '系统通知', color: '#409EFF' },
      sendTime: '2023-10-10 10:00:00',
      read: false,
      important: true,
      sender: '系统管理员'
    },
    {
      id: 2,
      title: '订单审核提醒',
      content: '订单#98765需要您的审核，请尽快处理。',
      type: { id: 2, name: '工作提醒', color: '#67C23A' },
      sendTime: '2023-10-11 09:30:00',
      read: true,
      important: false,
      sender: '订单系统'
    },
    {
      id: 3,
      title: '服务器异常告警',
      content: '数据库服务器CPU使用率超过90%，请及时检查。',
      type: { id: 3, name: '告警信息', color: '#F56C6C' },
      sendTime: '2023-10-11 15:45:00',
      read: false,
      important: true,
      sender: '监控系统'
    },
    {
      id: 4,
      title: '新功能上线通知',
      content: '消息中心新增了批量处理功能，欢迎体验使用。',
      type: { id: 1, name: '系统通知', color: '#409EFF' },
      sendTime: '2023-10-12 14:00:00',
      read: false,
      important: false,
      sender: '系统管理员'
    },
    {
      id: 5,
      title: '会议提醒',
      content: '项目周例会将于明天上午10:00在3号会议室举行，请准时参加。',
      type: { id: 4, name: '会议通知', color: '#E6A23C' },
      sendTime: '2023-10-12 16:30:00',
      read: true,
      important: false,
      sender: '行政部门'
    }
  ]

  // 加载消息列表
  const loadMessages = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      messages.value = mockMessages
      updateUnreadCount()
      loading.value = false
    }, 500)
    
    // 实际项目中应使用axios请求
    // axios.get('/api/messages')
    //   .then(response => {
    //     messages.value = response.data
    //     updateUnreadCount()
    //   })
    //   .catch(err => {
    //     error.value = err.message
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  // 标记消息为已读
  const markAsRead = (messageId) => {
    const message = messages.value.find(msg => msg.id === messageId)
    if (message && !message.read) {
      message.read = true
      updateUnreadCount()
    }
  }

  // 标记所有消息为已读
  const markAllAsRead = () => {
    messages.value.forEach(message => {
      message.read = true
    })
    updateUnreadCount()
  }

  // 更新未读消息数量
  const updateUnreadCount = () => {
    unreadCount.value = messages.value.filter(message => !message.read).length
  }

  // 获取分类消息
  const getMessagesByType = (typeId) => {
    return computed(() => {
      return messages.value.filter(message => message.type.id === typeId)
    })
  }

  return {
    messages,
    loading,
    error,
    unreadCount,
    loadMessages,
    markAsRead,
    markAllAsRead,
    updateUnreadCount,
    getMessagesByType
  }
}) 