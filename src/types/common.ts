export type RowRecord = Record<string, string>

export interface ColumnDef {
  key: string
  label: string
  kind?: 'text' | 'status' | 'image' | 'identifier' | 'strong'
}

export interface StatItem {
  label: string
  value: string
  hint: string
}

export interface FormField {
  key: string
  label: string
  type?: 'text' | 'url' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
}

export interface ModuleMeta {
  code: string
  title: string
  desc: string
  action: string
  tableTitle: string
  stats: StatItem[]
  columns: ColumnDef[]
  fields: FormField[]
  defaultStatus: string
}
