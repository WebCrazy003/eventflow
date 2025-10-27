<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Events</h1>
            <p class="mt-2 text-gray-600">Discover and book amazing events</p>
          </div>
          <div v-if="authStore.isOrganizer">
            <router-link
              to="/dashboard"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create Event
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Search events..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              id="location"
              v-model="filters.location"
              type="text"
              placeholder="City, venue..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              id="startDate"
              v-model="filters.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              id="endDate"
              v-model="filters.endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="clearFilters"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>

    <!-- Events Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading events...</p>
      </div>

      <div v-else-if="events.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No events found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="event in events"
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
          <div class="h-48 bg-gray-200 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">{{ event.title }}</h3>
            <p class="text-gray-600 mb-4 line-clamp-2">{{ event.description }}</p>
            
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ formatDate(event.startAt) }}
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ event.location || 'Online' }}
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {{ getBookedCount(event) }} / {{ event.capacity }} tickets
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">
                by {{ event.organizer.name }}
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

      <!-- Load More Button -->
      <div v-if="hasNextPage && !loading" class="text-center mt-8">
        <button
          @click="loadMore"
          class="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Load More Events
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { EVENTS_QUERY } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import type { Event, EventFilter, PaginationInput } from '@/types'

const authStore = useAuthStore()

const filters = reactive<EventFilter>({
  search: '',
  location: '',
  startDate: '',
  endDate: '',
})

const events = ref<Event[]>([])
const loading = ref(true)
const hasNextPage = ref(false)
const endCursor = ref<string | null>(null)

const pagination = computed<PaginationInput>(() => ({
  first: 12,
  after: endCursor.value || undefined,
}))

const { result, loading: queryLoading, fetchMore } = useQuery(EVENTS_QUERY, {
  filter: filters,
  pagination: pagination,
})

const loadMore = async () => {
  if (!hasNextPage.value || queryLoading.value) return
  
  try {
    const result = await fetchMore({
      variables: {
        filter: filters,
        pagination: {
          first: 12,
          after: endCursor.value,
        },
      },
    })
    
    if (result?.data?.events) {
      const newEvents = result.data.events.edges.map((edge: any) => edge.node)
      events.value.push(...newEvents)
      hasNextPage.value = result.data.events.pageInfo.hasNextPage
      endCursor.value = result.data.events.pageInfo.endCursor
    }
  } catch (error) {
    console.error('Error loading more events:', error)
  }
}

const clearFilters = () => {
  filters.search = ''
  filters.location = ''
  filters.startDate = ''
  filters.endDate = ''
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getBookedCount = (event: Event) => {
  return event.tickets?.filter(ticket => ticket.status === 'CONFIRMED').length || 0
}

// Watch for changes in filters and reset pagination
watch(filters, () => {
  events.value = []
  endCursor.value = null
  hasNextPage.value = false
}, { deep: true })

// Watch for query results
watch(result, (newResult) => {
  if (newResult?.events) {
    events.value = newResult.events.edges.map((edge: any) => edge.node)
    hasNextPage.value = newResult.events.pageInfo.hasNextPage
    endCursor.value = newResult.events.pageInfo.endCursor
    loading.value = false
  }
})

onMounted(() => {
  if (result.value) {
    events.value = result.value.events.edges.map((edge: any) => edge.node)
    hasNextPage.value = result.value.events.pageInfo.hasNextPage
    endCursor.value = result.value.events.pageInfo.endCursor
    loading.value = false
  }
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-white {
  background-color: #ffffff;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
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

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-xl {
  font-size: 1.25rem;
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

.text-gray-900 {
  color: #111827;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-blue-600 {
  color: #2563eb;
}

.text-white {
  color: #ffffff;
}

.hover\:text-gray-800:hover {
  color: #1f2937;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:bg-blue-50:hover {
  background-color: #eff6ff;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.border {
  border-width: 1px;
}

.border-blue-600 {
  border-color: #2563eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.rounded-md {
  border-radius: 0.375rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.overflow-hidden {
  overflow: hidden;
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
  
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-8 {
  margin-top: 2rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.w-full {
  width: 100%;
}

.h-48 {
  height: 12rem;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.object-cover {
  object-fit: cover;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.block {
  display: block;
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

.animate-spin {
  animation: spin 1s linear infinite;
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
