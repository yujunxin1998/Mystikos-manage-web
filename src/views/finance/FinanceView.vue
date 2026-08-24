<script setup lang="ts">
import { CircleDollarSign, Gamepad2, TrendingUp, UsersRound } from 'lucide-vue-next'
import ModulePage from '../../components/ModulePage.vue'
import { financeMeta, financeRows } from '../../mocks/finance'

const statIcons = [TrendingUp, UsersRound, Gamepad2, CircleDollarSign]
</script>

<template>
  <ModulePage
    :meta="financeMeta"
    :source="financeRows"
    filename-prefix="财务中心"
    :action-icon="CircleDollarSign"
    :stat-icons="statIcons"
  />
</template>
