import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMessageStore } from './messageStore'
import { useMessageTypeStore } from './messageTypeStore'
import { useTemplateStore } from './templateStore'
import { useChannelStore } from './channelStore'
import { useSystemStore } from './systemStore'
import { useStatisticsStore } from './statisticsStore'
import { ElMessage } from 'element-plus'

export const useInitStore = defineStore('init', () => {
  // 状态
  const initialized = ref(false)
  const initializing = ref(false)
  const error = ref(null)
  
  // 初始化所有store
  const initializeAll = async () => {
    if (initializing.value) {
      ElMessage.info('数据正在初始化中，请稍候...')
      return
    }
    
    if (initialized.value) {
      ElMessage.info('数据已经初始化完成')
      return
    }
    
    try {
      initializing.value = true
      error.value = null
      
      // 获取所有store实例
      const messageStore = useMessageStore()
      const messageTypeStore = useMessageTypeStore()
      const templateStore = useTemplateStore()
      const channelStore = useChannelStore()
      const systemStore = useSystemStore()
      const statisticsStore = useStatisticsStore()
      
      console.log('开始初始化所有数据...')
      
      // 串行加载数据，确保顺序执行
      const initializeDataSequentially = async () => {
        try {
          // 消息类型数据
          console.log('加载消息类型...')
          await new Promise(resolve => {
            messageTypeStore.loadMessageTypes()
            setTimeout(resolve, 300)
          })
          
          // 通知渠道数据
          console.log('加载通知渠道...')
          await new Promise(resolve => {
            channelStore.loadChannels()
            setTimeout(resolve, 300)
          })
          
          // 加载渠道参数映射
          console.log('加载渠道参数映射...')
          await new Promise(resolve => {
            channelStore.loadDefaultParamMappings()
            setTimeout(resolve, 300)
          })
          
          // 消息模板数据 - 提前加载
          console.log('加载消息模板...')
          await new Promise(resolve => {
            templateStore.loadTemplates()
            setTimeout(resolve, 300)
          })
          
          // 系统对接数据
          console.log('加载系统对接...')
          await new Promise(resolve => {
            systemStore.loadSystems()
            setTimeout(resolve, 300)
          })
          
          // 统计数据
          console.log('加载统计数据...')
          await new Promise(resolve => {
            statisticsStore.loadStatistics()
            setTimeout(resolve, 300)
          })
          
          // 消息列表数据
          console.log('加载消息列表...')
          await new Promise(resolve => {
            messageStore.loadMessages()
            setTimeout(resolve, 300)
          })
          
          initialized.value = true
          initializing.value = false
          console.log('所有数据初始化完成!')
          ElMessage.success('数据加载完成')
        } catch (err) {
          console.error('数据初始化过程出错:', err)
          error.value = err.message || '数据加载失败'
          initializing.value = false
          ElMessage.error(`数据初始化失败: ${error.value}`)
        }
      }
      
      await initializeDataSequentially()
    } catch (err) {
      console.error('初始化过程出错:', err)
      error.value = err.message || '初始化失败'
      initializing.value = false
      ElMessage.error(`初始化失败: ${error.value}`)
    }
  }
  
  // 重置数据
  const resetAll = () => {
    initialized.value = false
    initializing.value = false
    error.value = null
  }
  
  return {
    initialized,
    initializing,
    error,
    initializeAll,
    resetAll
  }
}) 