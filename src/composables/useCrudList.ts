import { computed, ref, type Ref } from 'vue'
import type { ColumnDef, FormField, ModuleMeta, RowRecord } from '../types'
import {
  collectStatusOptions,
  exportCsv,
  filterByKeyword,
  filterByStatus,
  recordKey,
} from '../utils/list'
import { useToastStore } from '../stores/toast'

interface UseCrudListOptions<T extends RowRecord> {
  meta: ModuleMeta
  source: T[]
  filenamePrefix: string
}

export function useCrudList<T extends RowRecord>(options: UseCrudListOptions<T>) {
  const toast = useToastStore()
  const keyword = ref('')
  const statusFilter = ref('全部状态')
  const modal = ref(false)
  const editingKey = ref('')
  const form = ref<RowRecord>({}) as Ref<RowRecord>
  const localRows = ref([...options.source]) as Ref<T[]>

  const statusOptions = computed(() => collectStatusOptions(localRows.value))
  const rows = computed(() =>
    filterByStatus(filterByKeyword(localRows.value, keyword.value), statusFilter.value),
  )

  function createEmptyForm(): RowRecord {
    const next: RowRecord = {}
    options.meta.fields.forEach((field: FormField) => {
      if (field.key === 'status') {
        next[field.key] = options.meta.defaultStatus
      } else if (field.key === 'created' || field.key === 'updated') {
        next[field.key] = new Date().toISOString().slice(0, 10)
      } else {
        next[field.key] = ''
      }
    })
    return next
  }

  function resetRows() {
    localRows.value = [...options.source] as T[]
    keyword.value = ''
    statusFilter.value = '全部状态'
    toast.notify('数据已刷新')
  }

  function openCreate() {
    editingKey.value = ''
    form.value = createEmptyForm()
    modal.value = true
  }

  function openEdit(row: T) {
    editingKey.value = recordKey(row)
    form.value = { ...row }
    modal.value = true
  }

  function removeRow(row: T) {
    localRows.value = localRows.value.filter((item) => recordKey(item) !== recordKey(row))
    toast.notify('记录已删除')
  }

  function submit() {
    try {
      const firstEditable = options.meta.fields.find((field) => field.key !== 'image')
      if (firstEditable && !form.value[firstEditable.key]) {
        toast.notify('请填写必要信息')
        return
      }
      if (editingKey.value) {
        localRows.value = localRows.value.map((row) =>
          recordKey(row) === editingKey.value ? ({ ...form.value } as T) : row,
        )
      } else {
        localRows.value.unshift({ ...form.value } as T)
      }
      modal.value = false
      toast.notify(editingKey.value ? '修改已保存' : `${options.meta.action}成功`)
    } catch (error) {
      console.error('提交失败', error)
      toast.notify('提交失败，请重试')
    }
  }

  function exportRows() {
    try {
      exportCsv(
        `${options.filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`,
        options.meta.columns as ColumnDef[],
        rows.value,
      )
      toast.notify('报表已导出')
    } catch {
      toast.notify('导出失败，请重试')
    }
  }

  return {
    keyword,
    statusFilter,
    modal,
    editingKey,
    form,
    localRows,
    statusOptions,
    rows,
    resetRows,
    openCreate,
    openEdit,
    removeRow,
    submit,
    exportRows,
  }
}
