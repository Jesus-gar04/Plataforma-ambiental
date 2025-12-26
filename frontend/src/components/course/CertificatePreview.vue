<template>
  <div class="certificate-container bg-white p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
    <div class="border-8 border-double border-yellow-600 p-8 relative">
      <!-- Decorative corners -->
      <div class="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500"></div>
      <div class="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-500"></div>
      <div class="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-500"></div>
      <div class="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500"></div>

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🏆</div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">CERTIFICADO DE FINALIZACIÓN</h1>
        <p class="text-lg text-gray-600">{{ universityName }}</p>
        <p class="text-md text-gray-500">{{ universitySection }}</p>
      </div>

      <!-- Body -->
      <div class="text-center mb-8">
        <p class="text-lg text-gray-700 mb-4">Se otorga el presente certificado a:</p>
        <h2 class="text-4xl font-bold text-green-600 mb-6">{{ certificate.studentName }}</h2>
        
        <p class="text-md text-gray-700 mb-2">
          Con documento de identificación: <strong>{{ certificate.documentType }} {{ certificate.documentNumber }}</strong>
        </p>
        
        <p class="text-lg text-gray-700 mb-6">
          Por haber completado satisfactoriamente el curso de
        </p>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-6">{{ certificate.courseName }}</h3>
        
        <p class="text-md text-gray-600 mb-2">
          Con una calificación de: <strong class="text-green-600">{{ certificate.score }}%</strong>
        </p>
        
        <p class="text-md text-gray-600">
          Emitido el día: <strong>{{ formatDate(certificate.issuedDate) }}</strong>
        </p>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-end mt-12 pt-8 border-t-2 border-gray-300">
        <div class="text-center">
          <div class="border-t-2 border-gray-400 pt-2 w-48">
            <p class="text-sm font-semibold">Director Académico</p>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-xs text-gray-500 mb-2">Código de verificación:</p>
          <p class="text-sm font-mono font-bold text-gray-700">{{ certificate.verificationCode }}</p>
        </div>
        
        <div class="text-center">
          <div class="border-t-2 border-gray-400 pt-2 w-48">
            <p class="text-sm font-semibold">Coordinador del Curso</p>
          </div>
        </div>
      </div>

      <!-- QR Code area -->
      <div class="text-center mt-6">
        <div class="inline-block bg-gray-100 p-2 rounded">
          <div class="w-24 h-24 bg-white flex items-center justify-center text-xs text-gray-400">
            QR Code
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-center space-x-4 mt-6">
      <button
        @click="downloadPDF"
        class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
      >
        📥 Descargar PDF
      </button>
      <button
        @click="shareCertificate"
        class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
      >
        🔗 Compartir
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  certificate: {
    type: Object,
    required: true
  },
  universityName: {
    type: String,
    default: 'Universidad Libre'
  },
  universitySection: {
    type: String,
    default: 'Seccional Barranquilla'
  }
});

const emit = defineEmits(['download', 'share']);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};

const downloadPDF = () => {
  emit('download', props.certificate);
};

const shareCertificate = () => {
  emit('share', props.certificate);
};
</script>