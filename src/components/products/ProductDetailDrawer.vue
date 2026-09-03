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
  <NDrawer
    class="product-detail-drawer"
    :show="show"
    width="min(640px, 100vw)"
    :mask-closable="false"
    @update:show="emit('close')"
  >
    <NDrawerContent title="商品详情" closable>
      <NSpin :show="loading">
        <div v-if="error" class="drawer-error">
          <p>{{ error }}</p>
          <NButton type="primary" @click="emit('retry')">重试</NButton>
        </div>
        <div v-else-if="product" class="product-detail">
          <section class="product-detail-hero" aria-labelledby="product-overview-title">
            <div class="product-detail-media">
              <ProductImage :src="product.images[0] || ''" />
            </div>
            <div class="product-detail-summary">
              <div class="detail-section-heading">
                <span id="product-overview-title">商品概览</span>
                <NTag :type="productStatusTone[product.status]" size="small">
                  {{ productStatusLabel[product.status] }}
                </NTag>
              </div>
              <h2>{{ product.name }}</h2>
              <strong class="product-detail-price">{{ formatMoney(product.price) }}</strong>
              <dl class="product-detail-meta">
                <div>
                  <dt>商品 ID</dt>
                  <dd>#{{ product.id }}</dd>
                </div>
                <div>
                  <dt>分类 ID</dt>
                  <dd>{{ product.categoryId ?? '-' }}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section class="detail-section" aria-labelledby="product-description-title">
            <div class="detail-section-heading">
              <h3 id="product-description-title">商品说明</h3>
            </div>
            <p class="product-detail-desc">{{ product.description || '暂无商品说明' }}</p>
          </section>

          <section class="detail-section" aria-labelledby="product-gallery-title">
            <div class="detail-section-heading">
              <h3 id="product-gallery-title">商品图片</h3>
              <span>{{ product.images.length }} 张</span>
            </div>
            <div class="product-detail-gallery">
              <ProductImage
                v-for="(img, index) in product.images"
                :key="`${img}-${index}`"
                :src="img"
              />
              <div v-if="!product.images.length" class="detail-empty">暂无商品图片</div>
            </div>
          </section>
        </div>
      </NSpin>
      <template #footer>
        <NButton type="primary" :disabled="!product" @click="emit('edit')">编辑</NButton>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
