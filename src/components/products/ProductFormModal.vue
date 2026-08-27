<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  NUpload,
  useMessage,
  type UploadCustomRequestOptions,
} from 'naive-ui'
import { ImagePlus, X } from 'lucide-vue-next'
import ProductImage from './ProductImage.vue'
import { uploadFile } from '../../api/files'
import type {
  CreateProductRequest,
  ProductStatus,
  ProductView,
  UpdateProductRequest,
} from '../../types'
import { productStatusLabel } from '../../utils/product-status'

const props = defineProps<{
  show: boolean
  mode: 'create' | 'edit'
  product: ProductView | null
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [request: CreateProductRequest | UpdateProductRequest]
}>()

const message = useMessage()

const uploading = ref(false)

const form = reactive({
  name: '',
  price: null as number | null,
  initialStock: null as number | null,
  description: '',
  images: [] as string[],
  status: 'ON_SHELF' as ProductStatus,
})

const statusOptions = [
  { label: productStatusLabel.ON_SHELF, value: 'ON_SHELF' },
  { label: productStatusLabel.OFF_SHELF, value: 'OFF_SHELF' },
]

const title = computed(() => (props.mode === 'create' ? '新增商品' : '编辑商品'))

function resetForm() {
  const source = props.mode === 'edit' ? props.product : null
  form.name = source?.name ?? ''
  form.price = source?.price ?? null
  form.initialStock = null
  form.description = source?.description ?? ''
  form.images = source ? [...source.images] : []
  form.status = source?.status ?? 'ON_SHELF'
}

watch(
  () => props.show,
  (show) => {
    if (show) resetForm()
  },
)

async function handleUpload(options: UploadCustomRequestOptions) {
  const file = options.file.file
  if (!file) {
    options.onError()
    return
  }
  uploading.value = true
  try {
    const result = await uploadFile(file)
    form.images = [...form.images, result.objectKey]
    options.onFinish()
  } catch (error) {
    options.onError()
    message.error(error instanceof Error ? error.message : '图片上传失败')
  } finally {
    uploading.value = false
  }
}

function removeImage(index: number) {
  form.images = form.images.filter((_, i) => i !== index)
}

function submit() {
  const name = form.name.trim()
  if (!name) {
    message.warning('请输入商品名称')
    return
  }
  if (form.price == null || form.price <= 0) {
    message.warning('价格必须大于零')
    return
  }

  if (props.mode === 'create') {
    if (
      form.initialStock == null ||
      form.initialStock < 0 ||
      !Number.isInteger(form.initialStock)
    ) {
      message.warning('初始库存必须为非负整数')
      return
    }
    emit('submit', {
      name,
      description: form.description.trim() || undefined,
      price: form.price,
      images: form.images,
      initialStock: form.initialStock,
    })
    return
  }

  emit('submit', {
    name,
    description: form.description.trim() || undefined,
    price: form.price,
    images: form.images,
    status: form.status,
  })
}
</script>

<template>
  <NModal :show="show" :mask-closable="false" @update:show="emit('close')">
    <NCard
      class="app-form-modal"
      :title="title"
      :bordered="false"
      size="huge"
      closable
      role="dialog"
      aria-modal="true"
      @close="emit('close')"
    >
      <p class="app-form-subtitle">
        {{ mode === 'create' ? '填写商品信息并上传图片' : '修改商品信息与上下架状态' }}
      </p>
      <NForm class="app-form-grid" label-placement="top">
        <NFormItem label="商品名称" required>
          <NInput v-model:value="form.name" placeholder="请输入商品名称" />
        </NFormItem>
        <NFormItem label="价格" required>
          <NInputNumber
            v-model:value="form.price"
            :min="0.01"
            :precision="2"
            :step="0.01"
            placeholder="大于 0"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem v-if="mode === 'create'" label="初始库存" required>
          <NInputNumber
            v-model:value="form.initialStock"
            :min="0"
            :precision="0"
            placeholder="非负整数"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem v-else label="上下架状态">
          <NSelect v-model:value="form.status" :options="statusOptions" />
        </NFormItem>
        <NFormItem label="商品描述" class="app-form-full">
          <NInput
            v-model:value="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          />
        </NFormItem>
        <NFormItem label="商品图片" class="app-form-full">
          <div class="product-upload">
            <div
              v-for="(img, index) in form.images"
              :key="`${img}-${index}`"
              class="product-upload-item"
            >
              <ProductImage :src="img" />
              <span v-if="index === 0" class="product-upload-cover">主图</span>
              <NButton
                class="product-upload-remove"
                quaternary
                circle
                size="tiny"
                type="error"
                title="删除图片"
                @click="removeImage(index)"
              >
                <template #icon><X :size="14" /></template>
              </NButton>
            </div>
            <NUpload :show-file-list="false" accept="image/*" :custom-request="handleUpload">
              <div class="product-upload-add" :class="{ 'is-uploading': uploading }">
                <NSpin v-if="uploading" :size="20" />
                <template v-else>
                  <span class="product-upload-add__icon"><ImagePlus :size="22" /></span>
                  <span class="product-upload-add__text">上传图片</span>
                  <span class="product-upload-add__hint">JPG / PNG</span>
                </template>
              </div>
            </NUpload>
          </div>
          <p class="product-upload-tip">第一张作为封面图，单张不超过 5MB</p>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton :disabled="loading" @click="emit('close')">取消</NButton>
          <NButton type="primary" :loading="loading" @click="submit">确认提交</NButton>
        </NSpace>
      </template>
    </NCard>
  </NModal>
</template>
