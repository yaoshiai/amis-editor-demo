/**
 * 模板图表编辑器插件
 * 在原生 chart 基础上新增"快速创建" tab
 */

import { registerEditorPlugin, BasePlugin } from 'amis-editor'
import { getChartTemplateJson, lineChartTemplate, pieChartTemplate, barChartTemplate } from '../../config/chart-template-jsons'

class TemplateChartEditorPlugin extends BasePlugin {
  // 独立的渲染器名称,不覆盖原生 chart
  rendererName = 'template-chart'

  // 组件信息
  name = '模板图表'
  description = '快速创建预定义图表模板'
  icon = 'fa fa-chart-line'
  pluginIcon = 'templateChartPluginIcon'
  tags = ['展示']
  scaffold = {
    type: 'template-chart',
    ...lineChartTemplate
  }
  previewSchema = {
    type: 'template-chart',
    ...lineChartTemplate
  }

  // 面板配置 - 在原生 chart 基础上添加"快速创建" tab
  panelTitle = '模板图表配置'
  panelBody = [
    {
      type: 'tabs',
      tabsMode: 'line',
      className: 'm-t-n-xs',
      contentClassName: 'no-border p-l-none p-r-none',
      tabs: [
        {
          title: '快速创建',
          className: 'p-lg',
          body: [
            {
              type: 'group',
              body: [
                {
                  type: 'button-group-select',
                  name: 'templateType',
                  label: '选择图表类型',
                  size: 'md',
                  mode: 'inline',
                  options: [
                    {
                      label: '折线图',
                      value: 'line',
                      icon: 'fa fa-chart-line'
                    },
                    {
                      label: '饼图',
                      value: 'pie',
                      icon: 'fa fa-chart-pie'
                    },
                    {
                      label: '柱状图',
                      value: 'bar',
                      icon: 'fa fa-chart-bar'
                    }
                  ],
                  value: 'line',
                  description: '选择图表模板类型,将自动加载对应配置'
                }
              ]
            }
          ]
        }
        // 其他 tabs (属性、外观、事件) 将由 amis 原生 chart 插件提供
        // 我们不需要重复定义
      ]
    }
  ]

  /**
   * 监听 templateType 变化,自动加载对应模板
   */
  builderProps = {
    templateType_change: (
      value: any,
      oldValue: any,
      data: any,
      onChange: (value: any) => void
    ) => {
      if (value && value !== oldValue) {
        // 获取对应类型的模板 JSON
        const template = getChartTemplateJson(value as 'line' | 'pie' | 'bar')

        // 深拷贝模板,避免修改原始配置
        const newSchema = JSON.parse(JSON.stringify(template))

        // 合并当前组件的基本信息 (id 等)
        onChange({
          ...newSchema,
          id: data.id || newSchema.id
        })
      }
    }
  }

  /**
   * 过滤组件属性,确保默认值正确设置
   */
  filterProps(props: any) {
    // 如果没有 templateType,默认为 line
    if (!props.data.templateType) {
      props.data.templateType = 'line'
    }

    return props
  }
}

registerEditorPlugin(TemplateChartEditorPlugin)
