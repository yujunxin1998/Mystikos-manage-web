<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import type { FormField, RowRecord } from '../types'

defineProps<{
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
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-head">
        <div>
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>
        <button type="button" class="icon-btn" @click="emit('close')"><X :size="19" /></button>
      </div>
      <div class="business-form dynamic-form">
        <label v-for="field in fields" :key="field.key">
          <span>{{ field.label }}</span>
          <select
            v-if="field.type === 'select'"
            :value="form[field.key]"
            @change="
              emit('update:form', {
                ...form,
                [field.key]: ($event.target as HTMLSelectElement).value,
              })
            "
          >
            <option v-for="item in field.options || statusOptions" :key="item">{{ item }}</option>
            <option v-if="!(field.options || statusOptions).length">{{ defaultStatus }}</option>
          </select>
          <textarea
            v-else-if="field.type === 'textarea'"
            :value="form[field.key]"
            :placeholder="field.placeholder"
            @input="
              emit('update:form', {
                ...form,
                [field.key]: ($event.target as HTMLTextAreaElement).value,
              })
            "
          ></textarea>
          <input
            v-else
            :value="form[field.key]"
            :type="field.type === 'url' ? 'url' : 'text'"
            :placeholder="field.placeholder || `请输入${field.label}`"
            @input="
              emit('update:form', {
                ...form,
                [field.key]: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </label>
      </div>
      <div class="modal-foot">
        <button type="button" class="secondary" @click="emit('close')">取消</button>
        <button type="button" class="primary" @click="emit('submit')"><Check :size="17" />确认提交</button>
      </div>
    </div>
  </div>
</template>
