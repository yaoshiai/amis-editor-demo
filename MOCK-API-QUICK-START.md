# Mock API 快速使用指南

## 概述

项目中已内置 Mock API 服务，可以用于演示图表的自动刷新功能。

## 快速开始

### 步骤1：启动项目

```bash
npm run dev
```

### 步骤2：添加图表组件

1. 从左侧拖入"模板图表"组件到画布
2. 选中组件，查看右侧配置面板

### 步骤3：配置自动刷新

#### 方式A：使用"快速创建" tab（推荐）

1. 切换到"快速创建" tab
2. 选择图表类型（折线图/饼图/柱状图）
3. 在"⏰ 时间维度"中选择"自动刷新"频率，例如：`5秒`

#### 方式B：使用"属性" tab

1. 切换到"属性" tab
2. 找到"数据接口"配置项
3. 填写 API 地址（见下方）
4. 配置"数据处理"函数
5. 设置"定时刷新"间隔

### 步骤4：配置 API 接口

在"属性" tab 中找到"数据接口"，填写以下 URL：

**折线图**（实时监测）：
```
/api/mock/chart?chartType=${chartType}&metrics=${metrics}
```

**饼图**（占比分析）：
```
/api/mock/chart?chartType=${chartType}&deptId=${deptId}
```

**柱状图**（对比统计）：
```
/api/mock/chart?chartType=${chartType}&timePeriod=${timePeriod}
```

### 步骤5：配置数据处理函数

在"数据接口"下方找到"数据处理"，粘贴以下代码：

```javascript
// Mock API 数据处理
if (!data || data.status !== 0) {
  return config
}

const apiData = data.data

// 更新系列数据
if (apiData.series && apiData.series.length > 0) {
  const newSeries = apiData.series.map((s, index) => {
    const existingSeries = config.series[index] || {}
    return {
      ...existingSeries,
      ...s,
      itemStyle: existingSeries.itemStyle || s.itemStyle,
      lineStyle: existingSeries.lineStyle || s.lineStyle,
      areaStyle: existingSeries.areaStyle || s.areaStyle
    }
  })

  config = {
    ...config,
    series: newSeries
  }
}

// 更新 X 轴数据
if (apiData.xAxis && apiData.xAxis.data) {
  config = {
    ...config,
    xAxis: {
      ...config.xAxis,
      data: apiData.xAxis.data
    }
  }
}

return config
```

### 步骤6：查看效果

1. 打开浏览器控制台（F12）
2. 观察 Mock API 的日志输出：
   ```
   [Mock API] 启动模拟数据服务...
   [Mock API] 模拟数据服务已启动
   [Mock API] 拦截到请求: /api/mock/chart?chartType=line&metrics=active-power
   ```
3. 图表会按照设定的间隔自动刷新
4. 数据会有 ±8% ~ ±10% 的随机波动，模拟实时监控

## 控制台日志说明

### 启动日志
```
[Mock API] 启动模拟数据服务...
[Mock API] 模拟数据服务已启动
[Mock API] 请求格式: /api/mock/chart?chartType=pie&deptId=500kV-A
[Mock API] 支持的图表类型: line, pie, bar
```

### 请求日志
```
[Mock API] 拦截到请求: /api/mock/chart?chartType=line&metrics=active-power
[Mock API] 收到请求: { chartType: 'line', metrics: 'active-power' }
[Mock API] 返回数据: { status: 0, data: {...} }
```

## 支持的参数

| 参数 | 说明 | 示例 | 适用图表 |
|------|------|------|----------|
| chartType | 图表类型 | line, pie, bar | 所有 |
| deptId | 部门ID | 500kV-A, dept-workshop | 饼图 |
| timePeriod | 统计周期 | 1day, 1month, 1year | 柱状图 |
| metrics | 监测指标 | active-power, voltage | 折线图 |

## 数据波动说明

Mock API 会为数据添加随机波动，模拟实时监控效果：

- **饼图**：±10% 波动（模拟部门用电量变化）
- **柱状图**：±10% 波动（模拟时段用电量变化）
- **折线图**：±8% 波动（模拟实时指标变化）

## 完整示例 JSON

### 折线图实时监测
```json
{
  "type": "template-chart",
  "chartType": "line",
  "metrics": "active-power,voltage",
  "interval": 5000,
  "api": {
    "method": "get",
    "url": "/api/mock/chart?chartType=${chartType}&metrics=${metrics}"
  },
  "dataFilter": "// 粘贴上面的数据处理函数"
}
```

### 饼图部门占比
```json
{
  "type": "template-chart",
  "chartType": "pie",
  "deptId": "500kV-A",
  "interval": 10000,
  "api": {
    "method": "get",
    "url": "/api/mock/chart?chartType=${chartType}&deptId=${deptId}"
  },
  "dataFilter": "// 粘贴上面的数据处理函数"
}
```

### 柱状图对比统计
```json
{
  "type": "template-chart",
  "chartType": "bar",
  "timePeriod": "1day",
  "interval": 30000,
  "api": {
    "method": "get",
    "url": "/api/mock/chart?chartType=${chartType}&timePeriod=${timePeriod}"
  },
  "dataFilter": "// 粘贴上面的数据处理函数"
}
```

## 常见问题

### Q1: Mock API 不生效？

**A**: 检查以下几点：
1. 确认在开发环境运行（`npm run dev`）
2. 确认 API URL 以 `/api/mock/chart` 开头
3. 打开控制台查看是否有日志输出

### Q2: 图表不刷新？

**A**: 确保：
1. 已配置 `api` 字段
2. 已配置 `dataFilter` 字段
3. 已设置 `interval` 值（毫秒）
4. 在"快速创建" tab 中设置了"自动刷新"

### Q3: 如何停止自动刷新？

**A**: 两种方式：
1. 在"快速创建" tab 中清空"自动刷新"选择
2. 在"属性" tab 中删除 `interval` 字段

### Q4: 可以同时刷新多个图表吗？

**A**: 可以！每个图表组件都有独立的 `interval` 和 `api` 配置，可以设置不同的刷新频率。

## 技术细节

### Mock API 实现原理

1. **拦截 fetch 请求**：重写 `window.fetch` 方法
2. **检测 URL**：判断是否为 `/api/mock/chart` 开头
3. **解析参数**：从 URL query string 中提取参数
4. **生成数据**：调用数据管理器生成带波动的模拟数据
5. **返回响应**：返回标准的 Response 对象

### 数据处理流程

```
用户配置 interval
  ↓
amis 检测到 interval 字段
  ↓
amis 启动定时器
  ↓
每 interval 毫秒调用 API
  ↓
Mock API 拦截请求
  ↓
生成带波动的模拟数据
  ↓
返回数据给 amis
  ↓
amis 调用 dataFilter 处理数据
  ↓
更新图表 config
  ↓
重新渲染图表
```

### 相关文件

- `src/mock-api/mock-service.ts` - Mock API 服务实现
- `src/utils/chart-data-manager.ts` - 数据管理器
- `src/route/Editor.tsx` - Mock API 启动入口
- `AUTO-REFRESH-GUIDE.md` - 完整文档

## 下一步

如果需要使用真实数据，请参考：
1. 配置后端 API 接口
2. 修改 `dataFilter` 函数适配真实数据格式
3. 调整刷新间隔以匹配业务需求
