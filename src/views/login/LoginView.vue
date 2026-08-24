<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, LockKeyhole, Sparkles, UserRound } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import type { LoginForm } from '../../types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref<LoginForm>({
  channel: 'PHONE',
  identifier: '',
  password: '',
  remember: true,
})
const showPassword = ref(false)
const error = ref('')

const canSubmit = computed(() => {
  return form.value.identifier.trim().length >= 5 && form.value.password.length >= 6 && !authStore.loading
})

function validate(): string {
  const identifier = form.value.identifier.trim()
  const password = form.value.password
  if (!identifier) return form.value.channel === 'PHONE' ? '请输入手机号' : '请输入邮箱'
  if (identifier.length > 64) return '登录账号长度不能超过 64 位'
  if (form.value.channel === 'EMAIL' && !/^\S+@\S+\.\S+$/.test(identifier)) return '请输入有效邮箱'
  if (!password) return '请输入密码'
  if (password.length < 6) return '密码至少 6 位'
  if (password.length > 64) return '密码长度不能超过 64 位'
  return ''
}

async function handleSubmit() {
  error.value = validate()
  if (error.value) return

  try {
    await authStore.login({
      ...form.value,
      identifier: form.value.identifier.trim(),
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect || '/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败，请重试'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-ambient" aria-hidden="true"></div>

    <section class="login-panel">
      <div class="login-brand">
        <span class="brand-mark"><Sparkles :size="22" /></span>
        <div>
          <strong>MYSTIKOS</strong>
          <p>运营管理后台</p>
        </div>
      </div>

      <div class="login-head">
        <h1>欢迎回来</h1>
        <p>登录后进入运营中心，管理会员、订单与经营数据</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div
          class="login-channel"
          :class="{ 'is-email': form.channel === 'EMAIL' }"
          role="group"
          aria-label="登录方式"
        >
          <span class="login-channel-indicator" aria-hidden="true"></span>
          <button
            type="button"
            :class="{ active: form.channel === 'PHONE' }"
            :aria-pressed="form.channel === 'PHONE'"
            @click="form.channel = 'PHONE'"
          >
            手机号
          </button>
          <button
            type="button"
            :class="{ active: form.channel === 'EMAIL' }"
            :aria-pressed="form.channel === 'EMAIL'"
            @click="form.channel = 'EMAIL'"
          >
            邮箱
          </button>
        </div>
        <label :key="form.channel" class="login-account">
          <span>{{ form.channel === 'PHONE' ? '手机号' : '邮箱' }}</span>
          <div class="login-field">
            <UserRound :size="17" />
            <input
              v-model="form.identifier"
              :type="form.channel === 'EMAIL' ? 'email' : 'tel'"
              name="identifier"
              autocomplete="username"
              maxlength="64"
              :placeholder="form.channel === 'PHONE' ? '请输入管理员手机号' : '请输入管理员邮箱'"
            />
          </div>
        </label>

        <label>
          <span>密码</span>
          <div class="login-field">
            <LockKeyhole :size="17" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              maxlength="64"
              placeholder="请输入登录密码"
            />
            <button
              type="button"
              class="login-eye"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="17" />
              <Eye v-else :size="17" />
            </button>
          </div>
        </label>

        <div class="login-meta">
          <label class="login-remember">
            <input v-model="form.remember" type="checkbox" />
            <span>记住登录状态</span>
          </label>
          <span class="login-hint">使用后台管理员账号登录</span>
        </div>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button type="submit" class="primary login-submit" :disabled="!canSubmit">
          {{ authStore.loading ? '登录中...' : '进入运营中心' }}
        </button>
      </form>

      <div class="login-foot">
        <span>仅供运营人员使用</span>
        <span>登录状态由 Mystikos Server API 验证</span>
      </div>
    </section>
  </div>
</template>
