import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 样式导入
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/css/v4-shims.css'
import 'amis/lib/themes/cxd.css'
import 'amis/lib/helper.css'
import 'amis/sdk/iconfont.css'
import 'amis-editor-core/lib/style.css'
import './scss/style.scss'
import './index.scss'

// 主题配置
import { setDefaultTheme } from 'amis'

setDefaultTheme('cxd')

// 注册自定义组件
import './editor/DisabledEditorPlugin'
import './editor/plugins/ChartEditorPlugin'
import './renderers/ChartRenderer'

// 移除 StrictMode 以避免与 amis-editor 的 MobX State Tree 冲突
// StrictMode 会导致组件双重渲染,触发 MST 生命周期问题
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
