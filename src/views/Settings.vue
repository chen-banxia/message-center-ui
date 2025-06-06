<script setup>
import { ref, onMounted } from 'vue'

// 系统配置
const systemSettings = ref({
  // 基本设置
  system: {
    name: '企业级消息中心',
    logo: '/src/assets/logo.svg',
    description: '集中管理和分发各类消息通知的平台',
    adminEmail: 'admin@example.com',
    supportPhone: '400-123-4567',
    version: '1.0.0'
  },
  
  // 消息设置
  message: {
    defaultPriority: 5,
    maxRetryTimes: 3,
    retryInterval: 60,
    expireDays: 30,
    batchSize: 100,
    enableRealtime: true
  },
  
  // 通知设置
  notification: {
    enableWebNotification: true,
    enableEmailNotification: true,
    enableSmsNotification: true,
    dailyLimit: 1000,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    enableQuietHours: false
  },
  
  // 存储设置
  storage: {
    archiveDays: 90,
    cleanupDays: 180,
    backupEnabled: true,
    backupCycle: 'weekly',
    backupTime: '03:00',
    backupRetention: 12
  },
  
  // 安全设置
  security: {
    passwordExpireDays: 90,
    maxLoginAttempts: 5,
    lockoutMinutes: 30,
    sessionTimeout: 120,
    enableTwoFactor: false,
    ipRestriction: false,
    allowedIps: ''
  }
})

// 当前激活的标签页
const activeTab = ref('basic')

// 保存设置
const saveSettings = (section) => {
  // 实际项目中应调用API保存
  ElMessage.success(`${section}设置保存成功`)
}

// 重置设置
const resetSettings = (section) => {
  ElMessageBox.confirm('确定要重置为默认设置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中应调用API重置
    ElMessage.success(`${section}设置已重置为默认值`)
  }).catch(() => {
    // 取消重置
  })
}

