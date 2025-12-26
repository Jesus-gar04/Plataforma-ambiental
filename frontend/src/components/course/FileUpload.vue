<template>
  <div class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
       :class="isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'"
       @dragover.prevent="isDragging = true"
       @dragleave="isDragging = false"
       @drop.prevent="handleDrop">
    
    <input ref="fileInput" type="file" :accept="accept" class="hidden" @change="handleFileChange" :multiple="multiple" />
    
    <div class="flex flex-col items-center">
      <div class="p-4 bg-primary-100 rounded-full mb-4">
        <Upload class="w-8 h-8 text-primary-600" />
      </div>
      
      <p class="text-lg font-semibold text-gray-700 mb-2">
        Arrastra archivos aquí o
        <button @click="$refs.fileInput.click()" class="text-primary-600 hover:text-primary-700 underline">
          selecciona
        </button>
      </p>
      
      <p class="text-sm text-gray-500">{{ acceptText }}</p>
      <p class="text-xs text-gray-400 mt-1">Tamaño máximo: {{ maxSizeMB }}MB</p>
    </div>

    <div v-if="files.length > 0" class="mt-6 space-y-2">
      <div v-for="(file, index) in files" :key="index" 
           class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center">
          <FileIcon class="w-5 h-5 text-primary-600 mr-2" />
          <span class="text-sm font-medium text-gray-700">{{ file.name }}</span>
          <span class="text-xs text-gray-500 ml-2">({{ formatSize(file.size) }})</span>
        </div>
        <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload, FileIcon, X } from 'lucide-vue-next'

const props = defineProps({
  accept: String,
  acceptText: String,
  maxSizeMB: {
    type: Number,
    default: 30
  },
  multiple: Boolean
})

const emit = defineEmits(['files-selected'])

const isDragging = ref(false)
const files = ref([])
const fileInput = ref(null)

const handleFileChange = (e) => {
  addFiles(Array.from(e.target.files))
}

const handleDrop = (e) => {
  isDragging.value = false
  addFiles(Array.from(e.dataTransfer.files))
}

const addFiles = (newFiles) => {
  const maxSize = props.maxSizeMB * 1024 * 1024
  const validFiles = newFiles.filter(f => f.size <= maxSize)
  
  if (props.multiple) {
    files.value = [...files.value, ...validFiles]
  } else {
    files.value = [validFiles[0]]
  }
  
  emit('files-selected', files.value)
}

const removeFile = (index) => {
  files.value.splice(index, 1)
  emit('files-selected', files.value)
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>