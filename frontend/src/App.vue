<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">EventFlow</h1>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link 
              to="/events" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Events
            </router-link>
            
            <template v-if="authStore.isAuthenticated">
              <router-link 
                to="/my-tickets" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Tickets
              </router-link>
              
              <router-link 
                v-if="authStore.isOrganizer"
                to="/dashboard" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </router-link>
              
              <router-link 
                v-if="authStore.isAdmin"
                to="/admin" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </router-link>
              
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-700">
                  {{ authStore.user?.name }}
                </span>
                <button 
                  @click="handleLogout"
                  class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </template>
            
            <template v-else>
              <router-link 
                to="/login" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </router-link>
              <router-link 
                to="/register" 
                class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Register
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Loading Overlay -->
    <div 
      v-if="authStore.isLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-gray-700">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

onMounted(async () => {
  // Check if user is already logged in
  if (authStore.accessToken && !authStore.user) {
    await authStore.fetchUser()
  }
})

const handleLogout = () => {
  authStore.logout()
  toast.success('Logged out successfully')
  router.push('/')
}
</script>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Tailwind CSS classes for better styling */
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-white {
  background-color: #ffffff;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.border-b {
  border-bottom-width: 1px;
}

.max-w-7xl {
  max-width: 80rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
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

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.h-16 {
  height: 4rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.text-blue-600 {
  color: #2563eb;
}

.text-gray-700 {
  color: #374151;
}

.hover\:text-blue-600:hover {
  color: #2563eb;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-medium {
  font-weight: 500;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.text-white {
  color: #ffffff;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black {
  background-color: #000000;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.z-50 {
  z-index: 50;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-6 {
  padding: 1.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.rounded-full {
  border-radius: 9999px;
}

.h-6 {
  height: 1.5rem;
}

.w-6 {
  width: 1.5rem;
}

.border-b-2 {
  border-bottom-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
