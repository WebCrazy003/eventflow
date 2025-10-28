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
    <EventFilters
      :modelValue="filters"
      @update:modelValue="(val) => Object.assign(filters, val)"
    />

    <!-- Events Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LoadingSpinner v-if="loading" message="Loading events..." />

      <EmptyState
        v-else-if="events.length === 0"
        title="No events found"
        description="Try adjusting your search criteria."
      />

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
            :show-location="true"
            :show-capacity="true"
            :show-organizer="true"
          />
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { EVENTS_QUERY } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import type { Event } from '@/types'
import EventFilters from '@/components/EventFilters.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import EventCard from '@/components/EventCard.vue'

const authStore = useAuthStore()

const filters = reactive({
  search: '',
  location: '',
  startDate: '',
  endDate: '',
})

const events = ref<Event[]>([])
const loading = ref(true)
const hasNextPage = ref(false)
const endCursor = ref<string | null>(null)


const { loading: queryLoading, fetchMore, refetch, onResult } = useQuery(EVENTS_QUERY, {
  filter: filters,
  pagination: {
    first: 3,
    after: endCursor.value || undefined,
  },
})

const onFetchComplete = (result: any) => {
  if (result?.data) {
    const { data } = result
    events.value = data.events.edges.map((edge: any) => edge.node)
    hasNextPage.value = data.events.pageInfo.hasNextPage
    endCursor.value = data.events.pageInfo.endCursor
    loading.value = false
  }
}
onResult(onFetchComplete)

const loadMore = async () => {
  if (!hasNextPage.value || queryLoading.value) return
  
  try {
    await fetchMore({
      variables: {
        filter: filters,
        pagination: {
          first: 3,
          after: endCursor.value,
        },
      },
      updateQuery: (previousResult: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return previousResult

        const newEdges = fetchMoreResult.events.edges || []
        const prevEdges = previousResult?.events?.edges || []

        return {
          events: {
            ...fetchMoreResult.events,
            edges: [...prevEdges, ...newEdges],
          },
        }
      },
    })
  } catch (error) {
    console.error('Error loading more events:', error)
  }
}




onMounted(() => {
  refetch()
})
</script>

