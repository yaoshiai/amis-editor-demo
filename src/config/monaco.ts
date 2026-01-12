/**
 * Monaco Editor 配置
 * 解决 Vite 环境下 Monaco Editor worker 加载问题
 */

// 扩展 Window 接口以包含 MonacoEnvironment
declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker?: (workerId: string, label: string) => any | null
      getWorkerUrl?: (workerId: string, label: string) => string
    }
  }
}

// 配置 Monaco Editor 不使用 worker
// 这样可以避免 worker 文件加载失败的问题
// 注意: 这会禁用某些高级功能 (如实时语法检查)
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorker: function (_workerId: string, _label: string) {
      // 返回 null 禁用 worker
      // 这样可以避免尝试加载不存在的 worker 文件
      return null
    }
  }
}

export {}
