import type { RowRecord } from './common'

export interface SettingItem extends RowRecord {
  module: string
  item: string
  value: string
  updatedBy: string
  updated: string
  status: string
}
