import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { orderMeta, orderRows } from '../mocks/orders'
import { useCrudList } from './useCrudList'

describe('useCrudList notifications', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('uses the injected notifier for refresh and delete feedback', () => {
    const notify = vi.fn()
    const crud = useCrudList({
      meta: orderMeta,
      source: orderRows,
      filenamePrefix: '订单管理',
      notify,
    })

    crud.removeRow(orderRows[0])
    expect(crud.rows.value).toHaveLength(orderRows.length - 1)
    expect(notify).toHaveBeenLastCalledWith('记录已删除')

    crud.resetRows()
    expect(crud.rows.value).toHaveLength(orderRows.length)
    expect(notify).toHaveBeenLastCalledWith('数据已刷新')
  })
})
