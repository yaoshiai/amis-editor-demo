# 图表自动刷新功能说明

## 概述

图表组件支持自动刷新功能，可以定时从服务器获取最新数据并更新图表显示。

## 当前状态

### ✅ 已实现的功能

1. **自动刷新配置 UI**
   - 在"快速创建" tab 中可以选择刷新频率
   - 支持多种预设间隔：5秒、10秒、30秒、1分钟、5分钟、15分钟、30分钟
   - 可以选择不自动刷新（手动刷新）

2. **字段保存**
   - `interval` 字段会正确保存到组件 schema 中
   - 切换图表类型或其他配置时，interval 设置会被保留

### ⚠️ 需要配合的功能

自动刷新功能 **需要配置 API 接口** 才能真正工作。这是 amis 框架的设计机制：

```
interval 字段 + api 配置 = 自动刷新功能
```

## 如何使用自动刷新功能

### 方案1：使用 Mock API（推荐用于演示）

#### ✅ Mock API 已内置

项目中已经内置了 Mock API 服务，位于 `src/mock-api/mock-service.ts`。

该服务会自动拦截 `/api/mock/chart` 开头的请求，并根据参数返回模拟数据。

#### Step 1: 配置 API 接口

1. 在编辑器中拖入"模板图表"组件
2. 选中组件，切换到"属性" tab
3. 找到"数据接口"配置项
4. 填写以下 API 地址：

```json
/api/mock/chart?chartType=${chartType}&deptId=${deptId}
```

**说明**：
- `${chartType}` - 会自动替换为当前的图表类型（line/pie/bar）
- `${deptId}` - 会自动替换为当前选择的部门ID（饼图专用）
- `${timePeriod}` - 会自动替换为当前选择的统计周期（柱状图专用）
- `${metrics}` - 会自动替换为当前选择的指标（折线图专用）

#### Step 2: 配置数据处理函数

在"数据接口"下方找到"数据处理"配置项，粘贴以下代码：

```javascript
// Mock API 数据处理函数
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

// 更新 X 轴数据（柱状图需要）
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

#### Step 3: 设置自动刷新

1. 切换到"快速创建" tab
2. 在"⏰ 时间维度"中找到"自动刷新"
3. 选择刷新频率，例如：`5秒`

#### Step 4: 测试效果

```bash
npm run dev
```

打开浏览器控制台，您会看到：

```
[Mock API] 启动模拟数据服务...
[Mock API] 模拟数据服务已启动
[Mock API] 拦截到请求: /api/mock/chart?chartType=line&metrics=active-power
[Mock API] 收到请求: { chartType: 'line', metrics: 'active-power' }
[Mock API] 返回数据: { status: 0, data: {...} }
```

图表会每 5 秒自动刷新一次，数据会有 ±8% 的随机波动，模拟实时监控效果。

#### 不同图表类型的 API 配置

**折线图**：
```
/api/mock/chart?chartType=${chartType}&metrics=${metrics}
```

**饼图**：
```
/api/mock/chart?chartType=${chartType}&deptId=${deptId}
```

**柱状图**：
```
/api/mock/chart?chartType=${chartType}&timePeriod=${timePeriod}
```

#### 完整示例配置

以折线图为例：

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
  "dataFilter": "// 粘贴上面的数据处理函数",
  "config": {
    "title": { "text": "实时负荷监测" }
  }
}
```

### 方案2：使用真实 API（生产环境）

#### Step 1: 配置后端 API

在后端提供数据接口，例如：

```typescript
// 后端接口示例（Node.js + Express）
app.get('/api/chart/power-data', (req, res) => {
  const { chartType, deptId, timePeriod, metrics } = req.query

  let data = {}

  if (chartType === 'pie') {
    // 查询数据库获取该部门的用电量数据
    data = await db.query(`
      SELECT device_name, power_value
      FROM power_consumption
      WHERE dept_id = ?
      ORDER BY power_value DESC
    `, [deptId])
  } else if (chartType === 'line') {
    // 查询数据库获取时间序列数据
    data = await db.query(`
      SELECT timestamp, value
      FROM power_monitoring
      WHERE metric_id = ?
      ORDER BY timestamp DESC
      LIMIT 12
    `, [metrics])
  }

  res.json({
    status: 0,
    data: data
  })
})
```

#### Step 2: 配置数据映射

在"属性" tab 中配置 `dataFilter`，将 API 返回的数据映射到 ECharts 配置：

