<script setup lang="ts">
import type { Component } from 'vue'
import { TrendingUp } from 'lucide-vue-next'
import type { StatItem } from '../types'

withDefaults(
  defineProps<{
    items: StatItem[]
    icons?: Component[]
    variant?: 'dashboard' | 'business'
    tones?: string[]
  }>(),
  {
    variant: 'business',
    tones: () => ['tone-0', 'tone-1', 'tone-2', 'tone-3'],
    icons: undefined,
  },
)
</script>

<template>
  <section v-if="variant === 'dashboard'" class="stats-grid">
    <article v-for="(item, index) in items" :key="item.label" class="stat-card">
      <div class="stat-top">
        <span :class="['stat-icon', tones[index] || 'violet']">
          <component :is="icons?.[index] || TrendingUp" :size="21" />
        </span>
      </div>
      <p>{{ item.label }}</p>
      <div class="stat-value">
        <strong>{{ item.value }}</strong>
        <span :class="{ neutral: index === 3 }">
          <TrendingUp v-if="index !== 3" :size="13" />
          {{ item.hint }}
        </span>
      </div>
      <div class="mini-bars">
        <i
          v-for="n in 12"
          :key="n"
          :style="{ height: `${18 + ((n * 13 + item.value.length * 7) % 24)}px` }"
        ></i>
      </div>
    </article>
  </section>

  <section v-else class="business-stats">
    <article v-for="(item, index) in items" :key="item.label">
      <i :class="tones[index] || 'tone-0'">
        <component :is="icons?.[index] || TrendingUp" :size="20" />
      </i>
      <div>
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </div>
    </article>
  </section>
</template>
