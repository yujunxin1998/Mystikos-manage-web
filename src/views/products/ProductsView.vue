<script setup lang="ts">
import { CircleDollarSign, Gamepad2, Plus, TrendingUp, UsersRound } from 'lucide-vue-next'
import ModulePage from '../../components/ModulePage.vue'
import { productMeta, productRows } from '../../mocks/products'

const statIcons = [TrendingUp, UsersRound, Gamepad2, CircleDollarSign]
</script>

<template>
  <ModulePage
    :meta="productMeta"
    :source="productRows"
    filename-prefix="商品管理"
    :action-icon="Plus"
    :stat-icons="statIcons"
  />
</template>
