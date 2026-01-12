/**
 * 图表渲染器集合
 * 为折线图、饼图、柱状图提供独立的渲染器
 * 这些渲染器将 type 转换为 'chart'，然后使用 amis 的渲染系统
 */

import React from 'react'
import { Renderer } from 'amis'
import { render } from 'amis'

// 统一的模板图表渲染器
@Renderer({
  type: 'template-chart'
})
export class TemplateChartRenderer extends React.Component<any> {
  render() {
    const { type, ...rest } = this.props
    // 转换为原生 chart 类型并渲染
    return render({
      type: 'chart',
      ...rest
    } as any, this.props)
  }
}

// 保留原有的独立渲染器（向后兼容）
@Renderer({
  type: 'line-chart'
})
export class LineChartRenderer extends React.Component<any> {
  render() {
    const { type, ...rest } = this.props
    // 转换为原生 chart 类型并渲染
    return render({
      type: 'chart',
      ...rest
    } as any, this.props)
  }
}

@Renderer({
  type: 'pie-chart'
})
export class PieChartRenderer extends React.Component<any> {
  render() {
    const { type, ...rest } = this.props
    return render({
      type: 'chart',
      ...rest
    } as any, this.props)
  }
}

@Renderer({
  type: 'bar-chart'
})
export class BarChartRenderer extends React.Component<any> {
  render() {
    const { type, ...rest } = this.props
    return render({
      type: 'chart',
      ...rest
    } as any, this.props)
  }
}
