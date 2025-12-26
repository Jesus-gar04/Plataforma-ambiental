<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Leaf class="w-6 h-6 text-primary-600 animate-pulse" />
      </div>
    </div>
    <p v-if="message" class="ml-4 text-gray-600 font-medium">{{ message }}</p>
  </div>
</template>

<script setup>
import { Leaf } from 'lucide-vue-next'

defineProps({
  message: String,
  containerClass: {
    type: String,
    default: 'min-h-screen'
  }
})
</script>