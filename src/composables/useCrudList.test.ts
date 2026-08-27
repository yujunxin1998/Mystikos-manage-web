import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reportMeta, reportRows } from '../mocks/reports'
import { useCrudList } from './useCrudList'

describe('useCrudList notifications', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('uses the injected notifier for refresh and delete feedback', () => {
    const notify = vi.fn()
    const crud = useCrudList({
      meta: reportMeta,
      source: reportRows,
      filenamePrefix: '数据报表',
      notify,
    })

    crud.removeRow(reportRows[0])
    expect(crud.rows.value).toHaveLength(reportRows.length - 1)
    expect(notify).toHaveBeenLastCalledWith('记录已删除')

    crud.resetRows()
    expect(crud.rows.value).toHaveLength(reportRows.length)
    expect(notify).toHaveBeenLastCalledWith('数据已刷新')
  })
})
