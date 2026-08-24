<script setup lang="ts">
import { CircleDollarSign, Gamepad2, TrendingUp, UserPlus, UsersRound } from 'lucide-vue-next'
import ModulePage from '../../components/ModulePage.vue'
import { workerMeta, workerRows } from '../../mocks/workers'

const statIcons = [TrendingUp, UsersRound, Gamepad2, CircleDollarSign]
</script>

<template>
  <ModulePage
    :meta="workerMeta"
    :source="workerRows"
    filename-prefix="陪玩师管理"
    :action-icon="UserPlus"
    :stat-icons="statIcons"
  />
</template>
