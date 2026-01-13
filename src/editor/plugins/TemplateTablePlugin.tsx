/**
 * 模板表格编辑器插件
 * 统一的表格插件，支持设备台账、巡检记录、故障工单的切换
 * 默认显示设备台账（基础表格）
 *
 * 参考 amis-editor Table2 插件实现
 */

import { registerEditorPlugin, BasePlugin, getEventControlConfig } from 'amis-editor'
import { getSchemaTpl, tipedLabel, defaultValue } from 'amis-editor-core'
import { tableTypeOptions, getTableComponentTemplate, getTableTypeDescription } from '../../config/table-templates'

// 默认表格配置
const tableDefaultConfig = {
  type: 'crud',
  title: '设备台账列表',
  perPage: 10,
  columns: [],
  api: {
    method: 'get',
    url: '/api/table/basic'
  }
}

class TemplateTablePlugin extends BasePlugin {
  rendererName = 'template-table'

  // 设置高优先级
  order = -100

  // 组件信息
  name = '模板表格'
  isBaseComponent = false  // 设置为 false 使其显示在"自定义组件" tab
  description = '可切换的表格组件，支持设备台账、巡检记录、故障工单'
  docLink = '/amis/zh-CN/components/crud'
  icon = 'fa fa-table'
  pluginIcon = 'table-plugin'
  tags = ['表格']  // 在自定义组件 tab 内按"表格"分组

  // 保存 manager 引用
  manager: any = null

  constructor(manager: any) {
    super(manager)
    this.manager = manager
  }

