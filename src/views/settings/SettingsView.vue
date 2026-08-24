<script setup lang="ts">
import { Check, CircleDollarSign, Gamepad2, TrendingUp, UsersRound } from 'lucide-vue-next'
import ModulePage from '../../components/ModulePage.vue'
import { settingMeta, settingRows } from '../../mocks/settings'

const statIcons = [TrendingUp, UsersRound, Gamepad2, CircleDollarSign]
</script>

<template>
  <ModulePage
    :meta="settingMeta"
    :source="settingRows"
    filename-prefix="系统设置"
    :action-icon="Check"
    :stat-icons="statIcons"
  />
</template>
