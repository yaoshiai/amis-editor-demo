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

// 启动 Mock API 服务 - 必须在所有其他导入之前，确保拦截器最早设置
import { setupMockAPI } from './mock-api/mock-service'

// Monaco Editor 配置 (必须在组件注册前)
import './config/monaco'

// 注册自定义渲染器 (需要在编辑器插件之前)
import './renderers/ChartRenderer'
import './renderers/ChartRenderers'
import './renderers/TemplateTable'

// 启动 Mock API (必须在 amis 导入后，但在使用前)
// 注意：在 Vite 中使用 import.meta.env.DEV 检测开发环境
if (import.meta.env.DEV) {
  setupMockAPI()
}

// 移除 StrictMode 以避免与 amis-editor 的 MobX State Tree 冲突
// StrictMode 会导致组件双重渲染,触发 MST 生命周期问题
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)

// 注册自定义编辑器插件 (必须在 App 渲染之后)
import './editor/DisabledEditorPlugin'

// 使用统一的模板图表插件
import './editor/plugins/TemplateChartPlugin'

// 使用统一的模板表格插件
import './editor/plugins/TemplateTablePlugin'

// 旧的独立图表插件（已被 TemplateChartPlugin 替代，保留以便向后兼容）
// import './editor/plugins/LineChartPlugin'
// import './editor/plugins/PieChartPlugin'
// import './editor/plugins/BarChartPlugin'
