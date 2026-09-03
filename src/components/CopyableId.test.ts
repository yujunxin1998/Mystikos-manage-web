import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NButton } from 'naive-ui'
import CopyableId from './CopyableId.vue'

describe('CopyableId', () => {
  it('renders the copy button without incompatible Naive UI button props', () => {
    const wrapper = mount(CopyableId, { props: { value: 42 } })

    expect(wrapper.getComponent(NButton).props('quaternary')).toBe(false)
  })
})
