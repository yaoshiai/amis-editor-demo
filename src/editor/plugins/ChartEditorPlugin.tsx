/**
 * 自定义图表编辑器插件
 * 扩展 amis 原生 chart 组件,添加"类型" tab
 */

import { registerEditorPlugin, BasePlugin } from 'amis-editor'
import { chartTemplates, getTemplatesByType } from '../../config/chart-templates'

class ChartEditorPlugin extends BasePlugin {
  // 关键配置: 覆盖原生 chart 组件
  rendererName = 'chart'

  // 设置高优先级,确保覆盖原生插件
  order = -100

  // 组件信息
  name = '自定义图表'
  description = '支持多种图表类型的可视化组件'
  icon = 'fa fa-chart-line'
  pluginIcon = 'chartPluginIcon'
  tags = ['展示']
  scaffold = {
    type: 'chart',
    chartType: 'line',
    templateId: 'line-basic'
  }
  previewSchema = {
    type: 'chart',
    chartType: 'line',
    templateId: 'line-basic'
  }

  // 面板配置 - 添加"类型" tab
  panelTitle = '图表配置'
  panelBody = [
    {
      type: 'tabs',
      tabsMode: 'line',
      className: 'm-t-n-xs',
      contentClassName: 'no-border p-l-none p-r-none',
      tabs: [
        {
          title: '类型',
          className: 'p-lg',
          body: [
            {
              type: 'group',
              body: [
                {
                  name: 'chartType',
                  label: '图表类型',
                  type: 'button-group-select',
              size: 'sm',
              options: [
                {
                  label: '折线图',
                  value: 'line',
                  icon: 'fa fa-chart-line'
                },
                {
                  label: '柱状图',
                  value: 'bar',
                  icon: 'fa fa-chart-bar'
                },
                {
                  label: '饼图',
                  value: 'pie',
                  icon: 'fa fa-chart-pie'
                },
                {
                  label: '散点图',
                  value: 'scatter',
                  icon: 'fa fa-braille'
                }
              ],
              description: '选择图表的基本类型'
            },
                {
                  name: 'templateId',
                  label: '选择模板',
                  type: 'select',
                  source: '${templateOptions}',
                  description: '选择预定义的图表模板',
                  visibleOn: 'data.chartType',
                  required: true
                },
                {
                  type: 'tpl',
                  tpl: '<% if (data.templateInfo) { %><div class="alert alert-info mb-0"><% data.templateInfo.description %></div><% } %>',
                  visibleOn: 'data.templateInfo'
                }
              ]
            }
          ]
        },
        {
          title: '属性',
          className: 'p-lg',
          body: [
            {
              type: 'group',
              body: [
                {
                  name: 'apiConfig.url',
                  label: 'API 地址',
                  type: 'input-text',
                  description: '数据接口地址'
                },
                {
                  name: 'apiConfig.method',
                  label: '请求方法',
                  type: 'select',
                  options: [
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]
                },
                {
                  name: 'apiConfig.dataField',
                  label: '数据字段',
                  type: 'input-text',
                  description: '从响应数据中提取数据的字段路径,例如: data.items'
                },
                {
                  name: 'config.width',
                  label: '宽度',
                  type: 'input-text',
                  placeholder: '100%'
                },
                {
                  name: 'config.height',
                  label: '高度',
                  type: 'input-text',
                  placeholder: '400px'
                }
              ]
            }
          ]
        },
        {
          title: '外观',
          className: 'p-lg',
          body: [
            {
              type: 'group',
              body: [
                {
                  name: 'styleConfig.backgroundColor',
                  label: '背景颜色',
                  type: 'input-color',
                  clearable: true
                },
                {
                  name: 'styleConfig.padding',
                  label: '内边距',
                  type: 'input-text',
                  placeholder: '10px'
                },
                {
                  name: 'config.tooltip',
                  label: '显示提示框',
                  type: 'switch',
                  mode: 'inline',
                  value: true
                },
                {
                  name: 'config.legend',
                  label: '显示图例',
                  type: 'switch',
                  mode: 'inline',
                  value: true
                }
              ]
            }
          ]
        },
        {
          title: '事件',
          className: 'p-lg',
          body: [
            {
              type: 'group',
              body: this.buildEventTabs()
            }
          ]
        }
      ]
    }
  ]

  /**
   * 构建事件配置
   */
  buildEventTabs(): any[] {
    return [
      {
        type: 'button-group-select',
        name: 'eventName',
        label: '事件类型',
        size: 'sm',
        options: [
          {
            label: '点击',
            value: 'click'
          },
          {
            label: '鼠标悬停',
            value: 'mouseover'
          }
        ]
      },
      {
        name: 'eventAction',
        label: '事件动作',
        type: 'input-text',
        description: '配置事件触发时执行的动作'
      }
    ]
  }

  /**
   * 获取当前上下文数据
   * 用于动态生成模板选项
   */
  filterProps(props: any) {
    const { chartType } = props.data || {}

    // 根据图表类型获取模板列表
    let templateOptions: any[] = []
    let templateInfo: any = null

    if (chartType) {
      const templates = getTemplatesByType(chartType as any)
      templateOptions = templates.map((t) => ({
        label: t.name,
        value: t.id
      }))

      // 获取当前选中的模板信息
      const templateId = props.data?.templateId
      if (templateId) {
        const template = templates.find((t) => t.id === templateId)
        if (template) {
          templateInfo = template
        }
      }
    }

    return {
      ...props,
      data: {
        ...props.data,
        templateOptions,
        templateInfo
      }
    }
  }

  /**
   * 当图表类型改变时,自动设置默认模板
   */
  builderProps = {
    chartType_change: (value: any, oldValue: any, data: any, onChange: (value: any) => void) => {
      if (value && value !== oldValue) {
        const templates = getTemplatesByType(value as any)
        if (templates.length > 0) {
          // 选择第一个模板作为默认值
          onChange({
            templateId: templates[0].id
          })
        }
      }
    }
  }
}

registerEditorPlugin(ChartEditorPlugin)
