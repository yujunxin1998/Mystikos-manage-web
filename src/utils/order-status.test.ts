import { describe, expect, it } from 'vitest'
import { allowedOrderActions, orderStatusLabel, orderStatusTone } from './order-status'

describe('order status transitions', () => {
  it('exposes the documented transition matrix', () => {
    expect(allowedOrderActions('DRAFT')).toEqual(['cancel'])
    expect(allowedOrderActions('PENDING_PAYMENT')).toEqual(['cancel'])
    expect(allowedOrderActions('PAID')).toEqual(['start-fulfilling', 'cancel', 'refund'])
    expect(allowedOrderActions('FULFILLING')).toEqual(['ship', 'refund'])
    expect(allowedOrderActions('SHIPPED')).toEqual(['complete', 'refund'])
    expect(allowedOrderActions('COMPLETED')).toEqual(['refund'])
    expect(allowedOrderActions('CANCELLED')).toEqual([])
    expect(allowedOrderActions('REFUNDED')).toEqual([])
  })

  it('returns a copy so callers cannot mutate policy', () => {
    const actions = allowedOrderActions('PAID')
    actions.length = 0
    expect(allowedOrderActions('PAID')).toEqual(['start-fulfilling', 'cancel', 'refund'])
  })

  it('labels and tones every backend status', () => {
    const statuses = [
      'DRAFT',
      'PENDING_PAYMENT',
      'PAID',
      'FULFILLING',
      'SHIPPED',
      'COMPLETED',
      'CANCELLED',
      'REFUNDED',
    ] as const
    for (const status of statuses) {
      expect(orderStatusLabel[status]).toBeTruthy()
      expect(orderStatusTone[status]).toBeTruthy()
    }
  })
})
