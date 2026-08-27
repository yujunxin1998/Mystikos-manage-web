<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NSelect,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { Eye, PackageOpen, Pencil, Plus, RefreshCcw } from 'lucide-vue-next'
import ListPagination from '../../components/ListPagination.vue'
import CopyableId from '../../components/CopyableId.vue'
import ProductImage from '../../components/products/ProductImage.vue'
import ProductDetailDrawer from '../../components/products/ProductDetailDrawer.vue'
import ProductFormModal from '../../components/products/ProductFormModal.vue'
import { createProduct, fetchProduct, fetchProducts, updateProduct } from '../../api/manage-products'
import type {
  CreateProductRequest,
  ProductStatus,
  ProductView,
  UpdateProductRequest,
} from '../../types'
import { productStatusLabel, productStatusTone } from '../../utils/product-status'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'
import { formatMoney } from '../../utils/format'

const message = useMessage()

const rows = ref<ProductView[]>([])
const loading = ref(false)
const status = ref<ProductStatus | ''>('')
const pageNum = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const pages = ref(0)

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const selected = ref<ProductView | null>(null)

const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formLoading = ref(false)

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: productStatusLabel.ON_SHELF, value: 'ON_SHELF' },
  { label: productStatusLabel.OFF_SHELF, value: 'OFF_SHELF' },
]

const onShelfCount = computed(() => rows.value.filter((item) => item.status === 'ON_SHELF').length)
const offShelfCount = computed(() => rows.value.filter((item) => item.status === 'OFF_SHELF').length)

const range = computed(() => pageRange(pageNum.value, pageSize.value, total.value))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)

async function loadProducts() {
  loading.value = true
  try {
    const result = await fetchProducts({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: status.value || undefined,
    })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    message.error(error instanceof Error ? error.message : '商品列表加载失败')
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  pageNum.value = 1
  await loadProducts()
}

async function resetFilters() {
  status.value = ''
  pageNum.value = 1
  await loadProducts()
}

async function changePage(page: number) {
  pageNum.value = page
  await loadProducts()
}

async function changePageSize(size: number) {
  pageSize.value = size
  pageNum.value = 1
  await loadProducts()
}

function openCreate() {
  formMode.value = 'create'
  selected.value = null
  formOpen.value = true
}

async function openDetail(row: ProductView) {
  detailOpen.value = true
  detailError.value = ''
  selected.value = row
  detailLoading.value = true
  try {
    selected.value = await fetchProduct(row.id)
  } catch (error) {
    detailError.value = error instanceof Error ? error.message : '商品详情加载失败'
  } finally {
    detailLoading.value = false
  }
}

function openEdit() {
  formMode.value = 'edit'
  formOpen.value = true
}

async function handleSubmit(request: CreateProductRequest | UpdateProductRequest) {
  formLoading.value = true
  try {
    if (formMode.value === 'create') {
      await createProduct(request as CreateProductRequest)
      message.success('商品创建成功')
    } else if (selected.value) {
      await updateProduct(selected.value.id, request as UpdateProductRequest)
      message.success('商品已更新')
    }
    formOpen.value = false
    await loadProducts()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '商品保存失败')
  } finally {
    formLoading.value = false
  }
}

const columns = computed<DataTableColumns<ProductView>>(() => [
  {
    title: '商品 ID',
    key: 'id',
    width: 100,
    render: (row) => h(CopyableId, { value: row.id, prefix: '#', name: '商品ID' }),
  },
  {
    title: '主图',
    key: 'image',
    width: 84,
    render: (row) => h(ProductImage, { src: row.images[0] || '' }),
  },
  {
    title: '商品名称',
    key: 'name',
    width: 200,
    render: (row) => h('strong', { class: 'order-member' }, row.name),
  },
  { title: '分类 ID', key: 'categoryId', width: 90, render: (row) => row.categoryId ?? '-' },
  { title: '价格', key: 'price', width: 110, render: (row) => formatMoney(row.price) },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: productStatusTone[row.status], size: 'small', bordered: false },
        () => productStatusLabel[row.status],
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 92,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 2, wrap: false }, () => [
        h(
          NButton,
          {
            quaternary: true,
            circle: true,
            size: 'small',
            title: '查看详情',
            onClick: () => openDetail(row),
          },
          { default: () => h(Eye, { size: 15 }) },
        ),
        h(
          NButton,
          {
            quaternary: true,
            circle: true,
            size: 'small',
            title: '编辑',
            onClick: () => {
              selected.value = row
              openEdit()
            },
          },
          { default: () => h(Pencil, { size: 15 }) },
        ),
      ]),
  },
])

onMounted(loadProducts)
</script>

<template>
  <div class="business-page product-page">
    <section class="business-title">
      <div>
        <h1>商品管理</h1>
        <span>管理前台奇物商店的商品与上下架状态</span>
      </div>
    </section>

    <section class="business-stats product-summary">
      <article>
        <i class="tone-0"><PackageOpen /></i>
        <div>
          <p>商品总数</p>
          <strong>{{ total }}</strong>
          <small>来自服务器实时数据</small>
        </div>
      </article>
      <article>
        <i class="tone-1"><PackageOpen /></i>
        <div>
          <p>当前页上架数</p>
          <strong>{{ onShelfCount }}</strong>
          <small>当前第 {{ pageNum }} 页</small>
        </div>
      </article>
      <article>
        <i class="tone-2"><PackageOpen /></i>
        <div>
          <p>当前页下架数</p>
          <strong>{{ offShelfCount }}</strong>
          <small>仅统计当前页</small>
        </div>
      </article>
    </section>

    <section class="list-table-panel panel">
      <div class="list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>商品列表</h2>
            <p>共 {{ total }} 件商品</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton :loading="loading" @click="loadProducts">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
            <NButton type="primary" @click="openCreate">
              <template #icon><Plus :size="17" /></template>
              新增商品
            </NButton>
          </NSpace>
        </div>
        <NSpace class="list-filters" :size="8" wrap align="center">
          <NSelect
            v-model:value="status"
            aria-label="上下架状态"
            :options="statusOptions"
            style="width: 130px"
          />
          <NButton type="primary" :loading="loading" @click="applyFilters">查询</NButton>
          <NButton :disabled="loading" @click="resetFilters">重置</NButton>
        </NSpace>
      </div>

      <div class="list-table-host">
        <NDataTable
          :columns="columns"
          :data="rows"
          :loading="loading"
          :pagination="false"
          :row-key="(row: ProductView) => row.id"
          :scroll-x="900"
          :single-line="false"
          striped
        />
      </div>

      <ListPagination
        :page="pageNum"
        :page-size="pageSize"
        :item-count="total"
        :range-start="rangeStart"
        :range-end="rangeEnd"
        :disabled="loading"
        @update:page="changePage"
        @update:page-size="changePageSize"
      />
    </section>

    <ProductDetailDrawer
      :show="detailOpen"
      :loading="detailLoading"
      :product="selected"
      :error="detailError"
      @close="detailOpen = false"
      @retry="selected && openDetail(selected)"
      @edit="openEdit"
    />

    <ProductFormModal
      :show="formOpen"
      :mode="formMode"
      :product="selected"
      :loading="formLoading"
      @close="formOpen = false"
      @submit="handleSubmit"
    />
  </div>
</template>
