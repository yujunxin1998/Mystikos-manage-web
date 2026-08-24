import type { ModuleMeta, ReportRank } from '../types'

export const reportMeta: ModuleMeta = {
  code: 'DATA INSIGHTS',
  title: '数据报表',
  desc: '洞察经营趋势、品类表现与团队绩效',
  action: '导出报表',
  tableTitle: '品类经营排行',
  defaultStatus: '持续增长',
  stats: [
    { label: '本月营业额', value: '¥ 386,420', hint: '同比 +18.6%' },
    { label: '本月订单量', value: '2,846', hint: '同比 +12.4%' },
    { label: '客单价', value: '¥ 135.78', hint: '同比 +5.5%' },
    { label: '复购率', value: '68.2%', hint: '同比 +3.8%' },
  ],
  columns: [
    { key: 'rank', label: '排名', kind: 'identifier' },
    { key: 'name', label: '游戏品类', kind: 'strong' },
    { key: 'orders', label: '订单数量' },
    { key: 'revenue', label: '营业收入' },
    { key: 'average', label: '平均客单价' },
    { key: 'share', label: '营收占比' },
    { key: 'growth', label: '环比增长' },
    { key: 'trend', label: '趋势', kind: 'status' },
  ],
  fields: [
    { key: 'rank', label: '排名', placeholder: '01' },
    { key: 'name', label: '游戏品类', placeholder: '请输入游戏品类' },
    { key: 'orders', label: '订单数量', placeholder: '0' },
    { key: 'revenue', label: '营业收入', placeholder: '¥0' },
    { key: 'average', label: '平均客单价', placeholder: '¥0' },
    { key: 'share', label: '营收占比', placeholder: '0%' },
    { key: 'growth', label: '环比增长', placeholder: '+0%' },
    { key: 'trend', label: '趋势', type: 'select', options: ['持续增长', '稳定增长', '轻微下降'] },
  ],
}

export const reportRows: ReportRank[] = [
  {
    rank: '01',
    name: '三角洲行动',
    orders: '1,862',
    revenue: '¥256,480',
    average: '¥137.74',
    share: '66.4%',
    growth: '+18.6%',
    trend: '持续增长',
  },
  {
    rank: '02',
    name: '无畏契约',
    orders: '482',
    revenue: '¥62,860',
    average: '¥130.41',
    share: '16.3%',
    growth: '+12.2%',
    trend: '稳定增长',
  },
  {
    rank: '03',
    name: '和平精英',
    orders: '296',
    revenue: '¥38,420',
    average: '¥129.80',
    share: '9.9%',
    growth: '+8.7%',
    trend: '稳定增长',
  },
  {
    rank: '04',
    name: '英雄联盟',
    orders: '138',
    revenue: '¥18,260',
    average: '¥132.32',
    share: '4.7%',
    growth: '-2.1%',
    trend: '轻微下降',
  },
]

export const reportBarHeights = [38, 52, 44, 66, 72, 88, 78, 96, 105, 118, 112, 132]
