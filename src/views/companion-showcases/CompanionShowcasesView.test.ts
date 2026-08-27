import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCompanionShowcases } from '../../api/companions'
import CompanionShowcasesView from './CompanionShowcasesView.vue'

vi.mock('../../api/companions', () => ({
  fetchCompanionShowcases: vi.fn(),
  reviewCompanionShowcase: vi.fn(),
}))

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  document.body.innerHTML = ''
})

function mountView() {
  const Host = defineComponent({
    setup() {
      return () =>
        h(NConfigProvider, null, {
          default: () =>
            h(NMessageProvider, null, {
              default: () => h(CompanionShowcasesView),
            }),
        })
    },
  })

  return mount(Host, { attachTo: document.body, global: { plugins: [createPinia()] } })
}

describe('CompanionShowcasesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchCompanionShowcases).mockResolvedValue({
      records: [
        {
          id: 88,
          userId: 10,
          applicantNickname: '浅眠',
          applicantEmail: 'companion10@mystikos.local',
          status: 'PENDING_REVIEW',
          tagline: '吃鸡陪练首选',
          availability: '周末可约',
          bio: '和平精英资深陪练，带你上分。',
          coverUrl: 'https://example.com/cover.jpg',
          photoUrls: ['https://example.com/photo.jpg'],
          audioUrls: ['https://example.com/voice.mp3'],
          videoUrls: [],
          tags: [{ id: 1, category: 'GAME_TYPE', label: '和平精英', sortOrder: 1, enabled: true }],
          createdAt: '2026-08-26T10:12:00',
        },
      ],
      total: 1,
      pageNum: 1,
      pageSize: 10,
      pages: 1,
    })
  })

  it('待审核名片详情突出媒体并提供通过和驳回入口', async () => {
    const wrapper = mountView()
    await flushPromises()
    const viewButton = wrapper.findAll('button').find((button) => button.text() === '查看')
    expect(viewButton).toBeDefined()

    await viewButton!.trigger('click')
    await nextTick()
    await flushPromises()

    expect(document.body.querySelector('.showcase-media-stage')).not.toBeNull()
    expect(document.body.querySelector('.showcase-detail-grid')).not.toBeNull()
    expect(document.body.textContent).toContain('驳回')
    expect(document.body.textContent).toContain('通过审核')
  })

  it('使用可点击的语音气泡代替原生音频控件', async () => {
    const wrapper = mountView()
    await flushPromises()
    const viewButton = wrapper.findAll('button').find((button) => button.text() === '查看')

    await viewButton!.trigger('click')
    await nextTick()
    await flushPromises()

    const voiceBubble = document.body.querySelector<HTMLButtonElement>('.voice-message')
    expect(voiceBubble).not.toBeNull()
    expect(voiceBubble?.getAttribute('aria-label')).toContain('播放语音 1')
    expect(document.body.querySelector('.voice-message-wave')).not.toBeNull()
    expect(document.body.querySelector('audio[controls]')).toBeNull()
  })

  it('使用紧凑人物头部和短语音消息布局', async () => {
    const wrapper = mountView()
    await flushPromises()
    const viewButton = wrapper.findAll('button').find((button) => button.text() === '查看')

    await viewButton!.trigger('click')
    await nextTick()
    await flushPromises()

    expect(document.body.querySelector('.showcase-profile-head')).not.toBeNull()
    expect(document.body.querySelector('.voice-message-copy')?.textContent).toContain('语音介绍 01')
    expect(document.body.querySelector('.showcase-voice-index')).toBeNull()
  })
})
