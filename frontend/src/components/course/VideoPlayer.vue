<template>
  <div class="relative bg-black rounded-xl overflow-hidden shadow-2xl">
    <video
      ref="videoRef"
      :src="src"
      class="w-full"
      controls
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
    ></video>
    
    <div v-if="!isPlaying" class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <button @click="play" class="p-6 bg-white/90 rounded-full hover:bg-white hover:scale-110 transition-all duration-300">
        <Play class="w-12 h-12 text-primary-600" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Play } from 'lucide-vue-next'

const props = defineProps({
  src: String
})

const emit = defineEmits(['progress', 'ended'])

const videoRef = ref(null)
const isPlaying = ref(false)

const play = () => {
  videoRef.value?.play()
  isPlaying.value = true
}

const handleTimeUpdate = (e) => {
  const progress = (e.target.currentTime / e.target.duration) * 100
  emit('progress', Math.round(progress))
}

const handleEnded = () => {
  emit('ended')
  isPlaying.value = false
}
</script>