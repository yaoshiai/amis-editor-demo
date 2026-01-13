/**
 * 电力图表业务配置
 * 定义电力行业相关的部门、区域、指标等配置
 */

// ============ 部门/组织架构配置 ============
export interface DepartmentConfig {
  id: string
  name: string
  level: string // 电压等级：500kV、220kV、110kV 等
  type: 'substation' | 'workshop' | 'office' | 'system'
  children?: DepartmentConfig[]
}

// 部门树形结构
export const departmentTree: DepartmentConfig[] = [
  {
    id: '500kV-root',
    name: '500kV变电站',
    level: '500kV',
    type: 'substation',
    children: [
      { id: '500kV-A', name: '500kV站A', level: '500kV', type: 'substation' },
      { id: '500kV-B', name: '500kV站B', level: '500kV', type: 'substation' }
    ]
  },
  {
    id: '220kV-root',
    name: '220kV变电站',
    level: '220kV',
    type: 'substation',
    children: [
      { id: '220kV-C', name: '220kV站C', level: '220kV', type: 'substation' },
      { id: '220kV-D', name: '220kV站D', level: '220kV', type: 'substation' }
    ]
  },
  {
    id: '110kV-root',
    name: '110kV变电站',
    level: '110kV',
    type: 'substation',
    children: [
      { id: '110kV-E', name: '110kV站E', level: '110kV', type: 'substation' },
      { id: '110kV-F', name: '110kV站F', level: '110kV', type: 'substation' }
    ]
  },
  {
    id: 'dept-root',
    name: '用电部门',
    level: 'general',
    type: 'office',
    children: [
      { id: 'dept-workshop', name: '生产车间', level: 'general', type: 'workshop' },
      { id: 'dept-office', name: '办公区域', level: 'general', type: 'office' },
      { id: 'dept-lighting', name: '照明系统', level: 'general', type: 'system' },
      { id: 'dept-hvac', name: '空调系统', level: 'general', type: 'system' },
      { id: 'dept-other', name: '其他设备', level: 'general', type: 'system' }
    ]
  }
]

// 扁平化的部门列表（用于下拉选择）
export const departmentOptions = [
  { label: '500kV站A', value: '500kV-A', level: '500kV' },
  { label: '500kV站B', value: '500kV-B', level: '500kV' },
  { label: '220kV站C', value: '220kV-C', level: '220kV' },
  { label: '220kV站D', value: '220kV-D', level: '220kV' },
  { label: '110kV站E', value: '110kV-E', level: '110kV' },
  { label: '110kV站F', value: '110kV-F', level: '110kV' },
  { label: '生产车间', value: 'dept-workshop', level: 'general' },
  { label: '办公区域', value: 'dept-office', level: 'general' },
  { label: '照明系统', value: 'dept-lighting', level: 'general' },
  { label: '空调系统', value: 'dept-hvac', level: 'general' },
  { label: '其他设备', value: 'dept-other', level: 'general' }
]

// ============ 时间维度配置 ============
export interface TimePeriodConfig {
  label: string
  value: string
  unit: string
  description: string
  dataPoints: number // 数据点数量
}

export const timePeriodOptions: TimePeriodConfig[] = [
  {
    label: '实时（秒级）',
    value: 'realtime',
    unit: 's',
    description: '每秒刷新，适用于实时监控',
    dataPoints: 60
  },
  {
    label: '5分钟',
    value: '5min',
    unit: 'min',
    description: '每5分钟一个数据点',
    dataPoints: 288 // 24小时 * 12
  },
  {
    label: '15分钟',
    value: '15min',
    unit: 'min',
    description: '每15分钟一个数据点',
    dataPoints: 96 // 24小时 * 4
  },
  {
    label: '1小时',
    value: '1hour',
    unit: 'hour',
    description: '每小时一个数据点',
    dataPoints: 24 // 24小时
  },
  {
    label: '1天',
    value: '1day',
    unit: 'day',
    description: '每天一个数据点',
    dataPoints: 30 // 30天
  },
  {
    label: '1月',
    value: '1month',
    unit: 'month',
    description: '每月一个数据点',
    dataPoints: 12 // 12个月
  }
]

// ============ 监测指标配置 ============
export interface MetricConfig {
  id: string
  name: string
  unit: string
  icon: string
  category: 'power' | 'voltage' | 'current' | 'energy'
  description: string
  color: string
  min?: number
  max?: number
  defaultFormat: string
}

export const metricOptions: MetricConfig[] = [
  {
    id: 'active-power',
    name: '有功功率',
    unit: 'MW',
    icon: 'fa fa-bolt',
    category: 'power',
    description: '实际做功的功率',
    color: '#5470c6',
    defaultFormat: '{value} MW'
  },
  {
    id: 'reactive-power',
    name: '无功功率',
    unit: 'MVar',
    icon: 'fa fa-bolt',
    category: 'power',
    description: '在电路中起交换作用的功率',
    color: '#91cc75',
    defaultFormat: '{value} MVar'
  },
  {
    id: 'voltage',
    name: '电压',
    unit: 'kV',
    icon: 'fa fa-tachometer-alt',
    category: 'voltage',
    description: '电路中的电位差',
    color: '#fac858',
    min: 0,
    max: 500,
    defaultFormat: '{value} kV'
  },
  {
    id: 'current',
    name: '电流',
    unit: 'A',
    icon: 'fa fa-plug',
    category: 'current',
    description: '单位时间内通过的电荷量',
    color: '#ee6666',
    defaultFormat: '{value} A'
  },
  {
    id: 'power-factor',
    name: '功率因数',
    unit: 'cosφ',
    icon: 'fa fa-percent',
    category: 'power',
    description: '有功功率与视在功率的比值',
    color: '#73c0de',
    min: 0,
    max: 1,
    defaultFormat: '{value}'
  },
  {
    id: 'energy',
    name: '用电量',
    unit: 'kWh',
    icon: 'fa fa-lightbulb',
    category: 'energy',
    description: '消耗的电能量',
    color: '#3ba272',
    defaultFormat: '{value} kWh'
  }
]

