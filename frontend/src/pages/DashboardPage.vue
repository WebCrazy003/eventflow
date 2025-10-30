<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
        <p class="mt-2 text-gray-600">Manage your events and view analytics</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          :value="totalEvents"
          label="Total Events"
        />
        <StatCard
          :value="totalTickets"
          label="Total Tickets Sold"
          icon-bg-class="bg-green-100"
          icon-color-class="text-green-600"
          :icon-path="'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'"
        />
        <StatCard
          :value="totalRevenue"
          label="Total Revenue"
          icon-bg-class="bg-purple-100"
          icon-color-class="text-purple-600"
          :icon-path="'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'"
        />
      </div>

      <!-- Create Event Button -->
      <div class="mb-8">
        <button
          @click="openCreateModal"
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
        
        <LoadingSpinner v-if="loading" message="Loading events..." />

        <EmptyState
          v-else-if="events.length === 0"
          title="No events found"
          description="Create your first event to get started."
        />

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

    <!-- Event Modal (Create/Edit) -->
    <Modal :show="showEventModal" :title="modalTitle" @close="showEventModal = false">
      <template #default>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <Input
              id="event-title"
              v-model="newEvent.title"
              type="text"
              label="Title"
              :required="true"
            />
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="newEvent.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <Input
              id="event-location"
              :model-value="newEvent.location || ''"
              @update:model-value="newEvent.location = $event"
              type="text"
              label="Location"
            />
            
            <div class="grid grid-cols-2 gap-4">
              <Input
                id="event-startAt"
                v-model="newEvent.startAt"
                type="datetime-local"
                label="Start Date"
                :required="true"
              />
              <Input
                id="event-endAt"
                v-model="newEvent.endAt"
                type="datetime-local"
                label="End Date"
                :required="true"
              />
            </div>
            
            <div>
              <label for="event-capacity" class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                id="event-capacity"
                v-model.number="newEvent.capacity"
                type="number"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <!-- Event Images -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Event Images</label>
              
              <!-- Current Images -->
              <div v-if="eventImages.length > 0" class="grid grid-cols-3 gap-2 mb-3">
                <div
                  v-for="image in eventImages"
                  :key="image.id || image.url"
                  class="relative group"
                >
                  <img
                    :src="getImageUrl(image.url)"
                    :alt="image.alt || 'Event image'"
                    class="w-full h-24 object-cover rounded-md border border-gray-300"
                  />
                  <button
                    @click="removeImage(image)"
                    class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <!-- Upload Button -->
              <div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="hidden"
                />
                  <button
                    @click="triggerFileInput"
                    type="button"
                    :disabled="uploadingImage"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {{ uploadingImage ? 'Uploading...' : 'Add Image' }}
                  </button>
              </div>
            </div>
          </div>
        </form>
      </template>
      
      <template #footer>
        <button
          type="button"
          @click="showEventModal = false"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ submitButtonText }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { EVENTS_QUERY, CREATE_EVENT_MUTATION, UPDATE_EVENT_MUTATION, DELETE_EVENT_MUTATION, ADD_EVENT_IMAGE_MUTATION, REMOVE_EVENT_IMAGE_MUTATION } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { Event as GQLEvent, CreateEventInput, EventImage } from '@/types'
import StatCard from '@/components/StatCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import Modal from '@/components/Modal.vue'
import Input from '@/components/Input.vue'

const authStore = useAuthStore()
const toast = useToast()

