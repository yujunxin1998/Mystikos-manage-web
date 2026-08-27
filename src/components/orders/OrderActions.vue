<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NPopconfirm, NSpace } from 'naive-ui'
import type { ManageOrderStatus, OrderAction } from '../../types'
import { allowedOrderActions, orderActionLabel } from '../../utils/order-status'

const props = defineProps<{
  status: ManageOrderStatus
  loadingAction?: OrderAction
}>()

const emit = defineEmits<{ action: [action: OrderAction] }>()

const actions = computed(() => allowedOrderActions(props.status))

function isDanger(action: OrderAction) {
  return action === 'cancel' || action === 'refund'
}
</script>

<template>
  <NSpace :size="6" wrap>
    <NPopconfirm
      v-for="action in actions"
      :key="action"
      :positive-button-props="{ type: isDanger(action) ? 'error' : 'primary' }"
      @positive-click="emit('action', action)"
    >
      <template #trigger>
        <NButton
          size="small"
          :type="isDanger(action) ? 'error' : 'default'"
          :loading="loadingAction === action"
          :disabled="loadingAction != null && loadingAction !== action"
        >
          {{ orderActionLabel[action] }}
        </NButton>
      </template>
      {{
        isDanger(action)
          ? '该操作会释放预占库存，确认继续？'
          : `确认${orderActionLabel[action]}该订单？`
      }}
    </NPopconfirm>
  </NSpace>
</template>
