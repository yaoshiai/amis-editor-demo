/**
 * 模板表格渲染器
 * 基于 amis CRUD 实现的可配置表格组件
 * 支持三种预定义类型：设备台账、巡检记录、故障工单
 */

import React from 'react'
import { Renderer, RendererProps } from 'amis'
import { getTableComponentTemplate } from '../config/table-templates'

// 默认列配置，用于初始化
const DEFAULT_COLUMNS = [
  {
    name: 'id',
    label: 'ID',
    type: 'text'
  },
  {
    name: 'name',
    label: '名称',
    type: 'text'
  }
]

export interface TemplateTableProps extends RendererProps {
  /**
   * 表格类型
   */
  tableType?: 'basic' | 'paginated' | 'full-featured'

  /**
   * API 配置
   */
  api?: {
    url?: string
    method?: 'GET' | 'POST'
    data?: Record<string, any>
  }

  /**
   * CRUD 配置 (可以直接覆盖模板配置)
   */
  columns?: any[]
  filter?: any
  bulkActions?: any[]
  itemActions?: any[]
  headerToolbar?: any[]
  footerToolbar?: any[]

  /**
   * 每页显示数量
   */
  perPage?: number

  /**
   * 是否显示序号列
   */
  showIndex?: boolean

  /**
   * 表格标题
   */
  title?: string

  /**
   * 其他 CRUD 属性
   */
  [key: string]: any
}

@Renderer({
  type: 'template-table',
  autoVar: true
})
export class TemplateTableRenderer extends React.Component<TemplateTableProps> {
  constructor(props: TemplateTableProps) {
    super(props)
    console.log('TemplateTable initialized with props:', props)
  }

  render() {
    const {
      tableType = 'basic',
      api,
      columns,
      filter,
      bulkActions,
      itemActions,
      headerToolbar,
      footerToolbar,
      perPage,
      showIndex = true,
      title,
      render,
      classnames: cx,
      classPrefix: ns,
      data,
      ...rest
    } = this.props

    // 获取表格模板配置
    let templateConfig: any = {}
    try {
      const template = getTableComponentTemplate(tableType)
      templateConfig = template.config || {}
    } catch (error) {
      console.warn('Failed to get table template:', error)
    }

    // 合并配置：模板配置 + 用户自定义配置
    // 用户自定义配置优先级更高
    let finalColumns = columns
    if (!finalColumns || finalColumns.length === 0) {
      finalColumns = templateConfig.columns || DEFAULT_COLUMNS
    }

    const finalFilter = filter !== undefined ? filter : templateConfig.filter
    const finalBulkActions = bulkActions || templateConfig.bulkActions || []
    const finalItemActions = itemActions || templateConfig.itemActions || []
    const finalHeaderToolbar = headerToolbar || templateConfig.headerToolbar || []
    const finalFooterToolbar = footerToolbar || templateConfig.footerToolbar || []
    const finalPerPage = perPage !== undefined ? perPage : (templateConfig.perPage || 10)
    const finalTitle = title || templateConfig.title || '表格'

    // 如果启用了显示序号，且第一列不是序号列，则添加序号列
    let displayColumns = finalColumns
    if (showIndex && finalColumns && finalColumns.length > 0) {
      const hasIndexColumn = finalColumns.some((col: any) => col.name === 'id' || col.type === 'index')
      if (!hasIndexColumn) {
        displayColumns = [
          {
            name: 'index',
            label: '序号',
            type: 'index',
            width: 60,
            align: 'center'
          },
          ...finalColumns
        ]
      }
    }

    // 构建 CRUD schema - 只包含必要的属性
    const crudSchema: any = {
      type: 'crud',
      title: finalTitle,
      perPage: finalPerPage,
      columns: displayColumns || DEFAULT_COLUMNS,
      columnsTogglable: true,
      autoGenerateFilter: false
    }

    // 只有在有值时才添加这些属性
    if (finalFilter) crudSchema.filter = finalFilter
    if (finalBulkActions && finalBulkActions.length > 0) crudSchema.bulkActions = finalBulkActions
    if (finalItemActions && finalItemActions.length > 0) crudSchema.itemActions = finalItemActions
    if (finalHeaderToolbar && finalHeaderToolbar.length > 0) crudSchema.headerToolbar = finalHeaderToolbar
    if (finalFooterToolbar && finalFooterToolbar.length > 0) crudSchema.footerToolbar = finalFooterToolbar

    // API 配置
    if (api) {
      crudSchema.api = api
    } else {
      crudSchema.api = {
        method: 'get',
        url: '/api/table/' + tableType
      }
    }

    // 过滤掉不应该传递给 CRUD 的属性
    const safeRest = Object.keys(rest).reduce((acc: any, key) => {
      // 跳过可能导致循环的属性
      if (!['render', 'data', 'classnames', 'classPrefix', 'tableType', 'type'].includes(key)) {
        acc[key] = rest[key]
      }
      return acc
    }, {})

    console.log('TemplateTable rendering with schema:', crudSchema)

    // 使用 render 函数来渲染子 schema
    try {
      return render('nested-crud', { ...crudSchema, ...safeRest }, {
        key: `template-table-${tableType || 'basic'}-${Math.random().toString(36).substr(2, 9)}`
      }) as any
    } catch (error) {
      console.error('Failed to render CRUD:', error)
      return React.createElement('div', {
        className: 'alert alert-danger'
      }, '表格渲染失败: ' + (error as any).message)
    }
  }
}
