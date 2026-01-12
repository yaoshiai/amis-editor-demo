/**
 * 自定义图表渲染器
 * 基于 ECharts 实现的可配置图表组件
 */

import React from 'react'
import { Renderer, RendererProps } from 'amis'
import { getTemplateById } from '../config/chart-templates'
import axios from 'axios'

// ECharts 类型定义
interface EChartsOption {
  series?: any[]
  xAxis?: any
  yAxis?: any
  tooltip?: any
  legend?: any
  grid?: any
  dataset?: any
  color?: string[]
  [key: string]: any
}

export interface ChartRendererProps extends RendererProps {
  /**
   * 图表类型
   */
  chartType?: 'line' | 'bar' | 'pie' | 'scatter'

  /**
   * 模板 ID
   */
  templateId?: string

  /**
   * API 配置
   */
  apiConfig?: {
    url: string
    method: 'GET' | 'POST'
    params?: Record<string, any>
    dataField?: string
    headers?: Record<string, string>
  }

  /**
   * ECharts 配置
   */
  config?: Partial<EChartsOption>

  /**
   * 样式配置
   */
  styleConfig?: {
    width?: string
    height?: string
    padding?: string
    backgroundColor?: string
  }

  /**
   * 自定义字段
   */
  customFields?: Record<string, any>

  /**
   * 是否显示加载状态
   */
  showLoading?: boolean

  /**
   * 加载提示文本
   */
  loadingText?: string
}

interface ChartRendererState {
  loading: boolean
  error: string | null
  chartData: any
  option: EChartsOption
}

// 装饰器需要在类定义之后应用
@Renderer({
  test: /\bchart$/,
  name: 'chart'
})
export class ChartRenderer extends React.Component<ChartRendererProps, ChartRendererState> {
  chartRef: React.RefObject<HTMLDivElement>
  echartsInstance: any = null
  resizeObserver: ResizeObserver | null = null

  static defaultProps: Partial<ChartRendererProps> = {
    chartType: 'line',
    templateId: 'line-basic',
    showLoading: true,
    loadingText: '加载中...'
  }

  constructor(props: ChartRendererProps) {
    super(props)

    this.state = {
      loading: false,
      error: null,
      chartData: null,
      option: {}
    }

    this.chartRef = React.createRef<HTMLDivElement>()
  }

