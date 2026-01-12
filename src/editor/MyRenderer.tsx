import React from 'react'
import { RendererEditor, BasicEditor } from 'amis-editor'

export default class MyRendererEditor extends BasicEditor {
  tipName = '自定义组件'
  settingsSchema = {
    title: '自定义组件配置',
    body: [
      {
        type: 'tabs',
        tabsMode: 'line',
        className: 'm-t-n-xs',
        contentClassName: 'no-border p-l-none p-r-none',
        tabs: [
          {
            title: '常规',
            controls: [
              {
                name: 'target',
                label: 'Target',
                type: 'text'
              }
            ]
          },
          {
            title: '外观',
            controls: []
          }
        ]
      }
    ]
  }
}

// 装饰器需要在类定义之后应用
RendererEditor('my-renderer', {
  name: '自定义渲染器',
  description: '这只是个示例',
  type: 'my-renderer',
  previewSchema: {
    type: 'my-renderer',
    target: 'demo'
  },
  scaffold: {
    type: 'my-renderer',
    target: '233'
  }
})(MyRendererEditor)
