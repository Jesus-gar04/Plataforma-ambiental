import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  
  // ROOT ROUTES
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['root'] },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/AdminDashboard.vue')
      },
      {
        path: 'institutions',
        name: 'InstitutionsView',
        component: () => import('@/views/admin/InstitutionsView.vue')
      },
      {
        path: 'courses',
        name: 'CourseManagement',
        component: () => import('@/views/admin/CourseManagement.vue')
      },
      {
        path: 'reports',
        name: 'ReportsView',
        component: () => import('@/views/admin/ReportsView.vue')
      }
    ]
  },

  // DIRECTOR ROUTES
  {
    path: '/director',
    component: () => import('@/views/director/DirectorLayout.vue'),
    meta: { requiresAuth: true, roles: ['director'] },
    children: [
      {
        path: '',
        name: 'DirectorDashboard',
        component: () => import('@/views/director/DirectorDashboard.vue')
      },
      {
        path: 'students',
        name: 'StudentsView',
        component: () => import('@/views/director/StudentsView.vue')
      }
    ]
  },

  // PROFESOR ROUTES
  {
    path: '/profesor',
    component: () => import('@/views/profesor/ProfesorLayout.vue'),
    meta: { requiresAuth: true, roles: ['profesor'] },
    children: [
      {
        path: '',
        name: 'ProfesorDashboard',
        component: () => import('@/views/profesor/ProfesorDashboard.vue')
      },
      {
        path: 'monitoring',
        name: 'MonitoringView',
        component: () => import('@/views/profesor/MonitoringView.vue')
      }
    ]
  },

  // STUDENT ROUTES
  {
    path: '/student',
    component: () => import('@/views/student/StudentLayout.vue'),
    meta: { requiresAuth: true, roles: ['estudiante'] },
    children: [
      {
        path: '',
        name: 'StudentDashboard',
        component: () => import('@/views/student/Dashboard.vue')
      },
      {
        path: 'courses',
        name: 'StudentCourses',
        component: () => import('@/views/student/CourseView.vue')
      },
      {
        path: 'courses/:id',
        name: 'CourseDetail',
        component: () => import('@/views/student/ModuleView.vue')
      },
      {
        path: 'evaluations/:id',
        name: 'EvaluationView',
        component: () => import('@/views/student/EvaluationView.vue')
      },
      {
        path: 'certificates',
        name: 'CertificateView',
        component: () => import('@/views/student/CertificateView.vue')
      }
    ]
  },

  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next('/login')
    }

    if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
      return next('/404')
    }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const roleRoutes = {
      root: '/admin',
      director: '/director',
      profesor: '/profesor',
      estudiante: '/student'
    }
    return next(roleRoutes[authStore.user?.role] || '/student')
  }

  next()
})

export default router