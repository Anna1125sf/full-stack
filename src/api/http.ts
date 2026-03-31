import axios from 'axios'
import { CONFIG } from '../config'
import { authTokenStore } from '../auth/authTokenStore'

export const http = axios.create({
  baseURL: CONFIG.apiBaseUrl,
})

http.interceptors.request.use((cfg) => {
  const token = authTokenStore.get()
  if (token) {
    cfg.headers = cfg.headers ?? {}
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

