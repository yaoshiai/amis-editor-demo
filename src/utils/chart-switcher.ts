/**
 * 图表组件切换工具
 * 提供统一的图表类型切换逻辑
 */

import { getChartComponentTemplate } from '../config/chart-templates'

/**
 * 创建图表类型切换处理器
 * 用于 amis-editor 的 builderProps.chartType_change
 *
 * @param value 新选择的图表类型: 'line' | 'pie' | 'bar'
 * @param context amis-editor 上下文
 * @param manager 编辑器管理器
 * @returns 切换后的完整组件 schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function createChartTypeSwitcher(value: string, context: any, _manager: any) {
  // value 是新选择的图表类型: 'line' | 'pie' | 'bar'
  const template = getChartComponentTemplate(value)

  // 获取当前组件的基础信息
  const currentSchema = context.schema

  // 构建新的组件 schema
  // 根据 user requirements:
  // - 完整替换组件 (type + config)
  // - 保留位置和大小信息
  // - 重置其他所有属性为模板默认值
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newSchema: any = {
    // 核心配置 - 使用新模板的值
    type: template.type,
    config: template.config,

    // 保留布局相关属性 (位置和大小)
    size: currentSchema.size,
    offset: currentSchema.offset,
    visibleOn: currentSchema.visibleOn,
    hiddenOn: currentSchema.hiddenOn,
    visible: currentSchema.visible,
    hidden: currentSchema.hidden,

    // 保留基础标识符
    id: currentSchema.id,

    // 其他属性全部重置为模板默认值 (不保留原有的 name, className 等)
  }

  // 如果新模板有特定的大小设置,也可以应用
  // 这里我们选择保留用户设置的大小,以便切换后保持一致的布局

  return newSchema
}

/**
 * 获取当前图表类型应该选中的值
 * 根据组件类型返回 chartType 的值
 *
 * @param rendererName 组件渲染器名称
 * @returns chartType 值
 */
export function getChartTypeValue(rendererName: string): string {
  const typeMap: Record<string, string> = {
    'line-chart': 'line',
    'pie-chart': 'pie',
    'bar-chart': 'bar',
    'template-chart': 'line' // 默认值
  }
  return typeMap[rendererName] || 'line'
}

/**
 * 获取图表类型描述文本
 * 用于显示在快速创建 tab 中
 *
 * @param chartType 图表类型
 * @returns 描述文本
 */
export function getChartTypeDescription(chartType: string): string {
  const descriptionMap: Record<string, string> = {
    line: '适用于展示负荷曲线、电压趋势等随时间变化的电力数据',
    pie: '适用于展示用电量占比、能耗分布等比例关系',
    bar: '适用于对比各变电站、各部门的用电量大小'
  }
  return descriptionMap[chartType] || '适用于展示负荷曲线、电压趋势等随时间变化的电力数据'
}
