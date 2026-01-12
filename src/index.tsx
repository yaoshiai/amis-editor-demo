/**
 * @file entry of this example (legacy, for compatibility)
 * 实际入口文件是 src/main.tsx
 */
import * as React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/css/v4-shims.css'
import 'amis/lib/themes/cxd.css'
import 'amis/lib/helper.css'
import 'amis/sdk/iconfont.css'
import 'amis-editor-core/lib/style.css'
import './scss/style.scss'
import { setDefaultTheme } from 'amis'
import { setThemeConfig } from 'amis-editor-core'

// 主题配置 - 先注释掉,因为可能不存在
// import themeConfig from 'amis-theme-editor-helper/lib/systemTheme/cxd'

setDefaultTheme('cxd')

// setThemeConfig(themeConfig)

// react < 18
// ReactDOM.render(<App />, document.getElementById('root'))

// 注意: 这个文件已被 src/main.tsx 替代,保留仅为兼容性
export {}
