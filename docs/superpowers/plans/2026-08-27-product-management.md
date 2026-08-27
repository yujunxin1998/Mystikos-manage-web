# Product Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock product list with a complete backend-managed product list, detail, create, edit, and shelf-status workflow.

**Architecture:** A focused `manage-products` API module owns the four admin endpoint contracts. `ProductsView.vue` owns server query state and composes focused product form/detail components; backend responses remain the only list source.

**Tech Stack:** Vue 3 Composition API, TypeScript, Axios, Naive UI, Vitest, Vue Test Utils

**Spec:** `docs/superpowers/specs/2026-08-27-product-order-management-design.md`

## Global Constraints

- Use only `GET/POST/PUT /api/v1/manage/products` contracts documented in the spec.
- Do not display stock in the list or edit form because `ProductView` and `UpdateProductRequest` do not expose it.
- Initial stock exists only in the create form.
- Do not add a third-party data-fetching or form library.
- Modal and drawer masks must not discard user input.
- Update `README.md` with only capabilities that are actually backed by the server.
- Preserve unrelated dirty-worktree changes and use `apply_patch` for edits.

---

### Task 1: Define backend product contracts

**Files:**
- Modify: `src/types/product.ts`
- Modify: `src/types/common.ts`
- Modify: `src/types/index.ts`
- Test: `src/types/product.test.ts`

**Interfaces:**
- Produces: `ProductStatus`, `ProductView`, `ProductQuery`, `UpdateProductRequest`, `PageResult<T>`
- Consumes: existing `CreateProductRequest`

- [ ] **Step 1: Write the failing status and page-shape test**

```ts
import { describe, expect, it } from 'vitest'
import { productStatusLabel, productStatusTone } from '../utils/product-status'

describe('product status presentation', () => {
  it('maps backend product statuses to stable Chinese labels and tones', () => {
    expect(productStatusLabel.ON_SHELF).toBe('已上架')
    expect(productStatusLabel.OFF_SHELF).toBe('已下架')
    expect(productStatusTone.ON_SHELF).toBe('success')
    expect(productStatusTone.OFF_SHELF).toBe('default')
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test -- src/types/product.test.ts`

Expected: FAIL because `src/utils/product-status.ts` does not exist.

- [ ] **Step 3: Add exact backend types and status mappings**

```ts
export type ProductStatus = 'ON_SHELF' | 'OFF_SHELF'

export interface PageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export interface ProductView {
  id: number
  categoryId?: number
  name: string
  description?: string
  price: number
  images: string[]
  status: ProductStatus
}

export interface ProductQuery {
  status?: ProductStatus
  pageNum: number
  pageSize: number
}

export interface UpdateProductRequest {
  categoryId?: number
  name: string
  description?: string
  price: number
  images?: string[]
  status?: ProductStatus
}
```

Create `src/utils/product-status.ts` with literal label and tone records matching the test.

- [ ] **Step 4: Run the test and type build**

Run: `npm run test -- src/types/product.test.ts && npm run build`

Expected: PASS and build exit code 0.

- [ ] **Step 5: Commit the contract unit**

```bash
git add src/types/product.ts src/types/common.ts src/types/index.ts src/types/product.test.ts src/utils/product-status.ts
git commit -m "feat(products): define admin product contracts"
```

---

### Task 2: Add the admin product API module

**Files:**
- Create: `src/api/manage-products.ts`
- Create: `src/api/manage-products.test.ts`
- Modify: `src/api/commerce.ts`
- Modify: `src/api/commerce.test.ts`

**Interfaces:**
- Consumes: `ProductQuery`, `ProductView`, `PageResult<ProductView>`, `CreateProductRequest`, `UpdateProductRequest`
- Produces: `fetchProducts`, `fetchProduct`, `createProduct`, `updateProduct`

- [ ] **Step 1: Write failing API contract tests**

