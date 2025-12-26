<template>
  <Transition name="modal">
    <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
      <div class="flex items-center justify-center min-h-screen px-4">
        <Transition name="fade">
          <div v-if="modelValue" class="fixed inset-0 bg-gray-900 bg-opacity-75" @click="close"></div>
        </Transition>

        <div class="relative bg-white rounded-2xl shadow-2xl transform transition-all sm:max-w-lg w-full animate-slide-up z-10">
          <div class="bg-gradient-to-r from-unilibre-red to-red-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-xl font-bold text-white">{{ title }}</h3>
            <button @click="close" class="text-white hover:text-gray-200 transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>
          
          <div class="px-6 py-6">
            <slot />
          </div>
          
          <div v-if="$slots.footer" class="bg-gray-50 px-6 py-4 rounded-b-2xl">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  modelValue: Boolean,
  title: String
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>