<script setup lang="ts">
import { ArrowDownToLine, CircleDollarSign, Gamepad2, TrendingUp, UsersRound } from 'lucide-vue-next'
import ModulePage from '../../components/ModulePage.vue'
import { reportBarHeights, reportMeta, reportRows } from '../../mocks/reports'

const statIcons = [TrendingUp, UsersRound, Gamepad2, CircleDollarSign]
</script>

<template>
  <ModulePage
    :meta="reportMeta"
    :source="reportRows"
    filename-prefix="数据报表"
    :action-icon="ArrowDownToLine"
    :stat-icons="statIcons"
  >
    <template #extra>
      <section class="insight-strip">
        <div>
          <span>最近 6 个月经营趋势</span><strong>收入持续增长</strong
          ><small>平均环比增长 12.8%</small>
        </div>
        <div class="report-bars">
          <i v-for="h in reportBarHeights" :key="h" :style="{ height: h + 'px' }"></i>
        </div>
        <div>
          <span>表现最佳品类</span><strong>三角洲行动</strong
          ><small>贡献总收入的 66.4%</small>
        </div>
      </section>
    </template>
  </ModulePage>
</template>
