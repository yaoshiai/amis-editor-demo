/**
 * 表格模板配置
 * 用于自定义表格组件的模板选择
 */

export interface TableTemplate {
  id: string
  name: string
  type: 'basic' | 'paginated' | 'full-featured'
  category: '基础表格' | '分页表格' | '全功能表格'
  description: string
  // amis CRUD 配置
  config: {
    title?: string
    perPage?: number
    filter?: any
    columns?: any[]
    bulkActions?: any[]
    itemActions?: any[]
    headerToolbar?: any[]
    footerToolbar?: any[]
  }
  // API 配置
  apiConfig?: {
    url: string
    method: 'GET' | 'POST'
    dataField?: string
  }
  // 样式配置
  styleConfig?: {
    width?: string
    height?: string
  }
  // 自定义字段
  customFields?: Record<string, any>
}

/**
 * 简化的表格组件模板
 * 用于快速创建 tab 中的类型切换
 */
export interface SimpleTableTemplate {
  // 表格类型标识
  type: 'basic' | 'paginated' | 'full-featured'
  // 表格显示名称
  name: string
  // 表格图标
  icon: string
  // 表格描述
  description: string
  // amis CRUD 配置
  config: any
}

// ===== 表格1: 设备台账列表 (基础表格) =====
export const basicTableTemplate: SimpleTableTemplate = {
  type: 'basic',
  name: '设备台账列表',
  icon: 'fa fa-list',
  description: '基础表格，用于展示设备台账信息，无分页和筛选功能',
  config: {
    title: '设备台账列表',
    perPage: 10,
    columns: [
      {
        name: 'id',
        label: '序号',
        type: 'text',
        width: 80,
        sortable: true
      },
      {
        name: 'deviceName',
        label: '设备名称',
        type: 'text',
        sortable: true,
        searchable: true
      },
      {
        name: 'deviceType',
        label: '设备类型',
        type: 'text',
        sortable: true
      },
      {
        name: 'model',
        label: '型号规格',
        type: 'text'
      },
      {
        name: 'manufacturer',
        label: '生产厂家',
        type: 'text'
      },
      {
        name: 'installDate',
        label: '安装日期',
        type: 'date',
        format: 'YYYY-MM-DD'
      },
      {
        name: 'status',
        label: '运行状态',
        type: 'mapping',
        map: {
          '1': '<span class="label label-info">运行中</span>',
          '0': '<span class="label label-warning">停机</span>',
          '-1': '<span class="label label-danger">故障</span>'
        }
      }
    ],
    filter: undefined,
    bulkActions: [],
    itemActions: [],
    headerToolbar: [],
    footerToolbar: [],
    columnsTogglable: true,
    autoGenerateFilter: false,
    // 添加 API 配置
    api: {
      method: 'get',
      url: '/api/table/basic'
    }
  }
}

// ===== 表格2: 巡检记录列表 (带分页表格) =====
export const paginatedTableTemplate: SimpleTableTemplate = {
  type: 'paginated',
  name: '巡检记录列表',
  icon: 'fa fa-list-alt',
  description: '带分页功能的表格，用于展示巡检记录，支持翻页',
  config: {
    title: '巡检记录列表',
    perPage: 10,
    columns: [
      {
        name: 'id',
        label: '序号',
        type: 'text',
        width: 80
      },
      {
        name: 'inspectionDate',
        label: '巡检日期',
        type: 'date',
        format: 'YYYY-MM-DD',
        sortable: true,
        width: 120
      },
      {
        name: 'inspector',
        label: '巡检人员',
        type: 'text',
        width: 100
      },
      {
        name: 'deviceName',
        label: '设备名称',
        type: 'text',
        sortable: true
      },
      {
        name: 'inspectionType',
        label: '巡检类型',
        type: 'mapping',
        map: {
          'routine': '例行巡检',
          'special': '专项巡检',
          'emergency': '应急巡检'
        }
      },
      {
        name: 'result',
        label: '巡检结果',
        type: 'mapping',
        map: {
          'normal': '<span class="label label-success">正常</span>',
          'abnormal': '<span class="label label-warning">异常</span>',
          'fault': '<span class="label label-danger">故障</span>'
        }
      },
      {
        name: 'remark',
        label: '备注',
        type: 'text',
        breakpoint: '*'
      }
    ],
    filter: {
      title: '筛选条件',
      submitText: '查询',
      controls: [
        {
          type: 'date',
          name: 'inspectionDate',
          label: '巡检日期',
          format: 'YYYY-MM-DD'
        },
        {
          type: 'select',
          name: 'inspectionType',
          label: '巡检类型',
          options: [
            { label: '全部', value: '' },
            { label: '例行巡检', value: 'routine' },
            { label: '专项巡检', value: 'special' },
            { label: '应急巡检', value: 'emergency' }
          ]
        }
      ]
    },
    bulkActions: [],
    itemActions: [],
    headerToolbar: [
      {
        type: 'reload',
        icon: 'fa fa-sync',
        label: '刷新'
      }
    ],
    footerToolbar: [
      {
        type: 'pagination',
        layout: ['total', 'perPage', 'pager'],
        perPageAvailable: [10, 20, 50, 100]
      },
      {
        type: 'statistics'
      }
    ],
    columnsTogglable: true,
    autoGenerateFilter: false,
    // 添加 API 配置
    api: {
      method: 'get',
      url: '/api/table/paginated'
    }
  }
}

