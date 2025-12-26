import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [],
    currentCourse: null,
    myCourses: [],
    loading: false
  }),

  actions: {
    async fetchCourses() {
      try {
        this.loading = true
        const { data } = await axios.get(`${API_URL}/courses`)
        this.courses = data.data
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchMyCourses() {
      try {
        this.loading = true
        const { data } = await axios.get(`${API_URL}/courses/my-courses`)
        this.myCourses = data.data
      } catch (error) {
        console.error('Error fetching my courses:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCourseById(id) {
      try {
        this.loading = true
        const { data } = await axios.get(`${API_URL}/courses/${id}`)
        this.currentCourse = data.data
        return data.data
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        this.loading = false
      }
    },

    async createCourse(courseData) {
      try {
        const { data } = await axios.post(`${API_URL}/courses`, courseData)
        this.courses.push(data.data)
        return { success: true, data: data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message }
      }
    },

    async enrollCourse(courseId) {
      try {
        await axios.post(`${API_URL}/courses/${courseId}/enroll`)
        await this.fetchMyCourses()
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message }
      }
    }
  }
})