<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p class="mt-2 text-gray-600">View and manage your event tickets</p>
      </div>

      <LoadingSpinner v-if="loading" message="Loading your tickets..." />

      <EmptyState
        v-else-if="tickets?.length === 0"
        title="No tickets found"
        description="You haven't booked any events yet."
        :path="'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'"
      >
        <template #action>
          <router-link
            to="/events"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Events
          </router-link>
        </template>
      </EmptyState>

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
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </div>

          <div class="p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-semibold">{{ ticket.event.title }}</h3>
              <span
                :class="{
                  'bg-green-100 text-green-800': ticket.status === 'CONFIRMED',
                  'bg-red-100 text-red-800': ticket.status === 'CANCELLED',
                  'bg-yellow-100 text-yellow-800': ticket.status === 'REFUNDED',
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
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                {{ formatDate(ticket.event.startAt) }}
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                {{ ticket.event.location || 'Online' }}
              </div>
              <div v-if="ticket.type" class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  ></path>
                </svg>
                {{ ticket.type }}
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500"> Booked {{ formatDate(ticket.createdAt) }} </span>
              <button
                v-if="ticket.status === 'CONFIRMED' && !isEventPast(ticket.event.startAt)"
                :disabled="cancelling"
                class="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="cancelTicket(ticket.id)"
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
import { ref, watch, onMounted } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { MY_TICKETS_QUERY, CANCEL_TICKET_MUTATION } from '@/graphql/queries'
import { useToast } from 'vue-toastification'
import type { Ticket } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'

const toast = useToast()
const cancelling = ref(false)

const { result, loading, refetch, onResult } = useQuery(MY_TICKETS_QUERY)
const { mutate: cancelTicketMutation } = useMutation(CANCEL_TICKET_MUTATION)

const tickets = ref<Ticket[]>([])

// Function to be called after fetching result
const onFetchComplete = (result: { data?: { myTickets: Ticket[] } }) => {
  if (result?.data) {
    tickets.value = result.data.myTickets
  }
}

onResult(onFetchComplete)

watch(result, newResult => {
  onFetchComplete({ data: newResult })
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
      id: ticketId,
    })

    toast.success('Ticket cancelled successfully')
  } catch (error) {
    toast.error('Failed to cancel ticket')
    console.error('Cancel ticket error:', error)
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  refetch()
})
</script>
