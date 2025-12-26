<template>
  <div class="card-hover group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600 font-medium mb-1">{{ title }}</p>
        <p class="text-3xl font-bold bg-gradient-to-r from-unilibre-red to-red-600 bg-clip-text text-transparent">
          {{ value }}
        </p>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
      <div :class="iconBgClass" class="p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
        <component :is="icon" :class="iconColorClass" class="w-8 h-8" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  subtitle: String,
  icon: Object,
  iconBgClass: {
    type: String,
    default: 'bg-primary-100'
  },
  iconColorClass: {
    type: String,
    default: 'text-primary-600'
  }
})
</script>