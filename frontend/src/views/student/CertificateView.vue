<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mis Certificados</h1>
      <p class="text-gray-600">Certificados obtenidos por completar cursos</p>
    </div>

    <LoadingSpinner v-if="loading" message="Cargando certificados..." />

    <div v-else-if="certificates.length === 0" class="text-center py-20">
      <Award class="w-24 h-24 mx-auto text-gray-300 mb-4" />
      <h3 class="text-2xl font-bold text-gray-900 mb-2">Aún no tienes certificados</h3>
      <p class="text-gray-600 mb-6">Completa un curso para obtener tu primer certificado</p>
      <router-link to="/student/courses" class="btn-primary inline-flex items-center">
        Explorar Cursos
        <ArrowRight class="w-5 h-5 ml-2" />
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="cert in certificates"
        :key="cert.id"
        class="card-hover group cursor-pointer border-2 border-yellow-200 hover:border-yellow-400 transition-all"
        @click="viewCertificate(cert)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-yellow-100 rounded-xl group-hover:scale-110 transition-transform">
            <Award class="w-8 h-8 text-yellow-600" />
          </div>
          <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Verificado
          </span>
        </div>

        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ cert.course_title }}</h3>
        <p class="text-sm text-gray-600 mb-4">Código: {{ cert.certificate_code }}</p>

        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <div class="flex items-center text-sm text-gray-600">
            <Calendar class="w-4 h-4 mr-1" />
            {{ formatDate(cert.issued_date) }}
          </div>
          <div class="flex items-center text-sm font-semibold text-primary-600">
            <Star class="w-4 h-4 mr-1" />
            Puntuación: {{ cert.final_score }}%
          </div>
        </div>

        <div class="flex space-x-2 mt-4">
          <button @click.stop="downloadCertificate(cert)" class="flex-1 btn-primary text-sm">
            <Download class="w-4 h-4 mr-1 inline" />
            Descargar
          </button>
          <button @click.stop="shareCertificate(cert)" class="flex-1 btn-secondary text-sm">
            <Share2 class="w-4 h-4 mr-1 inline" />
            Compartir
          </button>
        </div>
      </div>
    </div>

    <!-- Certificate Preview Modal -->
    <Modal v-model="showPreview" title="Certificado">
      <div v-if="selectedCertificate" class="space-y-4">
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border-4 border-yellow-400">
          <!-- Certificate Header -->
          <div class="text-center mb-6">
            <img src="/logo.png" alt="Universidad Libre" class="h-20 mx-auto mb-4" />
            <h2 class="text-2xl font-bold text-gray-900">CERTIFICADO DE FINALIZACIÓN</h2>
            <p class="text-sm text-gray-600 mt-2">La Universidad Libre Seccional Barranquilla</p>
          </div>

          <!-- Certificate Body -->
          <div class="text-center space-y-4">
            <p class="text-gray-700">Otorga la presente certificación a:</p>
            <p class="text-3xl font-bold text-unilibre-red">{{ userName }}</p>
            <p class="text-sm text-gray-600">{{ userDocument }}</p>
            <p class="text-gray-700 mt-4">Por haber completado exitosamente el curso:</p>
            <p class="text-xl font-bold text-gray-900">{{ selectedCertificate.course_title }}</p>
            
            <div class="mt-6 pt-6 border-t border-gray-300">
              <p class="text-xs text-gray-600">Código de certificado: {{ selectedCertificate.certificate_code }}</p>
              <p class="text-xs text-gray-600">Emitido el: {{ formatDate(selectedCertificate.issued_date) }}</p>
              <!-- <p class="text-xs text-gray-600">Oficina emisora: [Nombre de Oficina]</p> -->
            </div>
          </div>
        </div>

        <div class="flex space-x-2">
          <button @click="downloadCertificate(selectedCertificate)" class="flex-1 btn-primary">
            Descargar PDF
          </button>
          <button @click="showPreview = false" class="flex-1 btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import axios from 'axios'
import { Award, ArrowRight, Calendar, Star, Download, Share2 } from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL

const loading = ref(true)
const certificates = ref([])
const showPreview = ref(false)
const selectedCertificate = ref(null)

const userName = computed(() => authStore.userName)
const userDocument = computed(() => {
  const user = authStore.user
  return user ? `${user.document_type}: ${user.document_number}` : ''
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const viewCertificate = (cert) => {
  selectedCertificate.value = cert
  showPreview.value = true
}

const downloadCertificate = async (cert) => {
  if (cert.certificate_url) {
    window.open(cert.certificate_url, '_blank')
  } else {
    alert('Generando certificado...')
  }
}

const shareCertificate = (cert) => {
  if (navigator.share) {
    navigator.share({
      title: 'Mi Certificado',
      text: `He completado el curso: ${cert.course_title}`,
      url: window.location.href
    })
  } else {
    alert('Compartir no disponible en este navegador')
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API_URL}/certificates/my-certificates`)
    certificates.value = data.data
  } catch (error) {
    console.error('Error loading certificates:', error)
  } finally {
    loading.value = false
  }
})
</script>