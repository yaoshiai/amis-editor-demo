import React from 'react'
import { Editor, ShortcutKey } from 'amis-editor'
import { observer } from 'mobx-react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'amis'
import { Icon } from '../icons/index'
import { IMainStore } from '../store'
import '../editor/DisabledEditorPlugin' // 用于隐藏一些不需要的Editor预置组件
import '../renderer/MyRenderer'
import '../editor/MyRenderer'

let currentIndex = -1

let host = `${window.location.protocol}//${window.location.host}`

// 如果在 gh-pages 里面
if (/^\/amis-editor-demo/.test(window.location.pathname)) {
  host += '/amis-editor'
}

const schemaUrl = `${host}/schema.json`

function EditorWrapper({ store }: { store: IMainStore }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const index = parseInt(id || '0', 10)

  // 固定 PC 模式,屏蔽移动端切换
  const isMobile = false

  if (index !== currentIndex) {
    currentIndex = index
    if (store.pages[index]) {
      store.updateSchema(store.pages[index].schema)
    }
  }

  function save() {
    store.updatePageSchemaAt(index)
    toast.success('保存成功', '提示')
  }

  function onChange(value: any) {
    store.updateSchema(value)
    store.updatePageSchemaAt(index)
  }

  function exit() {
    navigate(`/${store.pages[index].path}`)
  }

  return (
    <div className="Editor-Demo">
      <div className="Editor-header">
        <div className="Editor-title">amis 可视化编辑器</div>
        {/* 移动端切换按钮已屏蔽 */}
        <div className="Editor-header-actions">
          <ShortcutKey />
          <div
            className={`header-action-btn m-1 ${store.preview ? 'primary' : ''}`}
            onClick={() => {
              store.setPreview(!store.preview)
            }}
          >
            {store.preview ? '编辑' : '预览'}
          </div>
          {!store.preview && (
            <div className={`header-action-btn exit-btn`} onClick={exit}>
              退出
            </div>
          )}
        </div>
      </div>
      <div className="Editor-inner">
        <Editor
          theme={'cxd'}
          preview={store.preview}
          isMobile={isMobile}
          value={store.schema}
          onChange={onChange}
          onPreview={() => {
            store.setPreview(true)
          }}
          onSave={save}
          className="is-fixed"
          $schemaUrl={schemaUrl}
          showCustomRenderersPanel={true}
          amisEnv={{
            fetcher: store.fetcher,
            notify: store.notify,
            alert: store.alert,
            copy: store.copy
          }}
        />
      </div>
    </div>
  )
}

export default observer(EditorWrapper)
