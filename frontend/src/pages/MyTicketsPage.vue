<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p class="mt-2 text-gray-600">View and manage your event tickets</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading your tickets...</p>
      </div>

      <div v-else-if="tickets.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
        <p class="mt-1 text-sm text-gray-500">You haven't booked any events yet.</p>
        <div class="mt-6">
          <router-link
            to="/events"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Events
          </router-link>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <!-- <div v-if="ticket.event.images.length > 0" class="h-48 bg-gray-200">
            <img
              :src="ticket.event.images[0].url"
              :alt="ticket.event.images[0].alt || ticket.event.title"
              class="w-full h-full object-cover"
            />
          </div> -->
          <div class="h-48 bg-gray-200 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-semibold">{{ ticket.event.title }}</h3>
              <span 
                :class="{
                  'bg-green-100 text-green-800': ticket.status === 'CONFIRMED',
                  'bg-red-100 text-red-800': ticket.status === 'CANCELLED',
                  'bg-yellow-100 text-yellow-800': ticket.status === 'REFUNDED'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ ticket.status }}
              </span>
            </div>
            
            <p class="text-gray-600 mb-4 line-clamp-2">{{ ticket.event.description }}</p>
            
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ formatDate(ticket.event.startAt) }}
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ ticket.event.location || 'Online' }}
              </div>
              <div v-if="ticket.type" class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
                {{ ticket.type }}
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">
                Booked {{ formatDate(ticket.createdAt) }}
              </span>
              <button
                v-if="ticket.status === 'CONFIRMED' && !isEventPast(ticket.event.startAt)"
                @click="cancelTicket(ticket.id)"
                :disabled="cancelling"
                class="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ cancelling ? 'Cancelling...' : 'Cancel' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { MY_TICKETS_QUERY, CANCEL_TICKET_MUTATION } from '@/graphql/queries'
import { useToast } from 'vue-toastification'
import type { Ticket } from '@/types'

const toast = useToast()
const cancelling = ref(false)

const { result, loading } = useQuery(MY_TICKETS_QUERY)
const { mutate: cancelTicketMutation } = useMutation(CANCEL_TICKET_MUTATION)

const tickets = ref<Ticket[]>([])

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

const cancelTicket = async (ticketId: string) => {
  if (!confirm('Are you sure you want to cancel this ticket?')) {
    return
  }

  cancelling.value = true
  
  try {
    await cancelTicketMutation({
      id: ticketId
    })
    
    toast.success('Ticket cancelled successfully')
    
    // Refresh the tickets list
    if (result.value) {
      tickets.value = result.value.myTickets
    }
  } catch (error) {
    toast.error('Failed to cancel ticket')
    console.error('Cancel ticket error:', error)
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  if (result.value) {
    tickets.value = result.value.myTickets
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

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
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

.mt-6 {
  margin-top: 1.5rem;
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

.text-white {
  color: #ffffff;
}

.text-green-800 {
  color: #166534;
}

.text-red-800 {
  color: #991b1b;
}

.text-yellow-800 {
  color: #92400e;
}

.bg-white {
  background-color: #ffffff;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.bg-red-100 {
  background-color: #fee2e2;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-red-600 {
  background-color: #dc2626;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.rounded-full {
  border-radius: 9999px;
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
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
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

.justify-center {
  justify-content: center;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
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

.p-6 {
  padding: 1.5rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
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
