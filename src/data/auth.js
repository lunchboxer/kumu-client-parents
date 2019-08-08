import { writable } from 'svelte/store'
import { request } from './fetch-client'
import { LOGIN, CREATE_STUDENT_PASSWORD } from './mutations'

const getAuthFromStorage = () => {
  const coldAuth = window.localStorage.getItem('auth')
  const student = coldAuth ? JSON.parse(coldAuth).student : null
  const token = coldAuth ? JSON.parse(coldAuth).token : null
  return { student, token }
}

const createAuthStore = () => {
  // pull token and student from localStorage if it's there
  const { student, token } = getAuthFromStorage()
  const { subscribe, set, update } = writable({ ...student, token })

  return {
    subscribe,
    login: async (studentId, password) => {
      const response = await request(LOGIN, { studentId, password })
      window.localStorage.setItem('auth', JSON.stringify(response.studentLogin))
      update(previous => ({
        ...previous,
        ...response.studentLogin.student,
        token: response.studentLogin.token
      }))
    },
    logout: () => {
      const { student } = getAuthFromStorage()
      window.localStorage.removeItem('auth')
      set({})
      return student && student.id
    },
    register: async (studentId, password) => {
      const response = await request(CREATE_STUDENT_PASSWORD, { studentId, password })
      window.localStorage.setItem('auth', JSON.stringify(response.createStudentPassword))
      update(previous => ({
        ...previous,
        ...response.createStudentPassword.student,
        token: response.createStudentPassword.token
      }))
    }
  }
}

export const auth = createAuthStore()