const showEventModal = ref(false)
const isSaving = ref(false)
const editingEvent = ref<GQLEvent | null>(null)
const eventImages = ref<(EventImage & { id?: string })[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const uploadingImage = ref(false)

// Computed properties for modal behavior
const isEditMode = computed(() => editingEvent.value !== null)
const modalTitle = computed(() => isEditMode.value ? 'Edit Event' : 'Create New Event')
const submitButtonText = computed(() => isSaving.value ? (isEditMode.value ? 'Updating...' : 'Creating...') : (isEditMode.value ? 'Update Event' : 'Create Event'))

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
const { mutate: updateEventMutation } = useMutation(UPDATE_EVENT_MUTATION)
const { mutate: deleteEventMutation } = useMutation(DELETE_EVENT_MUTATION)
const { mutate: addEventImageMutation } = useMutation(ADD_EVENT_IMAGE_MUTATION)
const { mutate: removeEventImageMutation } = useMutation(REMOVE_EVENT_IMAGE_MUTATION)

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'
const API_BASE_URL = GRAPHQL_URL.replace('/graphql', '')

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

const getBookedCount = (event: GQLEvent) => {
  return event.tickets?.filter(ticket => ticket.status === 'CONFIRMED').length || 0
}

const resetForm = () => {
  newEvent.value = {
    title: '',
    description: '',
    location: '',
    startAt: '',
    endAt: '',
    capacity: 100,
  }
  editingEvent.value = null
  eventImages.value = []
}

const openCreateModal = () => {
  resetForm()
  // Set default dates
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  newEvent.value.startAt = tomorrow.toISOString().slice(0, 16)
  newEvent.value.endAt = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
  showEventModal.value = true
}

const handleSubmit = async () => {
  if (isEditMode.value) {
    await updateEvent()
  } else {
    await createEvent()
  }
}

const createEvent = async () => {
  isSaving.value = true
  
  try {
    const result = await createEventMutation({
      input: {
        ...newEvent.value,
        startAt: new Date(newEvent.value.startAt).toISOString(),
        endAt: new Date(newEvent.value.endAt).toISOString(),
      }
    })
    
    // Add images after event is created
    if (eventImages.value.length > 0 && result?.data?.createEvent?.id) {
      for (const image of eventImages.value) {
        await addEventImageMutation({
          eventId: result.data.createEvent.id,
          url: image.url,
          alt: image.alt,
        })
      }
    }
    
    toast.success('Event created successfully!')
    showEventModal.value = false
    resetForm()
    await refetch()
  } catch (error) {
    toast.error('Failed to create event')
    console.error('Create event error:', error)
  } finally {
    isSaving.value = false
  }
}

const editEvent = (event: GQLEvent) => {
  editingEvent.value = event
  newEvent.value = {
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    startAt: new Date(event.startAt).toISOString().slice(0, 16),
    endAt: new Date(event.endAt).toISOString().slice(0, 16),
    capacity: event.capacity,
  }
  eventImages.value = event.images ? [...event.images] : []
  showEventModal.value = true
}

const getImageUrl = (url: string) => {
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingImage.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)

    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        authorization: token ? `Bearer ${token}` : '',
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      credentials: 'include', // Include credentials for CORS
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()

    // If editing existing event, add image to database immediately
    if (isEditMode.value && editingEvent.value) {
      await addEventImageMutation({
        eventId: editingEvent.value.id,
        url: data.url,
        alt: file.name,
      })
      await refetch()
    } else {
      // For new events, store locally until event is created
      eventImages.value.push({
        url: data.url,
        alt: file.name,
        filename: data.filename,
        path: data.path,
      })
    }

    toast.success('Image uploaded successfully!')
  } catch (error) {
    toast.error('Failed to upload image')
    console.error('Upload error:', error)
  } finally {
    uploadingImage.value = false
    if (target) target.value = ''
  }
}

const removeImage = async (image: EventImage & { id?: string }) => {
  // If image has an id, it's in the database - remove it
  if (image.id && isEditMode.value && editingEvent.value) {
    try {
      await removeEventImageMutation({ id: image.id })
      eventImages.value = eventImages.value.filter(img => img.id !== image.id)
      toast.success('Image removed successfully!')
      await refetch()
    } catch (error) {
      toast.error('Failed to remove image')
      console.error('Remove image error:', error)
    }
  } else {
    // Remove from local array (not yet saved)
    eventImages.value = eventImages.value.filter(img => img.url !== image.url)
  }
}

const updateEvent = async () => {
  if (!editingEvent.value) return
  
  isSaving.value = true
  
  try {
    await updateEventMutation({
      id: editingEvent.value.id,
      input: {
        title: newEvent.value.title,
        description: newEvent.value.description,
        location: newEvent.value.location,
        startAt: new Date(newEvent.value.startAt).toISOString(),
        endAt: new Date(newEvent.value.endAt).toISOString(),
        capacity: newEvent.value.capacity,
      }
    })
    
    toast.success('Event updated successfully!')
    showEventModal.value = false
    resetForm()
    await refetch()
  } catch (error) {
    toast.error('Failed to update event')
    console.error('Update event error:', error)
  } finally {
    isSaving.value = false
  }
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

</script>