// ============ 告警阈值配置 ============
export interface AlarmThresholdConfig {
  id: string
  name: string
  type: 'upper' | 'lower' | 'range'
  metricId: string
  defaultThreshold?: number
  unit: string
  color: string
}

export const alarmThresholdOptions: AlarmThresholdConfig[] = [
  {
    id: 'upper-limit',
    name: '上限告警',
    type: 'upper',
    metricId: 'active-power',
    defaultThreshold: 700,
    unit: 'MW',
    color: '#ee6666'
  },
  {
    id: 'lower-limit',
    name: '下限告警',
    type: 'lower',
    metricId: 'active-power',
    defaultThreshold: 300,
    unit: 'MW',
    color: '#91cc75'
  },
  {
    id: 'voltage-high',
    name: '电压过高',
    type: 'upper',
    metricId: 'voltage',
    defaultThreshold: 235,
    unit: 'kV',
    color: '#ee6666'
  },
  {
    id: 'voltage-low',
    name: '电压过低',
    type: 'lower',
    metricId: 'voltage',
    defaultThreshold: 215,
    unit: 'kV',
    color: '#fac858'
  }
]

// ============ 刷新频率配置 ============
export interface RefreshIntervalConfig {
  label: string
  value: number // 毫秒
  description: string
}

export const refreshIntervalOptions: RefreshIntervalConfig[] = [
  { label: '不自动刷新', value: 0, description: '手动刷新数据' },
  { label: '5秒', value: 5000, description: '每5秒刷新一次' },
  { label: '10秒', value: 10000, description: '每10秒刷新一次' },
  { label: '30秒', value: 30000, description: '每30秒刷新一次' },
  { label: '1分钟', value: 60000, description: '每1分钟刷新一次' },
  { label: '5分钟', value: 300000, description: '每5分钟刷新一次' },
  { label: '15分钟', value: 900000, description: '每15分钟刷新一次' },
  { label: '30分钟', value: 1800000, description: '每30分钟刷新一次' }
]

// ============ API 接口配置模板 ============
export interface ApiConfigTemplate {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST'
  description: string
  params?: Record<string, any>
}

export const apiConfigTemplates: ApiConfigTemplate[] = [
  {
    id: 'realtime-data',
    name: '实时数据接口',
    url: '/api/power/realtime',
    method: 'GET',
    description: '获取实时监测数据',
    params: {
      deptId: '${deptId}',
      metricId: '${metricId}'
    }
  },
  {
    id: 'history-data',
    name: '历史数据接口',
    url: '/api/power/history',
    method: 'GET',
    description: '获取历史统计数据',
    params: {
      deptId: '${deptId}',
      metricId: '${metricId}',
      startTime: '${startTime}',
      endTime: '${endTime}'
    }
  },
  {
    id: 'statistics-data',
    name: '统计数据接口',
    url: '/api/power/statistics',
    method: 'POST',
    description: '获取聚合统计数据',
    params: {
      deptIds: '${deptIds}',
      metricId: '${metricId}',
      groupBy: '${groupBy}'
    }
  }
]

// ============ 辅助函数 ============

/**
 * 根据指标 ID 获取指标配置
 */
export function getMetricById(metricId: string): MetricConfig | undefined {
  return metricOptions.find(m => m.id === metricId)
}

/**
 * 根据指标 ID 获取单位
 */
export function getMetricUnit(metricId: string): string {
  const metric = getMetricById(metricId)
  return metric?.unit || ''
}

/**
 * 根据部门 ID 获取部门名称
 */
export function getDepartmentName(deptId: string): string {
  const dept = departmentOptions.find(d => d.value === deptId)
  return dept?.label || deptId
}

/**
 * 根据时间周期获取时间标签数组
 */
export function generateTimeLabels(period: string): string[] {
  const config = timePeriodOptions.find(t => t.value === period)
  if (!config) return []

  const labels: string[] = []
  const now = new Date()

  switch (period) {
    case 'realtime':
      // 60秒，每秒一个标签
      for (let i = 59; i >= 0; i--) {
        const sec = (now.getSeconds() - i + 60) % 60
        labels.push(`${sec.toString().padStart(2, '0')}s`)
      }
      break

    case '5min':
    case '15min':
    case '1hour':
      // 24小时
      for (let i = 23; i >= 0; i--) {
        const hour = (now.getHours() - i + 24) % 24
        labels.push(`${hour.toString().padStart(2, '0')}:00`)
      }
      break

    case '1day':
      // 30天
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
      }
      break

    case '1month':
      // 12个月
      for (let i = 11; i >= 0; i--) {
        const month = (now.getMonth() - i + 12) % 12
        labels.push(`${month + 1}月`)
      }
      break

    default:
      break
  }

  return labels
}
