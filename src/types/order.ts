export type ManageOrderStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'FULFILLING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

export type OrderAction = 'start-fulfilling' | 'ship' | 'complete' | 'cancel' | 'refund'

export interface OrderLineItemResponse {
  productId: number
  productNameSnapshot: string
  unitPriceSnapshot: number
  quantity: number
  subtotal: number
}

export interface ManageOrder {
  orderId: number
  patronId: number
  items: OrderLineItemResponse[]
  totalAmount: number
  shippingAddress: string
  status: ManageOrderStatus
  createdAt: string
}

export interface ManageOrderQuery {
  status?: ManageOrderStatus
  patronId?: number
  pageNum: number
  pageSize: number
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
