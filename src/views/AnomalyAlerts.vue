<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStatisticsStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'

const statisticsStore = useStatisticsStore()

// 加载状态
const loading = ref(false)

// 异常预警数据
const alerts = ref([])

// 预警规则表单
const ruleForm = reactive({
  name: '',
  metricType: 'failureRate', // 指标类型
  targetType: 'channel', // 目标类型（渠道、系统、消息类型）
  targetId: '', // 目标ID
  threshold: 5, // 阈值
  level: 'medium', // 预警级别
  notifyMethod: ['email'], // 通知方式
  description: '' // 描述
})

const ruleFormVisible = ref(false)
const isEdit = ref(false)
const currentRuleId = ref(null)

// 显示所有预警还是仅显示活跃预警
const showAllAlerts = ref(false)

// 筛选选项
const filterOptions = reactive({
  level: '',
  type: '',
  status: ''
})

// 指标类型选项
const metricTypeOptions = [
  { value: 'failureRate', label: '失败率', unit: '%' },
  { value: 'responseTime', label: '响应时间', unit: '秒' },
  { value: 'volumeGrowth', label: '消息量增长', unit: '%' },
  { value: 'unreadRate', label: '未读率', unit: '%' },
  { value: 'queueBacklog', label: '队列积压', unit: '条' }
]

// 目标类型选项
const targetTypeOptions = [
  { value: 'channel', label: '通知渠道' },
  { value: 'system', label: '系统' },
  { value: 'messageType', label: '消息类型' }
]

// 目标选项（根据目标类型动态变化）
const targetOptions = computed(() => {
  switch(ruleForm.targetType) {
    case 'channel':
      return [
        { value: 'email', label: '邮件' },
        { value: 'sms', label: '短信' },
        { value: 'wechat', label: '微信' },
        { value: 'dingtalk', label: '钉钉' },
        { value: 'internal', label: '站内信' }
      ]
    case 'system':
      return [
        { value: 'erp', label: 'ERP系统' },
        { value: 'crm', label: 'CRM系统' },
        { value: 'oa', label: 'OA系统' },
        { value: 'monitor', label: '监控平台' },
        { value: 'hr', label: '人事系统' }
      ]
    case 'messageType':
      return [
        { value: 'system', label: '系统通知' },
        { value: 'work', label: '工作提醒' },
        { value: 'alert', label: '告警信息' },
        { value: 'meeting', label: '会议通知' },
        { value: 'operation', label: '运营活动' }
      ]
    default:
      return []
  }
})

// 通知方式选项
const notifyMethodOptions = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'internal', label: '站内信' }
]

// 筛选后的预警列表
const filteredAlerts = computed(() => {
  let result = alerts.value
  
  if (!showAllAlerts.value) {
    result = result.filter(alert => alert.status === 'active')
  }
  
  if (filterOptions.level) {
    result = result.filter(alert => alert.level === filterOptions.level)
  }
  
  if (filterOptions.type) {
    result = result.filter(alert => alert.type === filterOptions.type)
  }
  
  if (filterOptions.status) {
    result = result.filter(alert => alert.status === filterOptions.status)
  }
  
  return result
})

// 根据预警级别获取状态类型
const getAlertType = (level) => {
  switch (level) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'info'
  }
}

// 加载预警数据
const loadAlerts = async () => {
  loading.value = true
  try {
    await statisticsStore.loadStatistics()
    alerts.value = statisticsStore.getAnomalyAlerts()
  } catch (error) {
    console.error('加载预警数据失败:', error)
    ElMessage.error('加载预警数据失败')
  } finally {
    loading.value = false
  }
}

// 解决预警
const resolveAlert = async (alertId) => {
  try {
    const result = await statisticsStore.updateAlertStatus(alertId, 'resolved')
    if (result) {
      ElMessage.success('预警已解决')
      loadAlerts()
    }
  } catch (error) {
    console.error('解决预警失败:', error)
    ElMessage.error('解决预警失败')
  }
}

// 忽略预警
const ignoreAlert = async (alertId) => {
  try {
    const result = await statisticsStore.updateAlertStatus(alertId, 'ignored')
    if (result) {
      ElMessage.success('预警已忽略')
      loadAlerts()
    }
  } catch (error) {
    console.error('忽略预警失败:', error)
    ElMessage.error('忽略预警失败')
  }
}