// ===== 表格3: 故障处理工单 (全功能表格) =====
export const fullFeaturedTableTemplate: SimpleTableTemplate = {
  type: 'full-featured',
  name: '故障处理工单',
  icon: 'fa fa-table',
  description: '全功能表格，支持分页、筛选、编辑、查看、导出Excel',
  config: {
    title: '故障处理工单',
    perPage: 10,
    columns: [
      {
        name: 'id',
        label: '工单号',
        type: 'text',
        width: 100,
        sortable: true
      },
      {
        name: 'faultDate',
        label: '故障时间',
        type: 'datetime',
        format: 'YYYY-MM-DD HH:mm',
        sortable: true,
        width: 150
      },
      {
        name: 'deviceName',
        label: '设备名称',
        type: 'text',
        sortable: true,
        searchable: true
      },
      {
        name: 'faultType',
        label: '故障类型',
        type: 'mapping',
        map: {
          'electrical': '电气故障',
          'mechanical': '机械故障',
          'thermal': '热工故障',
          'control': '控制故障',
          'other': '其他'
        }
      },
      {
        name: 'faultLevel',
        label: '故障等级',
        type: 'mapping',
        map: {
          'critical': '<span class="label label-danger">重大</span>',
          'major': '<span class="label label-warning">较大</span>',
          'minor': '<span class="label label-info">一般</span>'
        }
      },
      {
        name: 'reporter',
        label: '上报人',
        type: 'text',
        width: 100
      },
      {
        name: 'handler',
        label: '处理人',
        type: 'text',
        width: 100
      },
      {
        name: 'status',
        label: '处理状态',
        type: 'mapping',
        map: {
          'pending': '<span class="label label-warning">待处理</span>',
          'processing': '<span class="label label-info">处理中</span>',
          'completed': '<span class="label label-success">已完成</span>',
          'closed': '<span class="label label-default">已关闭</span>'
        }
      },
      {
        name: 'faultDescription',
        label: '故障描述',
        type: 'text',
        breakpoint: '*'
      }
    ],
    filter: {
      title: '筛选条件',
      submitText: '查询',
      controls: [
        {
          type: 'input-date-range',
          name: 'faultDate',
          label: '故障时间',
          format: 'YYYY-MM-DD'
        },
        {
          type: 'select',
          name: 'faultType',
          label: '故障类型',
          options: [
            { label: '全部', value: '' },
            { label: '电气故障', value: 'electrical' },
            { label: '机械故障', value: 'mechanical' },
            { label: '热工故障', value: 'thermal' },
            { label: '控制故障', value: 'control' },
            { label: '其他', value: 'other' }
          ]
        },
        {
          type: 'select',
          name: 'faultLevel',
          label: '故障等级',
          options: [
            { label: '全部', value: '' },
            { label: '重大', value: 'critical' },
            { label: '较大', value: 'major' },
            { label: '一般', value: 'minor' }
          ]
        },
        {
          type: 'select',
          name: 'status',
          label: '处理状态',
          options: [
            { label: '全部', value: '' },
            { label: '待处理', value: 'pending' },
            { label: '处理中', value: 'processing' },
            { label: '已完成', value: 'completed' },
            { label: '已关闭', value: 'closed' }
          ]
        },
        {
          type: 'text',
          name: 'keyword',
          label: '关键字',
          placeholder: '输入设备名称或工单号'
        }
      ]
    },
    bulkActions: [
      {
        label: '批量导出',
        icon: 'fa fa-download',
        actionType: 'ajax',
        confirmText: '确认要导出选中的工单吗？',
        api: {
          method: 'post',
          url: '/api/work-orders/export',
          data: '${|pick:items}'
        }
      }
    ],
    itemActions: [
      {
        type: 'button',
        icon: 'fa fa-eye',
        label: '查看',
        actionType: 'dialog',
        level: 'link',
        dialog: {
          title: '查看工单详情',
          size: 'lg',
          body: {
            type: 'form',
            body: [
              {
                type: 'static',
                name: 'id',
                label: '工单号'
              },
              {
                type: 'static',
                name: 'faultDate',
                label: '故障时间'
              },
              {
                type: 'static',
                name: 'deviceName',
                label: '设备名称'
              },
              {
                type: 'static',
                name: 'faultDescription',
                label: '故障描述'
              },
              {
                type: 'static',
                name: 'handler',
                label: '处理人'
              },
              {
                type: 'static',
                name: 'handleResult',
                label: '处理结果'
              }
            ]
          }
        }
      },
      {
        type: 'button',
        icon: 'fa fa-edit',
        label: '编辑',
        actionType: 'dialog',
        level: 'link',
        visibleOn: 'this.status !== "completed" && this.status !== "closed"',
        dialog: {
          title: '编辑工单',
          size: 'lg',
          body: {
            type: 'form',
            api: {
              method: 'post',
              url: '/api/work-orders/update/$id'
            },
            body: [
              {
                type: 'input-text',
                name: 'deviceName',
                label: '设备名称',
                required: true
              },
              {
                type: 'select',
                name: 'faultType',
                label: '故障类型',
                options: [
                  { label: '电气故障', value: 'electrical' },
                  { label: '机械故障', value: 'mechanical' },
                  { label: '热工故障', value: 'thermal' },
                  { label: '控制故障', value: 'control' },
                  { label: '其他', value: 'other' }
                ],
                required: true
              },
              {
                type: 'select',
                name: 'faultLevel',
                label: '故障等级',
                options: [
                  { label: '重大', value: 'critical' },
                  { label: '较大', value: 'major' },
                  { label: '一般', value: 'minor' }
                ],
                required: true
              },
              {
                type: 'textarea',
                name: 'faultDescription',
                label: '故障描述',
                required: true,
                minRows: 3
              },
              {
                type: 'select',
                name: 'status',
                label: '处理状态',
                options: [
                  { label: '待处理', value: 'pending' },
                  { label: '处理中', value: 'processing' },
                  { label: '已完成', value: 'completed' }
                ],
                required: true
              },
              {
                type: 'input-text',
                name: 'handler',
                label: '处理人'
              },
              {
                type: 'textarea',
                name: 'handleResult',
                label: '处理结果',
                minRows: 3
              }
            ]
          }
        }
      },
      {
        type: 'button',
        icon: 'fa fa-download',
        label: '导出',
        actionType: 'ajax',
        level: 'link',
        confirmText: '确认要导出此工单吗？',
        api: {
          method: 'post',
          url: '/api/work-orders/export/$id'
        }
      }
    ],
    headerToolbar: [
      {
        type: 'reload',
        icon: 'fa fa-sync',
        label: '刷新'
      },
      {
        type: 'export-excel',
        icon: 'fa fa-download',
        label: '导出Excel',
        api: {
          method: 'post',
          url: '/api/work-orders/export-excel'
        }
      }
    ],
    footerToolbar: [
      {
        type: 'pagination',
        layout: ['total', 'perPage', 'pager', 'go'],
        perPageAvailable: [10, 20, 50, 100]
      },
      {
        type: 'statistics'
      }
    ],
    columnsTogglable: true,
    autoGenerateFilter: true,
    // 添加 API 配置
    api: {
      method: 'get',
      url: '/api/table/full-featured'
    }
  }
}

