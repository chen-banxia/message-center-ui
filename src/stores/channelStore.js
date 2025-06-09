import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useChannelStore = defineStore('channel', () => {
  // 状态
  const channels = ref([])
  const loading = ref(false)
  const error = ref(null)
  const defaultParamMappings = ref([])

  // 模拟的通知渠道数据
  const mockChannels = [
    { 
      id: 1, 
      name: '系统站内信', 
      type: 'internal', 
      status: 'enabled',
      config: {
        messageBoxSize: 100,
        notificationEnabled: true
      },
      priority: 1,
      retryTimes: 3,
      retryInterval: 30,
      rateLimit: 1000,
      vendor: '自建系统',
      tags: ['系统', '内部'],
      paramMapping: {
        recipient: 'user_id',
        subject: 'title',
        content: 'content',
        url: 'link'
      },
      availableTime: {
        workDays: [1, 2, 3, 4, 5, 6, 7],
        timeRanges: [{ start: '00:00', end: '23:59' }]
      },
      monitorMetrics: {
        availability: 99.9,
        successRate: 99.8,
        avgResponseTime: 50
      }
    },
    { 
      id: 2, 
      name: '企业邮箱', 
      type: 'email', 
      status: 'enabled',
      config: {
        host: 'smtp.example.com',
        port: 465,
        username: 'notification@example.com',
        password: '******',
        ssl: true,
        from: 'notification@example.com'
      },
      priority: 2,
      retryTimes: 3,
      retryInterval: 60,
      rateLimit: 50,
      vendor: '腾讯企业邮',
      tags: ['邮件', '正式'],
      paramMapping: {
        recipient: 'to_email',
        subject: 'subject',
        content: 'html_body',
        attachment: 'attachments'
      },
      availableTime: {
        workDays: [1, 2, 3, 4, 5],
        timeRanges: [{ start: '08:30', end: '22:00' }]
      },
      monitorMetrics: {
        availability: 98.5,
        successRate: 97.2,
        avgResponseTime: 1200
      }
    },
    { 
      id: 3, 
      name: '阿里云短信', 
      type: 'sms', 
      status: 'enabled',
      config: {
        accessKey: 'ALI*****',
        secretKey: '******',
        signName: '信立集团',
        region: 'cn-hangzhou'
      },
      priority: 3,
      retryTimes: 2,
      retryInterval: 30,
      rateLimit: 20,
      vendor: '阿里云',
      tags: ['短信', '营销'],
      paramMapping: {
        recipient: 'phone_number',
        content: 'content',
        template_id: 'template_code'
      },
      availableTime: {
        workDays: [1, 2, 3, 4, 5, 6, 7],
        timeRanges: [{ start: '08:00', end: '20:00' }]
      },
      monitorMetrics: {
        availability: 99.1,
        successRate: 98.5,
        avgResponseTime: 800
      }
    },
    { 
      id: 4, 
      name: '企业微信通知', 
      type: 'wechat', 
      status: 'disabled',
      config: {
        appId: 'wx*****',
        appSecret: '******',
        templateId: 'template_123'
      },
      priority: 4,
      retryTimes: 2,
      retryInterval: 60,
      rateLimit: 30,
      vendor: '腾讯企业微信',
      tags: ['微信', '测试'],
      paramMapping: {
        recipient: 'open_id',
        subject: 'first_data',
        content: 'remark',
        url: 'url'
      },
      availableTime: {
        workDays: [1, 2, 3, 4, 5],
        timeRanges: [{ start: '09:00', end: '18:00' }]
      },
      monitorMetrics: {
        availability: 96.0,
        successRate: 94.5,
        avgResponseTime: 1500
      }
    },
    { 
      id: 5, 
      name: '钉钉工作通知', 
      type: 'dingtalk', 
      status: 'enabled',
      config: {
        accessToken: 'din*****',
        secret: '******'
      },
      priority: 5,
      retryTimes: 3,
      retryInterval: 60,
      rateLimit: 50,
      vendor: '阿里钉钉',
      tags: ['钉钉', '内部'],
      paramMapping: {
        recipient: 'user_id',
        subject: 'title',
        content: 'text'
      },
      availableTime: {
        workDays: [1, 2, 3, 4, 5],
        timeRanges: [{ start: '09:00', end: '19:00' }]
      },
      monitorMetrics: {
        availability: 99.5,
        successRate: 98.8,
        avgResponseTime: 700
      }
    },
    { 
      id: 6, 
      name: '业务系统Webhook', 
      type: 'webhook', 
      status: 'enabled',
      config: {
        url: 'https://api.example.com/notifications',
        method: 'POST',
        headers: '{"Content-Type": "application/json", "X-API-Key": "abc123"}',
        timeout: 5
      },
      priority: 6,
      retryTimes: 5,
      retryInterval: 120,
      rateLimit: 100,
      vendor: '内部系统',
      tags: ['webhook', 'API'],
      paramMapping: {
        content: 'payload'
      },
      availableTime: {
        workDays: [1, 2, 3, 4, 5, 6, 7],
        timeRanges: [{ start: '00:00', end: '23:59' }]
      },
      monitorMetrics: {
        availability: 99.8,
        successRate: 99.5,
        avgResponseTime: 250
      }
    }
  ]

  // 加载通知渠道
  const loadChannels = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      channels.value = mockChannels
      loading.value = false
    }, 300)
    
    // 实际项目中应使用axios请求
    // axios.get('/api/channels')
    //   .then(response => {
    //     channels.value = response.data
    //   })
    //   .catch(err => {
    //     error.value = err.message
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  // 加载默认参数映射配置
  const loadDefaultParamMappings = () => {
    loading.value = true
    error.value = null
    
    // 实际项目中应从API获取
    // 这里使用模拟数据
    setTimeout(() => {
      // 先创建标准参数列表
      const standardParamsList = [
        {
          id: 'recipient',
          key: 'recipient',
          label: '接收者',
          description: '消息接收者的标识符',
          required: true
        },
        {
          id: 'subject',
          key: 'subject',
          label: '主题',
          description: '消息的主题或标题',
          required: true
        },
        {
          id: 'content',
          key: 'content',
          label: '内容',
          description: '消息的正文内容',
          required: true
        },
        {
          id: 'attachment',
          key: 'attachment',
          label: '附件',
          description: '消息的附件',
          required: false
        },
        {
          id: 'importance',
          key: 'importance',
          label: '重要性',
          description: '消息的重要程度',
          required: false
        },
        {
          id: 'template_id',
          key: 'template_id',
          label: '模板ID',
          description: '消息模板的唯一标识',
          required: false
        },
        {
          id: 'url',
          key: 'url',
          label: '链接',
          description: '相关的链接地址',
          required: false
        }
      ];
      
      // 设置映射关系
      defaultParamMappings.value = [
        {
          standardParam: standardParamsList[0],
          mappings: {
            email: {
              paramKey: 'to_email',
              description: '邮件收件人',
              isRequired: true
            },
            sms: {
              paramKey: 'phone_number',
              description: '手机号码',
              isRequired: true
            },
            wechat: {
              paramKey: 'open_id',
              description: '微信OpenID',
              isRequired: true
            },
            dingtalk: {
              paramKey: 'user_id',
              description: '钉钉用户ID',
              isRequired: true
            },
            webhook: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            internal: {
              paramKey: 'user_id',
              description: '用户ID',
              isRequired: true
            }
          }
        },
        {
          standardParam: standardParamsList[1],
          mappings: {
            email: {
              paramKey: 'subject',
              description: '邮件主题',
              isRequired: true
            },
            sms: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            wechat: {
              paramKey: 'first_data',
              description: '首行数据',
              isRequired: true
            },
            dingtalk: {
              paramKey: 'title',
              description: '标题',
              isRequired: true
            },
            webhook: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            internal: {
              paramKey: 'title',
              description: '标题',
              isRequired: true
            }
          }
        },
        {
          standardParam: standardParamsList[2],
          mappings: {
            email: {
              paramKey: 'html_body',
              description: 'HTML正文',
              isRequired: true
            },
            sms: {
              paramKey: 'content',
              description: '短信内容',
              isRequired: true
            },
            wechat: {
              paramKey: 'remark',
              description: '备注',
              isRequired: true
            },
            dingtalk: {
              paramKey: 'text',
              description: '文本内容',
              isRequired: true
            },
            webhook: {
              paramKey: 'payload',
              description: '请求数据',
              isRequired: true
            },
            internal: {
              paramKey: 'content',
              description: '内容',
              isRequired: true
            }
          }
        },
        {
          standardParam: standardParamsList[3],
          mappings: {
            email: {
              paramKey: 'attachments',
              description: '附件列表',
              isRequired: false
            },
            sms: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            wechat: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            dingtalk: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            webhook: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            internal: {
              paramKey: '',
              description: '',
              isRequired: false
            }
          }
        },
        {
          standardParam: standardParamsList[4],
          mappings: {
            email: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            sms: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            wechat: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            dingtalk: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            webhook: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            internal: {
              paramKey: 'type',
              description: '站内信类型',
              isRequired: false
            }
          }
        },
        {
          standardParam: standardParamsList[5],
          mappings: {
            email: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            sms: {
              paramKey: 'template_code',
              description: '模板编码',
              isRequired: false
            },
            wechat: {
              paramKey: 'template_id',
              description: '模板ID',
              isRequired: false
            },
            dingtalk: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            webhook: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            internal: {
              paramKey: '',
              description: '',
              isRequired: false
            }
          }
        },
        {
          standardParam: standardParamsList[6],
          mappings: {
            email: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            sms: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            wechat: {
              paramKey: 'url',
              description: '跳转链接',
              isRequired: false
            },
            dingtalk: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            webhook: {
              paramKey: '',
              description: '',
              isRequired: false
            },
            internal: {
              paramKey: 'link',
              description: '链接',
              isRequired: false
            }
          }
        }
      ]
      loading.value = false
    }, 300)
  }

  // 更新默认参数映射配置
  const updateDefaultParamMappings = (mappings) => {
    defaultParamMappings.value = mappings
    
    // 实际项目中应调用API保存到后端
    ElMessage.success('默认参数映射配置已更新')
    return true
  }

  // 根据ID获取渠道
  const getChannelById = (id) => {
    return channels.value.find(channel => channel.id === id)
  }

  // 根据类型获取渠道
  const getChannelsByType = (type) => {
    return channels.value.filter(channel => channel.type === type)
  }

  // 获取启用的渠道
  const getEnabledChannels = () => {
    return channels.value.filter(channel => channel.status === 'enabled')
  }

  // 添加渠道
  const addChannel = (channel) => {
    // 生成新ID（实际项目中应由后端生成）
    const newId = Math.max(...channels.value.map(c => c.id)) + 1
    
    const newChannel = {
      ...channel,
      id: newId
    }
    
    channels.value.push(newChannel)
    ElMessage.success('渠道添加成功')
    return newChannel
  }

  // 更新渠道
  const updateChannel = (id, updatedChannel) => {
    const index = channels.value.findIndex(channel => channel.id === id)
    
    if (index !== -1) {
      channels.value[index] = {
        ...channels.value[index],
        ...updatedChannel
      }
      ElMessage.success('渠道更新成功')
      return true
    }
    
    ElMessage.error('未找到要更新的渠道')
    return false
  }

  // 删除渠道
  const deleteChannel = (id) => {
    const index = channels.value.findIndex(channel => channel.id === id)
    
    if (index !== -1) {
      channels.value.splice(index, 1)
      ElMessage.success('渠道删除成功')
      return true
    }
    
    ElMessage.error('未找到要删除的渠道')
    return false
  }

  // 启用渠道
  const enableChannel = (id) => {
    const channel = getChannelById(id)
    
    if (channel) {
      channel.status = 'enabled'
      ElMessage.success(`${channel.name} 已启用`)
      return true
    }
    
    ElMessage.error('未找到要启用的渠道')
    return false
  }

  // 禁用渠道
  const disableChannel = (id) => {
    const channel = getChannelById(id)
    
    if (channel) {
      channel.status = 'disabled'
      ElMessage.success(`${channel.name} 已禁用`)
      return true
    }
    
    ElMessage.error('未找到要禁用的渠道')
    return false
  }

  // 测试渠道连接
  const testChannel = (id) => {
    const channel = getChannelById(id)
    
    if (!channel) {
      ElMessage.error('未找到要测试的渠道')
      return Promise.reject('未找到要测试的渠道')
    }
    
    // 模拟API调用
    return new Promise((resolve) => {
      ElMessage.info('正在测试渠道连接...')
      
      setTimeout(() => {
        // 模拟80%成功率
        const success = Math.random() > 0.2
        
        if (success) {
          ElMessage.success(`${channel.name} 连接测试成功`)
          resolve({
            success: true,
            message: '连接测试成功',
            data: {
              responseTime: Math.floor(Math.random() * 500 + 100),
              timestamp: new Date().toISOString()
            }
          })
        } else {
          const errorMsg = `${channel.name} 连接测试失败`
          ElMessage.error(errorMsg)
          resolve({
            success: false,
            message: errorMsg,
            error: '连接超时或服务不可用'
          })
        }
      }, 1500)
    })
  }

  return {
    channels,
    loading,
    error,
    defaultParamMappings,
    loadChannels,
    loadDefaultParamMappings,
    updateDefaultParamMappings,
    getChannelById,
    getChannelsByType,
    getEnabledChannels,
    addChannel,
    updateChannel,
    deleteChannel,
    enableChannel,
    disableChannel,
    testChannel
  }
}) 