// 打开预警规则表单
const openRuleForm = (rule = null) => {
  if (rule) {
    // 编辑模式
    Object.assign(ruleForm, rule)
    isEdit.value = true
    currentRuleId.value = rule.id
  } else {
    // 新建模式
    Object.assign(ruleForm, {
      name: '',
      metricType: 'failureRate',
      targetType: 'channel',
      targetId: '',
      threshold: 5,
      level: 'medium',
      notifyMethod: ['email'],
      description: ''
    })
    isEdit.value = false
    currentRuleId.value = null
  }
  ruleFormVisible.value = true
}

// 提交预警规则表单
const submitRuleForm = async () => {
  try {
    if (isEdit.value) {
      // 更新规则
      const result = await statisticsStore.updateAlertRule(currentRuleId.value, ruleForm)
      if (result.success) {
        ElMessage.success('预警规则更新成功')
      }
    } else {
      // 新增规则
      const result = await statisticsStore.addAlertRule(ruleForm)
      if (result.success) {
        ElMessage.success('预警规则创建成功')
      }
    }
    ruleFormVisible.value = false
    loadAlerts()
  } catch (error) {
    console.error('保存预警规则失败:', error)
    ElMessage.error('保存预警规则失败')
  }
}

// 删除预警规则
const deleteRule = async (ruleId) => {
  try {
    await ElMessageBox.confirm('确定要删除该预警规则吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await statisticsStore.deleteAlertRule(ruleId)
    if (result.success) {
      ElMessage.success('预警规则删除成功')
      loadAlerts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除预警规则失败:', error)
      ElMessage.error('删除预警规则失败')
    }
  }
}

// 清空所有筛选条件
const clearFilters = () => {
  filterOptions.level = ''
  filterOptions.type = ''
  filterOptions.status = ''
}

// 初始化
onMounted(() => {
  loadAlerts()
})
</script>

<template>
  <div class="anomaly-alerts-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">异常数据预警</h2>
      </el-col>
    </el-row>
    
    <!-- 操作栏 -->
    <el-row :gutter="20" class="operation-bar">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card shadow="never">
          <div class="operation-container">
            <div class="left-operations">
              <el-button type="primary" @click="openRuleForm()" :icon="Plus">
                添加预警规则
              </el-button>
              <el-button @click="loadAlerts()" :loading="loading" :icon="Refresh">
                刷新
              </el-button>
            </div>
            <div class="filter-container">
              <el-select v-model="filterOptions.level" placeholder="预警级别" clearable>
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
              <el-select v-model="filterOptions.type" placeholder="预警类型" clearable>
                <el-option label="渠道" value="channel" />
                <el-option label="系统" value="system" />
                <el-option label="消息类型" value="messageType" />
              </el-select>
              <el-select v-model="filterOptions.status" placeholder="预警状态" clearable>
                <el-option label="活跃" value="active" />
                <el-option label="已解决" value="resolved" />
                <el-option label="已忽略" value="ignored" />
              </el-select>
              <el-button @click="clearFilters()" :icon="Delete">清空</el-button>
              <el-switch
                v-model="showAllAlerts"
                active-text="显示所有预警"
                inactive-text="仅显示活跃预警"
                class="show-all-switch"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 预警列表 -->
    <el-row :gutter="20" class="alert-list">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card shadow="hover" v-if="loading">
          <div class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
        </el-card>
        
        <template v-else>
          <el-empty description="暂无预警数据" v-if="filteredAlerts.length === 0" />
          
          <el-card 
            v-for="alert in filteredAlerts" 
            :key="alert.id" 
            shadow="hover" 
            class="alert-card"
            :class="{ 'alert-resolved': alert.status === 'resolved', 'alert-ignored': alert.status === 'ignored' }"
          >
            <div class="alert-header">
              <div class="alert-title">
                <el-tag :type="getAlertType(alert.level)" effect="dark" size="small" class="alert-level-tag">
                  {{ alert.level === 'high' ? '高' : alert.level === 'medium' ? '中' : '低' }}
                </el-tag>
                <span>{{ alert.title }}</span>
              </div>
              <div class="alert-status">
                <el-tag 
                  :type="alert.status === 'active' ? 'danger' : alert.status === 'resolved' ? 'success' : 'info'"
                  size="small"
                >
                  {{ alert.status === 'active' ? '活跃' : alert.status === 'resolved' ? '已解决' : '已忽略' }}
                </el-tag>
              </div>
            </div>
            
            <div class="alert-content">
              <p class="alert-description">{{ alert.description }}</p>
              <div class="alert-meta">
                <div class="alert-type">
                  <span class="meta-label">类型：</span>
                  <el-tag size="small">
                    {{ alert.type === 'channel' ? '渠道' : alert.type === 'system' ? '系统' : '消息类型' }}
                  </el-tag>
                </div>
                <div class="alert-metric">
                  <span class="meta-label">指标：</span>
                  <span>
                    {{ 
                      alert.metric === 'failureRate' ? '失败率' : 
                      alert.metric === 'responseTime' ? '响应时间' : 
                      alert.metric === 'volumeGrowth' ? '消息量增长' : 
                      alert.metric === 'unreadRate' ? '未读率' : 
                      '队列积压'
                    }}
                  </span>
                </div>
                <div class="alert-value">
                  <span class="meta-label">当前值：</span>
                  <span class="value-text">{{ alert.value }}</span>
                  <span class="unit-text">
                    {{ 
                      alert.metric === 'failureRate' || alert.metric === 'volumeGrowth' || alert.metric === 'unreadRate' ? '%' : 
                      alert.metric === 'responseTime' ? '秒' : 
                      '条'
                    }}
                  </span>
                </div>
                <div class="alert-threshold">
                  <span class="meta-label">阈值：</span>
                  <span>{{ alert.threshold }}
                    {{ 
                      alert.metric === 'failureRate' || alert.metric === 'volumeGrowth' || alert.metric === 'unreadRate' ? '%' : 
                      alert.metric === 'responseTime' ? '秒' : 
                      '条'
                    }}
                  </span>
                </div>
                <div class="alert-time">
                  <span class="meta-label">时间：</span>
                  <span>{{ alert.timestamp }}</span>
                </div>
              </div>
            </div>
            
            <div class="alert-actions" v-if="alert.status === 'active'">
              <el-button type="success" size="small" @click="resolveAlert(alert.id)">解决</el-button>
              <el-button type="info" size="small" @click="ignoreAlert(alert.id)">忽略</el-button>
            </div>
          </el-card>
        </template>
      </el-col>
    </el-row>
    
    <!-- 预警规则表单对话框 -->
    <el-dialog
      v-model="ruleFormVisible"
      :title="isEdit ? '编辑预警规则' : '添加预警规则'"
      width="550px"
    >
      <el-form :model="ruleForm" label-width="100px" label-position="right">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        
        <el-form-item label="指标类型">
          <el-select v-model="ruleForm.metricType" placeholder="请选择指标类型" class="full-width">
            <el-option
              v-for="option in metricTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <span>{{ option.label }}</span>
              <span class="option-unit">({{ option.unit }})</span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标类型">
          <el-select v-model="ruleForm.targetType" placeholder="请选择目标类型" class="full-width">
            <el-option
              v-for="option in targetTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="监控目标">
          <el-select v-model="ruleForm.targetId" placeholder="请选择监控目标" class="full-width">
            <el-option
              v-for="option in targetOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预警阈值">
          <el-input-number
            v-model="ruleForm.threshold"
            :min="0"
            :precision="2"
            :step="0.5"
            class="full-width"
          />
        </el-form-item>
        
        <el-form-item label="预警级别">
          <el-radio-group v-model="ruleForm.level">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="ruleForm.notifyMethod">
            <el-checkbox v-for="option in notifyMethodOptions" :key="option.value" :label="option.value">
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="规则描述">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ruleFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRuleForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.anomaly-alerts-container {
  padding-bottom: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.operation-bar {
  margin-bottom: 20px;
}

.operation-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.left-operations {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.filter-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.show-all-switch {
  margin-left: 10px;
}

.alert-list {
  margin-top: 20px;
}

.alert-card {
  margin-bottom: 15px;
}

.alert-resolved {
  opacity: 0.7;
}

.alert-ignored {
  opacity: 0.6;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.alert-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.alert-level-tag {
  margin-right: 10px;
}

.alert-description {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
}

.alert-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  color: #909399;
  font-size: 14px;
}

.meta-label {
  font-weight: 600;
  margin-right: 5px;
}

.value-text {
  font-weight: 600;
  color: #F56C6C;
}

.alert-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.full-width {
  width: 100%;
}

.option-unit {
  color: #909399;
  margin-left: 5px;
}

@media (max-width: 768px) {
  .operation-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-container {
    margin-top: 10px;
    width: 100%;
  }
  
  .alert-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 