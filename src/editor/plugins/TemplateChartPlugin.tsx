/**
 * 模板图表编辑器插件
 * 统一的图表插件，支持折线图、饼图、柱状图的切换
 * 默认显示折线图
 *
 * 参考 amis-editor Chart 插件实现
 */

import { registerEditorPlugin, BasePlugin, getEventControlConfig } from 'amis-editor'
import { getSchemaTpl, tipedLabel, defaultValue } from 'amis-editor-core'
import { chartTypeOptions, getChartComponentTemplate } from '../../config/chart-templates'
import { getChartTypeDescription } from '../../utils/chart-switcher'

// 默认事件参数结构
const DEFAULT_EVENT_PARAMS = [
  {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        title: '事件数据',
        properties: {
          componentType: {
            type: 'string',
            title: 'componentType'
          },
          seriesType: {
            type: 'string',
            title: 'seriesType'
          },
          seriesIndex: {
            type: 'number',
            title: 'seriesIndex'
          },
          seriesName: {
            type: 'string',
            title: 'seriesName'
          },
          name: {
            type: 'string',
            title: 'name'
          },
          dataIndex: {
            type: 'number',
            title: 'dataIndex'
          },
          data: {
            type: 'object',
            title: 'data'
          },
          dataType: {
            type: 'string',
            title: 'dataType'
          },
          value: {
            type: 'number',
            title: 'value'
          },
          color: {
            type: 'string',
            title: 'color'
          }
        }
      }
    }
  }
]

// 默认图表配置
const chartDefaultConfig = {
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
  backgroundColor: 'transparent'
}

class TemplateChartPlugin extends BasePlugin {
  rendererName = 'template-chart'

  // 设置高优先级
  order = -100

  // 组件信息
  name = '模板图表'
  isBaseComponent = true
  description = '可切换的图表组件，支持折线图、饼图、柱状图'
  docLink = '/amis/zh-CN/components/chart'
  icon = 'fa fa-chart-line'
  pluginIcon = 'chart-plugin'
  tags = ['展示']

  // 保存 manager 引用
  manager: any = null

  constructor(manager: any) {
    super(manager)
    this.manager = manager
  }

  // 默认使用折线图配置
  scaffold = {
    type: 'template-chart',
    chartType: 'line',
    config: chartDefaultConfig,
    replaceChartOption: true
  }

  previewSchema = {
    ...this.scaffold
  }

