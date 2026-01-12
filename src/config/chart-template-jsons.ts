// 折线图模板
export const lineChartTemplate = {
  "type": "chart",
  "config": {
    "xAxis": {
      "type": "category",
      "data": [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ]
    },
    "yAxis": {
      "type": "value"
    },
    "series": [
      {
        "data": [820, 932, 901, 934, 1290, 1330, 1320],
        "type": "line"
      }
    ],
    "backgroundColor": "transparent"
  },
  "replaceChartOption": true,
  "id": "u:a6c3e76a3869",
  "dataFilter": "",
  "onEvent": {
    "init": {
      "weight": 0,
      "actions": []
    }
  }
}

// 饼图模板
export const pieChartTemplate = {
  "type": "chart",
  "config": {
    "series": [
      {
        "type": "pie",
        "data": [
          { "value": 335, "name": "直接访问" },
          { "value": 310, "name": "邮件营销" },
          { "value": 234, "name": "联盟广告" },
          { "value": 135, "name": "视频广告" },
          { "value": 1548, "name": "搜索引擎" }
        ],
        "radius": "50%",
        "emphasis": {
          "itemStyle": {
            "shadowBlur": 10,
            "shadowOffsetX": 0,
            "shadowColor": "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ],
    "backgroundColor": "transparent"
  },
  "replaceChartOption": true,
  "id": "u:pie-chart-template",
  "dataFilter": "",
  "onEvent": {
    "init": {
      "weight": 0,
      "actions": []
    }
  }
}

// 柱状图模板
export const barChartTemplate = {
  "type": "chart",
  "config": {
    "xAxis": {
      "type": "category",
      "data": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    "yAxis": {
      "type": "value"
    },
    "series": [
      {
        "data": [120, 200, 150, 80, 70, 110, 130],
        "type": "bar",
        "showBackground": true,
        "backgroundStyle": {
          "color": "rgba(180, 180, 180, 0.2)"
        }
      }
    ],
    "backgroundColor": "transparent"
  },
  "replaceChartOption": true,
  "id": "u:bar-chart-template",
  "dataFilter": "",
  "onEvent": {
    "init": {
      "weight": 0,
      "actions": []
    }
  }
}

// 导出所有模板
export const chartTemplateJsons = {
  line: lineChartTemplate,
  pie: pieChartTemplate,
  bar: barChartTemplate
}

// 根据类型获取模板
export function getChartTemplateJson(type: 'line' | 'pie' | 'bar') {
  return chartTemplateJsons[type] || lineChartTemplate
}