// 加载设置
const loadSettings = () => {
  // 实际项目中应从API获取
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="settings-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <h2 class="page-title">系统设置</h2>
      </el-col>
    </el-row>
    
    <el-card shadow="hover" class="settings-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="systemSettings.system" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="systemSettings.system.name" />
            </el-form-item>
            
            <el-form-item label="系统描述">
              <el-input v-model="systemSettings.system.description" type="textarea" :rows="2" />
            </el-form-item>
            
            <el-form-item label="管理员邮箱">
              <el-input v-model="systemSettings.system.adminEmail" />
            </el-form-item>
            
            <el-form-item label="支持电话">
              <el-input v-model="systemSettings.system.supportPhone" />
            </el-form-item>
            
            <el-form-item label="系统版本">
              <el-input v-model="systemSettings.system.version" disabled />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSettings('基本')">保存设置</el-button>
              <el-button @click="resetSettings('基本')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 消息设置 -->
        <el-tab-pane label="消息设置" name="message">
          <el-form :model="systemSettings.message" label-width="120px">
            <el-form-item label="默认优先级">
              <el-input-number v-model="systemSettings.message.defaultPriority" :min="1" :max="10" />
              <div class="form-help">数字越小优先级越高，默认为5</div>
            </el-form-item>
            
            <el-form-item label="最大重试次数">
              <el-input-number v-model="systemSettings.message.maxRetryTimes" :min="0" :max="10" />
            </el-form-item>
            
            <el-form-item label="重试间隔(秒)">
              <el-input-number v-model="systemSettings.message.retryInterval" :min="10" :max="3600" />
            </el-form-item>
            
            <el-form-item label="消息过期天数">
              <el-input-number v-model="systemSettings.message.expireDays" :min="1" :max="365" />
              <div class="form-help">消息发送后超过指定天数将被标记为过期</div>
            </el-form-item>
            
            <el-form-item label="批处理大小">
              <el-input-number v-model="systemSettings.message.batchSize" :min="10" :max="1000" />
              <div class="form-help">批量处理消息的数量</div>
            </el-form-item>
            
            <el-form-item label="实时推送">
              <el-switch v-model="systemSettings.message.enableRealtime" />
              <div class="form-help">启用后将通过WebSocket实时推送消息</div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSettings('消息')">保存设置</el-button>
              <el-button @click="resetSettings('消息')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="systemSettings.notification" label-width="120px">
            <el-form-item label="网页通知">
              <el-switch v-model="systemSettings.notification.enableWebNotification" />
              <div class="form-help">启用后将在浏览器中显示桌面通知</div>
            </el-form-item>
            
            <el-form-item label="邮件通知">
              <el-switch v-model="systemSettings.notification.enableEmailNotification" />
            </el-form-item>
            
            <el-form-item label="短信通知">
              <el-switch v-model="systemSettings.notification.enableSmsNotification" />
            </el-form-item>
            
            <el-form-item label="每日限额">
              <el-input-number v-model="systemSettings.notification.dailyLimit" :min="0" :max="10000" />
              <div class="form-help">每日最大发送通知数量，0表示不限制</div>
            </el-form-item>
            
            <el-form-item label="安静时段">
              <div class="quiet-hours-setting">
                <el-switch v-model="systemSettings.notification.enableQuietHours" />
                <el-time-picker
                  v-model="systemSettings.notification.quietHoursStart"
                  format="HH:mm"
                  placeholder="开始时间"
                  :disabled="!systemSettings.notification.enableQuietHours"
                />
                <span class="time-separator">至</span>
                <el-time-picker
                  v-model="systemSettings.notification.quietHoursEnd"
                  format="HH:mm"
                  placeholder="结束时间"
                  :disabled="!systemSettings.notification.enableQuietHours"
                />
              </div>
              <div class="form-help">在安静时段内只发送紧急通知</div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSettings('通知')">保存设置</el-button>
              <el-button @click="resetSettings('通知')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 存储设置 -->
        <el-tab-pane label="存储设置" name="storage">
          <el-form :model="systemSettings.storage" label-width="120px">
            <el-form-item label="归档天数">
              <el-input-number v-model="systemSettings.storage.archiveDays" :min="30" :max="365" />
              <div class="form-help">超过指定天数的消息将被归档</div>
            </el-form-item>
            
            <el-form-item label="清理天数">
              <el-input-number v-model="systemSettings.storage.cleanupDays" :min="90" :max="730" />
              <div class="form-help">超过指定天数的消息将被永久删除</div>
            </el-form-item>
            
            <el-form-item label="启用备份">
              <el-switch v-model="systemSettings.storage.backupEnabled" />
            </el-form-item>
            
            <el-form-item label="备份周期">
              <el-select v-model="systemSettings.storage.backupCycle" :disabled="!systemSettings.storage.backupEnabled">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="备份时间">
              <el-time-picker
                v-model="systemSettings.storage.backupTime"
                format="HH:mm"
                placeholder="备份时间"
                :disabled="!systemSettings.storage.backupEnabled"
              />
            </el-form-item>
            
            <el-form-item label="保留备份数">
              <el-input-number
                v-model="systemSettings.storage.backupRetention"
                :min="1"
                :max="100"
                :disabled="!systemSettings.storage.backupEnabled"
              />
              <div class="form-help">保留的历史备份数量</div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSettings('存储')">保存设置</el-button>
              <el-button @click="resetSettings('存储')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="systemSettings.security" label-width="120px">
            <el-form-item label="密码有效期">
              <el-input-number v-model="systemSettings.security.passwordExpireDays" :min="0" :max="365" />
              <div class="form-help">密码过期天数，0表示永不过期</div>
            </el-form-item>
            
            <el-form-item label="最大登录尝试">
              <el-input-number v-model="systemSettings.security.maxLoginAttempts" :min="3" :max="10" />
            </el-form-item>
            
            <el-form-item label="锁定时间(分钟)">
              <el-input-number v-model="systemSettings.security.lockoutMinutes" :min="5" :max="1440" />
              <div class="form-help">账号锁定后的解锁时间</div>
            </el-form-item>
            
            <el-form-item label="会话超时(分钟)">
              <el-input-number v-model="systemSettings.security.sessionTimeout" :min="10" :max="1440" />
              <div class="form-help">用户无操作后的自动登出时间</div>
            </el-form-item>
            
            <el-form-item label="双因素认证">
              <el-switch v-model="systemSettings.security.enableTwoFactor" />
              <div class="form-help">启用后用户登录需要进行双因素认证</div>
            </el-form-item>
            
            <el-form-item label="IP访问限制">
              <el-switch v-model="systemSettings.security.ipRestriction" />
            </el-form-item>
            
            <el-form-item label="允许的IP" v-if="systemSettings.security.ipRestriction">
              <el-input
                v-model="systemSettings.security.allowedIps"
                type="textarea"
                :rows="3"
                placeholder="输入允许访问的IP地址，多个IP用逗号分隔"
              />
              <div class="form-help">只有列表中的IP地址才能访问系统</div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSettings('安全')">保存设置</el-button>
              <el-button @click="resetSettings('安全')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.settings-container {
  padding-bottom: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.settings-card {
  margin-bottom: 20px;
}

.settings-card :deep(.el-card__body) {
  padding: 0;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.quiet-hours-setting {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.time-separator {
  color: #606266;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .quiet-hours-setting {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quiet-hours-setting .el-time-picker {
    width: 100%;
    margin-top: 10px;
  }
  
  .time-separator {
    display: none;
  }
}
</style> 