/**
 * Mock API 服务
 * 用于演示图表自动刷新功能和表格数据
 */

import axios from 'axios'
import {
  getPieDataByDept,
  getBarDataByPeriod,
  getLineDataByMetrics
} from '../utils/chart-data-manager'

// 存储 API 响应的延迟（模拟网络延迟）
const API_DELAY = 300

/**
 * 生成带随机波动的数据
 * 用于模拟实时数据变化
 */
function addFluctuation(value: number, rate: number = 0.1): number {
  const fluctuation = 1 + (Math.random() * rate * 2 - rate)
  return typeof value === 'number'
    ? Number((value * fluctuation).toFixed(2))
    : value
}

/**
 * 模拟饼图数据 API
 */
function mockPieAPI(params: any): Promise<any> {
  const { deptId } = params

  return new Promise((resolve) => {
    setTimeout(() => {
      const pieData = getPieDataByDept(deptId || 'dept-workshop')

      // 为数据添加随机波动，模拟实时变化
      const fluctuatedData = pieData.map(item => ({
        ...item,
        value: Math.floor(item.value * (0.9 + Math.random() * 0.2)) // ±10% 波动
      }))

      resolve({
        status: 0,
        msg: '',
        data: {
          series: [{
            data: fluctuatedData
          }]
        }
      })
    }, API_DELAY)
  })
}

/**
 * 模拟柱状图数据 API
 */
function mockBarAPI(params: any): Promise<any> {
  const { timePeriod } = params

  return new Promise((resolve) => {
    setTimeout(() => {
      const barData = getBarDataByPeriod(timePeriod || '1day')

      // 为数据添加随机波动
      const fluctuatedData = barData.data.map((value: number) =>
        Math.floor(value * (0.9 + Math.random() * 0.2))
      )

      resolve({
        status: 0,
        msg: '',
        data: {
          series: [{
            data: fluctuatedData
          }],
          xAxis: {
            data: barData.labels
          },
          title: {
            text: barData.title
          }
        }
      })
    }, API_DELAY)
  })
}

/**
 * 模拟折线图数据 API
 */
