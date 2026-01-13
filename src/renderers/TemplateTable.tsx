/**
 * 模板表格渲染器
 * 薄包装层：将 template-table 类型转发给 amis 原生的 CRUD 组件
 * 参考模板图表组件的实现方案
 */

import React from 'react'
import { Renderer, RendererProps, render } from 'amis'

@Renderer({
  type: 'template-table'
})
export class TemplateTableRenderer extends React.Component<RendererProps> {
  render() {
    const { type, tableType, ...rest } = this.props

    // 调试日志
    console.log('[TemplateTable] 渲染器被调用, props:', {
      type,
      tableType,
      api: rest.api,
      columns: rest.columns?.length
    })

    // 构建完整的 CRUD schema
    const crudSchema = {
      type: 'crud',
      // 确保 syncLocation 为 false，避免 URL 问题
      syncLocation: false,
      ...rest
    } as any

    console.log('[TemplateTable] 生成的 CRUD schema:', crudSchema)

    // 使用 amis 的 render 函数渲染，传递完整的上下文
    // 这样 CRUD 能够访问到 fetcher、isCancel 等配置
    return render(crudSchema, rest, rest.env)
  }
}
