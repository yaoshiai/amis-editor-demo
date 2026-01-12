/**
 * 模板图表渲染器
 * 独立的渲染器,复用 amis 原生 chart 的渲染逻辑
 */

import React from 'react'
import { Renderer, RendererProps } from 'amis'

// 模板图表组件实际上复用原生 chart 渲染器
// 这里只是一个标识,实际渲染由 amis 内部的 chart renderer 处理
@Renderer({
  type: 'template-chart',
  alias: ['template-chart', 'chart-template']
})
export class TemplateChartRenderer extends React.Component<RendererProps> {
  render() {
    // 将 type 改为 'chart',让 amis 原生渲染器处理
    const { type, ...rest } = this.props

    // 渲染一个原生 chart 组件
    return (
      <div className="template-chart-wrapper">
        {React.createElement('div', {
          ...rest,
          type: 'chart'
        } as any)}
      </div>
    )
  }
}
