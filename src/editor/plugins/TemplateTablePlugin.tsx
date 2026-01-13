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

// 导入 Table2 的事件和动作定义
import { Table2RenderereEvent, Table2RendererAction } from 'amis-editor'

// 默认使用设备台账模板
const basicTableTemplate = getTableComponentTemplate('basic')

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

  // 默认使用设备台账模板
  scaffold = {
    type: 'template-table',
    tableType: 'basic',
    ...basicTableTemplate.config
  }

  previewSchema = {
    ...this.scaffold
  }

  // 事件定义 - 直接使用 Table2 的事件
  events = Table2RenderereEvent

  // 动作定义 - 直接使用 Table2 的动作
  actions = Table2RendererAction

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

        // 获取目标模板
        const template = getTableComponentTemplate(value)
        const templateConfig = template.config || {}

        // 构建新的 schema - 保持 type 不变，只更新 tableType 和相关配置
        const newSchema: any = {
          type: 'template-table',
          tableType: value,
          title: templateConfig.title || template.name,
          perPage: templateConfig.perPage || 10,
          // 从模板中提取配置
          columns: templateConfig.columns || [],
          filter: templateConfig.filter,
          bulkActions: templateConfig.bulkActions || [],
          itemActions: templateConfig.itemActions || [],
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
          // 使用新模板的 API 配置（切换类型时更新 API）
          api: templateConfig.api
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

    // 返回配置面板 - 参考 Table2Plugin 的结构
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
                  name: 'columnsTogglable',
                  label: '列显示开关',
                  value: true,
                  description: '是否显示列配置开关'
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
        // ===== 属性 Tab（完全复制 Table2 的实现）=====
        {
          title: '属性',
          body: [
            getSchemaTpl('collapseGroup', [
              {
                title: '基本',
                body: [
                  getSchemaTpl('layout:originPosition', {
                    value: 'left-top'
                  }),
                  getSchemaTpl('formulaControl', {
                    label: tipedLabel('数据源', '绑定当前上下文变量'),
                    name: 'source',
                    pipeIn: defaultValue('${items}')
                  }),
                  getSchemaTpl('switch', {
                    name: 'title',
                    label: '标题',
                    pipeIn: (value: any) => !!value,
                    pipeOut: (value: any) => {
                      if (value) {
                        return {
                          type: 'container',
                          body: [{
                            type: 'tpl',
                            wrapperComponent: '',
                            tpl: '标题',
                            inline: false,
                            style: {
                              fontSize: 14
                            }
                          }]
                        }
                      }
                      return null
                    }
                  }),
                  getSchemaTpl('switch', {
                    name: 'showHeader',
                    label: '显示表头',
                    value: true,
                    pipeIn: (value: any) => !!value,
                    pipeOut: (value: any) => !!value
                  }),
                  getSchemaTpl('switch', {
                    visibleOn: 'this.showHeader !== false',
                    name: 'sticky',
                    label: '吸顶表头',
                    pipeIn: defaultValue(false)
                  }),
                  getSchemaTpl('switch', {
                    name: 'footer',
                    label: '表尾',
                    pipeIn: (value: any) => !!value,
                    pipeOut: (value: any) => {
                      if (value) {
                        return {
                          type: 'container',
                          body: [{
                            type: 'tpl',
                            tpl: '表尾',
                            wrapperComponent: '',
                            inline: false,
                            style: {
                              fontSize: 14
                            }
                          }]
                        }
                      }
                      return null
                    }
                  })
                ]
              },
              {
                title: '功能',
                body: [
                  getSchemaTpl('switch', {
                    name: 'columnsTogglable',
                    label: tipedLabel('列显示开关', '是否显示列配置开关'),
                    value: true
                  }),
                  getSchemaTpl('switch', {
                    name: 'resizable',
                    label: tipedLabel('列宽可调整', '支持拖拽调整列宽'),
                    pipeIn: (value: any) => !!value,
                    pipeOut: (value: any) => value
                  }),
                  getSchemaTpl('switch', {
                    name: 'rowSelection',
                    label: '行选择',
                    hiddenOnDefault: true,
                    mode: 'normal',
                    formType: 'extend',
                    bulk: false,
                    form: {
                      body: [
                        {
                          name: 'keyField',
                          type: 'input-text',
                          label: '主键字段'
                        },
                        {
                          name: 'type',
                          label: '选择类型',
                          type: 'button-group-select',
                          options: [
                            { label: '多选', value: 'checkbox' },
                            { label: '单选', value: 'radio' }
                          ],
                          pipeIn: (value: any, formStore: any) => {
                            if (value != null && typeof value === 'string') {
                              return value
                            }
                            const schema = formStore?.data
                            return schema?.selectable === true
                              ? schema.multiple
                                ? 'checkbox'
                                : 'radio'
                              : 'checkbox'
                          }
                        },
                        getSchemaTpl('switch', {
                          name: 'fixed',
                          label: '固定列'
                        }),
                        {
                          type: 'input-number',
                          name: 'columnWidth',
                          label: '列宽',
                          min: 0,
                          pipeOut: (data: any) => data || undefined
                        },
                        {
                          label: '点击行触发选中',
                          name: 'rowClick',
                          type: 'button-group-select',
                          value: false,
                          options: [
                            { label: '是', value: true },
                            { label: '否', value: false }
                          ]
                        },
                        getSchemaTpl('formulaControl', {
                          name: 'disableOn',
                          label: '禁用表达式'
                        }),
                        {
                          name: 'selections',
                          label: '快捷选择',
                          type: 'checkboxes',
                          joinValues: false,
                          inline: false,
                          itemClassName: 'text-sm',
                          options: [
                            { label: '全部', value: 'all' },
                            { label: '反向', value: 'invert' },
                            { label: '无', value: 'none' },
                            { label: '奇数行', value: 'odd' },
                            { label: '偶数行', value: 'even' }
                          ],
                          pipeIn: (v: any) => {
                            if (!v) return
                            return v.map((item: any) => ({
                              label: item.text,
                              value: item.key
                            }))
                          },
                          pipeOut: (v: any) => {
                            if (!v) return
                            return v.map((item: any) => ({
                              key: item.value,
                              text: item.label
                            }))
                          }
                        }
                      ]
                    }
                  }),
                  getSchemaTpl('formulaControl', {
                    label: '可勾选表达式',
                    name: 'itemCheckableOn'
                  })
                ]
              },
              {
                title: '外观',
                body: [
                  getSchemaTpl('switch', {
                    name: 'autoFillHeight',
                    label: '自动撑满高度'
                  }),
                  {
                    name: 'scroll.y',
                    label: '纵向滚动',
                    type: 'button-group-select',
                    pipeIn: (v: any) => v != null,
                    pipeOut: (v: any) => (v ? '' : null),
                    options: [
                      { label: '关闭', value: false },
                      { label: '开启', value: true }
                    ]
                  },
                  {
                    name: 'scroll.x',
                    label: tipedLabel('横向滚动', '是否开启横向滚动'),
                    type: 'button-group-select',
                    pipeIn: (v: any) => v != null,
                    pipeOut: (v: any) => (v ? '' : null),
                    options: [
                      { label: '关闭', value: false },
                      { label: '开启', value: true }
                    ]
                  }
                ]
              },
              {
                title: '状态',
                body: [
                  getSchemaTpl('hidden'),
                  getSchemaTpl('visible')
                ]
              }
            ])
          ]
        },
        // ===== 事件 Tab（完全复制 Table2 的实现）=====
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
