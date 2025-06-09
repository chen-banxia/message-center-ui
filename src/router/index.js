import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import Messages from '../views/Messages.vue'
import MessageDetail from '../views/MessageDetail.vue'
import Templates from '../views/Templates.vue'
import Systems from '../views/Systems.vue'
import Channels from '../views/Channels.vue'
import Recipients from '../views/Recipients.vue'
import MessageTypes from '../views/MessageTypes.vue'
import Settings from '../views/Settings.vue'
import ParamConfig from '../views/ParamConfig.vue'
import Login from '../views/Login.vue'
import NotFound from '../views/NotFound.vue'
import ScheduledMessages from '../views/ScheduledMessages.vue'
import MessageRecords from '../views/MessageRecords.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard,
          meta: { title: '控制台', icon: 'Odometer' }
        },
        {
          path: 'messages',
          name: 'messages',
          component: Messages,
          meta: { title: '消息中心', icon: 'Message' }
        },
        {
          path: 'messages/:id',
          name: 'message-detail',
          component: MessageDetail,
          meta: { title: '消息详情', hidden: true }
        },
        {
          path: 'scheduled-messages',
          name: 'scheduled-messages',
          component: ScheduledMessages,
          meta: { title: '定时与批量发送', icon: 'Timer' }
        },
        {
          path: 'message-records',
          name: 'message-records',
          component: MessageRecords,
          meta: { title: '发送记录', icon: 'Tickets' }
        },
        {
          path: 'templates',
          name: 'templates',
          component: Templates,
          meta: { title: '消息模板', icon: 'Document' }
        },
        {
          path: 'systems',
          name: 'systems',
          component: Systems,
          meta: { title: '系统对接', icon: 'Connection' }
        },
        {
          path: 'channels',
          name: 'channels',
          component: Channels,
          meta: { title: '通知渠道', icon: 'Share' }
        },
        {
          path: 'param-config',
          name: 'param-config',
          component: ParamConfig,
          meta: { title: '标准参数', icon: 'SetUp' }
        },
        {
          path: 'recipients',
          name: 'recipients',
          component: Recipients,
          meta: { title: '接收者管理', icon: 'User' }
        },
        {
          path: 'types',
          name: 'message-types',
          component: MessageTypes,
          meta: { title: '消息类型', icon: 'Collection' }
        },
        {
          path: 'alerts',
          name: 'anomaly-alerts',
          component: () => import('../views/AnomalyAlerts.vue'),
          meta: { title: '异常预警', icon: 'Warning' }
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('../views/Statistics.vue'),
          meta: { title: '统计分析', icon: 'DataAnalysis' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: Settings,
          meta: { title: '系统设置', icon: 'Setting' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

export default router
