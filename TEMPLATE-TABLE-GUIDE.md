# 模板表格组件使用指南

## 组件概述

模板表格是一个基于 amis CRUD 的自定义表格组件，专为电网电力业务场景设计。它提供了三种预定义的表格类型，可以快速创建功能完整的表格页面。

## 三种表格类型

### 1. 设备台账列表 (basic)
- **适用场景**: 基础数据展示
- **功能特点**:
  - 纯展示功能
  - 无分页
  - 无筛选
  - 可排序
  - 支持列显示开关

**预定义列**:
- 序号
- 设备名称
- 设备类型
- 型号规格
- 生产厂家
- 安装日期
- 运行状态（带颜色标记）

### 2. 巡检记录列表 (paginated)
- **适用场景**: 需要翻页的数据列表
- **功能特点**:
  - 支持分页
  - 支持筛选（日期、巡检类型）
  - 刷新按钮
  - 数据统计
  - 自定义每页条数

**预定义列**:
- 序号
- 巡检日期
- 巡检人员
- 设备名称
- 巡检类型（例行/专项/应急）
- 巡检结果（带颜色标记）
- 备注

### 3. 故障处理工单 (full-featured)
- **适用场景**: 复杂的业务数据管理
- **功能特点**:
  - 完整的分页功能
  - 高级筛选（时间范围、故障类型、故障等级、处理状态、关键字）
  - 行操作：查看、编辑、导出
  - 批量操作：批量导出
  - 工具栏：刷新、导出Excel
  - 自定义每页条数
  - 跳转到指定页

**预定义列**:
- 工单号
- 故障时间
- 设备名称
- 故障类型（电气/机械/热工/控制/其他）
- 故障等级（带颜色标记）
- 上报人
- 处理人
- 处理状态（带颜色标记）
- 故障描述

## 使用方法

### 方法一：在可视化编辑器中使用

1. **打开编辑器**
   - 访问 `http://localhost:4000`
   - 进入编辑模式

2. **添加组件**
   - 在左侧组件面板中找到"自定义组件"分类
   - 展开"表格"分类
   - 找到"模板表格"组件
   - 拖拽到页面中

3. **配置表格**
   - 点击组件，在右侧面板中配置

#### 快速创建 Tab
- **表格类型**: 选择表格类型（设备台账/巡检记录/故障工单）
- **基本配置**:
  - 表格标题：自定义表格标题
  - 每页显示条数：设置每页显示的数据条数（5-200）
  - 显示序号列：是否在第一列显示序号

#### 属性 Tab
- **基本**:
  - 布局原点
  - 组件名称

- **数据**:
  - 数据接口：配置 API 接口
  - 列配置：动态添加/删除/修改列
  - 初始是否拉取：是否在组件初始化时自动拉取数据
  - 定时刷新：设置自动刷新间隔
  - 可筛选：是否显示筛选区域
  - 可排序：是否支持列排序
  - 列显示开关：是否显示列配置开关

- **功能**:
  - 各种功能开关

- **状态**:
  - 显示/隐藏配置
  - 条件显示/隐藏

#### 外观 Tab
- **基本样式**:
  - 宽度
  - 高度

- **主题配置**:
  - 各种样式主题选项

#### 事件 Tab
支持的事件：
- **选中项变化**: 表格选中项发生变化时触发
- **列排序**: 点击列头排序时触发
- **列筛选**: 列筛选条件变化时触发
- **行点击**: 点击表格行时触发
- **行双击**: 双击表格行时触发

### 方法二：直接使用 Schema

#### 设备台账列表
```json
{
  "type": "page",
  "title": "设备管理",
  "body": {
    "type": "template-table",
    "tableType": "basic",
    "id": "device-table",
    "title": "设备台账列表",
    "perPage": 10,
    "showIndex": true,
    "api": {
      "method": "get",
      "url": "/api/devices"
    }
  }
}
```

#### 巡检记录列表
```json
{
  "type": "page",
  "title": "巡检管理",
  "body": {
    "type": "template-table",
    "tableType": "paginated",
    "id": "inspection-table",
    "title": "巡检记录列表",
    "perPage": 10,
    "showIndex": true,
    "api": {
      "method": "get",
      "url": "/api/inspections"
    }
  }
}
```

