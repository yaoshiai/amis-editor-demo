# 数据联动实现文档

## 概述

本文档说明了电力图表编辑器中数据联动功能的实现细节。当用户在"快速创建" tab 中修改配置项时，图表数据会自动更新以反映新的配置。

## 实现架构

### 1. 数据管理层

**文件位置**: [src/utils/chart-data-manager.ts](src/utils/chart-data-manager.ts)

负责处理各种图表配置变更时的数据更新逻辑。

#### 核心函数

##### updatePieChartConfig(config, deptId)
更新饼图配置，根据选择的部门显示不同的用电量分布。

```typescript
// 示例：选择"500kV站A"
const newConfig = updatePieChartConfig(currentConfig, '500kV-A')

// 结果：
// - 标题更新为"500kV站A用电量占比"
// - 数据更新为该站设备的用电量分布（1#主变、2#主变、母线等）
```

**数据映射**:
- `500kV-A` → 500kV变电站A的设备数据
- `dept-workshop` → 生产车间的用电设备数据
- `dept-office` → 办公区域的电器设备数据

##### updateBarChartConfig(config, period)
更新柱状图配置，根据统计周期显示不同的时间轴数据。

```typescript
// 示例：选择"1天"统计周期
const newConfig = updateBarChartConfig(currentConfig, '1day')

// 结果：
// - 标题更新为"24小时用电量对比"
// - X轴数据：['00:00', '02:00', '04:00', ..., '22:00']
// - 系列数据：对应24小时的用电量
```

**支持的周期**:
- `1day` → 24小时数据点
- `1week` → 7天数据点
- `1month` → 30天数据点（随机生成）
- `1quarter` → 3个月数据点
- `1year` → 12个月数据点

##### updateLineChartConfig(config, metricIds, decimalPlaces)
更新折线图配置，支持单指标或多指标显示。

```typescript
// 示例1：单指标
const newConfig = updateLineChartConfig(currentConfig, ['active-power'], 2)

// 结果：
// - Y轴单位：MW
// - 单条折线：有功功率
// - 小数位数：2位

// 示例2：多指标
const newConfig = updateLineChartConfig(
  currentConfig,
  ['active-power', 'reactive-power', 'voltage'],
  2
)

// 结果：
// - 三条折线：有功功率(MW)、无功功率(MVar)、电压(kV)
// - 显示图例
// - Tooltip显示所有指标数据
```

**支持的指标**:
- `active-power` → 有功功率（MW）
- `reactive-power` → 无功功率（MVar）
- `voltage` → 电压（kV）
- `current` → 电流（A）
- `power-factor` → 功率因数（cosφ）
- `energy` → 用电量（kWh）

##### addAlarmLines(config, alarms)
为折线图添加告警线。

```typescript
// 示例：添加上下限告警
const alarms = [
  { type: 'upper', threshold: 700, name: '上限告警' },
  { type: 'lower', threshold: 300, name: '下限告警' }
]
const newConfig = addAlarmLines(currentConfig, alarms)

// 结果：
// - 在图表上添加两条虚线标记
// - 上限线：红色，位置700
// - 下限线：绿色，位置300
```

### 2. 插件集成层

**文件位置**: [src/editor/plugins/TemplateChartPlugin.tsx](src/editor/plugins/TemplateChartPlugin.tsx)

负责将数据管理功能集成到 amis-editor 的配置面板中。

#### 核心方法

##### updateComponentConfig(newConfig)
通用的配置更新方法，用于将新配置应用到组件。

```typescript
updateComponentConfig(newConfig: any) {
  const manager = this.manager
  const store = manager.store
  const activeId = store.activeId

  // 获取当前schema
  const schema = store.getSchema(activeId)

  // 构建新schema，保留布局属性
  const updatedSchema = {
    ...schema,
    config: newConfig
  }

  // 替换组件
  manager.replaceChild(activeId, updatedSchema)
}
```

#### onChange 处理器实现

##### 1. 部门选择（饼图）

```typescript
// TemplateChartPlugin.tsx:417-437
onChange: (value, oldValue, model, form) => {
  if (!value) return

  const currentConfig = form?.data?.config
  const newConfig = updatePieChartConfig(currentConfig, value)

  this.updateComponentConfig(newConfig)
}
```

**触发时机**: 用户在饼图中选择部门时

**数据流**:
```
用户选择部门
  → deptId 变更
  → updatePieChartConfig()
  → 更新图表标题和数据
  → updateComponentConfig()
  → 刷新组件显示
```

##### 2. 统计周期（柱状图）

```typescript
// TemplateChartPlugin.tsx:462-482
onChange: (value, oldValue, model, form) => {
  if (!value) return

  const currentConfig = form?.data?.config
  const newConfig = updateBarChartConfig(currentConfig, value)

  this.updateComponentConfig(newConfig)
}
```

