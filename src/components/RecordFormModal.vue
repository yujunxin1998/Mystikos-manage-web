<script setup lang="ts">
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
} from 'naive-ui'
import type { FormField, RowRecord } from '../types'

const props = defineProps<{
  open: boolean
  title: string
  subtitle: string
  fields: FormField[]
  form: RowRecord
  statusOptions: string[]
  defaultStatus: string
}>()

const emit = defineEmits<{
  close: []
  submit: []
  'update:form': [value: RowRecord]
}>()

function updateField(key: string, value: string | null) {
  emit('update:form', { ...props.form, [key]: value ?? '' })
}

function selectOptions(field: FormField) {
  const options = field.options?.length ? field.options : props.statusOptions
  if (options.length) {
    return options.map((option) => ({ label: option, value: option }))
  }
  return [{ label: props.defaultStatus, value: props.defaultStatus }]
}

function onShowUpdate(show: boolean) {
  if (!show) emit('close')
}
</script>

<template>
  <NModal :show="open" :mask-closable="false" @update:show="onShowUpdate">
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
      <p class="app-form-subtitle">{{ subtitle }}</p>
      <NForm class="app-form-grid" label-placement="top">
        <NFormItem v-for="field in fields" :key="field.key" :label="field.label">
          <NSelect
            v-if="field.type === 'select'"
            :value="form[field.key]"
            :options="selectOptions(field)"
            :placeholder="field.placeholder || `请选择${field.label}`"
            @update:value="(value) => updateField(field.key, value)"
          />
          <NInput
            v-else-if="field.type === 'textarea'"
            type="textarea"
            :value="form[field.key]"
            :placeholder="field.placeholder"
            :autosize="{ minRows: 3, maxRows: 6 }"
            @update:value="(value) => updateField(field.key, value)"
          />
          <NInput
            v-else
            :value="form[field.key]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            @update:value="(value) => updateField(field.key, value)"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="emit('close')">取消</NButton>
          <NButton type="primary" @click="emit('submit')">确认提交</NButton>
        </NSpace>
      </template>
    </NCard>
  </NModal>
</template>
