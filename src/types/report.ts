import type { RowRecord } from './common'

export interface ReportRank extends RowRecord {
  rank: string
  name: string
  orders: string
  revenue: string
  average: string
  share: string
  growth: string
  trend: string
}
