<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.email || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.email, form.password)
    
    if (result.success) {
      toast.success('Login successful!')
      router.push('/')
    } else {
      error.value = result.error || 'Login failed'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.sm\:px-6 {
  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.lg\:px-8 {
  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.max-w-md {
  max-width: 28rem;
}

.w-full {
  width: 100%;
}

.space-y-8 > * + * {
  margin-top: 2rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.-space-y-px > * + * {
  margin-top: -1px;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-8 {
  margin-top: 2rem;
}

.text-center {
  text-align: center;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.font-extrabold {
  font-weight: 800;
}

.text-gray-900 {
  color: #111827;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-gray-600 {
  color: #4b5563;
}

.text-red-600 {
  color: #dc2626;
}

.font-medium {
  font-weight: 500;
}

.text-blue-600 {
  color: #2563eb;
}

.hover\:text-blue-500:hover {
  color: #3b82f6;
}

.hover\:text-blue-700:hover {
  color: #1d4ed8;
}

.rounded-md {
  border-radius: 0.375rem;
}

.rounded-none {
  border-radius: 0;
}

.rounded-t-md {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.rounded-b-md {
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.appearance-none {
  appearance: none;
}

.relative {
  position: relative;
}

.block {
  display: block;
}

.w-full {
  width: 100%;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.border {
  border-width: 1px;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.border-transparent {
  border-color: transparent;
}

.placeholder-gray-500::placeholder {
  color: #6b7280;
}

.text-gray-900 {
  color: #111827;
}

.text-white {
  color: #ffffff;
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-blue-500:focus {
  --tw-ring-color: #3b82f6;
  box-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}

.focus\:z-10:focus {
  z-index: 10;
}

.focus\:ring-2:focus {
  --tw-ring-width: 2px;
}

.focus\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}

.sm\:text-sm {
  @media (min-width: 640px) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}

.group {
  position: relative;
}

.justify-center {
  justify-content: center;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

.absolute {
  position: absolute;
}

.left-0 {
  left: 0;
}

.inset-y-0 {
  top: 0;
  bottom: 0;
}

.pl-3 {
  padding-left: 0.75rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

.opacity-25 {
  opacity: 0.25;
}

.opacity-75 {
  opacity: 0.75;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