/**
 * 表格类型映射表 (用于组件切换)
 * key: 表格类型标识 ('basic' | 'paginated' | 'full-featured')
 * value: 表格组件模板
 */
export const tableComponentTemplateMap: Record<string, SimpleTableTemplate> = {
  basic: basicTableTemplate,
  paginated: paginatedTableTemplate,
  'full-featured': fullFeaturedTableTemplate
}

/**
 * 根据表格类型获取组件模板
 * @param tableType 表格类型: 'basic' | 'paginated' | 'full-featured'
 * @returns 表格组件模板
 */
export function getTableComponentTemplate(tableType: string): SimpleTableTemplate {
  const template = tableComponentTemplateMap[tableType]
  if (!template) {
    console.warn(`未找到表格类型 "${tableType}" 的组件模板,使用基础表格作为默认值`)
    return basicTableTemplate
  }
  return template
}

/**
 * 表格类型切换选项配置
 * 用于快速创建 tab 中的 button-group-select
 */
export const tableTypeOptions = [
  {
    label: '设备台账',
    value: 'basic',
    icon: 'fa fa-list'
  },
  {
    label: '巡检记录',
    value: 'paginated',
    icon: 'fa fa-list-alt'
  },
  {
    label: '故障工单',
    value: 'full-featured',
    icon: 'fa fa-table'
  }
]

/**
 * 根据表格类型获取描述
 */
export function getTableTypeDescription(tableType: string): string {
  const descriptions: Record<string, string> = {
    basic: '基础表格，适用于展示设备台账等简单数据列表',
    paginated: '带分页功能，适用于展示巡检记录等需要翻页的数据',
    'full-featured': '全功能表格，支持分页、筛选、编辑、查看、导出等完整功能'
  }
  return descriptions[tableType] || descriptions.basic
}
