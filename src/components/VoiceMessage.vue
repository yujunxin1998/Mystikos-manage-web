<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Pause } from 'lucide-vue-next'

const props = defineProps<{ src: string; label: string; index: number }>()

const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const duration = ref(0)
const currentTime = ref(0)

const progress = computed(() => duration.value > 0
  ? Math.min(100, (currentTime.value / duration.value) * 100)
  : 0)
const bubbleWidth = computed(() => `${Math.min(270, 190 + duration.value * 4)}px`)

async function togglePlayback() {
  const element = audio.value
  if (!element) return
  if (!element.paused) {
    element.pause()
    return
  }
  document.querySelectorAll<HTMLAudioElement>('.voice-message audio').forEach((item) => {
    if (item !== element) item.pause()
  })
  try {
    await element.play()
  } catch {
    playing.value = false
  }
}

function syncDuration() { duration.value = audio.value?.duration || 0 }
function syncProgress() { currentTime.value = audio.value?.currentTime || 0 }
function handlePlay() { playing.value = true }
function handlePause() { playing.value = false }
function handleEnded() {
  playing.value = false
  currentTime.value = 0
}

onBeforeUnmount(() => {
  audio.value?.pause()
})
</script>

<template>
  <button
    type="button"
    class="voice-message"
    :class="{ 'is-playing': playing }"
    :style="{ '--voice-progress': `${progress}%`, '--voice-width': bubbleWidth }"
    :aria-label="`${playing ? '暂停' : '播放'}${label}`"
    :aria-pressed="playing"
    @click="togglePlayback"
  >
    <span class="voice-message-icon" aria-hidden="true">
      <Pause v-if="playing" :size="16" />
      <span v-else class="voice-message-wave voice-message-signal"><i></i><i></i><i></i></span>
    </span>
    <span class="voice-message-copy">
      <strong>语音介绍 {{ String(props.index).padStart(2, '0') }}</strong>
      <small>{{ playing ? '正在播放' : '点击播放' }}</small>
    </span>
    <span class="voice-message-duration">{{ Math.ceil(duration) || 0 }}″</span>
    <audio
      ref="audio"
      :src="src"
      preload="metadata"
      @loadedmetadata="syncDuration"
      @durationchange="syncDuration"
      @timeupdate="syncProgress"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
    >
      当前浏览器不支持音频播放
    </audio>
  </button>
</template>
