# Unified Order Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock service-order page with a real unified backend order center for all product types, including companion products.

**Architecture:** A focused `manage-orders` API module owns list, detail, and five transition endpoints. `OrdersView.vue` holds server filters and pagination while dedicated detail/action components render order lines and enforce the documented transition matrix.

**Tech Stack:** Vue 3 Composition API, TypeScript, Axios, Naive UI, Vitest, Vue Test Utils

**Spec:** `docs/superpowers/specs/2026-08-27-product-order-management-design.md`

## Global Constraints

- Treat companion services and ordinary goods as the same `OrderLineItemResponse` model.
- Do not add admin order creation, arbitrary editing, or deletion.
- Expose only backend-supported filters: `status`, `patronId`, `pageNum`, `pageSize`.
- Show actions only when allowed by the documented status transition matrix.
- Cancellation and refund confirmations must mention reserved-stock release.
- Preserve filters, page, and open detail when an operation fails.
- Update README with only server-backed behavior.

---

### Task 1: Define unified order contracts and transition policy

**Files:**
- Modify: `src/types/order.ts`
- Modify: `src/types/index.ts`
- Create: `src/utils/order-status.ts`
- Create: `src/utils/order-status.test.ts`

**Interfaces:**
- Produces: `ManageOrderStatus`, `OrderLineItemResponse`, `ManageOrder`, `ManageOrderQuery`, `OrderAction`, `allowedOrderActions`
- Consumes: shared `PageResult<T>` from the product plan

- [ ] **Step 1: Write the failing transition matrix test**

```ts
expect(allowedOrderActions('DRAFT')).toEqual(['cancel'])
expect(allowedOrderActions('PENDING_PAYMENT')).toEqual(['cancel'])
expect(allowedOrderActions('PAID')).toEqual(['start-fulfilling', 'cancel', 'refund'])
expect(allowedOrderActions('FULFILLING')).toEqual(['ship', 'refund'])
expect(allowedOrderActions('SHIPPED')).toEqual(['complete', 'refund'])
expect(allowedOrderActions('COMPLETED')).toEqual(['refund'])
expect(allowedOrderActions('CANCELLED')).toEqual([])
expect(allowedOrderActions('REFUNDED')).toEqual([])
```

Also assert every status has a Chinese label and stable tone.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test -- src/utils/order-status.test.ts`

Expected: FAIL because the transition utility does not exist.

- [ ] **Step 3: Implement exact backend types and transition records**

```ts
export type ManageOrderStatus =
  | 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'FULFILLING'
  | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

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
```

Implement `allowedOrderActions` from a literal `Record<ManageOrderStatus, OrderAction[]>`; return a copied array so callers cannot mutate policy.

- [ ] **Step 4: Run focused tests and build**

Run: `npm run test -- src/utils/order-status.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit contracts and policy**

```bash
git add src/types/order.ts src/types/index.ts src/utils/order-status.ts src/utils/order-status.test.ts
git commit -m "feat(orders): define unified order workflow"
```

---

### Task 2: Add the admin order API module

**Files:**
- Create: `src/api/manage-orders.ts`
- Create: `src/api/manage-orders.test.ts`

**Interfaces:**
- Consumes: `ManageOrder`, `ManageOrderQuery`, `OrderAction`, `PageResult<ManageOrder>`
- Produces: `fetchOrders`, `fetchOrder`, `transitionOrder`

- [ ] **Step 1: Write failing API contract tests**

```ts
await fetchOrders({ status: 'PAID', patronId: 42, pageNum: 2, pageSize: 20 })
expect(http.get).toHaveBeenCalledWith('/api/v1/manage/orders', {
  params: { status: 'PAID', patronId: 42, pageNum: 2, pageSize: 20 },
})

await fetchOrders({ pageNum: 1, pageSize: 20 })
expect(http.get).toHaveBeenLastCalledWith('/api/v1/manage/orders', {
  params: { pageNum: 1, pageSize: 20 },
})

expect(await fetchOrder(2099)).toEqual(orderFixture)
expect(http.get).toHaveBeenCalledWith('/api/v1/manage/orders/2099')
```

Use a table-driven literal for all five transitions:

```ts
for (const action of ['start-fulfilling', 'ship', 'complete', 'cancel', 'refund'] as const) {
  await transitionOrder(2099, action)
  expect(http.put).toHaveBeenCalledWith(`/api/v1/manage/orders/2099/${action}`)
}
```

- [ ] **Step 2: Run the API tests and verify RED**

Run: `npm run test -- src/api/manage-orders.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement minimal list, detail, and transition functions**

```ts
export async function fetchOrders(query: ManageOrderQuery): Promise<PageResult<ManageOrder>> {
  const params = {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    ...(query.status ? { status: query.status } : {}),
    ...(query.patronId ? { patronId: query.patronId } : {}),
  }
  const { data } = await http.get<ApiResponse<PageResult<ManageOrder>>>('/api/v1/manage/orders', { params })
  return unwrapApiResponse(data)
}

