<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span class="text-sm font-bold text-primary-600">{{ percentage }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div 
        class="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary-500 to-primary-600"
        :style="{ width: percentage + '%' }"
      >
        <div class="h-full w-full animate-pulse bg-white opacity-20"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  percentage: {
    type: Number,
    required: true
  },
  label: String
})
</script>