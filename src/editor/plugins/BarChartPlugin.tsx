/**
 * 柱状图编辑器插件
 * 基于 amis 原生 chart 组件
 */

import { registerEditorPlugin, BasePlugin } from 'amis-editor'
import { getSchemaTpl } from 'amis-editor-core'
import { chartTypeOptions, getChartComponentTemplate } from '../../config/chart-templates'
import { createChartTypeSwitcher, getChartTypeDescription } from '../../utils/chart-switcher'

class BarChartPlugin extends BasePlugin {
  rendererName = 'bar-chart'

  // 设置高优先级
  order = -100

  // 组件信息
  name = '柱状图'
  description = '柱状图图表组件'
  icon = 'fa fa-chart-bar'
  pluginIcon = 'barChartPluginIcon'
  tags = ['展示']

  // 保存 manager 引用
  manager: any = null

  constructor(manager: any) {
    super(manager)
    this.manager = manager
  }

  scaffold = {
    type: 'bar-chart',
    chartType: 'bar',
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
      backgroundColor: 'transparent'
    }
  }

  previewSchema = {
    type: 'bar-chart',
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
          type: 'bar'
        }
      ],
      backgroundColor: 'transparent'
    }
  }

  panelTitle = '柱状图配置'
  panelJustify = true

  // 添加 builderProps,实现图表类型切换逻辑
  builderProps = {
    chartType_change: createChartTypeSwitcher
  }

  panelBodyCreator = (context: any) => {
    // 保存 this 引用,因为在 onChange 中需要访问
    const manager = this.manager
    return {
      type: 'tabs',
      tabsMode: 'line',
      tabs: [
        {
          title: '快速创建',
          body: [
            {
              type: 'collapse-group',
              body: [
                {
                  type: 'input-group',
                  body: [
                    {
                      type: 'button-group-select',
                      name: 'chartType',
                      label: '图表类型',
                      size: 'md',
                      mode: 'inline',
                      options: chartTypeOptions,
                      value: 'bar',
                      description: getChartTypeDescription('bar'),
                      onChange: (value: string, oldValue: string, model: any, form: any) => {
                        console.log('BarChart type onChange triggered:', { value, oldValue })

                        if (!manager) {
                          console.error('Editor manager not available')
                          return
                        }

                        const store = manager.store
                        console.log('Store:', store)
                        console.log('Manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(manager)).filter(name => typeof manager[name] === 'function'))
                        console.log('Manager own methods:', Object.getOwnPropertyNames(manager).filter(name => typeof manager[name] === 'function'))
                        console.log('Store methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(store)).filter(name => typeof store[name] === 'function'))

                        // 获取当前选中的节点 ID
                        const activeId = store.activeId
                        console.log('Active ID:', activeId, 'type:', typeof activeId)

                        if (!activeId) {
                          console.error('No active component found')
                          return
                        }

                        // 获取当前组件的 schema
                        const schema = store.getSchema(activeId)
                        console.log('Current schema:', schema)
                        console.log('Schema $$id:', schema?.$$id, 'Schema id:', schema?.id, 'Schema type:', schema?.type)

                        if (!schema) {
                          console.error('Cannot get current schema')
                          return
                        }

                        // 获取目标模板
                        const template = getChartComponentTemplate(value)
                        console.log('Template:', template)

                        // 构建新的 schema - 完整替换为新的图表类型
                        const newSchema: any = {
                          type: template.type,
                          config: template.config,
                          // 保留布局属性
                          size: schema.size,
                          offset: schema.offset,
                          visibleOn: schema.visibleOn,
                          hiddenOn: schema.hiddenOn,
                          visible: schema.visible,
                          hidden: schema.hidden,
                          id: schema.id,
                          // 设置 chartType 字段，用于属性面板显示正确的选中状态
                          chartType: value
                        }
                        console.log('New schema:', newSchema)

                        // 使用 manager.replaceChild 来替换整个组件
                        try {
                          console.log('Attempting to replace component')

                          // 获取父节点和当前节点在父节点中的索引
                          const node = store.getNodeById(activeId)
                          console.log('Current node:', node)

                          if (!node) {
                            console.error('Cannot find node')
                            return
                          }

                          // 使用 replaceChild 替换整个节点
                          manager.replaceChild(activeId, newSchema)
                          console.log('Component replaced successfully')

                        } catch (error) {
                          console.error('Failed to replace component:', error)
                          console.error('Error details:', error.message, error.stack)
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          title: '属性',
          body: [
            {
              type: 'collapse-group',
              body: [
                {
                  title: '基础配置',
                  body: [
                    getSchemaTpl('layout:originPosition', { value: 'left-top' }),
                    getSchemaTpl('name')
                  ]
                },
                {
                  title: '图表配置',
                  body: [
                    {
                      type: 'js-editor',
                      name: 'config',
                      label: '图表配置',
                      description: '请参考 ECharts 的配置规范'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    } as any
  }
}

registerEditorPlugin(BarChartPlugin)
