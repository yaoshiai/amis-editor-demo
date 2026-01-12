import React from 'react'
import { inject, observer } from 'mobx-react'
import { getEnv, isAlive } from 'mobx-state-tree'
import { IMainStore } from '../store'
import qs from 'qs'
import { render as amisRender, utils, filter } from 'amis'

export function schema2component(
  schema: any,
  transform?: Function,
  session: string = 'page'
) {
  interface SchemaRendererProps {
    store?: IMainStore  // 可选,因为会被 @inject 注入
    history?: any
    location?: any
    match?: any
    schema?: any
    [propName: string]: any
  }

  @inject('store')
  @observer
  class SchemaRenderer extends React.Component<SchemaRendererProps> {
    static displayName = 'SchemaRenderer'
    env: any

    getEnv() {
      if (this.env) {
        return this.env
      }

      const props = this.props
      const store = props.store

      // 检查 store 是否存活
      if (!store) {
        return {
          session,
          updateLocation: () => {},
          jumpTo: () => {},
          isCurrentUrl: () => false
        }
      }

      try {
        // 使用 isAlive 函数检查 store 是否存活
        if (!isAlive(store)) {
          return {
            session,
            updateLocation: () => {},
            jumpTo: () => {},
            isCurrentUrl: () => false
          }
        }
      } catch (e) {
        // 如果检查失败,返回基本环境对象
        return {
          session,
          updateLocation: () => {},
          jumpTo: () => {},
          isCurrentUrl: () => false
        }
      }

      const rootEnv = getEnv(store)

      const normalizeLink = (to: string, preserveHash?: boolean) => {
        if (/^\/api\//.test(to)) {
          return to
        }

        to = to || ''
        const history = props.history || window.history
        const location = props.location || window.location
        const currentQuery = qs.parse(location.search ? location.search.substring(1) : '')
        to = filter(to.replace(/\$\$/g, qs.stringify(currentQuery)), currentQuery)

        if (to && to[0] === '#') {
          to = location.pathname + (location.search || '') + to
        } else if (to && to[0] === '?') {
          to = location.pathname + to
        }

        const idx = to.indexOf('?')
        const idx2 = to.indexOf('#')
        let pathname = ~idx ? to.substring(0, idx) : ~idx2 ? to.substring(0, idx2) : to
        let search = ~idx ? to.substring(idx, ~idx2 ? idx2 : undefined) : ''
        let hash = ~idx2 ? to.substring(idx2) : preserveHash ? location.hash || '' : ''

        if (!pathname) {
          pathname = location.pathname
        } else if (pathname[0] != '/' && !/^\w+\:/.test(pathname)) {
          let relativeBase = location.pathname
          const paths = relativeBase.split('/')
          paths.pop()
          let m
          while ((m = /^\.\.?\//.exec(pathname))) {
            if (m[0] === '../') {
              paths.pop()
            }
            pathname = pathname.substring(m[0].length)
          }
          pathname = paths.concat(pathname).join('/')
        }

        return pathname + search + hash
      }

      const isCurrentUrl = (to: string) => {
        const link = normalizeLink(to)
        const location = props.location || window.location
        let pathname = link
        let search = ''
        const idx = link.indexOf('?')
        if (~idx) {
          pathname = link.substring(0, idx)
          search = link.substring(idx)
        }

        if (search) {
          if (pathname !== location.pathname || !location.search) {
            return false
          }
          const currentQuery = qs.parse(location.search ? location.search.substring(1) : '')
          const query = qs.parse(search.substring(1))

          return Object.keys(query).every((key) => query[key] === currentQuery[key])
        } else if (pathname === location.pathname) {
          return true
        }

        return false
      }

      return (this.env = {
        ...rootEnv,
        session,
        isCurrentUrl,
        updateLocation:
          props.updateLocation ||
          ((location: string, replace: boolean) => {
            const history = props.history || window.history
            if (location === 'goBack') {
              return history.back ? history.back() : history.goBack()
            } else if (/^https?\:\/\//.test(location)) {
              return (window.location.href = location)
            }

            if (replace) {
              history.replace(normalizeLink(location, replace))
            } else {
              history.push(normalizeLink(location, replace))
            }
          }),
        jumpTo:
          props.jumpTo ||
          ((to: string, action?: any) => {
            const history = props.history || window.history
            if (to === 'goBack') {
              return history.back ? history.back() : history.goBack()
            }

            to = normalizeLink(to)

            if (isCurrentUrl(to)) {
              return
            }

            if (action && action.actionType === 'url') {
              action.blank === false ? (window.location.href = to) : window.open(to, '_blank')
              return
            } else if (action && action.blank) {
              window.open(to, '_blank')
              return
            }

            if (/^https?:\/\//.test(to)) {
              window.location.href = to
            } else {
              history.push(to)
            }
          }),
        affixOffsetTop: props.embedMode ? 0 : 50
      })
    }

    render() {
      const { router, match, location, history, store, schema: schemaProp, jumpTo, updateLocation, embedMode, ...rest } = this.props
      let finalSchema = schemaProp || schema
      let body: React.ReactNode

      // 检查 store 是否存活
      if (!store) {
        return <div>Store unavailable</div>
      }

      try {
        // 使用 isAlive 函数检查 store 是否存活
        if (!isAlive(store)) {
          return <div>Store unavailable</div>
        }
      } catch (e) {
        // 如果检查失败,返回错误信息
        return <div>Store unavailable</div>
      }

      if (!finalSchema.type) {
        finalSchema = { ...finalSchema, type: 'page' }
      }

      const matchParams = match?.params || {}

      body = amisRender(
        finalSchema,
        {
          data: utils.createObject({
            ...matchParams,
            amisStore: store,
            pathname: location?.pathname || window.location.pathname,
            params: matchParams
          }),
          ...rest,
          fetcher: store.fetcher,
          notify: store.notify,
          alert: store.alert,
          copy: store.copy,
          propsTransform: transform,
          theme: store.theme
        },
        this.getEnv()
      )

      return <>{body}</>
    }
  }

  return SchemaRenderer
}

export default schema2component({ type: 'page', body: 'It works' })
