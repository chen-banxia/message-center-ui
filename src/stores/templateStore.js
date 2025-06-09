import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useTemplateStore = defineStore('template', () => {
  // 状态
  const templates = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 模拟的模板数据
  const mockTemplates = [
    { 
      id: 1, 
      name: '系统维护通知', 
      code: 'SYS_MAINTENANCE', 
      type: 1, 
      status: 'published',
      content: {
        email: '尊敬的用户：<br><br>我们将于{date}进行系统维护升级，届时系统将暂停服务{duration}小时。<br><br>给您带来的不便，敬请谅解。',
        sms: '【系统通知】尊敬的用户，我们将于{date}进行系统维护，预计{duration}小时恢复，给您带来不便敬请谅解。',
        internal: '系统将于{date}进行维护升级，届时系统将暂停服务{duration}小时。',
        wechat: '系统维护通知：我们将于{date}进行系统维护，预计{duration}小时恢复。'
      },
      variables: ['date', 'duration']
    },
    { 
      id: 2, 
      name: '订单审核提醒', 
      code: 'ORDER_REVIEW', 
      type: 2, 
      status: 'published',
      content: {
        email: '您好：<br><br>订单#{orderId}需要您的审核，请尽快处理。<br><br>订单详情：{orderDetail}',
        sms: '【工作提醒】订单#{orderId}需要您审核，请尽快处理。',
        internal: '订单#{orderId}需要您的审核，请尽快处理。订单详情：{orderDetail}',
        wechat: '订单审核提醒：订单#{orderId}需要您审核，请尽快处理。'
      },
      variables: ['orderId', 'orderDetail']
    },
    { 
      id: 3, 
      name: '服务器告警通知', 
      code: 'SERVER_ALERT', 
      type: 3, 
      status: 'published',
      content: {
        email: '警告：<br><br>服务器{serverName}出现异常，异常信息：{alertInfo}。<br><br>请及时处理！',
        sms: '【告警信息】服务器{serverName}异常：{alertInfo}，请及时处理！',
        internal: '服务器{serverName}出现异常，异常信息：{alertInfo}。请及时处理！',
        wechat: '服务器告警：{serverName}异常，{alertInfo}，请及时处理！'
      },
      variables: ['serverName', 'alertInfo']
    },
    { 
      id: 4, 
      name: '会议提醒模板', 
      code: 'MEETING_REMINDER', 
      type: 4, 
      status: 'published',
      content: {
        email: '会议通知：<br><br>主题：{subject}<br>时间：{time}<br>地点：{location}<br>参与人：{participants}<br><br>请准时参加！',
        sms: '【会议通知】{subject}，时间：{time}，地点：{location}，请准时参加！',
        internal: '会议通知：{subject}，时间：{time}，地点：{location}，参与人：{participants}，请准时参加！',
        wechat: '会议提醒：{subject}，{time}，{location}，请准时参加！'
      },
      variables: ['subject', 'time', 'location', 'participants']
    },
    { 
      id: 5, 
      name: '营销活动通知', 
      code: 'MARKETING_CAMPAIGN', 
      type: 5, 
      status: 'draft',
      content: {
        email: '尊敬的客户：<br><br>我们将于{startDate}至{endDate}期间开展{activityName}活动，活动详情：{activityDetail}<br><br>欢迎参与！',
        sms: '【营销活动】{activityName}，{startDate}至{endDate}，{activityDetail}，欢迎参与！',
        internal: '营销活动：{activityName}，时间：{startDate}至{endDate}，详情：{activityDetail}',
        wechat: '营销活动：{activityName}，{startDate}至{endDate}，{activityDetail}'
      },
      variables: ['activityName', 'startDate', 'endDate', 'activityDetail']
    }
  ]

  // 更详细的模板数据（用于模板详情页面）
  const detailedTemplates = [
    {
      id: 'TPL202306001',
      templateName: '订单确认通知',
      templateCode: 'ORDER_CONFIRM',
      templateType: 'notification',
      supportChannels: ['email', 'sms', 'app_push'],
      description: '用户下单后发送订单确认信息',
      createdBy: 'admin',
      createdTime: '2023-06-15 14:30:25',
      updatedTime: '2023-06-16 09:15:30',
      status: 'published',
      version: '1.0.2',
      content: {
        email: '尊敬的{userName}，您的订单 {orderNo} 已确认，金额：{amount}元，下单时间：{orderTime}，预计发货时间：{shipTime}。感谢您的购买！',
        sms: '【信立集团】尊敬的{userName}，您的订单{orderNo}已确认，金额{amount}元，下单时间{orderTime}，预计发货{shipTime}。',
        app_push: '订单确认通知：您的订单 {orderNo} 已确认，预计{shipTime}发货。'
      },
      variableConfig: [
        {
          name: "userName",
          dataType: "string",
          required: true,
          description: "用户姓名",
          validationRule: "",
          maxLength: 50,
          example: "张三"
        },
        {
          name: "orderNo",
          dataType: "string",
          required: true,
          description: "订单号",
          validationRule: "^[A-Z0-9]{8,15}$",
          example: "ORD20230615001"
        },
        {
          name: "amount",
          dataType: "number",
          required: true,
          description: "金额",
          format: "0,0.00",
          example: "199.99"
        },
        {
          name: "orderTime",
          dataType: "date",
          required: true,
          description: "下单时间",
          format: "yyyy-MM-dd HH:mm:ss",
          example: "2023-06-15 14:30:25"
        },
        {
          name: "shipTime",
          dataType: "date",
          required: false,
          description: "预计发货时间",
          format: "yyyy-MM-dd",
          example: "2023-06-18"
        }
      ]
    },
    {
      id: 'TPL202306002',
      templateName: '支付成功通知',
      templateCode: 'PAYMENT_SUCCESS',
      templateType: 'notification',
      supportChannels: ['email', 'sms', 'wechat'],
      description: '用户完成支付后的通知',
      createdBy: 'admin',
      createdTime: '2023-06-16 10:20:15',
      updatedTime: '2023-06-17 15:40:22',
      status: 'published',
      version: '1.0.1',
      content: {
        email: '尊敬的{userName}，您的订单 {orderNo} 已支付成功，支付金额：{payAmount}元，支付时间：{payTime}，支付方式：{payMethod}。感谢您的支持！',
        sms: '【信立集团】尊敬的{userName}，您的订单{orderNo}已支付成功，支付金额{payAmount}元，支付时间{payTime}，支付方式{payMethod}。',
        wechat: '支付成功通知：您的订单 {orderNo} 已支付成功，支付金额{payAmount}元。'
      },
      variableConfig: [
        {
          name: "userName",
          dataType: "string",
          required: true,
          description: "用户姓名",
          example: "李四"
        },
        {
          name: "orderNo",
          dataType: "string",
          required: true,
          description: "订单号",
          example: "ORD20230616002"
        },
        {
          name: "payAmount",
          dataType: "number",
          required: true,
          description: "支付金额",
          example: "299.50"
        },
        {
          name: "payTime",
          dataType: "date",
          required: true,
          description: "支付时间",
          example: "2023-06-16 11:30:45"
        },
        {
          name: "payMethod",
          dataType: "string",
          required: true,
          description: "支付方式",
          example: "微信支付"
        }
      ]
    },
    {
      id: 'TPL202306003',
      templateName: '账户异常登录提醒',
      templateCode: 'ABNORMAL_LOGIN',
      templateType: 'alert',
      supportChannels: ['email', 'sms'],
      description: '检测到异常IP或设备登录时的安全提醒',
      createdBy: 'security_admin',
      createdTime: '2023-06-18 09:10:30',
      updatedTime: '2023-06-18 09:10:30',
      status: 'published',
      version: '1.0.0',
      content: {
        email: '安全提醒：您的账户于 {loginTime} 在 {loginLocation} 使用 {deviceInfo} 登录，IP地址为 {loginIP}。如非本人操作，请立即修改密码并联系客服。',
        sms: '【信立集团】安全提醒：您的账户于{loginTime}在{loginLocation}登录，设备：{deviceInfo}，IP：{loginIP}。如非本人操作，请立即修改密码。'
      },
      variableConfig: [
        {
          name: "loginTime",
          dataType: "date",
          required: true,
          description: "登录时间",
          example: "2023-06-18 08:45:20"
        },
        {
          name: "loginLocation",
          dataType: "string",
          required: true,
          description: "登录地点",
          example: "北京市"
        },
        {
          name: "deviceInfo",
          dataType: "string",
          required: true,
          description: "设备信息",
          example: "iPhone 12"
        },
        {
          name: "loginIP",
          dataType: "string",
          required: true,
          description: "登录IP",
          example: "192.168.1.1"
        }
      ]
    },
    {
      id: 'TPL202306004',
      templateName: '库存不足提醒',
      templateCode: 'LOW_INVENTORY',
      templateType: 'alert',
      supportChannels: ['email', 'web_notification'],
      description: '商品库存低于阈值时的提醒',
      createdBy: 'inventory_manager',
      createdTime: '2023-06-19 14:25:10',
      updatedTime: '2023-06-20 10:15:30',
      status: 'published',
      version: '1.0.1',
      content: {
        email: '库存提醒：商品 {productName}（SKU：{productSKU}）当前库存为 {currentStock}，已低于预警阈值 {thresholdValue}。请及时补充库存。',
        web_notification: '库存不足提醒：{productName} 库存不足，当前剩余 {currentStock} 件。'
      },
      variableConfig: [
        {
          name: "productName",
          dataType: "string",
          required: true,
          description: "商品名称",
          example: "超薄笔记本电脑"
        },
        {
          name: "productSKU",
          dataType: "string",
          required: true,
          description: "商品SKU",
          example: "NB-THIN-001"
        },
        {
          name: "currentStock",
          dataType: "number",
          required: true,
          description: "当前库存",
          example: "5"
        },
        {
          name: "thresholdValue",
          dataType: "number",
          required: true,
          description: "预警阈值",
          example: "10"
        }
      ]
    },
    {
      id: 'TPL202306005',
      templateName: '会员生日祝福',
      templateCode: 'BIRTHDAY_WISH',
      templateType: 'marketing',
      supportChannels: ['email', 'sms', 'app_push'],
      description: '会员生日当天发送的祝福和优惠信息',
      createdBy: 'marketing_admin',
      createdTime: '2023-06-20 16:40:25',
      updatedTime: '2023-06-21 09:30:15',
      status: 'published',
      version: '1.0.1',
      content: {
        email: '亲爱的{userName}，生日快乐！为庆祝您的{age}岁生日，我们为您准备了{discount}折优惠券，有效期至{expiryDate}。优惠码：{couponCode}。祝您生日愉快！',
        sms: '【信立集团】亲爱的{userName}，生日快乐！我们为您准备了{discount}折优惠券，优惠码{couponCode}，有效期至{expiryDate}。',
        app_push: '生日快乐，{userName}！点击领取您的{discount}折生日优惠券。'
      },
      variableConfig: [
        {
          name: "userName",
          dataType: "string",
          required: true,
          description: "用户姓名",
          example: "王五"
        },
        {
          name: "age",
          dataType: "number",
          required: false,
          description: "年龄",
          example: "30"
        },
        {
          name: "discount",
          dataType: "number",
          required: true,
          description: "折扣",
          example: "8.5"
        },
        {
          name: "expiryDate",
          dataType: "date",
          required: true,
          description: "有效期",
          example: "2023-07-20"
        },
        {
          name: "couponCode",
          dataType: "string",
          required: true,
          description: "优惠码",
          example: "BIRTH85"
        }
      ]
    },
    {
      id: 'TPL202306006',
      templateName: '系统维护通知',
      templateCode: 'SYSTEM_MAINTENANCE',
      templateType: 'system',
      supportChannels: ['email', 'web_notification', 'app_push'],
      description: '系统计划维护的通知',
      createdBy: 'system_admin',
      createdTime: '2023-06-21 11:20:35',
      updatedTime: '2023-06-21 11:20:35',
      status: 'draft',
      version: '1.0.0',
      content: {
        email: '尊敬的用户，我们计划于 {startTime} 至 {endTime} 进行系统维护，维护期间 {affectedServices} 将不可用。我们将尽量缩短维护时间，给您带来的不便敬请谅解。',
        web_notification: '系统维护通知：{startTime} 至 {endTime} 系统维护，{affectedServices} 暂停服务。',
        app_push: '系统维护：{startTime}开始，预计{duration}小时，请提前做好准备。'
      },
      variableConfig: [
        {
          name: "startTime",
          dataType: "date",
          required: true,
          description: "开始时间",
          example: "2023-06-25 22:00:00"
        },
        {
          name: "endTime",
          dataType: "date",
          required: true,
          description: "结束时间",
          example: "2023-06-26 02:00:00"
        },
        {
          name: "duration",
          dataType: "number",
          required: true,
          description: "持续时间(小时)",
          example: "4"
        },
        {
          name: "affectedServices",
          dataType: "string",
          required: true,
          description: "受影响的服务",
          example: "用户中心、订单系统"
        }
      ]
    },
    {
      id: 'TPL202306007',
      templateName: '密码重置通知',
      templateCode: 'PASSWORD_RESET',
      templateType: 'notification',
      supportChannels: ['email', 'sms'],
      description: '用户申请重置密码时的验证码通知',
      createdBy: 'security_admin',
      createdTime: '2023-06-22 09:15:40',
      updatedTime: '2023-06-22 09:15:40',
      status: 'published',
      version: '1.0.0',
      content: {
        email: '您正在重置密码，验证码为：{verificationCode}，有效期 {validPeriod} 分钟。如非本人操作，请忽略此邮件。',
        sms: '【信立集团】您正在重置密码，验证码为：{verificationCode}，{validPeriod}分钟内有效。验证码请勿泄露他人。'
      },
      variableConfig: [
        {
          name: "verificationCode",
          dataType: "string",
          required: true,
          description: "验证码",
          example: "123456"
        },
        {
          name: "validPeriod",
          dataType: "number",
          required: true,
          description: "有效期(分钟)",
          example: "15"
        }
      ]
    }
  ]

  // 加载消息模板
  const loadTemplates = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用 - 加载详细版本的模板数据
    setTimeout(() => {
      templates.value = detailedTemplates
      loading.value = false
    }, 300)
    
    // 实际项目中应使用axios请求
    // axios.get('/api/templates')
    //   .then(response => {
    //     templates.value = response.data
    //   })
    //   .catch(err => {
    //     error.value = err.message
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  // 加载详细模板数据
  const loadDetailedTemplates = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用 - 详细版本的模板数据
    setTimeout(() => {
      templates.value = detailedTemplates
      loading.value = false
    }, 300)
  }

  // 根据ID获取模板
  const getTemplateById = (id) => {
    // 先在简易版本中查找
    let template = templates.value.find(t => t.id === id)
    
    // 如果找不到，在详细版本中查找
    if (!template) {
      template = detailedTemplates.find(t => t.id === id)
    }
    
    return template
  }

  // 根据代码获取模板
  const getTemplateByCode = (code) => {
    // 先在简易版本中查找
    let template = templates.value.find(t => t.code === code)
    
    // 如果找不到，在详细版本中查找
    if (!template) {
      template = detailedTemplates.find(t => t.templateCode === code)
    }
    
    return template
  }

  // 添加模板
  const addTemplate = (template) => {
    // 实际项目中应通过API提交到后端
    // 这里使用模拟逻辑
    
    // 检查代码是否已存在
    const existingTemplate = templates.value.find(t => 
      t.code === template.code || 
      (t.templateCode && t.templateCode === template.code)
    )
    
    if (existingTemplate) {
      ElMessage.error(`模板代码 ${template.code} 已存在`)
      return false
    }
    
    // 生成新ID（实际项目中应由后端生成）
    const newId = Math.max(...templates.value.map(t => typeof t.id === 'number' ? t.id : 0)) + 1
    
    const newTemplate = {
      ...template,
      id: newId,
      status: template.status || 'draft',
      createdTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
    }
    
    templates.value.push(newTemplate)
    ElMessage.success('模板添加成功')
    return newTemplate
  }

  // 更新模板
  const updateTemplate = (id, updatedTemplate) => {
    const index = templates.value.findIndex(t => t.id === id)
    
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...updatedTemplate,
        updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
      }
      
      ElMessage.success('模板更新成功')
      return true
    }
    
    ElMessage.error('未找到要更新的模板')
    return false
  }

  // 删除模板
  const deleteTemplate = (id) => {
    const index = templates.value.findIndex(t => t.id === id)
    
    if (index !== -1) {
      templates.value.splice(index, 1)
      ElMessage.success('模板删除成功')
      return true
    }
    
    ElMessage.error('未找到要删除的模板')
    return false
  }

  // 发布模板
  const publishTemplate = (id) => {
    const template = templates.value.find(t => t.id === id)
    
    if (template) {
      template.status = 'published'
      template.updatedTime = new Date().toISOString().replace('T', ' ').substr(0, 19)
      ElMessage.success('模板已发布')
      return true
    }
    
    ElMessage.error('未找到要发布的模板')
    return false
  }

  // 模板预览
  const previewTemplate = (id, data = {}) => {
    const template = getTemplateById(id)
    
    if (!template) {
      ElMessage.error('未找到要预览的模板')
      return null
    }
    
    // 根据提供的数据替换变量
    const previewContent = {}
    
    for (const channel in template.content) {
      let content = template.content[channel]
      
      // 替换变量
      for (const variable in data) {
        const regex = new RegExp(`{${variable}}`, 'g')
        content = content.replace(regex, data[variable] || `{${variable}}`)
      }
      
      previewContent[channel] = content
    }
    
    return {
      ...template,
      previewContent
    }
  }

  return {
    templates,
    loading,
    error,
    loadTemplates,
    loadDetailedTemplates,
    getTemplateById,
    getTemplateByCode,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    publishTemplate,
    previewTemplate
  }
}) 