```ts
expect(await fetchProducts({ status: 'ON_SHELF', pageNum: 2, pageSize: 20 })).toEqual(pageFixture)
expect(http.get).toHaveBeenCalledWith('/api/v1/manage/products', {
  params: { status: 'ON_SHELF', pageNum: 2, pageSize: 20 },
})

await fetchProducts({ pageNum: 1, pageSize: 20 })
expect(http.get).toHaveBeenLastCalledWith('/api/v1/manage/products', {
  params: { pageNum: 1, pageSize: 20 },
})

expect(await fetchProduct(88)).toEqual(productFixture)
expect(http.get).toHaveBeenCalledWith('/api/v1/manage/products/88')

expect(await createProduct(createFixture)).toBe(88)
expect(http.post).toHaveBeenCalledWith('/api/v1/manage/products', createFixture)

expect(await updateProduct(88, updateFixture)).toEqual(productFixture)
expect(http.put).toHaveBeenCalledWith('/api/v1/manage/products/88', updateFixture)
```

Fixtures must include every documented field, including `images` and `status`.

- [ ] **Step 2: Run the API tests and verify RED**

Run: `npm run test -- src/api/manage-products.test.ts`

Expected: FAIL because the module and functions do not exist.

- [ ] **Step 3: Implement the minimal API module**

```ts
export async function fetchProducts(query: ProductQuery): Promise<PageResult<ProductView>> {
  const params = { pageNum: query.pageNum, pageSize: query.pageSize, ...(query.status ? { status: query.status } : {}) }
  const { data } = await http.get<ApiResponse<PageResult<ProductView>>>('/api/v1/manage/products', { params })
  return unwrapApiResponse(data)
}

export async function fetchProduct(productId: number): Promise<ProductView> {
  const { data } = await http.get<ApiResponse<ProductView>>(`/api/v1/manage/products/${productId}`)
  return unwrapApiResponse(data)
}

export async function createProduct(request: CreateProductRequest): Promise<number> {
  const { data } = await http.post<ApiResponse<number>>('/api/v1/manage/products', request)
  return unwrapApiResponse(data)
}

export async function updateProduct(productId: number, request: UpdateProductRequest): Promise<ProductView> {
  const { data } = await http.put<ApiResponse<ProductView>>(`/api/v1/manage/products/${productId}`, request)
  return unwrapApiResponse(data)
}
```

Remove only the moved `createProduct` export and test from `commerce.ts`; retain `createCommerceOrder` until the order plan removes its obsolete UI consumer.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- src/api/manage-products.test.ts src/api/commerce.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the API boundary**

```bash
git add src/api/manage-products.ts src/api/manage-products.test.ts src/api/commerce.ts src/api/commerce.test.ts
git commit -m "feat(products): add admin product API"
```

---

### Task 3: Render the real paginated product list

**Files:**
- Modify: `src/views/products/ProductsView.vue`
- Modify: `src/views/products/ProductsView.test.ts`
- Create: `src/components/products/ProductImage.vue`
- Create: `src/components/products/ProductImage.test.ts`
- Modify: `src/styles/business.css`

**Interfaces:**
- Consumes: `fetchProducts(ProductQuery)`, `ProductView`, product status mappings
- Produces: server-driven filter, table, pagination, refresh, loading and empty state

- [ ] **Step 1: Replace the existing view test with a failing server-list test**

Mount the real view inside `NConfigProvider` and `NMessageProvider`, mock only `manage-products` network functions, and assert visible behavior:

```ts
expect(wrapper.text()).toContain('星轨香薰')
expect(wrapper.text()).toContain('¥99.90')
expect(wrapper.text()).toContain('已上架')
expect(wrapper.text()).not.toContain('陪玩师')
expect(wrapper.text()).not.toContain('库存')
expect(wrapper.text()).toContain('共 43 件商品')
```

Add a second test that changes status to `OFF_SHELF` and asserts the next request uses `{ status: 'OFF_SHELF', pageNum: 1, pageSize: 20 }`.

- [ ] **Step 2: Run the view test and verify RED**

Run: `npm run test -- src/views/products/ProductsView.test.ts`

Expected: FAIL because the view still renders `productRows` through `ModulePage`.

- [ ] **Step 3: Implement server query state and dedicated table**

Use these state fields:

```ts
const loading = ref(false)
const records = ref<ProductView[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const status = ref<ProductStatus | null>(null)
```

`loadProducts()` must guard loading with `try/finally`, use `message.error` on failure, and never substitute mock rows. Status changes reset `page` to 1. Pagination events call the backend.

Implement `ProductImage.vue` with a local `failed` state. Render the first URL only while it has not emitted `error`; otherwise render a `PackageOpen` placeholder and the text “暂无图片”.

- [ ] **Step 4: Run focused list and image tests**

