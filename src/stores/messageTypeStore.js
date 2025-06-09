import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessageTypeStore = defineStore('messageType', () => {
  // 状态
  const messageTypes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 模拟的消息类型数据
  const mockMessageTypes = [
    { id: 1, name: '系统通知', color: '#409EFF', icon: 'Bell' },
    { id: 2, name: '工作提醒', color: '#67C23A', icon: 'Notification' },
    { id: 3, name: '告警信息', color: '#F56C6C', icon: 'Warning' },
    { id: 4, name: '会议通知', color: '#E6A23C', icon: 'Calendar' },
    { id: 5, name: '运营活动', color: '#909399', icon: 'Promotion' }
  ]

  // 加载消息类型
  const loadMessageTypes = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      messageTypes.value = mockMessageTypes
      loading.value = false
    }, 300)
    
    // 实际项目中应使用axios请求
    // axios.get('/api/message-types')
    //   .then(response => {
    //     messageTypes.value = response.data
    //   })
    //   .catch(err => {
    //     error.value = err.message
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  // 根据ID获取消息类型
  const getMessageTypeById = (typeId) => {
    return messageTypes.value.find(type => type.id === typeId)
  }

  // 添加消息类型
  const addMessageType = (messageType) => {
    // 生成新的ID（实际项目中应由后端生成）
    const newId = Math.max(...messageTypes.value.map(type => type.id)) + 1
    const newMessageType = {
      ...messageType,
      id: newId
    }
    
    messageTypes.value.push(newMessageType)
    return newMessageType
  }

  // 更新消息类型
  const updateMessageType = (id, updatedMessageType) => {
    const index = messageTypes.value.findIndex(type => type.id === id)
    if (index !== -1) {
      messageTypes.value[index] = {
        ...messageTypes.value[index],
        ...updatedMessageType
      }
      return true
    }
    return false
  }

  // 删除消息类型
  const deleteMessageType = (id) => {
    const index = messageTypes.value.findIndex(type => type.id === id)
    if (index !== -1) {
      messageTypes.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    messageTypes,
    loading,
    error,
    loadMessageTypes,
    getMessageTypeById,
    addMessageType,
    updateMessageType,
    deleteMessageType
  }
}) 