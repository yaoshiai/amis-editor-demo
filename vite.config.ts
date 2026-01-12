import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          '@emotion/babel-plugin',
          // 启用装饰器支持 (MobX 需要)
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 解决 i18n-runtime 的入口问题 - 使用 lib 目录
      'i18n-runtime': path.resolve(__dirname, './node_modules/i18n-runtime/lib/index.js')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  build: {
    outDir: 'dist',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'amis': ['amis', 'amis-core', 'amis-ui', 'amis-editor', 'amis-editor-core', 'amis-formula'],
          'react': ['react', 'react-dom', 'react-router-dom'],
          'mobx': ['mobx', 'mobx-react', 'mobx-state-tree']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['amis', 'amis-core', 'amis-ui', 'amis-editor', 'amis-editor-core', 'i18n-runtime']
  }
})