export async function fetchOrder(orderId: number): Promise<ManageOrder> {
  const { data } = await http.get<ApiResponse<ManageOrder>>(`/api/v1/manage/orders/${orderId}`)
  return unwrapApiResponse(data)
}
export async function transitionOrder(orderId: number, action: OrderAction): Promise<ManageOrder> {
  const { data } = await http.put<ApiResponse<ManageOrder>>(`/api/v1/manage/orders/${orderId}/${action}`)
  return unwrapApiResponse(data)
}
```

Build params explicitly; do not serialize `undefined`, `null`, or empty strings.

- [ ] **Step 4: Run focused API tests**

Run: `npm run test -- src/api/manage-orders.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the API module**

```bash
git add src/api/manage-orders.ts src/api/manage-orders.test.ts
git commit -m "feat(orders): add admin order API"
```

---

### Task 3: Render the real unified order list and filters

**Files:**
- Rewrite: `src/views/orders/OrdersView.vue`
- Rewrite: `src/views/orders/OrdersView.test.ts`
- Modify: `src/styles/orders.css`

**Interfaces:**
- Consumes: `fetchOrders`, order status mappings, `ManageOrder`
- Produces: server list, status/patron filters, pagination, current-page stats

- [ ] **Step 1: Write failing real-list and filter tests**

The complete mocked page response must include all `ManageOrder` fields and at least two item rows. Assert:

```ts
expect(wrapper.text()).toContain('陪玩服务 2 小时等 2 项')
expect(wrapper.text()).toContain('¥299.00')
expect(wrapper.text()).toContain('已支付')
expect(wrapper.text()).not.toContain('新增订单')
expect(wrapper.text()).not.toContain('编辑订单')
expect(wrapper.text()).not.toContain('删除订单')
```

Fill buyer ID `42`, choose status `PAID`, trigger query, and assert the request uses `{ patronId: 42, status: 'PAID', pageNum: 1, pageSize: 20 }`. Reset must remove both optional params.

- [ ] **Step 2: Run the view tests and verify RED**

Run: `npm run test -- src/views/orders/OrdersView.test.ts`

Expected: FAIL because the view still uses `useCrudList`, mocks, and local pagination.

- [ ] **Step 3: Implement server-driven list behavior**

Use query state with draft buyer input separated from the applied numeric filter:

```ts
const patronIdInput = ref('')
const patronId = ref<number>()
const status = ref<ManageOrderStatus>()
const page = ref(1)
const pageSize = ref(20)
```

Reject non-positive or non-integer buyer IDs with `message.warning`. Query/reset set page to 1. Page and page-size events fetch from the backend. Render first item name plus `等 N 项`, sum item quantities for piece count, format money with two decimals, and format `createdAt` in the existing Chinese locale utility.

Remove imports of `createCommerceOrder`, `useCrudList`, `orderRows`, edit/delete icons, and the two old modals.

- [ ] **Step 4: Run order list tests**

Run: `npm run test -- src/views/orders/OrdersView.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the unified list**

```bash
git add src/views/orders/OrdersView.vue src/views/orders/OrdersView.test.ts src/styles/orders.css
git commit -m "feat(orders): render unified backend order list"
```

---

### Task 4: Add order detail drawer

**Files:**
- Create: `src/components/orders/OrderDetailDrawer.vue`
- Create: `src/components/orders/OrderDetailDrawer.test.ts`
- Modify: `src/views/orders/OrdersView.vue`
- Modify: `src/views/orders/OrdersView.test.ts`

**Interfaces:**
- Consumes: `fetchOrder(orderId)`, `ManageOrder`
- Produces: detail drawer with order line table and action events

- [ ] **Step 1: Write failing detail rendering tests**

After clicking the unique details button for order `2099`, assert `fetchOrder(2099)` and these visible values:

```ts
expect(wrapper.text()).toContain('陪玩服务 2 小时')
expect(wrapper.text()).toContain('¥120.00')
expect(wrapper.text()).toContain('2')
expect(wrapper.text()).toContain('¥240.00')
expect(wrapper.text()).toContain('浙江省杭州市西湖区')
expect(wrapper.text()).toContain('订单总额')
```

Also assert the drawer remains open when the detail request fails and shows a retry affordance.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/components/orders/OrderDetailDrawer.test.ts src/views/orders/OrdersView.test.ts`

Expected: FAIL because no real detail drawer exists.

- [ ] **Step 3: Implement responsive detail drawer**

Props: `show: boolean`, `loading: boolean`, `order: ManageOrder | null`, `error?: string`, `actionLoading?: OrderAction`. Emits: `close`, `retry`, `action`.

