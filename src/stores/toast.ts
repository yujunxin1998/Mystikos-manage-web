import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  function notify(text: string) {
    message.value = text
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = ''
      timer = null
    }, 2200)
  }

  function clear() {
    if (timer) clearTimeout(timer)
    message.value = ''
    timer = null
  }

  return { message, notify, clear }
})
