import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent, h, nextTick } from 'vue'
import { useThemeVars } from 'naive-ui'
import { describe, expect, it } from 'vitest'
import App from './App.vue'
import { useAppStore } from './stores/app'

const ThemeProbe = defineComponent({
  setup() {
    const themeVars = useThemeVars()
    return () => h('span', { 'data-testid': 'primary-color' }, themeVars.value.primaryColor)
  },
})

describe('App theme provider', () => {
  it('provides the Mystikos primary color to Naive UI components', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: { RouterView: ThemeProbe },
      },
    })

    expect(wrapper.get('[data-testid="primary-color"]').text()).toBe('#7257df')
  })

  it('syncs theme-root data attribute and CSS variables with Pinia dark mode', async () => {
    const pinia = createPinia()
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: { RouterView: true },
      },
    })

    const root = wrapper.get('.theme-root')
    expect(root.attributes('data-theme')).toBe('light')
    expect(root.attributes('style')).toContain('--app-page: #f4f6fb')
    expect(root.attributes('style')).toContain('--app-primary: #7257df')
    expect(root.attributes('style')).toContain('--app-radius-md: 10px')

    useAppStore(pinia).toggleDark()
    await nextTick()

    expect(root.attributes('data-theme')).toBe('dark')
    expect(root.attributes('style')).toContain('--app-page: #0f121a')
  })
})
