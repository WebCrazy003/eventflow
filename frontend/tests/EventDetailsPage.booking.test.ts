import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventDetailsPage from '@/pages/EventDetailsPage.vue'
import { ref } from 'vue'

// Mock route with event id
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'event-1' } }),
}))

// Mock apollo composables
const mutateSpy = vi.fn().mockResolvedValue({ data: { bookTicket: { id: 't1' } } })
const eventData = {
  event: {
    id: 'event-1',
    title: 'Test Event',
    startAt: new Date(Date.now() + 60000).toISOString(),
    capacity: 2,
    tickets: [],
    organizer: { id: 'org-1', name: 'Org' },
    images: [],
  },
}

vi.mock('@vue/apollo-composable', () => ({
  useQuery: () => ({ result: ref(eventData), loading: ref(false), refetch: vi.fn() }),
  useMutation: () => ({ mutate: mutateSpy }),
  useSubscription: () => ({ result: ref(null), error: ref(null) }),
}))

// Mock auth store to be authenticated
vi.mock('@/stores/auth', async (orig) => {
  const actual = (await orig()) as any
  return {
    ...actual,
    useAuthStore: () => ({ isAuthenticated: true, user: { id: 'u1', name: 'User' } }),
  }
})

describe('EventDetailsPage booking flow', () => {
  it('books a ticket when clicking the button', async () => {
    setActivePinia(createPinia())

    const wrapper = mount(EventDetailsPage)

    const button = wrapper.get('button')
    await button.trigger('click')

    expect(mutateSpy).toHaveBeenCalledWith({ eventId: 'event-1', type: 'General Admission' })
  })
})


