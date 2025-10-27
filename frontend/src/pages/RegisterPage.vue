<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <Input
            id="name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            label="Full Name"
            placeholder="Enter your full name"
            :required="true"
          />
          <Input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            label="Email Address"
            placeholder="Enter your email"
            :required="true"
          />
          <Input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            label="Password"
            placeholder="Enter your password"
            :required="true"
          />
          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            label="Confirm Password"
            placeholder="Confirm your password"
            :required="true"
          />
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
            {{ loading ? 'Creating account...' : 'Create account' }}
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
import Input from '@/components/Input.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (!form.name || !form.email || !form.password || !form.confirmPassword) {
    error.value = 'Please fill in all fields'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.register(form.name, form.email, form.password)
    
    if (result.success) {
      toast.success('Account created successfully!')
      router.push('/')
    } else {
      error.value = result.error || 'Registration failed'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