  // 默认使用基础表格配置
  scaffold = {
    type: 'template-table',
    tableType: 'basic',
    perPage: 10,
    showIndex: true,
    title: '设备台账列表',
    // 提供简单的默认列配置，避免空列导致问题
    columns: [
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
  }

  previewSchema = {
    ...this.scaffold
  }

  // 事件定义 - 与 amis 原生 table2 保持一致
  events = [
    {
      eventName: 'selectedChange',
      eventLabel: '选中项变化',
      description: '表格选中项发生变化时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '事件数据',
              properties: {
                selectedItems: {
                  type: 'array',
                  title: '选中的项'
                },
                unSelectedItems: {
                  type: 'array',
                  title: '未选中的项'
                }
              }
            }
          }
        }
      ]
    },
    {
      eventName: 'columnSort',
      eventLabel: '列排序',
      description: '点击列头排序时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '事件数据',
              properties: {
                orderBy: {
                  type: 'string',
                  title: '排序字段'
                },
                orderDir: {
                  type: 'string',
                  title: '排序方向'
                }
              }
            }
          }
        }
      ]
    },
    {
      eventName: 'columnFilter',
      eventLabel: '列筛选',
      description: '列筛选条件变化时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '事件数据',
              properties: {
                filterName: {
                  type: 'string',
                  title: '筛选列名称'
                },
                filterValue: {
                  type: 'string',
                  title: '筛选值'
                }
              }
            }
          }
        }
      ]
    },
    {
      eventName: 'rowClick',
      eventLabel: '行点击',
      description: '点击表格行时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '事件数据',
              description: '当前行数据'
            }
          }
        }
      ]
    },
    {
      eventName: 'rowDbClick',
      eventLabel: '行双击',
      description: '双击表格行时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              title: '事件数据',
              description: '当前行数据'
            }
          }
        }
      ]
    }
  ]

  // 动作定义 - 与 amis 原生 table2 保持一致
  actions = [
    {
      actionType: 'select',
      actionLabel: '选中',
      description: '选中表格行'
    },
    {
      actionType: 'selectAll',
      actionLabel: '全选',
      description: '选中所有行'
    },
    {
      actionType: 'clearAll',
      actionLabel: '清空选择',
      description: '清空选中项'
    },
    {
      actionType: 'reload',
      actionLabel: '重新加载',
      description: '触发组件数据刷新并重新渲染'
    }
  ]

  panelTitle = '模板表格配置'
  panelJustify = true

  panelBodyCreator = (context: any) => {
    const manager = this.manager

    // 表格类型切换配置（快速创建 tab 独有）
    const tableTypeSwitcher = {
      type: 'button-group-select',
      name: 'tableType',
      label: '选择表格类型',
      size: 'md',
      mode: 'inline',
      options: tableTypeOptions,
      value: 'basic',
      description: getTableTypeDescription('basic'),
      onChange: (value: string, oldValue: string, model: any, form: any) => {
        console.log('Template Table type onChange triggered:', { value, oldValue })

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
        const template = getTableComponentTemplate(value)
        const templateConfig = template.config || {}

        // 构建新的 schema - 保持 type 不变，只更新 tableType 和相关配置
        const newSchema: any = {
          type: 'template-table',
          tableType: value,
          title: templateConfig.title || template.name,
          perPage: templateConfig.perPage || 10,
          showIndex: schema.showIndex !== false,
          // 从模板中提取列配置
          columns: templateConfig.columns || [],
          // 从模板中提取筛选配置
          filter: templateConfig.filter,
          // 从模板中提取批量操作配置
          bulkActions: templateConfig.bulkActions || [],
          // 从模板中提取行操作配置
          itemActions: templateConfig.itemActions || [],
          // 从模板中提取工具栏配置
          headerToolbar: templateConfig.headerToolbar || [],
          footerToolbar: templateConfig.footerToolbar || [],
          // 保留布局属性
          size: schema.size,
          offset: schema.offset,
          visibleOn: schema.visibleOn,
          hiddenOn: schema.hiddenOn,
          visible: schema.visible,
          hidden: schema.hidden,
          id: schema.id,
          // 保留 API 配置（如果用户自定义了）
          api: schema.api
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

    // 返回配置面板
    return [
      getSchemaTpl('tabs', [
        // ===== 快速创建 Tab =====
        {
          title: '快速创建',
          body: [
            {
              type: 'fieldset',
              title: '📋 表格类型',
              collapsable: false,
              body: [tableTypeSwitcher]
            },
            {
              type: 'fieldset',
              title: '⚙️ 基本配置',
              collapsable: false,
              body: [
                {
                  type: 'input-text',
                  name: 'title',
                  label: '表格标题',
                  placeholder: '请输入表格标题',
                  value: '设备台账列表'
                },
                {
                  type: 'input-number',
                  name: 'perPage',
                  label: '每页显示条数',
                  value: 10,
                  min: 5,
                  max: 200,
                  step: 5,
                  description: '设置表格每页显示的数据条数'
                },
                {
                  type: 'switch',
                  name: 'showIndex',
                  label: '显示序号列',
                      value: true,
                  description: '是否在表格第一列显示序号'
                }
              ]
            },
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
                    label: tipedLabel('数据接口', '表格数据接口，返回的数据将作为表格数据源'),
                    mode: 'normal'
                  }),
                  {
                    name: 'columns',
                    label: tipedLabel('列配置', '配置表格的列信息'),
                    type: 'combo',
                    multiple: true,
                    multiLine: true,
                    items: [
                      {
                        type: 'input-text',
                        name: 'name',
                        label: '字段名',
                        required: true
                      },
                      {
                        type: 'input-text',
                        name: 'label',
                        label: '列标题',
                        required: true
                      },
                      {
                        type: 'select',
                        name: 'type',
                        label: '列类型',
                        options: [
                          { label: '文本', value: 'text' },
                          { label: '数字', value: 'input-number' },
                          { label: '日期', value: 'date' },
                          { label: '时间', value: 'datetime' },
                          { label: '映射', value: 'mapping' },
                          { label: '图片', value: 'image' },
                          { label: '链接', value: 'link' },
                          { label: '操作', value: 'operation' }
                        ],
                        value: 'text'
                      },
                      {
                        type: 'input-number',
                        name: 'width',
                        label: '列宽'
                      },
                      {
                        type: 'textarea',
                        name: 'remark',
                        label: '说明'
                      }
                    ]
                  },
                  getSchemaTpl('switch', {
                    label: tipedLabel('初始是否拉取', '是否在组件初始化时自动拉取数据'),
                    name: 'initFetch',
                    pipeIn: defaultValue(true)
                  }),
                  {
                    name: 'interval',
                    label: tipedLabel('定时刷新', '设置后将自动定时刷新'),
                    type: 'input-number',
                    step: 500,
                    min: 1000,
                    unitOptions: ['ms']
                  }
                ]
              },
              // 功能配置
              {
                title: '功能',
                body: [
                  getSchemaTpl('switch', {
                    label: tipedLabel('可筛选', '是否显示筛选区域'),
                    name: 'filter',
                    value: false
                  }),
                  getSchemaTpl('switch', {
                    label: tipedLabel('可排序', '是否支持列排序'),
                    name: 'sortable',
                    value: false
                  }),
                  getSchemaTpl('switch', {
                    label: tipedLabel('列显示开关', '是否显示列配置开关'),
                    name: 'columnsTogglable',
                    value: true
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
                    label: tipedLabel('宽度', '表格宽度'),
                    pipeIn: defaultValue('100%')
                  },
                  heightSchema: {
                    label: tipedLabel('高度', '表格高度'),
                    pipeIn: defaultValue('auto')
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

registerEditorPlugin(TemplateTablePlugin)