#### 故障处理工单
```json
{
  "type": "page",
  "title": "故障管理",
  "body": {
    "type": "template-table",
    "tableType": "full-featured",
    "id": "fault-table",
    "title": "故障处理工单",
    "perPage": 10,
    "showIndex": true,
    "api": {
      "method": "get",
      "url": "/api/faults"
    }
  }
}
```

### 方法三：自定义列配置

如果需要自定义列，可以通过 `columns` 属性覆盖默认配置：

```json
{
  "type": "template-table",
  "tableType": "basic",
  "title": "自定义表格",
  "columns": [
    {
      "name": "id",
      "label": "ID",
      "type": "text",
      "width": 80
    },
    {
      "name": "name",
      "label": "名称",
      "type": "text",
      "sortable": true
    },
    {
      "name": "status",
      "label": "状态",
      "type": "mapping",
      "map": {
        "1": "<span class='label label-success'>正常</span>",
        "0": "<span class='label label-danger'>异常</span>"
      }
    }
  ],
  "api": {
    "method": "get",
    "url": "/api/custom-data"
  }
}
```

## API 数据格式

### 请求格式
amis CRUD 会自动发送分页、排序、筛选等参数：

```
GET /api/table/basic?page=1&perPage=10&orderBy=id&orderDir=asc
```

### 响应格式

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "items": [
      {
        "id": 1,
        "deviceName": "变压器A",
        "deviceType": "变压器",
        "model": "S11-M-400/10",
        "manufacturer": "某某电气",
        "installDate": "2020-01-15",
        "status": "1"
      }
    ],
    "total": 100
  }
}
```

## 切换表格类型

在编辑器中切换表格类型时：

1. **自动替换的内容**:
   - 列配置（columns）
   - 筛选配置（filter）
   - 批量操作（bulkActions）
   - 行操作（itemActions）
   - 工具栏配置（headerToolbar、footerToolbar）

2. **保留的内容**:
   - 布局属性（size、offset）
   - 显示/隐藏配置（visible、hidden、visibleOn、hiddenOn）
   - 组件 ID
   - API 配置（如果已自定义）
   - 自定义样式

## 高级用法

### 自定义筛选条件

```json
{
  "type": "template-table",
  "tableType": "paginated",
  "filter": {
    "title": "高级筛选",
    "submitText": "查询",
    "controls": [
      {
        "type": "input-date-range",
        "name": "dateRange",
        "label": "日期范围"
      },
      {
        "type": "select",
        "name": "type",
        "label": "类型",
        "options": [
          {"label": "全部", "value": ""},
          {"label": "类型A", "value": "a"},
          {"label": "类型B", "value": "b"}
        ]
      }
    ]
  }
}
```

### 自定义行操作

```json
{
  "type": "template-table",
  "tableType": "full-featured",
  "itemActions": [
    {
      "type": "button",
      "label": "查看详情",
      "actionType": "dialog",
      "level": "link",
      "dialog": {
        "title": "详情",
        "body": {
          "type": "form",
          "body": [
            {
              "type": "static",
              "name": "id",
              "label": "ID"
            }
          ]
        }
      }
    }
  ]
}
```

### 自定义工具栏

```json
{
  "type": "template-table",
  "tableType": "full-featured",
  "headerToolbar": [
    {
      "type": "reload",
      "icon": "fa fa-sync",
      "label": "刷新"
    },
    {
      "type": "export-excel",
      "icon": "fa fa-download",
      "label": "导出Excel",
      "api": {
        "method": "post",
        "url": "/api/export"
      }
    }
  ]
}
```

## 注意事项

1. **表格类型切换**: 切换表格类型会完全替换列配置，如果需要保留自定义列，请在切换后重新配置
2. **API 配置**: 确保后端 API 返回的数据格式符合 amis CRUD 的要求
3. **事件处理**: 事件配置在编辑器中进行，支持 JavaScript 表达式
4. **样式定制**: 可以通过"外观" Tab 中的主题配置来调整表格样式

## 技术实现

- **渲染器**: `src/renderers/TemplateTable.tsx`
- **编辑器插件**: `src/editor/plugins/TemplateTablePlugin.tsx`
- **配置模板**: `src/config/table-templates.ts`

## 相关文档

- [amis CRUD 文档](https://aisuda.bce.baidu.com/amis/zh-CN/components/crud)
- [amis 表格列配置](https://aisuda.bce.baidu.com/amis/zh-CN/components/crud#%E5%88%97%E9%85%8D%E7%BD%AE)