**触发时机**: 用户在柱状图中选择统计周期时

**数据流**:
```
用户选择统计周期
  → timePeriod 变更
  → updateBarChartConfig()
  → 更新图表标题、X轴、系列数据
  → updateComponentConfig()
  → 刷新组件显示
```

##### 3. 监测指标（折线图）

```typescript
// TemplateChartPlugin.tsx:525-550
onChange: (value, oldValue, model, form) => {
  if (!value) return

  // 处理逗号分隔的字符串
  const metricIds = typeof value === 'string' ? value.split(',') : value

  const currentConfig = form?.data?.config
  const decimalPlaces = form?.data?.decimalPlaces || 2

  const newConfig = updateLineChartConfig(
    currentConfig,
    metricIds,
    decimalPlaces
  )

  this.updateComponentConfig(newConfig)
}
```

**触发时机**: 用户在折线图中选择/取消选择指标时

**数据流**:
```
用户勾选/取消指标
  → metrics 字符串变更（如："active-power,reactive-power"）
  → updateLineChartConfig()
  → 更新Y轴单位、系列数据、图例
  → updateComponentConfig()
  → 刷新组件显示
```

##### 4. 小数位数（折线图）

```typescript
// TemplateChartPlugin.tsx:560-585
onChange: (value, oldValue, model, form) => {
  const metrics = form?.data?.metrics
  if (!metrics) return

  const metricIds = typeof metrics === 'string' ? metrics.split(',') : metrics
  const currentConfig = form?.data?.config

  const newConfig = updateLineChartConfig(
    currentConfig,
    metricIds,
    value || 2
  )

  this.updateComponentConfig(newConfig)
}
```

**触发时机**: 用户修改小数位数设置时

**数据流**:
```
用户修改小数位数
  → decimalPlaces 变更
  → updateLineChartConfig()
  → 更新Y轴格式化器（如：value.toFixed(2)）
  → updateComponentConfig()
  → 刷新组件显示
```

##### 5. 告警规则（折线图）

```typescript
// TemplateChartPlugin.tsx:635-655
onChange: (value, oldValue, model, form) => {
  if (!value || value.length === 0) return

  const currentConfig = form?.data?.config
  const newConfig = addAlarmLines(currentConfig, value)

  this.updateComponentConfig(newConfig)
}
```

**触发时机**: 用户添加/修改/删除告警规则时

**数据流**:
```
用户配置告警规则
  → alarms 数组变更
  → addAlarmLines()
  → 添加 markLine 数据
  → updateComponentConfig()
  → 刷新组件显示
```

##### 6. 自动刷新（所有图表）

```typescript
// TemplateChartPlugin.tsx:497-519
onChange: (value, oldValue, model, form) => {
  const currentConfig = form?.data?.config

  const newConfig = { ...currentConfig }

  this.updateComponentConfig(newConfig)

  if (value && value > 0) {
    console.log('自动刷新已设置，请确保在"属性"tab中配置了数据接口')
  }
}
```

**触发时机**: 用户设置自动刷新频率时

**注意**: 自动刷新需要配合 API 接口使用。interval 字段会被 amis 自动应用到图表组件上。

## 使用示例

### 示例1：创建24小时负荷监测折线图

**操作步骤**:
1. 从左侧拖入"模板图表"组件
2. 在"快速创建" tab 中确认图表类型为"折线图"
3. 在"监测指标"中勾选"有功功率"
4. 设置小数位数为 2

**结果**:
```
图表标题：24小时负荷监测曲线
Y轴单位：MW
数据：24小时有功功率数据
格式：数值显示2位小数（如：320.50 MW）
```

### 示例2：创建各部门用电量饼图

**操作步骤**:
1. 拖入"模板图表"组件
2. 切换图表类型为"饼图"
3. 在"组织机构"中选择"500kV站A"

**结果**:
```
图表标题：500kV站A用电量占比
数据项：1#主变、2#主变、母线、无功补偿、站用电
数据：该站各设备的用电量占比
```

### 示例3：创建多指标对比折线图

**操作步骤**:
1. 拖入"模板图表"组件
2. 确认图表类型为"折线图"
3. 在"监测指标"中同时勾选"有功功率"、"无功功率"、"电压"

**结果**:
```
图表标题：24小时负荷监测曲线
系列数：3条折线
图例：显示在顶部
颜色：
  - 有功功率：蓝色 (#5470c6)
  - 无功功率：绿色 (#91cc75)
  - 电压：黄色 (#fac858)
Tooltip：悬停时显示所有三个指标的数据
```

### 示例4：创建带告警的折线图

**操作步骤**:
1. 拖入"模板图表"组件
2. 确认图表类型为"折线图"
3. 展开"告警设置"面板
4. 添加上限告警：阈值 700 MW
5. 添加下限告警：阈值 300 MW