```javascript
return {
  ...config,
  series: [
    {
      ...config.series[0],
      data: data.items.map(item => ({
        name: item.device_name,
        value: item.power_value
      }))
    }
  ]
}
```

#### Step 3: 设置自动刷新

同方案1的 Step 3

## 技术原理

### amis 自动刷新机制

amis 的 Chart 组件通过以下流程实现自动刷新：

```
1. 检测到 interval 字段（单位：毫秒）
   ↓
2. 启动定时器
   ↓
3. 每隔 interval 毫秒调用 api 接口
   ↓
4. 将返回的数据传递给 dataFilter 处理
   ↓
5. 更新 config 配置
   ↓
6. 重新渲染图表
```

### 关键配置字段

```typescript
{
  type: 'template-chart',

  // 自动刷新间隔（毫秒）
  interval: 5000,  // 5秒

  // 数据接口（必需）
  api: {
    method: 'get',
    url: '/api/chart/data',
    data: {
      chartType: '${chartType}',
      deptId: '${deptId}'
    }
  },

  // 数据处理函数（可选）
  dataFilter: `
    // 处理 API 返回的数据
    return {
      ...config,
      series: [{
        data: data.items
      }]
    }
  `
}
```

## 示例配置

### 示例1：饼图自动刷新

```json
{
  "type": "template-chart",
  "chartType": "pie",
  "deptId": "500kV-A",
  "interval": 10000,
  "api": {
    "method": "get",
    "url": "/api/chart/pie?deptId=${deptId}"
  },
  "dataFilter": "return { ...config, series: [{ data: data.series[0].data }] }",
  "config": {
    "title": { "text": "500kV站A用电量占比" }
  }
}
```

### 示例2：折线图自动刷新

```json
{
  "type": "template-chart",
  "chartType": "line",
  "metrics": "active-power,voltage",
  "interval": 5000,
  "api": {
    "method": "get",
    "url": "/api/chart/line?metrics=${metrics}"
  },
  "dataFilter": "return { ...config, series: data.series }",
  "config": {
    "title": { "text": "实时负荷监测" }
  }
}
```

## 注意事项

1. **API 是必需的**
   - 只设置 `interval` 不会触发自动刷新
   - 必须同时配置 `api` 字段

2. **刷新频率建议**
   - 最小间隔：建议不少于 5 秒
   - 实时监控：5-10秒
   - 定时更新：1-5分钟
   - 长期统计：15-30分钟

3. **性能考虑**
   - 频繁刷新会增加服务器负担
   - 建议后端做数据缓存
   - 前端可考虑使用 WebSocket 替代轮询

4. **数据格式**
   - API 返回的数据需要通过 `dataFilter` 转换
   - 确保返回的数据格式与 ECharts 配置匹配

5. **错误处理**
   - 如果 API 请求失败，图表不会更新
   - 建议在后端添加日志记录
   - 可以配置 `error` 事件处理失败情况

## 常见问题

### Q1: 设置了 interval 但图表不刷新？

**A:** 检查是否配置了 `api` 字段。amis 的自动刷新必须配合 API 使用。

### Q2: 如何停止自动刷新？

**A:** 有两种方式：
1. 在"快速创建" tab 中将"自动刷新"清空（选择空值）
2. 在"属性" tab 中删除 `interval` 字段

### Q3: 刷新时如何传递当前配置的参数？

**A:** 使用变量替换：
```json
{
  "api": {
    "url": "/api/chart/data?deptId=${deptId}&type=${chartType}"
  }
}
```

### Q4: 可以在不同图表类型间切换并保持刷新吗？

**A:** 可以。`interval` 字段会保留，但需要确保 API 支持不同图表类型的数据请求。

## 下一步优化建议

1. **WebSocket 支持**
   - 对于真正实时的数据推送，建议使用 WebSocket
   - 可以减少服务器压力，提高实时性

2. **数据缓存**
   - 在后端实现数据缓存机制
   - 避免频繁查询数据库

3. **断线重连**
   - 实现自动重连机制
   - 网络恢复后自动继续刷新

4. **刷新状态提示**
   - 在图表上显示"正在刷新..."提示
   - 标识最后一次更新时间

## 相关文档

- [amis Chart 组件文档](https://aisuda.github.io/amis/zh-CN/components/chart)
- [amis API 配置文档](https://aisuda.github.io/amis/zh-CN/docs/Types/api)
- [数据联动实现文档](./DATA-LINKAGE-IMPLEMENTATION.md)
- [功能说明文档](./POWER-CHART-FEATURES.md)
