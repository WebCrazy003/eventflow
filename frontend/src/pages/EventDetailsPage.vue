<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading event details...</p>
    </div>

    <div v-else-if="!event" class="text-center py-12">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
      <p class="text-gray-600 mb-8">The event you're looking for doesn't exist.</p>
      <router-link
        to="/events"
        class="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Browse Events
      </router-link>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Event Header -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div v-if="event.images && event.images.length > 0" class="h-64 md:h-96 bg-gray-200">
          <img
            :src="getImageUrl(event.images[0].url)"
            :alt="event.images[0].alt || event.title"
            class="w-full h-full object-cover"
          />
        </div>
        <div v-else class="h-64 md:h-96 bg-gray-200 flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        
        <div class="p-8">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ event.title }}</h1>
              <p class="text-lg text-gray-600">{{ event.description }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600 mb-2">
                {{ remainingTickets }} / {{ event.capacity }} tickets left
              </div>
              <div class="text-sm text-gray-500">
                by {{ event.organizer.name }}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900">Start Date</div>
                <div class="text-sm text-gray-500">{{ formatDate(event.startAt) }}</div>
              </div>
            </div>
            
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900">End Date</div>
                <div class="text-sm text-gray-500">{{ formatDate(event.endAt) }}</div>
              </div>
            </div>
            
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900">Location</div>
                <div class="text-sm text-gray-500">{{ event.location || 'Online' }}</div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Created : {{ formatDate(event.createdAt) }}
            </div>
            <button
              v-if="canBookTicket"
              @click="bookTicket"
              :disabled="booking || remainingTickets === 0"
              class="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ booking ? 'Booking...' : remainingTickets === 0 ? 'Sold Out' : 'Book Ticket' }}
            </button>
            <div v-else-if="!authStore.isAuthenticated" class="text-sm text-gray-500">
              <router-link to="/login" class="text-blue-600 hover:text-blue-700">
                Login to book tickets
              </router-link>
            </div>
            <div v-else class="text-sm text-gray-500">
              You already have a ticket for this event
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Updates -->
      <div v-if="capacityInfo" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Live Capacity Updates</h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ capacityInfo.remaining }}</div>
            <div class="text-sm text-gray-500">tickets remaining</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ capacityInfo.booked }}</div>
            <div class="text-sm text-gray-500">tickets booked</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-600">{{ capacityInfo.capacity }}</div>
            <div class="text-sm text-gray-500">total capacity</div>
          </div>
        </div>
      </div>

      <!-- Event Attendees -->
      <div v-if="isOrganizer" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Event Attendees</h2>
        <div v-if="attendees.length === 0" class="text-center py-8 text-gray-500">
          <p>No attendees yet.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Type
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="ticket in attendees" :key="ticket.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ ticket.user?.name || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ ticket.user?.email || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ ticket.type || 'General Admission' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-green-100 text-green-800': ticket.status === 'CONFIRMED',
                      'bg-red-100 text-red-800': ticket.status === 'CANCELLED',
                      'bg-yellow-100 text-yellow-800': ticket.status === 'REFUNDED'
                    }"
                  >
                    {{ ticket.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Event Images -->
      <div v-if="event.images && event.images.length > 1" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Event Images</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="image in event.images.slice(1)"
            :key="image.id"
            class="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            @click="openImageModal(image)"
          >
            <img
              :src="getImageUrl(image.url)"
              :alt="image.alt || event.title"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation, useSubscription } from '@vue/apollo-composable'
import { EVENT_QUERY, BOOK_TICKET_MUTATION, EVENT_CAPACITY_CHANGED_SUBSCRIPTION } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { CapacityInfo } from '@/types'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const booking = ref(false)
const capacityInfo = ref<CapacityInfo | null>(null)

const { result, loading, refetch } = useQuery(EVENT_QUERY, {
  id: route.params.id
})

const { mutate: bookTicketMutation } = useMutation(BOOK_TICKET_MUTATION)

// Subscribe to capacity changes
const { result: subscriptionResult, error: subscriptionError } = useSubscription(
  EVENT_CAPACITY_CHANGED_SUBSCRIPTION,
  computed(() => ({
    eventId: route.params.id as string
  })),
  {
    enabled: computed(() => !!route.params.id)
  }
)

// Log subscription errors for debugging
watch(subscriptionError, (error) => {
  if (error) {
    console.error('Subscription error:', error)
    toast.error('Failed to connect to live updates')
  }
}, { immediate: true })

const event = computed(() => result.value?.event)

const remainingTickets = computed(() => {
  // Use subscription data if available for live updates
  if (capacityInfo.value?.remaining !== undefined) {
    return capacityInfo.value.remaining
  }
  
  if (!event.value) return 0
  const bookedTickets = event.value.tickets?.filter((ticket: any) => ticket.status === 'CONFIRMED').length || 0
  return event.value.capacity - bookedTickets
})

const canBookTicket = computed(() => {
  if (!authStore.isAuthenticated || !event.value) return false
  
  // Check if user already has a ticket
  const userTicket = event.value.tickets?.find((ticket: any) => 
    ticket?.user?.id === authStore.user?.id && ticket.status === 'CONFIRMED'
  )
  
  return !userTicket && remainingTickets.value > 0 && !isEventPast(event.value.startAt)
})

const attendees = computed(() => {
  if (!event.value?.tickets) return []
  // Show all tickets (including cancelled/refunded for transparency)
  // You can filter to only CONFIRMED if you want only confirmed attendees
  return event.value.tickets.filter((ticket: any) => ticket.status === 'CONFIRMED')
})

const isOrganizer = computed(() => {
  if (!authStore.isAuthenticated || !event.value) return false
  return event.value.organizer.id === authStore.user?.id
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

const isEventPast = (startAt: string) => {
  return new Date(startAt) < new Date()
}

const getImageUrl = (url: string) => {
  if (url.startsWith('http')) return url
  const API_BASE_URL = (import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql').replace('/graphql', '')
  return `${API_BASE_URL}${url}`
}

const openImageModal = (image: any) => {
  // Simple image viewer - could be enhanced with a proper modal component
  window.open(getImageUrl(image.url), '_blank')
}

const bookTicket = async () => {
  if (!event.value) return
  
  booking.value = true
  
  try {
    await bookTicketMutation({
      eventId: event.value.id,
      type: 'General Admission'
    })
    
    toast.success('Ticket booked successfully!')
    
    // Immediately update local capacity info for snappy UX
    if (capacityInfo.value) {
      const newRemaining = Math.max(0, (capacityInfo.value.remaining ?? 0) - 1)
      const newBooked = (capacityInfo.value.booked ?? 0) + 1
      capacityInfo.value = {
        ...capacityInfo.value,
        remaining: newRemaining,
        booked: newBooked
      }
    }

    // Also refetch the event query to stay consistent with server state
    if (refetch) {
      refetch()
    }
  } catch (error) {
    toast.error('Failed to book ticket')
    console.error('Book ticket error:', error)
  } finally {
    booking.value = false
  }
}

// Watch for subscription updates
watch(
  () => subscriptionResult.value,
  (newResult) => {
    if (newResult?.eventCapacityChanged) {
      const data = newResult.eventCapacityChanged
      capacityInfo.value = data
      toast.info(`Live update: ${data.remaining} tickets remaining!`, { timeout: 3000 })
      
      // Also refetch the event query to get latest data
      if (refetch) {
        refetch()
      }
    }
  },
  { deep: true, immediate: true }
)

// Watch for event data to initialize capacity info
watch(event, (newEvent) => {
  if (newEvent && !capacityInfo.value) {
    capacityInfo.value = {
      eventId: newEvent.id,
      capacity: newEvent.capacity,
      remaining: newEvent.capacity - (newEvent.tickets?.filter((t: any) => t.status === 'CONFIRMED').length || 0),
      booked: newEvent.tickets?.filter((t: any) => t.status === 'CONFIRMED').length || 0
    }
  }
}, { immediate: true })
</script>