**结果**:
```
图表标题：24小时负荷监测曲线
告警线：
  - 红色虚线：700 MW（上限告警）
  - 绿色虚线：300 MW（下限告警）
  - 黑色虚线：平均值
```

## 技术细节

### 配置数据结构

#### 表单数据（form.data）
```typescript
{
  chartType: 'line' | 'pie' | 'bar',
  deptId: string,              // 部门ID（饼图）
  timePeriod: string,          // 统计周期（柱状图）
  metrics: string,             // 指标ID，逗号分隔（折线图）
  decimalPlaces: number,       // 小数位数（折线图）
  alarms: Array<{              // 告警规则（折线图）
    type: 'upper' | 'lower',
    threshold: number,
    metricId: string
  }>,
  interval: number,            // 刷新频率（毫秒）
  config: object               // 当前ECharts配置
}
```

#### ECharts配置（config）
```typescript
{
  title: { text: string },
  xAxis: { type: string, data: string[], name: string },
  yAxis: { type: string, name: string, axisLabel: {...} },
  series: Array<{
    name: string,
    data: number[],
    type: 'line' | 'bar' | 'pie',
    markLine?: { data: Array<{...}> }
  }>,
  tooltip: { formatter: string | function },
  legend: { data: string[] }
}
```

### 状态管理

#### amis-editor 状态
- `manager.store.activeId`: 当前选中组件的ID
- `manager.store.getSchema(id)`: 获取组件的schema
- `manager.replaceChild(id, newSchema)`: 替换组件配置

#### 表单状态
- `form.data`: 当前表单的所有字段值
- `form.data.config`: 当前组件的ECharts配置

### 数据流总结

```
用户操作（onChange）
  ↓
访问表单数据（form.data）
  ↓
调用数据管理器函数
  ↓
生成新的ECharts配置
  ↓
调用 updateComponentConfig()
  ↓
获取当前组件schema
  ↓
构建新schema（保留布局，更新配置）
  ↓
调用 manager.replaceChild()
  ↓
amis-editor 更新组件
  ↓
图表重新渲染
```

## 扩展指南

### 添加新的图表类型

1. 在 [src/config/chart-templates.ts](src/config/chart-templates.ts) 中添加模板
2. 在 [src/config/power-chart-config.ts](src/config/power-chart-config.ts) 中添加配置选项
3. 在 [src/utils/chart-data-manager.ts](src/utils/chart-data-manager.ts) 中添加数据函数
4. 在 [src/editor/plugins/TemplateChartPlugin.tsx](src/editor/plugins/TemplateChartPlugin.tsx) 中添加 onChange 处理器

### 添加新的指标

1. 在 `power-chart-config.ts` 的 `metricOptions` 中添加配置
2. 在 `chart-data-manager.ts` 的 `metricDataMap` 中添加数据
3. 更新文档说明

### 添加新的部门

1. 在 `power-chart-config.ts` 的 `departmentOptions` 中添加选项
2. 在 `chart-data-manager.ts` 的 `deptDataMap` 中添加数据

### 集成真实API

当前使用模拟数据。要集成真实API：

1. 在"属性" tab 中配置数据接口（api字段）
2. 配置数据处理函数（dataFilter字段）
3. 移除快速创建 tab 中的模拟数据调用
4. 使用真实API返回的数据更新图表

示例：
```typescript
// 在 dataFilter 中处理API数据
dataFilter: `
  return {
    ...config,
    series: [{
      ...config.series[0],
      data: data.items  // 使用API返回的数据
    }]
  }
`
```

## 注意事项

1. **性能优化**:
   - 避免频繁的配置更新
   - 可以考虑添加防抖（debounce）处理
   - 大量数据时使用虚拟滚动

2. **错误处理**:
   - 所有 onChange 都有错误检查
   - 检查 form.data 是否存在
   - 检查配置是否为空

3. **数据一致性**:
   - 确保配置项之间的一致性（如：指标和小数位数）
   - 清空选择时不要更新配置
   - 切换图表类型时重置相关配置

4. **用户体验**:
   - console.log 输出便于调试
   - 配置说明清晰易懂
   - 条件显示避免混淆

## 相关文件

- [src/utils/chart-data-manager.ts](src/utils/chart-data-manager.ts) - 数据管理层
- [src/config/power-chart-config.ts](src/config/power-chart-config.ts) - 业务配置
- [src/editor/plugins/TemplateChartPlugin.tsx](src/editor/plugins/TemplateChartPlugin.tsx) - 插件集成
- [src/utils/chart-switcher.ts](src/utils/chart-switcher.ts) - 图表切换
- [src/config/chart-templates.ts](src/config/chart-templates.ts) - 图表模板
- [POWER-CHART-FEATURES.md](POWER-CHART-FEATURES.md) - 功能说明
- [CHART-TYPE-CONFIG-MAPPING.md](CHART-TYPE-CONFIG-MAPPING.md) - 配置映射
