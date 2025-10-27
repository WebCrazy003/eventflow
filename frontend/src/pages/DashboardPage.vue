<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
        <p class="mt-2 text-gray-600">Manage your events and view analytics</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalEvents }}</div>
              <div class="text-sm text-gray-500">Total Events</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalTickets }}</div>
              <div class="text-sm text-gray-500">Total Tickets Sold</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalRevenue }}</div>
              <div class="text-sm text-gray-500">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Event Button -->
      <div class="mb-8">
        <button
          @click="showCreateForm = true"
          class="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create New Event
        </button>
      </div>

      <!-- Events List -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Your Events</h2>
        </div>
        
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading events...</p>
        </div>

        <div v-else-if="events.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p class="mt-1 text-sm text-gray-500">Create your first event to get started.</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="event in events"
            :key="event.id"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900">{{ event.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ event.description }}</p>
                <div class="flex items-center mt-2 space-x-4">
                  <span class="text-sm text-gray-500">
                    {{ formatDate(event.startAt) }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ event.location || 'Online' }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ getBookedCount(event) }} / {{ event.capacity }} tickets
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <router-link
                  :to="`/events/${event.id}`"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View
                </router-link>
                <button
                  @click="editEvent(event)"
                  class="text-gray-600 hover:text-gray-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  @click="deleteEvent(event.id)"
                  class="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Event Modal -->
    <div v-if="showCreateForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">Create New Event</h2>
        
        <form @submit.prevent="createEvent">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model="newEvent.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="newEvent.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                v-model="newEvent.location"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  v-model="newEvent.startAt"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  v-model="newEvent.endAt"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                v-model.number="newEvent.capacity"
                type="number"
                min="1"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateForm = false"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ creating ? 'Creating...' : 'Create Event' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { EVENTS_QUERY, CREATE_EVENT_MUTATION, DELETE_EVENT_MUTATION } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { Event, CreateEventInput } from '@/types'

const authStore = useAuthStore()
const toast = useToast()

const showCreateForm = ref(false)
const creating = ref(false)

const newEvent = ref<CreateEventInput>({
  title: '',
  description: '',
  location: '',
  startAt: '',
  endAt: '',
  capacity: 100,
})

const { result, loading, refetch } = useQuery(EVENTS_QUERY, {
  filter: { organizerId: authStore.user?.id },
  pagination: { first: 50 }
})

const { mutate: createEventMutation } = useMutation(CREATE_EVENT_MUTATION)
const { mutate: deleteEventMutation } = useMutation(DELETE_EVENT_MUTATION)

const events = computed(() => {
  return result.value?.events.edges.map((edge: any) => edge.node) || []
})

const totalEvents = computed(() => events.value.length)

const totalTickets = computed(() => {
  return events.value.reduce((total: number, event: any) => {
    return total + (event.tickets?.filter((ticket: any) => ticket.status === 'CONFIRMED').length || 0)
  }, 0)
})

const totalRevenue = computed(() => {
  // This would be calculated based on ticket prices
  // For now, we'll just show a placeholder
  return totalTickets.value * 25 // Assuming $25 per ticket
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getBookedCount = (event: Event) => {
  return event.tickets?.filter(ticket => ticket.status === 'CONFIRMED').length || 0
}

const createEvent = async () => {
  creating.value = true
  
  try {
    await createEventMutation({
      input: {
        ...newEvent.value,
        startAt: new Date(newEvent.value.startAt).toISOString(),
        endAt: new Date(newEvent.value.endAt).toISOString(),
      }
    })
    
    toast.success('Event created successfully!')
    showCreateForm.value = false
    
    // Reset form
    newEvent.value = {
      title: '',
      description: '',
      location: '',
      startAt: '',
      endAt: '',
      capacity: 100,
    }
    
    // Refresh events list
    await refetch()
  } catch (error) {
    toast.error('Failed to create event')
    console.error('Create event error:', error)
  } finally {
    creating.value = false
  }
}

const editEvent = (_event: Event) => {
  // This would open an edit modal or navigate to edit page
  toast.info('Edit functionality coming soon!')
}

const deleteEvent = async (eventId: string) => {
  if (!confirm('Are you sure you want to delete this event?')) {
    return
  }
  
  try {
    await deleteEventMutation({ id: eventId })
    toast.success('Event deleted successfully!')
    
    // Refresh events list
    await refetch()
  } catch (error) {
    toast.error('Failed to delete event')
    console.error('Delete event error:', error)
  }
}

onMounted(() => {
  // Set default dates
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  newEvent.value.startAt = tomorrow.toISOString().slice(0, 16)
  newEvent.value.endAt = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
})
</script>

