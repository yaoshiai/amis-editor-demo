/**
 * 图表面板配置工具
 * 提供复用的图表配置面板逻辑,保持与 amis 原生 chart 插件一致
 */

import { getSchemaTpl } from 'amis-editor-core'

/**
 * 图表面板配置工具类
 */
export class ChartPanelHelper {
  /**
   * 获取标准的"属性" tab 配置
   */
  static getPropertiesTab(
    customConfigs?: any[],
    options: {
      includeSize?: boolean
      includeFullConfig?: boolean
      includeAdvanced?: boolean
    } = {}
  ) {
    const { includeSize = true, includeFullConfig = true, includeAdvanced = true } = options

    const configs: any[] = [
      getSchemaTpl('layout:originPosition', { value: 'left-top' }),
      getSchemaTpl('name'),
      getSchemaTpl('className'),
      { type: 'divider' }
    ]

    if (customConfigs && customConfigs.length > 0) {
      configs.push(...customConfigs)
      configs.push({ type: 'divider' })
    }

    if (includeSize) {
      configs.push(
        { type: 'input-text', name: 'config.width', label: '宽度', placeholder: '100%' },
        { type: 'input-text', name: 'config.height', label: '高度', placeholder: '300px' }
      )
    }

    if (includeFullConfig) {
      if (includeSize) configs.push({ type: 'divider' })
      configs.push({
        type: 'js-editor',
        name: 'config',
        label: '完整配置',
        allowFullscreen: true
      })
    }

    if (includeAdvanced) {
      configs.push({ type: 'divider' })
      configs.push(getSchemaTpl('ref'), getSchemaTpl('visible'))
    }

    return configs
  }

  /**
   * 获取标准的"外观" tab 配置
   */
  static getAppearanceTab(customConfigs?: any[]) {
    const baseSchema = [
      { type: 'input-color', name: 'config.backgroundColor', label: '背景颜色', clearable: true },
      { type: 'divider' },
      { type: 'switch', name: 'config.tooltip.show', label: '显示提示框', mode: 'inline', value: true },
      { type: 'switch', name: 'config.legend.show', label: '显示图例', mode: 'inline', value: true }
    ]

    const styleConfig = getSchemaTpl('style:common', {
      schema: customConfigs ? [...baseSchema, ...customConfigs] : baseSchema
    })

    return Array.isArray(styleConfig) ? styleConfig : [styleConfig]
  }

  /**
   * 获取标准的"事件" tab 配置
   */
  static getEventTab(supportEvents?: Array<{ label: string; value: string }>) {
    const defaultEvents = [
      { label: '点击', value: 'click' },
      { label: '鼠标悬停', value: 'mouseover' },
      { label: '鼠标离开', value: 'mouseout' },
      { label: '初始化完成', value: 'finished' }
    ]

    return [
      {
        type: 'tpl',
        tpl: '<div class="ae-ExtendMore"><p>配置图表交互事件</p></div>',
        inline: false
      },
      { type: 'divider' },
      {
        type: 'combo',
        name: 'onEvent',
        label: '事件配置',
        mode: 'normal',
        multiple: true,
        multiLine: true,
        items: [
          { type: 'select', name: 'eventName', label: '事件类型', options: supportEvents || defaultEvents },
          { type: 'select', name: 'actionType', label: '动作类型', options: [
            { label: '弹窗', value: 'dialog' },
            { label: '打开抽屉', value: 'drawer' },
            { label: '跳转链接', value: 'url' },
            { label: '刷新', value: 'reload' }
          ]},
          { type: 'input-text', name: 'actionValue', label: '动作配置' }
        ],
        addButtonText: '添加事件',
        draggable: true
      }
    ]
  }

  /**
   * 获取完整的 tabs 配置
   */
  static getFullTabs(typeTab: any, options: any = {}) {
    const { propertiesConfigs, appearanceConfigs, supportEvents, includeProperties = true, includeAppearance = true, includeEvents = true } = options

    const tabs: any[] = [typeTab]

    if (includeProperties) {
      tabs.push({ title: '属性', body: this.getPropertiesTab(propertiesConfigs) })
    }

    if (includeAppearance) {
      tabs.push({ title: '外观', body: this.getAppearanceTab(appearanceConfigs) })
    }

    if (includeEvents) {
      tabs.push({ title: '事件', body: this.getEventTab(supportEvents) })
    }

    return tabs
  }
}

export const CHART_CONFIG_CONSTANTS = {
  LEGEND_ORIENT_OPTIONS: [
    { label: '水平', value: 'horizontal' },
    { label: '垂直', value: 'vertical' }
  ],
  LEGEND_POSITION_OPTIONS: [
    { label: '左', value: 'left' },
    { label: '中', value: 'center' },
    { label: '右', value: 'right' }
  ],
  CHART_EVENTS: [
    { label: '点击', value: 'click' },
    { label: '鼠标悬停', value: 'mouseover' },
    { label: '鼠标离开', value: 'mouseout' },
    { label: '初始化完成', value: 'finished' }
  ]
}
