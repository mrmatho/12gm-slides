<template>
  <div class="timer">
    <span v-if="timeLeft > 0">{{ formattedTime }}</span>
    <span v-else>Time is up!</span>
    <div class="controls">
      <button class="btn" @click="start" :disabled="running">Start</button>
      <button class="btn" @click="reset">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  seconds: {
    type: Number,
    default: 60
  }
})

const emit = defineEmits(['finish'])
const timeLeft = ref(props.seconds)
const running = ref(false)
let timer = null

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  const m = mins < 10 ? '0' + mins : mins
  const s = secs < 10 ? '0' + secs : secs
  return `${m}:${s}`
})

function start() {
  if (running.value || timeLeft.value <= 0) return
  running.value = true
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
      running.value = false
      emit('finish')
    }
  }, 1000)
}

function reset() {
  clearInterval(timer)
  running.value = false
  timeLeft.value = props.seconds
}

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.timer {
  font-size: 1.8rem;
  font-family: monospace;
  font-weight: bold;
  text-align: center;
  background-color: #333333;
  color: #44ff44;
  width: 200px;
  border-radius: 10px;
  margin: 20px auto;
  padding: 8px 0;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 6px;
}

.btn {
  font-size: 0.7rem;
  font-family: sans-serif;
  font-weight: normal;
  padding: 2px 8px;
  border-radius: 6px;
  border: none;
  background-color: #555555;
  color: #ffffff;
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  background-color: #666666;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
