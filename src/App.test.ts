import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { useThemeVars } from 'naive-ui'
import { describe, expect, it } from 'vitest'
import App from './App.vue'

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
})