Use an `NDrawer` with `:mask-closable="false"`, responsive CSS width, order metadata, shipping address, `NDataTable` for items, and a total amount footer. The parent owns fetching and preserves the selected order ID across an error so retry uses the same ID.

- [ ] **Step 4: Run detail tests**

Run: `npm run test -- src/components/orders/OrderDetailDrawer.test.ts src/views/orders/OrdersView.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the order detail**

```bash
git add src/components/orders src/views/orders/OrdersView.vue src/views/orders/OrdersView.test.ts src/styles/orders.css
git commit -m "feat(orders): add unified order detail drawer"
```

---

### Task 5: Add guarded order status actions

**Files:**
- Create: `src/components/orders/OrderActions.vue`
- Create: `src/components/orders/OrderActions.test.ts`
- Modify: `src/components/orders/OrderDetailDrawer.vue`
- Modify: `src/views/orders/OrdersView.vue`
- Modify: `src/views/orders/OrdersView.test.ts`

**Interfaces:**
- Consumes: `allowedOrderActions(status)`, `transitionOrder(orderId, action)`
- Produces: confirmed actions and refreshed list/detail state

- [ ] **Step 1: Write failing action visibility and confirmation tests**

Use a table-driven component test for all eight statuses. For `PAID`, assert exactly “开始处理、取消订单、退款”; for terminal states assert no mutation buttons.

Assert cancellation and refund confirmation text contains “释放预占库存”. Assert a double click while the promise is pending produces only one transition request.

At page level, resolve `transitionOrder` with a `FULFILLING` order and assert the drawer updates to “处理中” and `fetchOrders` runs again. Reject it and assert the drawer, status, buyer filter, and current page remain unchanged.

- [ ] **Step 2: Run action tests and verify RED**

Run: `npm run test -- src/components/orders/OrderActions.test.ts src/views/orders/OrdersView.test.ts`

Expected: FAIL because transition controls do not exist.

- [ ] **Step 3: Implement action labels, confirmations, and request locking**

`OrderActions` receives `status` and `loadingAction`, renders only `allowedOrderActions(status)`, and emits the chosen `OrderAction` after `NPopconfirm` confirmation. Danger styling applies to `cancel` and `refund`.

The page stores `actionLoading = ref<OrderAction>()`; return early when already set. On success, replace `detailOrder` with the API response, show success feedback, and call `loadOrders()` without resetting filters. Clear the lock in `finally`.

- [ ] **Step 4: Run all order tests and build**

Run: `npm run test -- src/api/manage-orders.test.ts src/utils/order-status.test.ts src/components/orders src/views/orders/OrdersView.test.ts && npm run build`

Expected: PASS and build exit code 0.

- [ ] **Step 5: Commit state transitions**

```bash
git add src/components/orders src/views/orders/OrdersView.vue src/views/orders/OrdersView.test.ts
git commit -m "feat(orders): add guarded order transitions"
```

---

### Task 6: Remove obsolete order mocks, document, and verify

**Files:**
- Modify: `README.md`
- Modify only when unused: `src/mocks/orders.ts`
- Modify only when unused: `src/api/commerce.ts`
- Modify only when unused: `src/api/commerce.test.ts`

**Interfaces:**
- Consumes: completed unified order page
- Produces: accurate docs and full verification evidence

- [ ] **Step 1: Identify obsolete consumers before deletion**

Run:

```bash
rg -n "orderRows|orderMeta|mocks/orders|createCommerceOrder" src
```

Remove the mock order exports and current-user `createCommerceOrder` admin-page usage only when no other admin consumer remains. Do not remove a public storefront API merely because the admin page no longer uses it.

- [ ] **Step 2: Update README truthfully**

Document the seven real backend order endpoints, unified product-line model, status and buyer filters, server pagination, detail drawer, exact status transition rules, and removal of mock create/edit/delete operations. Add `2026-08-27（统一订单管理真实接口重构）` to the changelog and update development checkboxes.

- [ ] **Step 3: Run complete automated verification**

```bash
npm run test
npm run lint
npm run build
git diff --check
```

Expected: all tests pass, ESLint exits 0, build exits 0, and diff check has no errors.

- [ ] **Step 4: Browser verification**

Start the dev server and inspect `/orders` after sign-in: real loading/empty/error states, status and buyer filters, pagination, detail drawer, action visibility for available live statuses, responsive layout, and console errors. Do not execute cancel/refund or other real production mutations without explicit authorization; component tests prove mutation submission behavior.

- [ ] **Step 5: Commit docs and cleanup**

```bash
git add README.md src/mocks/orders.ts src/api/commerce.ts src/api/commerce.test.ts
git commit -m "docs: document unified order management"
```
