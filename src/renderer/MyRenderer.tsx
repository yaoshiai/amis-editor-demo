import { Renderer } from 'amis'
import { RendererProps } from 'amis'
import React from 'react'

export interface MyRendererProps extends RendererProps {
  target?: string
}

export default class MyRenderer extends React.Component<MyRendererProps> {
  static defaultProps = {
    target: 'world'
  }

  render() {
    const { target } = this.props

    return <p>Hello {target}! @amis-editor</p>
  }
}

// 装饰器需要在类定义之后应用
Renderer({
  test: /\bmy-renderer$/,
  name: 'my-renderer'
})(MyRenderer)
