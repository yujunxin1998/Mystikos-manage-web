import type { RowRecord } from './common'

export interface Order extends RowRecord {
  id: string
  member: string
  service: string
  worker: string
  amount: string
  pay: string
  status: string
  created: string
}

export interface DashboardOrder {
  id: string
  user: string
  game: string
  service: string
  worker: string
  amount: string
  status: string
  time: string
}
