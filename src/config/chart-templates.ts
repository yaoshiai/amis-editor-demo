/**
 * 图表模板配置
 * 用于自定义图表组件的模板选择
 */

export interface ChartTemplate {
  id: string
  name: string
  type: 'line' | 'bar' | 'pie' | 'scatter'
  category: '趋势图' | '比较图' | '占比图' | '分布图'
  description: string
  // ECharts 配置
  config: {
    series: any[]
    xAxis?: any
    yAxis?: any
    tooltip?: any
    legend?: any
    grid?: any
  }
  // API 配置
  apiConfig: {
    url: string
    method: 'GET' | 'POST'
    params?: Record<string, any>
    dataField?: string // 数据字段路径,例如: 'data.items'
  }
  // 样式配置
  styleConfig: {
    width?: string
    height?: string
    padding?: string
    backgroundColor?: string
  }
  // 自定义字段
  customFields?: Record<string, any>
}

export const chartTemplates: ChartTemplate[] = [
  // ==================== 折线图 ====================
  {
    id: 'line-basic',
    name: '基础折线图',
    type: 'line',
    category: '趋势图',
    description: '用于展示数据随时间变化的趋势',
    config: {
      series: [
        {
          type: 'line',
          name: '销售额',
          smooth: false,
          lineStyle: {
            width: 2
          }
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/line/basic',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      smooth: false,
      areaStyle: false,
      dataZoom: false
    }
  },
  {
    id: 'line-smooth',
    name: '平滑折线图',
    type: 'line',
    category: '趋势图',
    description: '使用平滑曲线展示数据变化趋势',
    config: {
      series: [
        {
          type: 'line',
          name: '访问量',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          }
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/line/smooth',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      smooth: true,
      areaStyle: true,
      dataZoom: false
    }
  },
  {
    id: 'line-multi',
    name: '多系列折线图',
    type: 'line',
    category: '趋势图',
    description: '同时展示多个指标的变化趋势',
    config: {
      series: [
        {
          type: 'line',
          name: '收入',
          smooth: true
        },
        {
          type: 'line',
          name: '支出',
          smooth: true
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/line/multi',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      smooth: true,
      areaStyle: false,
      dataZoom: true
    }
  },
  // ==================== 柱状图 ====================
  {
    id: 'bar-basic',
    name: '基础柱状图',
    type: 'bar',
    category: '比较图',
    description: '用于比较不同类别的数据大小',
    config: {
      series: [
        {
          type: 'bar',
          name: '销量',
          barWidth: '60%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          }
        }
      ],
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/bar/basic',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      stack: false,
      horizontal: false
    }
  },
  {
    id: 'bar-horizontal',
    name: '横向柱状图',
    type: 'bar',
    category: '比较图',
    description: '横向排列的柱状图,适合类别名称较长的情况',
    config: {
      series: [
        {
          type: 'bar',
          name: '数值',
          barWidth: '50%'
        }
      ],
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: []
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/bar/horizontal',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      stack: false,
      horizontal: true
    }
  },
  {
    id: 'bar-stacked',
    name: '堆叠柱状图',
    type: 'bar',
    category: '比较图',
    description: '展示总量以及各部分的构成',
    config: {
      series: [
        {
          type: 'bar',
          name: '产品A',
          stack: 'total'
        },
        {
          type: 'bar',
          name: '产品B',
          stack: 'total'
        }
      ],
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/bar/stacked',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      stack: true,
      horizontal: false
    }
  },
  // ==================== 饼图 ====================
  {
    id: 'pie-basic',
    name: '基础饼图',
    type: 'pie',
    category: '占比图',
    description: '展示各类别占总体的比例',
    config: {
      series: [
        {
          type: 'pie',
          radius: '50%',
          center: ['50%', '50%'],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        show: true,
        orient: 'vertical',
        left: 'left'
      }
    },
    apiConfig: {
      url: '/api/chart/pie/basic',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      radiusType: 'basic',
      labelPosition: 'outside'
    }
  },
  {
    id: 'pie-doughnut',
    name: '环形饼图',
    type: 'pie',
    category: '占比图',
    description: '中心为空的饼图,适合放置总计信息',
    config: {
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        show: true,
        orient: 'vertical',
        left: 'left'
      }
    },
    apiConfig: {
      url: '/api/chart/pie/doughnut',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      radiusType: 'doughnut',
      labelPosition: 'outside'
    }
  },
  {
    id: 'pie-rose',
    name: '玫瑰图',
    type: 'pie',
    category: '占比图',
    description: '半径不同的扇区,强调数据差异',
    config: {
      series: [
        {
          type: 'pie',
          radius: ['20%', '60%'],
          center: ['50%', '50%'],
          roseType: 'area',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        show: true,
        orient: 'vertical',
        left: 'left'
      }
    },
    apiConfig: {
      url: '/api/chart/pie/rose',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      radiusType: 'rose',
      labelPosition: 'outside'
    }
  },
  // ==================== 散点图 ====================
  {
    id: 'scatter-basic',
    name: '基础散点图',
    type: 'scatter',
    category: '分布图',
    description: '展示两个变量之间的相关关系',
    config: {
      series: [
        {
          type: 'scatter',
          symbolSize: 10,
          emphasis: {
            focus: 'series'
          }
        }
      ],
      xAxis: {
        type: 'value',
        scale: true
      },
      yAxis: {
        type: 'value',
        scale: true
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `X: ${params.data[0]}, Y: ${params.data[1]}`
        }
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '7%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/scatter/basic',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      symbolSize: 10,
      showRegressionLine: false
    }
  },
  {
    id: 'scatter-bubble',
    name: '气泡图',
    type: 'scatter',
    category: '分布图',
    description: '通过气泡大小展示第三个维度',
    config: {
      series: [
        {
          type: 'scatter',
          symbolSize: function (data: any[]) {
            return Math.sqrt(data[2]) * 2
          },
          emphasis: {
            focus: 'series'
          }
        }
      ],
      xAxis: {
        type: 'value',
        scale: true
      },
      yAxis: {
        type: 'value',
        scale: true
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `X: ${params.data[0]}, Y: ${params.data[1]}, Size: ${params.data[2]}`
        }
      },
      legend: {
        show: true,
        top: 10
      },
      grid: {
        left: '3%',
        right: '7%',
        bottom: '3%',
        containLabel: true
      }
    },
    apiConfig: {
      url: '/api/chart/scatter/bubble',
      method: 'GET',
      dataField: 'data'
    },
    styleConfig: {
      height: '400px'
    },
    customFields: {
      symbolSize: 'dynamic',
      showRegressionLine: false
    }
  }
]

/**
 * 根据图表类型获取模板列表
 */
export function getTemplatesByType(type: ChartTemplate['type']): ChartTemplate[] {
  return chartTemplates.filter((template) => template.type === type)
}

/**
 * 根据分类获取模板列表
 */
export function getTemplatesByCategory(category: ChartTemplate['category']): ChartTemplate[] {
  return chartTemplates.filter((template) => template.category === category)
}

/**
 * 根据模板 ID 获取模板
 */
export function getTemplateById(id: string): ChartTemplate | undefined {
  return chartTemplates.find((template) => template.id === id)
}

// ==================== 组件类型切换专用模板 ====================

/**
 * 简化的图表组件模板
 * 用于快速创建 tab 中的类型切换
 */
export interface SimpleChartTemplate {
  // 组件类型 (amis renderer type)
  type: 'line-chart' | 'pie-chart' | 'bar-chart'
  // 组件显示名称
  name: string
  // 组件图标
  icon: string
  // ECharts 配置
  config: any
}

// 折线图组件模板
export const lineChartComponentTemplate: SimpleChartTemplate = {
  type: 'line-chart',
  name: '折线图',
  icon: 'fa fa-chart-line',
  config: {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line'
      }
    ],
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    legend: {
      show: true,
      orient: 'horizontal',
      left: 'center'
    },
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000
  }
}

// 饼图组件模板
export const pieChartComponentTemplate: SimpleChartTemplate = {
  type: 'pie-chart',
  name: '饼图',
  icon: 'fa fa-chart-pie',
  config: {
    series: [
      {
        type: 'pie',
        data: [
          { value: 335, name: '直接访问' },
          { value: 310, name: '邮件营销' },
          { value: 234, name: '联盟广告' },
          { value: 135, name: '视频广告' },
          { value: 1548, name: '搜索引擎' }
        ],
        radius: '50%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    tooltip: {
      show: true,
      trigger: 'item'
    },
    legend: {
      show: true,
      orient: 'horizontal',
      left: 'center'
    },
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000
  }
}

// 柱状图组件模板
export const barChartComponentTemplate: SimpleChartTemplate = {
  type: 'bar-chart',
  name: '柱状图',
  icon: 'fa fa-chart-bar',
  config: {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ],
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    legend: {
      show: true,
      orient: 'horizontal',
      left: 'center'
    },
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000
  }
}

/**
 * 图表类型映射表 (用于组件切换)
 * key: 图表类型标识 ('line' | 'pie' | 'bar')
 * value: 组件模板
 */
export const chartComponentTemplateMap: Record<string, SimpleChartTemplate> = {
  line: lineChartComponentTemplate,
  pie: pieChartComponentTemplate,
  bar: barChartComponentTemplate
}

/**
 * 根据图表类型获取组件模板
 * @param chartType 图表类型: 'line' | 'pie' | 'bar'
 * @returns 图表组件模板
 */
export function getChartComponentTemplate(chartType: string): SimpleChartTemplate {
  const template = chartComponentTemplateMap[chartType]
  if (!template) {
    console.warn(`未找到图表类型 "${chartType}" 的组件模板,使用折线图作为默认值`)
    return lineChartComponentTemplate
  }
  return template
}

/**
 * 图表类型切换选项配置
 * 用于快速创建 tab 中的 button-group-select
 */
export const chartTypeOptions = [
  { label: '折线图', value: 'line', icon: 'fa fa-chart-line' },
  { label: '饼图', value: 'pie', icon: 'fa fa-chart-pie' },
  { label: '柱状图', value: 'bar', icon: 'fa fa-chart-bar' }
]