  // 事件定义 - 与 amis 原生 chart 保持一致
  events = [
    {
      eventName: 'init',
      eventLabel: '初始化',
      description: '组件初始化时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '事件数据',
              description: '当前数据域数据'
            }
          }
        }
      ]
    },
    {
      eventName: 'click',
      eventLabel: '点击',
      description: '鼠标点击图表时触发',
      dataSchema: DEFAULT_EVENT_PARAMS
    },
    {
      eventName: 'mouseover',
      eventLabel: '鼠标悬停',
      description: '鼠标悬停到图表元素时触发',
      dataSchema: DEFAULT_EVENT_PARAMS
    },
    {
      eventName: 'legendselectchanged',
      eventLabel: '切换图例选中状态',
      description: '切换图例选中状态时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '事件数据',
              properties: {
                name: {
                  type: 'string',
                  title: 'name'
                },
                selected: {
                  type: 'object',
                  title: 'selected'
                }
              }
            }
          }
        }
      ]
    }
  ]

  // 动作定义 - 与 amis 原生 chart 保持一致
  actions = [
    {
      actionType: 'reload',
      actionLabel: '重新加载',
      description: '触发组件数据刷新并重新渲染'
    },
    {
      actionType: 'setValue',
      actionLabel: '变量赋值',
      description: '更新数据域数据'
    }
  ]

  panelTitle = '模板图表配置'
  panelJustify = true

  panelBodyCreator = (context: any) => {
    const manager = this.manager

    // 图表类型切换配置（快速创建 tab 独有）
    const chartTypeSwitcher = {
      type: 'button-group-select',
      name: 'chartType',
      label: '选择图表类型',
      size: 'md',
      mode: 'inline',
      options: chartTypeOptions,
      value: 'line',
      description: getChartTypeDescription('line'),
      onChange: (value: string, oldValue: string, model: any, form: any) => {
        console.log('Template Chart type onChange triggered:', { value, oldValue })

        if (!manager) {
          console.error('Editor manager not available')
          return
        }

        const store = manager.store

        // 获取当前选中的节点 ID
        const activeId = store.activeId

        if (!activeId) {
          console.error('No active component found')
          return
        }

        // 获取当前组件的 schema
        const schema = store.getSchema(activeId)

        if (!schema) {
          console.error('Cannot get current schema')
          return
        }

        // 获取目标模板
        const template = getChartComponentTemplate(value)

        // 构建新的 schema - 保持 type 不变，只更新 chartType 和 config
        const newSchema: any = {
          type: 'template-chart',
          chartType: value,
          config: template.config,
          replaceChartOption: true,
          // 保留布局属性
          size: schema.size,
          offset: schema.offset,
          visibleOn: schema.visibleOn,
          hiddenOn: schema.hiddenOn,
          visible: schema.visible,
          hidden: schema.hidden,
          id: schema.id
        }

        // 使用 manager.replaceChild 来替换整个组件
        try {
          const node = store.getNodeById(activeId)

          if (!node) {
            console.error('Cannot find node')
            return
          }

          manager.replaceChild(activeId, newSchema)
          console.log('Component replaced successfully')
        } catch (error: any) {
          console.error('Failed to replace component:', error)
        }
      }
    }

    // 返回与 amis 原生 chart 一致的结构，但保留快速创建 tab
    return [
      getSchemaTpl('tabs', [
        // ===== 快速创建 Tab =====
        {
          title: '快速创建',
          body: [
            {
              type: 'fieldset',
              title: '图表类型',
              collapsable: false,
              body: [chartTypeSwitcher]
            }
          ]
        },
        // ===== 属性 Tab =====
        {
          title: '属性',
          body: [
            getSchemaTpl('collapseGroup', [
              // 基本配置
              {
                title: '基本',
                body: [
                  getSchemaTpl('layout:originPosition', {
                    value: 'left-top'
                  }),
                  getSchemaTpl('name')
                ]
              },
              // 数据配置
              {
                title: '数据',
                body: [
                  getSchemaTpl('apiControl', {
                    label: tipedLabel('数据接口', '图表数据接口，返回的数据可以作为图表配置'),
                    mode: 'normal'
                  }),
                  getSchemaTpl('switch', {
                    label: '初始是否拉取',
                    name: 'initFetch',
                    visibleOn: 'this.api && this.api.url',
                    pipeIn: defaultValue(true)
                  }),
                  {
                    name: 'interval',
                    label: tipedLabel('定时刷新', '设置后将自动定时刷新'),
                    type: 'input-number',
                    step: 500,
                    min: 1000,
                    visibleOn: 'this.api && this.api.url',
                    unitOptions: ['ms']
                  },
                  getSchemaTpl('expressionFormulaControl', {
                    evalMode: false,
                    label: tipedLabel('跟踪表达式', '如果这个表达式的值有变化时会更新图表'),
                    name: 'trackExpression',
                    placeholder: '\\${xxx}'
                  }),
                  {
                    name: 'config',
                    type: 'js-editor',
                    allowFullscreen: true,
                    mode: 'normal',
                    label: tipedLabel('图表配置', '图表配置，即 ECharts 的配置')
                  },
                  {
                    name: 'dataFilter',
                    type: 'ae-functionEditorControl',
                    allowFullscreen: true,
                    mode: 'normal',
                    label: tipedLabel('数据处理', '如需对请求返回的数据进行处理可设置'),
                    renderLabel: true,
                    params: [
                      {
                        label: 'config',
                        tip: '当前图表配置'
                      },
                      {
                        label: 'echarts',
                        tip: 'ECharts 全局对象'
                      },
                      {
                        label: 'data',
                        tip: '当前数据域数据'
                      }
                    ],
                    placeholder:
                      "debugger; // 可以浏览器中断点调试\n\n// 查看原始数据\nconsole.log(config)\n\n// 返回新的结果 \nreturn {}"
                  },
                  getSchemaTpl('switch', {
                    label: tipedLabel('替换图表配置', '开启后会完全替换图表配置，否则为追加模式'),
                    name: 'replaceChartOption'
                  })
                ]
              },
              // 状态
              getSchemaTpl('status')
            ])
          ]
        },
        // ===== 外观 Tab =====
        {
          title: '外观',
          body: getSchemaTpl('collapseGroup', [
            {
              title: '基本样式',
              body: [
                getSchemaTpl('style:widthHeight', {
                  widthSchema: {
                    label: tipedLabel('宽度', '图表宽度'),
                    pipeIn: defaultValue('100%')
                  },
                  heightSchema: {
                    label: tipedLabel('高度', '图表高度'),
                    pipeIn: defaultValue('300px')
                  }
                })
              ]
            },
            // 使用 amis 的主题通用配置
            ...getSchemaTpl('theme:common', {
              exclude: ['layout']
            })
          ])
        },
        // ===== 事件 Tab =====
        {
          title: '事件',
          className: 'p-none',
          body: [
            getSchemaTpl('eventControl', {
              name: 'onEvent',
              ...getEventControlConfig(this.manager, context)
            })
          ]
        }
      ])
    ]
  }
}

registerEditorPlugin(TemplateChartPlugin)
