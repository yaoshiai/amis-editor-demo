/**
 * 电力图表数据联动管理器
 * 处理配置项变更时的数据更新逻辑
 */

import {
  departmentOptions,
  timePeriodOptions,
  metricOptions,
  getMetricUnit,
  getDepartmentName,
  generateTimeLabels
} from '../config/power-chart-config'

/**
 * 根据部门ID获取饼图数据
 */
export function getPieDataByDept(deptId: string) {
  // 模拟数据：根据不同部门返回不同的用电量分布
  const deptDataMap: Record<string, any[]> = {
    '500kV-A': [
      { value: 45230, name: '1#主变' },
      { value: 38650, name: '2#主变' },
      { value: 28940, name: '母线' },
      { value: 15670, name: '无功补偿' },
      { value: 8920, name: '站用电' }
    ],
    '500kV-B': [
      { value: 42180, name: '1#主变' },
      { value: 39250, name: '2#主变' },
      { value: 27830, name: '母线' },
      { value: 13450, name: '无功补偿' },
      { value: 7680, name: '站用电' }
    ],
    '220kV-C': [
      { value: 32560, name: '1#主变' },
      { value: 28470, name: '2#主变' },
      { value: 19840, name: '出线间隔' },
      { value: 12350, name: '电容器' }
    ],
    '220kV-D': [
      { value: 31280, name: '1#主变' },
      { value: 26930, name: '2#主变' },
      { value: 18760, name: '出线间隔' },
      { value: 11230, name: '电容器' }
    ],
    '110kV-E': [
      { value: 18940, name: '主变' },
      { value: 14560, name: '进线柜' },
      { value: 9820, name: '出线柜' },
      { value: 6540, name: 'PT柜' }
    ],
    '110kV-F': [
      { value: 17250, name: '主变' },
      { value: 13280, name: '进线柜' },
      { value: 8940, name: '出线柜' },
      { value: 5670, name: 'PT柜' }
    ],
    // 用电部门数据
    'dept-workshop': [
      { value: 24580, name: '生产车间' },
      { value: 18240, name: '办公区域' },
      { value: 12860, name: '照明系统' },
      { value: 8950, name: '空调系统' },
      { value: 6320, name: '其他设备' }
    ],
    'dept-office': [
      { value: 12340, name: '办公电脑' },
      { value: 8920, name: '打印机' },
      { value: 6780, name: '空调' },
      { value: 4560, name: '照明' },
      { value: 3400, name: '其他' }
    ]
  }

  return deptDataMap[deptId] || [
    { value: 24580, name: '生产车间' },
    { value: 18240, name: '办公区域' },
    { value: 12860, name: '照明系统' },
    { value: 8950, name: '空调系统' },
    { value: 6320, name: '其他设备' }
  ]
}

/**
 * 根据统计周期获取柱状图数据
 */
export function getBarDataByPeriod(period: string) {
  // 模拟数据：根据不同统计周期返回不同的时间轴和数据
  const periodDataMap: Record<string, { labels: string[]; data: number[]; title: string }> = {
    '1day': {
      title: '24小时用电量对比',
      labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      data: [120, 98, 85, 145, 268, 389, 456, 489, 467, 523, 456, 312]
    },
    '1week': {
      title: '一周用电量对比',
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      data: [3240, 3560, 3380, 3720, 4120, 2890, 2650]
    },
    '1month': {
      title: '30天用电量对比',
      labels: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 500 + 200))
    },
    '1quarter': {
      title: '季度用电量对比',
      labels: ['1月', '2月', '3月'],
      data: [86500, 82300, 91200]
    },
    '1year': {
      title: '年度用电量对比',
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      data: [86500, 82300, 91200, 88400, 92300, 87600, 94500, 91200, 88900, 93400, 89700, 92800]
    }
  }

  return periodDataMap[period] || periodDataMap['1month']
}

/**
 * 根据指标ID获取折线图数据
 */
