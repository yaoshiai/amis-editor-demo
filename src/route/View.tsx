import React from 'react'
import { observer } from 'mobx-react'
import { useParams } from 'react-router-dom'
import { IMainStore } from '../store'
import AMISRenderer from '../component/AMISRenderer'

function ViewWrapper({ store }: { store: IMainStore }) {
  const { menuId } = useParams<{ menuId: string }>()

  // TODO: 根据菜单ID从后端API获取页面schema
  // 现在先临时使用本地页面作为示例
  const pageSchema = React.useMemo(() => {
    // 模拟从API获取数据
    // 实际应该调用: store.fetchPageByMenuId(menuId)
    return {
      type: 'page',
      title: '后端页面渲染',
      body: `这是一个从后端加载的页面 (MenuID: ${menuId})`
    }
  }, [menuId])

  return <AMISRenderer schema={pageSchema} history={null} location={null} />
}

export default observer(ViewWrapper)
