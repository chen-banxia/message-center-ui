import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useSystemStore = defineStore('system', () => {
  // 状态
  const systems = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 模拟的系统对接数据
  const mockSystems = [
    { id: 1, name: 'ERP系统', description: '企业资源计划系统', status: 'enabled' },
    { id: 2, name: 'CRM系统', description: '客户关系管理系统', status: 'enabled' },
    { id: 3, name: 'OA系统', description: '办公自动化系统', status: 'enabled' },
    { id: 4, name: '监控平台', description: '服务器监控平台', status: 'enabled' },
    { id: 5, name: '人事系统', description: '人力资源管理系统', status: 'disabled' }
  ]

  // 加载系统对接
  const loadSystems = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      systems.value = mockSystems
      loading.value = false
    }, 300)
    
    // 实际项目中应使用axios请求
    // axios.get('/api/systems')
    //   .then(response => {
    //     systems.value = response.data
    //   })
    //   .catch(err => {
    //     error.value = err.message
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  // 根据ID获取系统
  const getSystemById = (id) => {
    return systems.value.find(system => system.id === id)
  }

  // 获取启用的系统
  const getEnabledSystems = () => {
    return systems.value.filter(system => system.status === 'enabled')
  }

  // 添加系统
  const addSystem = (system) => {
    // 生成新ID（实际项目中应由后端生成）
    const newId = Math.max(...systems.value.map(s => s.id)) + 1
    
    const newSystem = {
      ...system,
      id: newId,
      status: system.status || 'enabled'
    }
    
    systems.value.push(newSystem)
    ElMessage.success('系统添加成功')
    return newSystem
  }

  // 更新系统
  const updateSystem = (id, updatedSystem) => {
    const index = systems.value.findIndex(system => system.id === id)
    
    if (index !== -1) {
      systems.value[index] = {
        ...systems.value[index],
        ...updatedSystem
      }
      ElMessage.success('系统更新成功')
      return true
    }
    
    ElMessage.error('未找到要更新的系统')
    return false
  }

  // 删除系统
  const deleteSystem = (id) => {
    const index = systems.value.findIndex(system => system.id === id)
    
    if (index !== -1) {
      systems.value.splice(index, 1)
      ElMessage.success('系统删除成功')
      return true
    }
    
    ElMessage.error('未找到要删除的系统')
    return false
  }

  // 启用系统
  const enableSystem = (id) => {
    const system = getSystemById(id)
    
    if (system) {
      system.status = 'enabled'
      ElMessage.success(`${system.name} 已启用`)
      return true
    }
    
    ElMessage.error('未找到要启用的系统')
    return false
  }

  // 禁用系统
  const disableSystem = (id) => {
    const system = getSystemById(id)
    
    if (system) {
      system.status = 'disabled'
      ElMessage.success(`${system.name} 已禁用`)
      return true
    }
    
    ElMessage.error('未找到要禁用的系统')
    return false
  }

  return {
    systems,
    loading,
    error,
    loadSystems,
    getSystemById,
    getEnabledSystems,
    addSystem,
    updateSystem,
    deleteSystem,
    enableSystem,
    disableSystem
  }
}) 