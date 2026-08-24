<script setup lang="ts">
import { CircleDollarSign, Gamepad2, Plus, TrendingUp, UsersRound } from 'lucide-vue-next'
import ModulePage from '../../components/ModulePage.vue'
import { orderMeta, orderRows } from '../../mocks/orders'

const statIcons = [TrendingUp, UsersRound, Gamepad2, CircleDollarSign]
</script>

<template>
  <ModulePage
    :meta="orderMeta"
    :source="orderRows"
    filename-prefix="订单管理"
    :action-icon="Plus"
    :stat-icons="statIcons"
  />
</template>