function mockLineAPI(params: any): Promise<any> {
  const { metrics } = params
  const metricIds = typeof metrics === 'string' ? metrics.split(',') : (metrics || ['active-power'])

  return new Promise((resolve) => {
    setTimeout(() => {
      const lineData = getLineDataByMetrics(metricIds)

      if (lineData.length === 0) {
        resolve({
          status: 0,
          msg: '',
          data: {
            series: []
          }
        })
        return
      }

      // 为每个指标的数据添加随机波动
      const fluctuatedSeries = lineData.map(metric => ({
        name: metric.name,
        data: metric.data.map((value: number) => addFluctuation(value, 0.08)), // ±8% 波动
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
          color: metric.color
        },
        itemStyle: {
          color: metric.color
        },
        areaStyle: metric.data.length > 0 ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${metric.color}66` },
              { offset: 1, color: `${metric.color}11` }
            ]
          }
        } : undefined
      }))

      resolve({
        status: 0,
        msg: '',
        data: {
          series: fluctuatedSeries
        }
      })
    }, API_DELAY)
  })
}

/**
 * 统一的 mock API 处理函数
 */
export function mockChartAPI(params: any): Promise<any> {
  const { chartType } = params

  console.log('[Mock API] 收到请求:', params)

  switch (chartType) {
    case 'pie':
      return mockPieAPI(params)
    case 'bar':
      return mockBarAPI(params)
    case 'line':
      return mockLineAPI(params)
    default:
      return Promise.resolve({
        status: 1,
        msg: `未知的图表类型: ${chartType}`
      })
  }
}

// 标记是否已设置拦截器，避免重复设置
let isInterceptorSetup = false

/**
 * 设置 mock API 拦截器（使用 axios 拦截器）
 */
export function setupMockAPI() {
  if (typeof window === 'undefined') {
    return
  }

  // 避免重复设置
  if (isInterceptorSetup) {
    console.log('[Mock API] 拦截器已设置，跳过重复初始化')
    return
  }
  isInterceptorSetup = true

  console.log('[Mock API] 启动模拟数据服务（axios 拦截器模式）...')

  // 保存原始的 adapter
  const originalAdapter = axios.defaults.adapter

  // 使用自定义 adapter 来拦截请求
  axios.defaults.adapter = async (config) => {
    const url = config.url || ''
    
    // 检查是否是需要 mock 的 API
    if (url.includes('/api/table/') || url.includes('/api/mock/chart')) {
      console.log('[Mock API] ✅ 拦截到请求:', url)
      
      // 解析请求参数
      const params: Record<string, string> = {}
      
      // 从 config.params 获取参数
      if (config.params) {
        Object.keys(config.params).forEach(key => {
          params[key] = config.params[key]
        })
      }
      
      // 解析 URL 中的查询参数
      try {
        const urlObj = new URL(url, window.location.origin)
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value
        })
      } catch (e) {
        // URL 解析失败，忽略
      }

      // POST 请求的 body 数据
      if (config.data) {
        try {
          const bodyData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          Object.assign(params, bodyData)
        } catch (e) {
          // 解析失败，忽略
        }
      }

      console.log('[Mock API] 解析后的参数:', params)

      let mockData: unknown

      // 根据 URL 调用对应的 mock API
      if (url.includes('/api/table/')) {
        mockData = await mockTableAPI(url, params)
      } else if (url.includes('/api/mock/chart')) {
        mockData = await mockChartAPI(params)
      }

      if (mockData) {
        console.log('[Mock API] ✅ 返回 mock 数据:', mockData)
        // 返回模拟的响应
        return {
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {
            'content-type': 'application/json'
          },
          config: config
        }
      }
    }

    // 其他请求使用原始 adapter
    if (originalAdapter && typeof originalAdapter === 'function') {
      return originalAdapter(config)
    }
    
    // fallback: 使用 fetch
    const response = await fetch(config.url || '', {
      method: config.method?.toUpperCase() || 'GET',
      headers: config.headers as HeadersInit,
      body: config.data
    })
    
    return {
      data: await response.json().catch(() => response.text()),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config: config
    }
  }

  console.log('[Mock API] ✅ axios adapter 已设置')
  console.log('[Mock API] 📊 图表请求格式: /api/mock/chart?chartType=pie&deptId=500kV-A')
  console.log('[Mock API] 📋 表格请求格式: /api/table/basic, /api/table/paginated, /api/table/full-featured')
  console.log('[Mock API] ✨ 支持的图表类型: line, pie, bar')
  console.log('[Mock API] ✨ 支持的表格类型: basic, paginated, full-featured')
}

/**
 * 创建用于 dataFilter 的数据处理函数
 * 将 mock API 返回的数据转换为 ECharts 配置
 */
export const chartDataFilter = `
// Mock API 数据处理函数
// 将 API 返回的数据映射到图表配置

if (!data || data.status !== 0) {
  return config
}

const apiData = data.data

// 更新系列数据
if (apiData.series && apiData.series.length > 0) {
  const newSeries = apiData.series.map((s: any, index: number) => {
    const existingSeries = config.series[index] || {}

    return {
      ...existingSeries,
      ...s,
      // 保留原有的样式配置
      itemStyle: existingSeries.itemStyle || s.itemStyle,
      lineStyle: existingSeries.lineStyle || s.lineStyle,
      areaStyle: existingSeries.areaStyle || s.areaStyle
    }
  })

  config = {
    ...config,
    series: newSeries
  }
}

// 更新 X 轴数据（如果存在）
if (apiData.xAxis && apiData.xAxis.data) {
  config = {
    ...config,
    xAxis: {
      ...config.xAxis,
      data: apiData.xAxis.data
    }
  }
}

// 更新标题（如果存在）
if (apiData.title && apiData.title.text) {
  config = {
    ...config,
    title: {
      ...config.title,
      text: apiData.title.text
    }
  }
}

return config
`

// ==================== 表格 Mock API ====================

/**
 * 模拟设备台账数据
 */
function mockDeviceTableAPI(params: any): Promise<any> {
  const { page = 1, perPage = 10 } = params

  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        status: 0,
        msg: '',
        data: {
          items: Array.from({ length: perPage }, (_, i) => ({
            id: (page - 1) * perPage + i + 1,
            deviceName: `变压器-${String((page - 1) * perPage + i + 1).padStart(3, '0')}`,
            deviceType: ['变压器', '断路器', '隔离开关', '互感器'][Math.floor(Math.random() * 4)],
            model: ['S11-M-400/10', 'S11-M-630/10', 'S11-M-800/10'][Math.floor(Math.random() * 3)],
            manufacturer: ['某某电气', '某某电力设备', '某某变压器厂'][Math.floor(Math.random() * 3)],
            installDate: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            status: String(Math.floor(Math.random() * 3) - 1) // -1: 故障, 0: 停机, 1: 运行中
          })),
          total: 100
        }
      }
      resolve(mockData)
    }, API_DELAY)
  })
}

/**
 * 模拟巡检记录数据
 */
function mockInspectionTableAPI(params: any): Promise<any> {
  const { page = 1, perPage = 10 } = params

  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        status: 0,
        msg: '',
        data: {
          items: Array.from({ length: perPage }, (_, i) => ({
            id: (page - 1) * perPage + i + 1,
            inspectionDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            inspector: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
            deviceName: `设备-${String((page - 1) * perPage + i + 1).padStart(3, '0')}`,
            inspectionType: ['routine', 'special', 'emergency'][Math.floor(Math.random() * 3)],
            result: ['normal', 'abnormal', 'fault'][Math.floor(Math.random() * 3)],
            remark: Math.random() > 0.7 ? '发现轻微异常，需关注' : '设备运行正常'
          })),
          total: 150
        }
      }
      resolve(mockData)
    }, API_DELAY)
  })
}

/**
 * 模拟故障工单数据
 */
function mockFaultTableAPI(params: any): Promise<any> {
  const { page = 1, perPage = 10 } = params

  return new Promise((resolve) => {
    setTimeout(() => {
      const faultTypes = ['electrical', 'mechanical', 'thermal', 'control', 'other']
      const faultLevels = ['critical', 'major', 'minor']
      const statuses = ['pending', 'processing', 'completed', 'closed']

      const mockData = {
        status: 0,
        msg: '',
        data: {
          items: Array.from({ length: perPage }, (_, i) => {
            const faultDate = new Date()
            faultDate.setDate(faultDate.getDate() - Math.floor(Math.random() * 30))

            return {
              id: `WO${String((page - 1) * perPage + i + 1).padStart(6, '0')}`,
              faultDate: faultDate.toISOString().slice(0, 16).replace('T', ' '),
              deviceName: `设备-${String((page - 1) * perPage + i + 1).padStart(3, '0')}`,
              faultType: faultTypes[Math.floor(Math.random() * faultTypes.length)],
              faultLevel: faultLevels[Math.floor(Math.random() * faultLevels.length)],
              reporter: ['张三', '李四', '王五'][Math.floor(Math.random() * 3)],
              handler: ['赵六', '钱七', '孙八'][Math.floor(Math.random() * 3)],
              status: statuses[Math.floor(Math.random() * statuses.length)],
              faultDescription: ['设备过热', '绝缘异常', '接触不良', '参数超标'][Math.floor(Math.random() * 4)]
            }
          }),
          total: 200
        }
      }
      resolve(mockData)
    }, API_DELAY)
  })
}

/**
 * 统一的表格 mock API 处理函数
 */
export function mockTableAPI(url: string, params: any): Promise<any> {
  console.log('[Mock Table API] 收到请求:', url, params)

  // 根据 URL 判断表格类型
  if (url.includes('/api/table/basic')) {
    return mockDeviceTableAPI(params)
  } else if (url.includes('/api/table/paginated')) {
    return mockInspectionTableAPI(params)
  } else if (url.includes('/api/table/full-featured')) {
    return mockFaultTableAPI(params)
  } else {
    return Promise.resolve({
      status: 1,
      msg: `未知的表格类型: ${url}`
    })
  }
}