  componentDidMount() {
    this.initChart()

    // 设置 ResizeObserver 监听容器大小变化
    if (this.chartRef.current && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.echartsInstance) {
          this.echartsInstance.resize()
        }
      })
      this.resizeObserver.observe(this.chartRef.current)
    }
  }

  componentDidUpdate(prevProps: ChartRendererProps) {
    // 当关键 props 变化时重新渲染
    if (
      prevProps.templateId !== this.props.templateId ||
      prevProps.chartType !== this.props.chartType ||
      prevProps.apiConfig?.url !== this.props.apiConfig?.url
    ) {
      this.initChart()
    }
  }

  componentWillUnmount() {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }

    // 销毁 ECharts 实例
    if (this.echartsInstance) {
      this.echartsInstance.dispose()
      this.echartsInstance = null
    }
  }

  /**
   * 初始化图表
   */
  async initChart() {
    const { templateId, apiConfig } = this.props

    // 获取模板配置
    const template = templateId ? getTemplateById(templateId) : null
    if (!template) {
      this.setState({
        error: `未找到模板: ${templateId}`,
        loading: false
      })
      return
    }

    // 设置初始配置
    this.setState({
      option: template.config,
      error: null
    })

    // 如果配置了 API,则加载数据
    if (apiConfig?.url) {
      await this.fetchData(apiConfig)
    } else {
      // 否则使用模板中的静态数据
      this.setState({
        chartData: null,
        loading: false
      })
    }

    // 渲染图表
    this.renderChart()
  }

  /**
   * 从 API 加载数据
   */
  async fetchData(apiConfig: ChartRendererProps['apiConfig']) {
    if (!apiConfig) return

    this.setState({ loading: true, error: null })

    try {
      const response = await axios({
        method: apiConfig.method || 'GET',
        url: apiConfig.url,
        params: apiConfig.params,
        headers: apiConfig.headers
      })

      // 提取数据字段
      let data = response.data
      if (apiConfig.dataField) {
        const fields = apiConfig.dataField.split('.')
        for (const field of fields) {
          if (data && typeof data === 'object') {
            data = data[field]
          } else {
            break
          }
        }
      }

      this.setState({
        chartData: data,
        loading: false
      })
    } catch (error: any) {
      console.error('图表数据加载失败:', error)
      this.setState({
        error: error.message || '数据加载失败',
        loading: false
      })
    }
  }

  /**
   * 渲染图表到 DOM
   */
  renderChart() {
    if (!this.chartRef.current) {
      return
    }

    // 动态导入 echarts
    import('echarts').then((echarts) => {
      // 如果已存在实例,先销毁
      if (this.echartsInstance) {
        this.echartsInstance.dispose()
      }

      // 创建新实例
      this.echartsInstance = echarts.init(this.chartRef.current!)

      // 合并配置和数据
      const option = this.buildOption()

      // 设置配置
      this.echartsInstance.setOption(option, true)

      // 绑定事件
      this.bindChartEvents()
    })
  }

  /**
   * 构建 ECharts 配置
   */
  buildOption(): EChartsOption {
    const { config, customFields, templateId } = this.props
    const { chartData } = this.state

    // 获取模板配置
    const template = templateId ? getTemplateById(templateId) : null
    const baseConfig = template?.config || {}

    // 合并配置
    let option: EChartsOption = {
      ...baseConfig,
      ...config
    }

    // 如果有数据,应用到配置中
    if (chartData) {
      option = this.applyDataToOption(option, chartData)
    }

    // 应用自定义字段
    if (customFields) {
      option = {
        ...option,
        ...customFields
      }
    }

    return option
  }

  /**
   * 将数据应用到 ECharts 配置
   */
  applyDataToOption(option: EChartsOption, data: any): EChartsOption {
    // 如果数据是数组格式,直接应用
    if (Array.isArray(data)) {
      // 根据图表类型应用数据
      const chartType = this.props.chartType || 'line'

      if (chartType === 'pie') {
        // 饼图数据格式
        option.series = option.series?.map((series: any) => ({
          ...series,
          data: data
        }))
      } else {
        // 其他图表类型,尝试从数据对象中提取
        const dataObj = data as any
        if (dataObj.xAxis && option.xAxis) {
          option.xAxis = {
            ...option.xAxis,
            data: dataObj.xAxis
          }
        }
        if (dataObj.series && option.series) {
          option.series = option.series.map((series: any, index: number) => ({
            ...series,
            data: dataObj.series[index]?.data || []
          }))
        }
      }
    } else if (typeof data === 'object' && data !== null) {
      // 对象格式,直接合并
      option = {
        ...option,
        ...data
      }
    }

    return option
  }

  /**
   * 绑定图表事件
   */
  bindChartEvents() {
    if (!this.echartsInstance) return

    // 点击事件
    this.echartsInstance.on('click', (params: any) => {
      const dispatchEvent = this.props.dispatchEvent
      if (dispatchEvent) {
        dispatchEvent('click', {
          componentType: params.componentType,
          seriesType: params.seriesType,
          seriesName: params.seriesName,
          name: params.name,
          value: params.value,
          data: params.data
        })
      }
    })

    // 鼠标悬停事件
    this.echartsInstance.on('mouseover', (params: any) => {
      const dispatchEvent = this.props.dispatchEvent
      if (dispatchEvent) {
        dispatchEvent('mouseover', {
          componentType: params.componentType,
          seriesType: params.seriesType,
          name: params.name,
          value: params.value
        })
      }
    })
  }

  render() {
    const { styleConfig, loadingText, showLoading } = this.props
    const { loading, error } = this.state

    // 构建容器样式
    const containerStyle: React.CSSProperties = {
      width: styleConfig?.width || '100%',
      height: styleConfig?.height || '400px',
      padding: styleConfig?.padding || '0',
      backgroundColor: styleConfig?.backgroundColor || 'transparent',
      position: 'relative'
    }

    return (
      <div style={containerStyle}>
        {/* 图表容器 */}
        <div
          ref={this.chartRef}
          style={{
            width: '100%',
            height: '100%'
          }}
        />

        {/* 加载状态 */}
        {loading && showLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 10
            }}
          >
            <div>
              <div
                className="spinner"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 10px'
                }}
              />
              <div style={{ textAlign: 'center', color: '#666' }}>
                {loadingText || '加载中...'}
              </div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10
            }}
          >
            <div style={{ color: '#e74c3c', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* 旋转动画样式 */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
}
