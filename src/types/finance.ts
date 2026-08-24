import type { RowRecord } from './common'

export interface FinanceRecord extends RowRecord {
  id: string
  type: string
  target: string
  amount: string
  method: string
  operator: string
  status: string
  created: string
}