export function getLineDataByMetrics(metricIds: string[]) {
  // 为每个指标生成模拟数据
  const metricsData: any[] = []

  const metricDataMap: Record<string, { name: string; unit: string; data: number[]; color: string }> = {
    'active-power': {
      name: '有功功率',
      unit: 'MW',
      data: [320, 280, 260, 290, 380, 520, 580, 610, 590, 650, 720, 580],
      color: '#5470c6'
    },
    'reactive-power': {
      name: '无功功率',
      unit: 'MVar',
      data: [120, 98, 85, 105, 145, 198, 220, 231, 224, 246, 272, 220],
      color: '#91cc75'
    },
    'voltage': {
      name: '电压',
      unit: 'kV',
      data: [220, 218, 219, 221, 223, 225, 224, 223, 222, 224, 223, 221],
      color: '#fac858'
    },
    'current': {
      name: '电流',
      unit: 'A',
      data: [480, 420, 390, 435, 570, 780, 870, 915, 885, 975, 1080, 870],
      color: '#ee6666'
    },
    'power-factor': {
      name: '功率因数',
      unit: 'cosφ',
      data: [0.85, 0.83, 0.82, 0.84, 0.86, 0.88, 0.89, 0.88, 0.87, 0.86, 0.85, 0.84],
      color: '#73c0de'
    },
    'energy': {
      name: '用电量',
      unit: 'kWh',
      data: [3200, 2800, 2600, 2900, 3800, 5200, 5800, 6100, 5900, 6500, 7200, 5800],
      color: '#3ba272'
    }
  }

  metricIds.forEach(id => {
    const metricData = metricDataMap[id]
    if (metricData) {
      metricsData.push(metricData)
    }
  })

  return metricsData
}

/**
 * 更新饼图配置
 */
export function updatePieChartConfig(config: any, deptId: string) {
  const deptName = getDepartmentName(deptId)
  const pieData = getPieDataByDept(deptId)

  return {
    ...config,
    title: {
      ...config.title,
      text: deptName ? `${deptName}用电量占比` : '用电量占比'
    },
    series: [
      {
        ...config.series[0],
        data: pieData
      }
    ]
  }
}

/**
 * 更新柱状图配置
 */
export function updateBarChartConfig(config: any, period: string) {
  const barData = getBarDataByPeriod(period)
  const timeConfig = timePeriodOptions.find(t => t.value === period)

  return {
    ...config,
    title: {
      ...config.title,
      text: barData.title
    },
    xAxis: {
      ...config.xAxis,
      data: barData.labels
    },
    series: [
      {
        ...config.series[0],
        data: barData.data
      }
    ],
    tooltip: {
      ...config.tooltip,
      formatter: timeConfig?.unit === 'day'
        ? '{b}<br/>{a}: {c} kWh'
        : '{b}<br/>{a}: {c} 万kWh'
    }
  }
}

/**
 * 更新折线图配置（多指标）
 */
export function updateLineChartConfig(config: any, metricIds: string[], decimalPlaces: number = 2) {
  const metricsData = getLineDataByMetrics(metricIds)

  // 如果只选择了一个指标，使用原来的单系列格式
  if (metricsData.length === 1) {
    const metric = metricsData[0]

    return {
      ...config,
      yAxis: {
        ...config.yAxis,
        name: metric.unit,
        axisLabel: {
          formatter: (value: any) => `${Number(value).toFixed(decimalPlaces)} ${metric.unit}`
        }
      },
      series: [
        {
          ...config.series[0],
          name: metric.name,
          data: metric.data,
          itemStyle: {
            color: metric.color
          },
          lineStyle: {
            color: metric.color
          },
          areaStyle: {
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
          }
        }
      ],
      tooltip: {
        ...config.tooltip,
        formatter: `{b}<br/>{a}: {c} ${metric.unit}`
      }
    }
  }

  // 多指标格式
  return {
    ...config,
    yAxis: {
      ...config.yAxis,
      name: metricsData[0].unit,
      axisLabel: {
        formatter: (value: any) => `${Number(value).toFixed(decimalPlaces)} ${metricsData[0].unit}`
      }
    },
    series: metricsData.map(metric => ({
      name: metric.name,
      data: metric.data,
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2,
        color: metric.color
      },
      itemStyle: {
        color: metric.color
      }
    })),
    tooltip: {
      ...config.tooltip,
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${Number(param.value).toFixed(decimalPlaces)} ${metricsData.find(m => m.name === param.seriesName)?.unit || ''}<br/>`
        })
        return result
      }
    },
    legend: {
      ...config.legend,
      data: metricsData.map(m => m.name)
    }
  }
}

/**
 * 添加告警线到折线图
 */
export function addAlarmLines(config: any, alarms: any[]) {
  const alarmLines = alarms.map(alarm => ({
    yAxis: alarm.threshold,
    name: alarm.type === 'upper' ? '上限告警' : '下限告警',
    lineStyle: {
      color: alarm.type === 'upper' ? '#ee6666' : '#91cc75',
      type: 'dashed',
      width: 2
    },
    label: {
      formatter: (params: any) => `${alarm.name}: ${params.value}`
    }
  }))

  // 保留原有的平均值线
  const existingMarkLine = config.series?.[0]?.markLine?.data || []

  return {
    ...config,
    series: [
      {
        ...config.series[0],
        markLine: {
          ...config.series[0].markLine,
          data: [...existingMarkLine, ...alarmLines]
        }
      }
    ]
  }
}
