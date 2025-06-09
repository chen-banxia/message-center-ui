import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useMessageStore = defineStore('message', () => {
  // 状态
  const messages = ref([])
  const templates = ref([])
  const channels = ref([])
  const systems = ref([])
  const messageTypes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const unreadCount = ref(0)
  const defaultParamMappings = ref([])
  const statistics = ref({
    total: 0,
    unread: 0,
    success: 0,
    failed: 0,
    pending: 0,
    todayCount: 0,
    weeklyData: [],
    channelDistribution: []
  })

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

  // 模拟的消息类型数据
  const mockMessageTypes = [
    { id: 1, name: '系统通知', color: '#409EFF', icon: 'Bell' },
    { id: 2, name: '工作提醒', color: '#67C23A', icon: 'Notification' },
    { id: 3, name: '告警信息', color: '#F56C6C', icon: 'Warning' },
    { id: 4, name: '会议通知', color: '#E6A23C', icon: 'Calendar' },
    { id: 5, name: '运营活动', color: '#909399', icon: 'Promotion' }
  ]

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

  // 模拟的系统对接数据
  const mockSystems = [
    { id: 1, name: 'ERP系统', description: '企业资源计划系统', status: 'enabled' },
    { id: 2, name: 'CRM系统', description: '客户关系管理系统', status: 'enabled' },
    { id: 3, name: 'OA系统', description: '办公自动化系统', status: 'enabled' },
    { id: 4, name: '监控平台', description: '服务器监控平台', status: 'enabled' },
    { id: 5, name: '人事系统', description: '人力资源管理系统', status: 'disabled' }
  ]

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

  // 加载消息类型
  const loadMessageTypes = () => {
    // 模拟API调用
    setTimeout(() => {
      messageTypes.value = mockMessageTypes
    }, 300)
  }

  // 加载通知渠道
  const loadChannels = () => {
    // 模拟API调用
    setTimeout(() => {
      channels.value = mockChannels
    }, 300)
  }

  // 加载系统对接
  const loadSystems = () => {
    // 模拟API调用
    setTimeout(() => {
      systems.value = mockSystems
    }, 300)
  }

  // 加载消息模板
  const loadTemplates = () => {
    // 模拟数据
    templates.value = [
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

  // 加载统计数据
  const loadStatistics = () => {
    // 模拟数据
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
      ]
    }
  }

  // 加载默认参数映射配置
  const loadDefaultParamMappings = () => {
    // 实际项目中应从API获取
    // 这里使用模拟数据
    defaultParamMappings.value = [
      {
        standardParam: 'recipient',
        mappings: {
          email: 'to_email',
          sms: 'phone_number',
          wechat: 'open_id',
          dingtalk: 'user_id',
          webhook: '',
          internal: 'user_id'
        }
      },
      {
        standardParam: 'subject',
        mappings: {
          email: 'subject',
          sms: '',
          wechat: 'first_data',
          dingtalk: 'title',
          webhook: '',
          internal: 'title'
        }
      },
      {
        standardParam: 'content',
        mappings: {
          email: 'html_body',
          sms: 'content',
          wechat: 'remark',
          dingtalk: 'text',
          webhook: 'payload',
          internal: 'content'
        }
      },
      {
        standardParam: 'attachment',
        mappings: {
          email: 'attachments',
          sms: '',
          wechat: '',
          dingtalk: '',
          webhook: '',
          internal: ''
        }
      },
      {
        standardParam: 'importance',
        mappings: {
          email: '',
          sms: '',
          wechat: '',
          dingtalk: '',
          webhook: '',
          internal: 'type'
        }
      },
      {
        standardParam: 'template_id',
        mappings: {
          email: '',
          sms: 'template_code',
          wechat: 'template_id',
          dingtalk: '',
          webhook: '',
          internal: ''
        }
      },
      {
        standardParam: 'url',
        mappings: {
          email: '',
          sms: '',
          wechat: 'url',
          dingtalk: '',
          webhook: '',
          internal: 'link'
        }
      }
    ]
  }

  // 更新默认参数映射配置
  const updateDefaultParamMappings = (mappings) => {
    defaultParamMappings.value = mappings
    
    // 实际项目中应调用API保存到后端
    ElMessage.success('默认参数映射配置已更新')
  }
  
  // 初始化数据
  const initializeData = () => {
    loadMessages()
    loadMessageTypes()
    loadChannels()
    loadSystems()
    loadTemplates()
    loadStatistics()
    loadDefaultParamMappings()
    updateUnreadCount()
  }

  return {
    messages,
    templates,
    channels,
    systems,
    messageTypes,
    loading,
    error,
    unreadCount,
    statistics,
    defaultParamMappings,
    loadMessages,
    loadMessageTypes,
    loadChannels,
    loadSystems,
    loadTemplates,
    loadStatistics,
    markAsRead,
    markAllAsRead,
    updateUnreadCount,
    getMessagesByType,
    initializeData,
    loadDefaultParamMappings,
    updateDefaultParamMappings
  }
}) 