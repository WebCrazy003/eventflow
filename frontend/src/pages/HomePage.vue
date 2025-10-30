<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <HeroSection
      title="Discover Amazing Events"
      description="Find, book, and manage events with EventFlow"
    >
      <template #actions>
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
      </template>
    </HeroSection>

    <!-- Features Section -->
    <div class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose EventFlow?</h2>
          <p class="text-lg text-gray-600">Everything you need to manage events and bookings</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Easy Booking</h3>
            <p class="text-gray-600">Book tickets for events with just a few clicks</p>
          </div>

          <div class="text-center">
            <div
              class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Real-time Updates</h3>
            <p class="text-gray-600">Get live updates on event capacity and bookings</p>
          </div>

          <div class="text-center">
            <div
              class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
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
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
          <p class="text-lg text-gray-600">Check out these popular events</p>
        </div>

        <!-- <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div> -->

        <div v-if="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard
            v-for="event in events.slice(0, 6)"
            :key="event.id"
            :event="event"
            :show-location="true"
          />
        </div>

        <EmptyState
          v-else
          title="No events available"
          description="Check back later for new events"
        />
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
import HeroSection from '@/components/HeroSection.vue'
import EventCard from '@/components/EventCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const authStore = useAuthStore()
const events = ref<Event[]>([])
// const loading = ref(true)

const { onResult, refetch } = useQuery(EVENTS_QUERY, {
  filter: {},
  pagination: { first: 6 },
})

const onFetchComplete = (result: any) => {
  if (result?.data?.events) {
    const { edges: eventArray } = result?.data?.events
    events.value = eventArray.map((edge: any) => edge.node)
  }
}
onResult(onFetchComplete)

onMounted(() => {
  refetch()
})
</script>
