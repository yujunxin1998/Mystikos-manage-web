<script setup lang="ts">
import { NButton, NDrawer, NDrawerContent, NSpin, NTag } from 'naive-ui'
import ProductImage from './ProductImage.vue'
import type { ProductView } from '../../types'
import { productStatusLabel, productStatusTone } from '../../utils/product-status'
import { formatMoney } from '../../utils/format'

defineProps<{
  show: boolean
  loading: boolean
  product: ProductView | null
  error?: string
}>()

const emit = defineEmits<{ close: []; edit: []; retry: [] }>()
</script>

<template>
  <NDrawer :show="show" :width="520" :mask-closable="false" @update:show="emit('close')">
    <NDrawerContent title="商品详情" closable>
      <NSpin :show="loading">
        <div v-if="error" class="drawer-error">
          <p>{{ error }}</p>
          <NButton type="primary" @click="emit('retry')">重试</NButton>
        </div>
        <div v-else-if="product" class="product-detail">
          <div class="product-detail-media">
            <ProductImage :src="product.images[0] || ''" />
          </div>
          <h2>{{ product.name }}</h2>
          <dl class="product-detail-meta">
            <div>
              <dt>商品 ID</dt>
              <dd>{{ product.id }}</dd>
            </div>
            <div>
              <dt>分类 ID</dt>
              <dd>{{ product.categoryId ?? '-' }}</dd>
            </div>
            <div>
              <dt>价格</dt>
              <dd>{{ formatMoney(product.price) }}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>
                <NTag :type="productStatusTone[product.status]" size="small">
                  {{ productStatusLabel[product.status] }}
                </NTag>
              </dd>
            </div>
          </dl>
          <p class="product-detail-desc">{{ product.description || '暂无描述' }}</p>
          <div v-if="product.images.length > 1" class="product-detail-thumbs">
            <ProductImage
              v-for="(img, index) in product.images"
              :key="index"
              :src="img"
            />
          </div>
        </div>
      </NSpin>
      <template #footer>
        <NButton type="primary" :disabled="!product" @click="emit('edit')">编辑</NButton>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
