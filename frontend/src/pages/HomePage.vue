<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100">
            Find, book, and manage events with EventFlow
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/events"
              class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Events
            </router-link>
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/register"
              class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Why Choose EventFlow?
          </h2>
          <p class="text-lg text-gray-600">
            Everything you need to manage events and bookings
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Easy Booking</h3>
            <p class="text-gray-600">Book tickets for events with just a few clicks</p>
          </div>
          
          <div class="text-center">
            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Real-time Updates</h3>
            <p class="text-gray-600">Get live updates on event capacity and bookings</p>
          </div>
          
          <div class="text-center">
            <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Secure & Reliable</h3>
            <p class="text-gray-600">Your data is protected with enterprise-grade security</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Events Section -->
    <div class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Featured Events
          </h2>
          <p class="text-lg text-gray-600">
            Check out these popular events
          </p>
        </div>
        
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        
        <div v-else-if="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="event in events.slice(0, 6)"
            :key="event.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <!-- <div v-if="event.images.length > 0" class="h-48 bg-gray-200">
              <img
                :src="event.images[0].url"
                :alt="event.images[0].alt || event.title"
                class="w-full h-full object-cover"
              />
            </div> -->
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{{ event.title }}</h3>
              <p class="text-gray-600 mb-4 line-clamp-2">{{ event.description }}</p>
              <div class="flex items-center text-sm text-gray-500 mb-4">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ formatDate(event.startAt) }}
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">
                  {{ event.location || 'Online' }}
                </span>
                <router-link
                  :to="`/events/${event.id}`"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-gray-500">
          <p>No events available at the moment.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { EVENTS_QUERY } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import type { Event } from '@/types'

const authStore = useAuthStore()
const events = ref<Event[]>([])
const loading = ref(true)

const { result } = useQuery(EVENTS_QUERY, {
  filter: {},
  pagination: { first: 6 }
})

onMounted(() => {
  if (result.value) {
    events.value = result.value.events.edges.map((edge: any) => edge.node)
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .md\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }
  
  .md\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.gap-8 {
  gap: 2rem;
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600 {
  --tw-gradient-from: #2563eb;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.to-purple-600 {
  --tw-gradient-to: #9333ea;
}

.text-white {
  color: #ffffff;
}

.text-blue-100 {
  color: #dbeafe;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.bg-purple-100 {
  background-color: #f3e8ff;
}

.text-blue-600 {
  color: #2563eb;
}

.text-green-600 {
  color: #16a34a;
}

.text-purple-600 {
  color: #9333ea;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:bg-white:hover {
  background-color: #ffffff;
}

.hover\:text-blue-600:hover {
  color: #2563eb;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.border-2 {
  border-width: 2px;
}

.border-white {
  border-color: #ffffff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.overflow-hidden {
  overflow: hidden;
}

.object-cover {
  object-fit: cover;
}

.flex-col {
  flex-direction: column;
}

.sm\:flex-row {
  @media (min-width: 640px) {
    flex-direction: row;
  }
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-12 {
  margin-bottom: 3rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.py-16 {
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.py-24 {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.p-6 {
  padding: 1.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.h-48 {
  height: 12rem;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
