import type { ModuleMeta, SettingItem } from '../types'

export const settingMeta: ModuleMeta = {
  code: 'SYSTEM SETTINGS',
  title: '系统设置',
  desc: '配置业务规则、通知方式和系统安全策略',
  action: '保存设置',
  tableTitle: '系统列表',
  defaultStatus: '已启用',
  stats: [
    { label: '系统用户', value: '12', hint: '3 个角色' },
    { label: '启用业务规则', value: '18', hint: '全部运行正常' },
    { label: '消息模板', value: '26', hint: '今日发送 186 条' },
    { label: '最近备份', value: '08:00', hint: '自动备份成功' },
  ],
  columns: [
    { key: 'module', label: '配置模块', kind: 'identifier' },
    { key: 'item', label: '配置项', kind: 'strong' },
    { key: 'value', label: '当前设置' },
    { key: 'updatedBy', label: '最后修改人' },
    { key: 'updated', label: '更新时间' },
    { key: 'status', label: '状态', kind: 'status' },
  ],
  fields: [
    { key: 'module', label: '配置模块', placeholder: '请输入配置模块' },
    { key: 'item', label: '配置项', placeholder: '请输入配置项' },
    { key: 'value', label: '当前设置', placeholder: '请输入当前设置' },
    { key: 'updatedBy', label: '最后修改人', placeholder: '请输入修改人' },
    { key: 'updated', label: '更新时间', placeholder: 'YYYY-MM-DD HH:mm' },
    { key: 'status', label: '状态', type: 'select', options: ['已启用', '已停用'] },
  ],
}

export const settingRows: SettingItem[] = [
  {
    module: '订单规则',
    item: '订单自动取消时间',
    value: '15 分钟',
    updatedBy: '杨林',
    updated: '2026-08-23 18:20',
    status: '已启用',
  },
  {
    module: '分成规则',
    item: '默认陪玩师分成比例',
    value: '70%',
    updatedBy: '杨林',
    updated: '2026-08-22 15:42',
    status: '已启用',
  },
  {
    module: '消息通知',
    item: '企业微信订单通知',
    value: '订单创建 / 完成',
    updatedBy: '林悦',
    updated: '2026-08-21 11:08',
    status: '已启用',
  },
  {
    module: '账户安全',
    item: '登录失败锁定策略',
    value: '5 次 / 30 分钟',
    updatedBy: '系统管理员',
    updated: '2026-08-18 09:30',
    status: '已启用',
  },
]
