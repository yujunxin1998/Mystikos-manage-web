import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import LoginView from './LoginView.vue'

async function mountLoginView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/login', component: LoginView }],
  })
  await router.push('/login')
  await router.isReady()

  return mount(LoginView, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('LoginView', () => {
  it('呈现编辑式品牌主视觉和安全登录舱', async () => {
    const wrapper = await mountLoginView()

    expect(wrapper.find('.login-editorial').exists()).toBe(true)
    expect(wrapper.text()).toContain('MYSTIKOS')
    expect(wrapper.text()).toContain('CONTROL')
    expect(wrapper.find('.login-capability-rail').exists()).toBe(true)
    expect(wrapper.find('.login-card-top').exists()).toBe(true)
  })

  it('登录方式切换后明确标记当前选项', async () => {
    const wrapper = await mountLoginView()
    const buttons = wrapper.findAll('.login-channel button')

    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-pressed')).toBe('false')

    await buttons[1].trigger('click')

    expect(buttons[0].attributes('aria-pressed')).toBe('false')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.login-channel').classes()).toContain('is-email')
  })
})
