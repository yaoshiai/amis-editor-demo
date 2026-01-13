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

// 折线图组件模板 - 电力负荷监测
export const lineChartComponentTemplate: SimpleChartTemplate = {
  type: 'line-chart',
  name: '折线图',
  icon: 'fa fa-chart-line',
  config: {
    title: {
      text: '24小时负荷监测曲线',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      name: '时间',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '负荷 (MW)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value} MW'
      }
    },
    series: [
      {
        name: '有功功率',
        data: [320, 280, 260, 290, 380, 520, 580, 610, 590, 650, 720, 580],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#5470c6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(84, 112, 198, 0.4)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
            ]
          }
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }
    ],
    tooltip: {
      show: true,
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} MW'
    },
    legend: {
      show: true,
      orient: 'horizontal',
      left: 'center',
      top: 30
    },
    grid: {
      left: '80px',
      right: '50px',
      bottom: '60px',
      top: '80px',
      containLabel: true
    },
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000
  }
}

// 饼图组件模板 - 用电量占比分析
export const pieChartComponentTemplate: SimpleChartTemplate = {
  type: 'pie-chart',
  name: '饼图',
  icon: 'fa fa-chart-pie',
  config: {
    title: {
      text: '各部门用电量占比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    series: [
      {
        type: 'pie',
        name: '用电量',
        data: [
          { value: 24580, name: '生产车间' },
          { value: 18240, name: '办公区域' },
          { value: 12860, name: '照明系统' },
          { value: 8950, name: '空调系统' },
          { value: 6320, name: '其他设备' }
        ],
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {d}%\n{c} kWh'
        },
        labelLine: {
          length: 15,
          length2: 10
        }
      }
    ],
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} kWh ({d}%)'
    },
    legend: {
      show: true,
      orient: 'horizontal',
      left: 'center',
      top: 30
    },
    grid: {
      top: '80px'
    },
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000
  }
}

// 柱状图组件模板 - 变电站用电对比
export const barChartComponentTemplate: SimpleChartTemplate = {
  type: 'bar-chart',
  name: '柱状图',
  icon: 'fa fa-chart-bar',
  config: {
    title: {
      text: '各变电站月用电量对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    xAxis: {
      type: 'category',
      data: ['500kV站A', '500kV站B', '220kV站C', '220kV站D', '110kV站E', '110kV站F'],
      name: '变电站',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '用电量 (万kWh)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '用电量',
        data: [1245, 980, 756, 623, 485, 342],
        type: 'bar',
        barWidth: '60%',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        },
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#83bff6' },
              { offset: 1, color: '#188df0' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}万',
          color: '#666'
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ]
            }
          }
        }
      }
    ],
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}<br/>{a}: {c} 万kWh'
    },
    legend: {
      show: true,
      orient: 'horizontal',
      left: 'center',
      top: 30
    },
    grid: {
      left: '90px',
      right: '50px',
      bottom: '70px',
      top: '80px',
      containLabel: true
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
