import React from 'react'
import { ToastComponent, AlertComponent, Spinner } from 'amis'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { observer } from 'mobx-react'
import { IMainStore } from '../store/index'
import '../renderer/MyRenderer'
const Preview = React.lazy(() => import('./Preview'))
const Editor = React.lazy(() => import('./Editor'))
const View = React.lazy(() => import('./View'))

export default observer(function ({ store }: { store: IMainStore }) {
  return (
    <Router>
      <div className="routes-wrapper">
        <ToastComponent key="toast" position={'top-right'} />
        <AlertComponent key="alert" />
        <React.Suspense fallback={<Spinner overlay className="m-t-lg" size="lg" />}>
          <Routes>
            {/* 默认重定向 */}
            <Route path="/" element={<Navigate to="/hello-world" replace />} />

            {/* 编辑器路由 */}
            <Route path="/edit/:id" element={<Editor store={store} />} />

            {/* 页面渲染路由 (新增) */}
            <Route path="/view/:menuId" element={<View store={store} />} />

            {/* 预览本地页面 */}
            <Route path="/*" element={<Preview store={store} />} />
          </Routes>
        </React.Suspense>
      </div>
    </Router>
  )
})
