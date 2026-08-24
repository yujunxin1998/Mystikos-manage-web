import type { RowRecord } from './common'

export interface Worker extends RowRecord {
  id: string
  name: string
  game: string
  level: string
  orders: string
  rating: string
  income: string
  status: string
}
