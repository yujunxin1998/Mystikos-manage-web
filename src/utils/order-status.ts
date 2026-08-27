import type { ManageOrderStatus, OrderAction } from '../types/order'

const TRANSITIONS: Record<ManageOrderStatus, OrderAction[]> = {
  DRAFT: ['cancel'],
  PENDING_PAYMENT: ['cancel'],
  PAID: ['start-fulfilling', 'cancel', 'refund'],
  FULFILLING: ['ship', 'refund'],
  SHIPPED: ['complete', 'refund'],
  COMPLETED: ['refund'],
  CANCELLED: [],
  REFUNDED: [],
}

export function allowedOrderActions(status: ManageOrderStatus): OrderAction[] {
  return [...TRANSITIONS[status]]
}

export const orderStatusLabel: Record<ManageOrderStatus, string> = {
  DRAFT: '草稿',
  PENDING_PAYMENT: '待支付',
  PAID: '已支付',
  FULFILLING: '处理中',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
}

export const orderStatusTone: Record<
  ManageOrderStatus,
  'default' | 'warning' | 'info' | 'success' | 'error'
> = {
  DRAFT: 'default',
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  FULFILLING: 'info',
  SHIPPED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'error',
}

export const orderActionLabel: Record<OrderAction, string> = {
  'start-fulfilling': '开始处理',
  ship: '发货',
  complete: '完成',
  cancel: '取消订单',
  refund: '退款',
}
