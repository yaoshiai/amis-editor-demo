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
import {
  departmentOptions,
  timePeriodOptions,
  metricOptions,
  refreshIntervalOptions,
  alarmThresholdOptions,
  getMetricUnit
} from '../../config/power-chart-config'
import {
  updatePieChartConfig,
  updateBarChartConfig,
  updateLineChartConfig,
  addAlarmLines
} from '../../utils/chart-data-manager'

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

// 默认图表配置 - 24小时负荷监测（电力业务场景）
const chartDefaultConfig = {
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
  backgroundColor: 'transparent'
}

class TemplateChartPlugin extends BasePlugin {
  rendererName = 'template-chart'

  // 设置高优先级
  order = -100

  // 组件信息
  name = '模板图表'
  isBaseComponent = false  // 设置为 false 使其显示在"自定义组件" tab
  description = '可切换的图表组件，支持折线图、饼图、柱状图'
  docLink = '/amis/zh-CN/components/chart'
  icon = 'fa fa-chart-line'
  pluginIcon = 'chart-plugin'
  tags = ['图表']  // 在自定义组件 tab 内按"图表"分组

  // 保存 manager 引用
  manager: any = null

  constructor(manager: any) {
    super(manager)
    this.manager = manager
  }

  /**
   * 更新组件配置的通用方法
   * @param newConfig 新的图表配置
   * @param businessFields 业务字段（如：deptId, timePeriod, metrics 等）
   */
  updateComponentConfig(newConfig: any, businessFields?: Record<string, any>) {
    const manager = this.manager
    if (!manager) {
      console.error('Editor manager not available')
      return
    }

    const store = manager.store
    const activeId = store.activeId

    if (!activeId) {
      console.error('No active component found')
      return
    }

    const schema = store.getSchema(activeId)
    if (!schema) {
      console.error('Cannot get current schema')
      return
    }

    // 构建新的 schema，保留布局属性，同时更新业务字段
    const updatedSchema: any = {
      ...schema,
      config: newConfig,
      ...(businessFields || {})
    }

    // 更新组件
    try {
      manager.replaceChild(activeId, updatedSchema)
      console.log('Component config updated successfully')
    } catch (error: any) {
      console.error('Failed to update component config:', error)
    }
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
            // 1. 图表类型选择（所有图表类型都显示）
            {
              type: 'fieldset',
              title: '📊 图表类型',
              collapsable: false,
              body: [chartTypeSwitcher]
            },

            // 2. 部门/区域配置（仅在饼图时显示）
            {
              type: 'fieldset',
              title: '🏢 组织机构',
              collapsable: false,
              visibleOn: 'this.chartType === "pie"',
              body: [
                {
                  type: 'select',
                  name: 'deptId',
                  label: '所属部门',
                  placeholder: '请选择部门或变电站',
                  options: departmentOptions,
                  searchable: true,
                  clearable: true,
                  description: '选择要统计用电量的部门或区域',
                  onChange: (value: any, oldValue: any, model: any, form: any) => {
                    console.log('部门选择变更:', value)

                    if (!value) {
                      console.log('清空部门选择，不更新配置')
                      return
                    }

                    // 获取当前组件的配置
                    const currentConfig = form?.data?.config
                    if (!currentConfig) {
                      console.error('无法获取当前配置')
                      return
                    }

                    // 使用数据管理器更新配置
                    const newConfig = updatePieChartConfig(currentConfig, value)

                    // 更新组件配置，同时更新 deptId 字段
                    this.updateComponentConfig(newConfig, { deptId: value })
                  }
                }
              ]
            },

            // 3. 时间维度配置（仅在柱状图时显示统计周期）
            {
              type: 'fieldset',
              title: '⏰ 时间维度',
              collapsable: false,
              body: [
                // 统计周期（仅在柱状图时显示）
                {
                  type: 'button-group-select',
                  name: 'timePeriod',
                  label: '统计周期',
                  mode: 'horizontal',
                  visibleOn: 'this.chartType === "bar"',
                  options: timePeriodOptions.map(t => ({
                    label: t.label,
                    value: t.value,
                    icon: 'fa fa-clock'
                  })),
                  value: '1day',
                  description: '选择数据统计的时间粒度（月度对比/季度对比/年度对比）',
                  onChange: (value: any, oldValue: any, model: any, form: any) => {
                    console.log('统计周期变更:', value)

                    if (!value) {
                      console.log('清空统计周期选择，不更新配置')
                      return
                    }

                    // 获取当前组件的配置
                    const currentConfig = form?.data?.config
                    if (!currentConfig) {
                      console.error('无法获取当前配置')
                      return
                    }

                    // 使用数据管理器更新配置
                    const newConfig = updateBarChartConfig(currentConfig, value)

                    // 更新组件配置，同时更新 timePeriod 字段
                    this.updateComponentConfig(newConfig, { timePeriod: value })
                  }
                },

                // 自动刷新（所有图表类型都显示）
                {
                  type: 'select',
                  name: 'interval',
                  label: '自动刷新',
                  placeholder: '选择刷新频率',
                  options: refreshIntervalOptions.map(r => ({
                    label: r.label,
                    value: r.value
                  })),
                  clearable: true,
                  description: '设置后图表将自动定时刷新数据',
                  onChange: (value: any, oldValue: any, model: any, form: any) => {
                    console.log('刷新频率变更:', value)

                    // 获取当前组件的配置
                    const currentConfig = form?.data?.config
                    if (!currentConfig) {
                      console.error('无法获取当前配置')
                      return
                    }

                    // 更新配置中的 interval 字段
                    const newConfig = {
                      ...currentConfig
                    }

                    // 更新组件配置，同时更新 interval 字段
                    this.updateComponentConfig(newConfig, { interval: value })

                    // 提示用户需要配置 API 接口才能使用自动刷新
                    if (value && value > 0) {
                      console.log('自动刷新已设置，请确保在"属性"tab中配置了数据接口')
                    }
                  }
                }
              ]
            },

            // 4. 监测指标配置（仅在折线图时显示）
            {
              type: 'fieldset',
              title: '📈 监测指标',
              collapsable: false,
              visibleOn: 'this.chartType === "line"',
              body: [
                {
                  type: 'checkboxes',
                  name: 'metrics',
                  label: '选择指标',
                  options: metricOptions.map(m => ({
                    label: m.name,
                    value: m.id,
                    icon: m.icon
                  })),
                  joinValues: true,
                  delimiter: ',',
                  value: 'active-power',
                  description: '可选择多个指标进行对比展示（如：有功功率 + 无功功率）',
                  onChange: (value: any, oldValue: any, model: any, form: any) => {
                    console.log('监测指标变更:', value)

                    if (!value) {
                      console.log('清空指标选择，不更新配置')
                      return
                    }

                    // 将逗号分隔的字符串转换为数组
                    const metricIds = typeof value === 'string' ? value.split(',') : value

                    // 获取当前组件的配置和小数位数
                    const currentConfig = form?.data?.config
                    const decimalPlaces = form?.data?.decimalPlaces || 2

                    if (!currentConfig) {
                      console.error('无法获取当前配置')
                      return
                    }

                    // 使用数据管理器更新配置
                    const newConfig = updateLineChartConfig(currentConfig, metricIds, decimalPlaces)

                    // 更新组件配置，同时更新 metrics 字段
                    this.updateComponentConfig(newConfig, { metrics: value })
                  }
                },
                {
                  type: 'input-number',
                  name: 'decimalPlaces',
                  label: '小数位数',
                  value: 2,
                  min: 0,
                  max: 6,
                  description: '设置数据显示的小数位数（如：2位显示320.50 MW）',
                  onChange: (value: any, oldValue: any, model: any, form: any) => {
                    console.log('小数位数变更:', value)

                    // 获取当前选择的指标
                    const metrics = form?.data?.metrics
                    if (!metrics) {
                      console.log('没有选择指标，不更新配置')
                      return
                    }

                    // 将逗号分隔的字符串转换为数组
                    const metricIds = typeof metrics === 'string' ? metrics.split(',') : metrics

                    // 获取当前组件的配置
                    const currentConfig = form?.data?.config
                    if (!currentConfig) {
                      console.error('无法获取当前配置')
                      return
                    }

                    // 使用数据管理器更新配置
                    const newConfig = updateLineChartConfig(currentConfig, metricIds, value || 2)

                    // 更新组件配置，同时更新 decimalPlaces 字段
                    this.updateComponentConfig(newConfig, { decimalPlaces: value || 2 })
                  }
                }
              ]
            },

            // 5. 告警阈值设置（仅在折线图时显示）
            {
              type: 'fieldset',
              title: '⚠️ 告警设置',
              collapsable: true,
              collapsed: true,
              visibleOn: 'this.chartType === "line"',
              body: [
                {
                  type: 'combo',
                  name: 'alarms',
                  label: '告警规则',
                  multiple: true,
                  multiLine: true,
                  items: [
                    {
                      type: 'select',
                      name: 'type',
                      label: '告警类型',
                      options: [
                        { label: '上限告警', value: 'upper' },
                        { label: '下限告警', value: 'lower' }
                      ],
                      value: 'upper'
                    },
                    {
                      type: 'input-number',
                      name: 'threshold',
                      label: '阈值',
                      placeholder: '请输入阈值',
                      description: '超过此值时触发告警'
                    },
                    {
                      type: 'select',
                      name: 'metricId',
                      label: '监测指标',
                      options: metricOptions.map(m => ({
                        label: m.name,
                        value: m.id
                      })),
                      value: 'active-power',
                      description: '选择要监控的指标'
                    }
                  ],
                  description: '设置告警阈值，当数值超过设定值时将在图表上显示告警线',
                  onChange: (value: any, oldValue: any, model: any, form: any) => {
                    console.log('告警规则变更:', value)

                    if (!value || value.length === 0) {
                      console.log('清空告警规则，不更新配置')
                      return
                    }

                    // 获取当前组件的配置
                    const currentConfig = form?.data?.config
                    if (!currentConfig) {
                      console.error('无法获取当前配置')
                      return
                    }

                    // 使用数据管理器添加告警线
                    const newConfig = addAlarmLines(currentConfig, value)

                    // 更新组件配置，同时更新 alarms 字段
                    this.updateComponentConfig(newConfig, { alarms: value })
                  }
                }
              ]
            },

            // 6. 快速操作按钮（所有图表类型都显示）
            {
              type: 'group',
              body: [
                {
                  type: 'button',
                  label: '应用配置',
                  level: 'primary',
                  actionType: 'submit',
                  size: 'md'
                },
                {
                  type: 'button',
                  label: '保存为模板',
                  level: 'secondary',
                  size: 'md',
                  onClick: () => {
                    console.log('保存为模板功能待实现')
                  }
                },
                {
                  type: 'button',
                  label: '重置',
                  level: 'default',
                  size: 'md',
                  actionType: 'reset'
                }
              ]
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
