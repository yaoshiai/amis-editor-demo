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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
