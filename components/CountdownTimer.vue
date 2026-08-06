<template>
  <div class="timer">
    <span v-if="timeLeft > 0">{{ formattedTime }}</span>
    <span v-else>Time is up!</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  seconds: {
    type: Number,
    default: 60
  }
})

const emit = defineEmits(['finish'])
const timeLeft = ref(props.seconds)
let timer = null

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  const m = mins < 10 ? '0' + mins : mins
  const s = secs < 10 ? '0' + secs : secs
  return `${m}:${s}`
})

onMounted(() => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
      emit('finish')
    }
  }, 1000)
})

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
}
</style>
