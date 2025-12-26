<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-fade-in">
    <LoadingSpinner v-if="loading" message="Cargando evaluación..." />

    <template v-else-if="evaluation && !submitted">
      <!-- Header -->
      <div class="card bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <button @click="$router.back()" class="mb-4 flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft class="w-5 h-5 mr-2" />
              Volver
            </button>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ evaluation.title }}</h1>
            <p class="text-gray-600">{{ evaluation.description }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-200">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-xl mr-3">
              <Clock class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Tiempo límite</p>
              <p class="font-bold text-gray-900">{{ evaluation.time_limit_minutes }} min</p>
            </div>
          </div>

          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-xl mr-3">
              <FileQuestion class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Preguntas</p>
              <p class="font-bold text-gray-900">{{ evaluation.questions?.length || 0 }}</p>
            </div>
          </div>

          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-xl mr-3">
              <Target class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Para aprobar</p>
              <p class="font-bold text-gray-900">{{ evaluation.passing_score }}%</p>
            </div>
          </div>

          <div class="flex items-center">
            <div class="p-3 bg-orange-100 rounded-xl mr-3">
              <RotateCcw class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Intentos</p>
              <p class="font-bold text-gray-900">{{ attemptsUsed }}/{{ evaluation.max_attempts }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timer -->
      <div v-if="started" class="card bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Clock class="w-6 h-6 text-orange-600 mr-3 animate-pulse" />
            <div>
              <p class="text-sm text-gray-600">Tiempo restante</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatTime(timeRemaining) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Progreso</p>
            <p class="text-2xl font-bold text-primary-600">{{ answeredCount }}/{{ evaluation.questions.length }}</p>
          </div>
        </div>
        <ProgressBar :percentage="(answeredCount / evaluation.questions.length) * 100" class="mt-4" />
      </div>

      <!-- Start Button -->
      <div v-if="!started" class="text-center py-12">
        <div class="mb-8">
          <AlertCircle class="w-20 h-20 mx-auto text-yellow-500 mb-4" />
          <h3 class="text-2xl font-bold text-gray-900 mb-2">¿Listo para comenzar?</h3>
          <p class="text-gray-600 mb-4">Una vez iniciada, el cronómetro comenzará a correr.</p>
          <p class="text-sm text-gray-500">Asegúrate de tener suficiente tiempo para completar la evaluación.</p>
        </div>
        <button @click="startEvaluation" class="btn-primary px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
          <Play class="inline-block w-6 h-6 mr-2" />
          Iniciar Evaluación
        </button>
      </div>

      <!-- Questions -->
      <div v-else class="space-y-6">
        <div
          v-for="(question, index) in evaluation.questions"
          :key="question.id"
          class="card-hover"
          :class="answers[question.id] ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-200'"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start flex-1">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold mr-4 flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="text-lg font-semibold text-gray-900 mb-2">{{ question.question_text }}</p>
                <div class="flex items-center text-sm text-gray-500">
                  <span class="px-2 py-1 bg-gray-100 rounded text-xs font-medium mr-2">
                    {{ question.question_type === 'multiple_choice' ? 'Opción múltiple' : 'Verdadero/Falso' }}
                  </span>
                  <span class="text-xs">{{ question.points }} {{ question.points === 1 ? 'punto' : 'puntos' }}</span>
                </div>
              </div>
            </div>
            <CheckCircle2 v-if="answers[question.id]" class="w-6 h-6 text-green-600 flex-shrink-0" />
          </div>

          <div class="space-y-3 ml-14">
            <label
              v-for="option in question.options"
              :key="option.id"
              class="flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
              :class="answers[question.id] === option.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'"
            >
              <input
                type="radio"
                :name="`question-${question.id}`"
                :value="option.id"
                v-model="answers[question.id]"
                class="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-3 text-gray-900">{{ option.text }}</span>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6 rounded-b-2xl shadow-lg">
          <div class="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <p class="text-sm text-gray-600">Has respondido</p>
              <p class="text-xl font-bold text-gray-900">{{ answeredCount }} de {{ evaluation.questions.length }} preguntas</p>
            </div>
            <button
              @click="confirmSubmit"
              :disabled="answeredCount < evaluation.questions.length"
              class="btn-primary px-8 py-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send class="inline-block w-5 h-5 mr-2" />
              Enviar Evaluación
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Results -->
    <template v-else-if="result">
      <div class="text-center py-12 animate-slide-up">
        <div class="mb-8">
          <div
            class="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6"
            :class="result.isPassed ? 'bg-green-100' : 'bg-red-100'"
          >
            <component
              :is="result.isPassed ? CheckCircle2 : XCircle"
              class="w-20 h-20"
              :class="result.isPassed ? 'text-green-600' : 'text-red-600'"
            />
          </div>
          
          <h2 class="text-4xl font-bold mb-4" :class="result.isPassed ? 'text-green-600' : 'text-red-600'">
            {{ result.isPassed ? '¡Felicitaciones!' : 'No aprobaste' }}
          </h2>
          
          <p class="text-xl text-gray-600 mb-8">
            {{ result.isPassed 
              ? 'Has aprobado la evaluación exitosamente' 
              : 'No alcanzaste el puntaje mínimo requerido' 
            }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
          <div class="card bg-gradient-to-br from-blue-50 to-indigo-50">
            <p class="text-sm text-gray-600 mb-1">Tu puntuación</p>
            <p class="text-4xl font-bold text-blue-600">{{ result.percentage }}%</p>
          </div>

          <div class="card bg-gradient-to-br from-green-50 to-emerald-50">
            <p class="text-sm text-gray-600 mb-1">Respuestas correctas</p>
            <p class="text-4xl font-bold text-green-600">{{ result.correctAnswers }}/{{ result.totalQuestions }}</p>
          </div>

          <div class="card bg-gradient-to-br from-purple-50 to-pink-50">
            <p class="text-sm text-gray-600 mb-1">Puntaje mínimo</p>
            <p class="text-4xl font-bold text-purple-600">{{ evaluation.passing_score }}%</p>
          </div>
        </div>

        <div class="flex justify-center space-x-4">
          <button @click="$router.back()" class="btn-secondary px-6 py-3">
            Volver al curso
          </button>
          <button
            v-if="!result.isPassed && attemptsUsed < evaluation.max_attempts"
            @click="resetEvaluation"
            class="btn-primary px-6 py-3"
          >
            <RotateCcw class="inline-block w-5 h-5 mr-2" />
            Intentar nuevamente
          </button>
        </div>
      </div>
    </template>

    <!-- Confirm Modal -->
    <Modal v-model="showConfirmModal" title="Confirmar Envío">
      <div class="text-center py-6">
        <AlertCircle class="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
        <p class="text-gray-600 mb-6">
          Has respondido {{ answeredCount }} de {{ evaluation.questions.length }} preguntas.
          {{ answeredCount < evaluation.questions.length ? 'Las preguntas sin responder se contarán como incorrectas.' : '' }}
        </p>
        <div class="flex space-x-4">
          <button @click="showConfirmModal = false" class="flex-1 btn-secondary">
            Cancelar
          </button>
          <button @click="submitEvaluation" class="flex-1 btn-primary">
            Enviar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import {
  ArrowLeft, Clock, FileQuestion, Target, RotateCcw, Play, CheckCircle2,
  XCircle, AlertCircle, Send
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import Modal from '@/components/common/Modal.vue'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const loading = ref(true)
const evaluation = ref(null)
const started = ref(false)
const submitted = ref(false)
const answers = ref({})
const timeRemaining = ref(0)
const timerInterval = ref(null)
const attemptsUsed = ref(0)
const result = ref(null)
const showConfirmModal = ref(false)

const answeredCount = computed(() => Object.keys(answers.value).length)

const startEvaluation = () => {
  started.value = true
  timeRemaining.value = evaluation.value.time_limit_minutes * 60
  startTimer()
}

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval.value)
      alert('¡Tiempo agotado! La evaluación se enviará automáticamente.')
      submitEvaluation()
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const confirmSubmit = () => {
  showConfirmModal.value = true
}

const submitEvaluation = async () => {
  showConfirmModal.value = false
  clearInterval(timerInterval.value)
  
  try {
    const answersArray = Object.entries(answers.value).map(([questionId, optionId]) => ({
      questionId,
      optionId
    }))

    const { data } = await axios.post(
      `${API_URL}/evaluations/${route.params.id}/submit`,
      { answers: answersArray }
    )

    result.value = data.data
    submitted.value = true
  } catch (error) {
    alert('Error al enviar evaluación: ' + (error.response?.data?.message || error.message))
  }
}

const resetEvaluation = () => {
  started.value = false
  submitted.value = false
  answers.value = {}
  result.value = null
  timeRemaining.value = 0
}

onMounted(async () => {
  try {
    const [evalData, attemptsData] = await Promise.all([
      axios.get(`${API_URL}/evaluations/${route.params.id}`),
      axios.get(`${API_URL}/evaluations/${route.params.id}/attempts`)
    ])

    evaluation.value = evalData.data.data
    attemptsUsed.value = attemptsData.data.data.length
  } catch (error) {
    console.error('Error loading evaluation:', error)
    alert('Error al cargar la evaluación')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>