Run: `npm run test -- src/views/products/ProductsView.test.ts src/components/products/ProductImage.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the real list**

```bash
git add src/views/products/ProductsView.vue src/views/products/ProductsView.test.ts src/components/products src/styles/business.css
git commit -m "feat(products): render backend product list"
```

---

### Task 4: Add product detail, create, and edit workflows

**Files:**
- Create: `src/components/products/ProductDetailDrawer.vue`
- Create: `src/components/products/ProductFormModal.vue`
- Create: `src/components/products/ProductFormModal.test.ts`
- Modify: `src/views/products/ProductsView.vue`
- Modify: `src/views/products/ProductsView.test.ts`

**Interfaces:**
- Consumes: `fetchProduct`, `createProduct`, `updateProduct`
- Produces: `ProductFormSubmit = CreateProductRequest | UpdateProductRequest`, detail/open/edit events

- [ ] **Step 1: Write failing detail and form workflow tests**

Tests must assert:

```ts
expect(fetchProduct).toHaveBeenCalledWith(88)
expect(wrapper.text()).toContain('木质调香')

expect(createProduct).toHaveBeenCalledWith({
  categoryId: 3,
  name: '星轨香薰',
  description: '木质调香',
  price: 99.9,
  images: ['products/88/main.png'],
  initialStock: 20,
})

expect(updateProduct).toHaveBeenCalledWith(88, {
  categoryId: 3,
  name: '星轨香薰',
  description: '木质调香',
  price: 109.9,
  images: ['products/88/main.png'],
  status: 'OFF_SHELF',
})
```

After either mutation resolves, assert `fetchProducts` is called again. When it rejects, assert the modal remains visible with the typed values.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test -- src/components/products/ProductFormModal.test.ts src/views/products/ProductsView.test.ts`

Expected: FAIL because detail and edit behavior do not exist.

- [ ] **Step 3: Implement focused detail and form components**

`ProductFormModal` receives `mode: 'create' | 'edit'`, `product?: ProductView`, `loading: boolean`, and emits a validated backend request. Split image input on newlines or commas. Create mode includes `initialStock`; edit mode includes `status` and never emits stock.

`ProductDetailDrawer` receives `show`, `loading`, `product`, and emits `close` and `edit`. Set `:mask-closable="false"` on both components.

The page fetches detail when opening the drawer, passes the latest product into edit, and refreshes the list after a successful create/update.

- [ ] **Step 4: Run product tests and build**

Run: `npm run test -- src/api/manage-products.test.ts src/components/products src/views/products/ProductsView.test.ts && npm run build`

Expected: PASS and build exit code 0.

- [ ] **Step 5: Commit complete product workflows**

```bash
git add src/components/products src/views/products/ProductsView.vue src/views/products/ProductsView.test.ts
git commit -m "feat(products): add product detail and editing"
```

---

### Task 5: Document and verify product management

**Files:**
- Modify: `README.md`
- Modify only if unused: `src/mocks/products.ts`

**Interfaces:**
- Consumes: completed product API and page behavior
- Produces: accurate project documentation and verification evidence

- [ ] **Step 1: Remove only confirmed-unused product mock imports/data**

Run `rg -n "productRows|productMeta|mocks/products" src` first. Delete or simplify mock files only when no remaining consumer exists; do not touch other module mocks.

- [ ] **Step 2: Update README truthfully**

Document the four real admin product endpoints, supported status filter, server pagination, detail/edit/create behavior, lack of inventory edit, and manual URL/objectKey image input. Add a `2026-08-27（商品管理真实接口重构）` changelog entry and mark the relevant development checklist item complete.

- [ ] **Step 3: Run full verification**

```bash
npm run test
npm run lint
npm run build
git diff --check
```

Expected: all tests pass, ESLint exits 0, build exits 0, and diff check reports no errors.

- [ ] **Step 4: Browser verification**

Start `npm run dev -- --host 127.0.0.1 --port 5180`, sign in through the existing login flow, and inspect `/products`: loading, status filter, pagination, detail drawer, create/edit modal, failed-image fallback, network errors, and console errors. Do not perform a production mutation with real data unless explicitly authorized; use component tests for mutation submission behavior.

- [ ] **Step 5: Commit documentation and cleanup**

```bash
git add README.md src/mocks/products.ts
git commit -m "docs: document real product management"
```
