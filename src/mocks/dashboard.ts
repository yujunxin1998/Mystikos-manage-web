import type { StatItem } from '../types'

export const dashboardStats: StatItem[] = [
  { label: '今日营收', value: '¥ 12,680', hint: '+18.2%' },
  { label: '进行中订单', value: '36', hint: '+8.4%' },
  { label: '新增会员', value: '28', hint: '+12.5%' },
  { label: '陪玩数量', value: '64', hint: '新增陪玩 6' },
]

export const chartPaths = {
  周: 'M0 136 C54 130 54 82 108 91 S163 145 216 102 S270 31 324 62 S379 106 432 69 S486 34 540 43',
  月: 'M0 142 C60 97 88 130 128 80 S220 54 270 96 S358 18 402 52 S480 89 540 27',
} as const
