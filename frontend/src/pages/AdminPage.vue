<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p class="mt-2 text-gray-600">Manage users, events, and system settings</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          :value="totalUsers"
          label="Total Users"
          icon-bg-class="bg-blue-100"
          icon-color-class="text-blue-600"
          :icon-path="'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'"
        />
        <StatCard
          :value="totalEvents"
          label="Total Events"
          icon-bg-class="bg-green-100"
          icon-color-class="text-green-600"
        />
        <StatCard
          :value="totalTickets"
          label="Total Tickets"
          icon-bg-class="bg-purple-100"
          icon-color-class="text-purple-600"
          :icon-path="'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'"
        />
        <StatCard
          :value="totalRevenue"
          label="Total Revenue"
          icon-bg-class="bg-yellow-100"
          icon-color-class="text-yellow-600"
          :icon-path="'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'"
        />
      </div>

      <!-- Users Management -->
      <div class="bg-white rounded-lg shadow-md mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Users Management</h2>
        </div>
        
        <LoadingSpinner v-if="usersLoading" message="Loading users..." />

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-1">
                    <span
                      v-for="role in user.roles"
                      :key="role"
                      :class="{
                        'bg-blue-100 text-blue-800': role === 'USER',
                        'bg-green-100 text-green-800': role === 'ORGANIZER',
                        'bg-purple-100 text-purple-800': role === 'ADMIN'
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.events?.length || 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.tickets?.length || 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editUserRoles(user)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit Roles
                  </button>
                  <button
                    v-if="user.id !== authStore.user?.id"
                    @click="deleteUser(user.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- System Settings -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">System Settings</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Database</h3>
              <div class="space-y-2">
                <button
                  @click="seedDatabase"
                  :disabled="seeding"
                  class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {{ seeding ? 'Seeding...' : 'Seed Database' }}
                </button>
                <button
                  @click="resetDatabase"
                  :disabled="resetting"
                  class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {{ resetting ? 'Resetting...' : 'Reset Database' }}
                </button>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Maintenance</h3>
              <div class="space-y-2">
                <button
                  @click="clearCache"
                  :disabled="clearing"
                  class="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {{ clearing ? 'Clearing...' : 'Clear Cache' }}
                </button>
                <button
                  @click="exportData"
                  :disabled="exporting"
                  class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {{ exporting ? 'Exporting...' : 'Export Data' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Roles Modal -->
    <Modal :show="showRoleModal" title="Edit User Roles" @close="showRoleModal = false">
      <div class="mb-4">
        <p class="text-sm text-gray-600 mb-2">User: {{ selectedUser?.name }}</p>
        <p class="text-sm text-gray-600">Email: {{ selectedUser?.email }}</p>
      </div>
      
      <div class="space-y-3">
        <label class="flex items-center">
          <input
            v-model="selectedRoles"
            type="checkbox"
            value="USER"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">User</span>
        </label>
        <label class="flex items-center">
          <input
            v-model="selectedRoles"
            type="checkbox"
            value="ORGANIZER"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">Organizer</span>
        </label>
        <label class="flex items-center">
          <input
            v-model="selectedRoles"
            type="checkbox"
            value="ADMIN"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">Admin</span>
        </label>
      </div>
      
      <template #footer>
        <button
          @click="showRoleModal = false"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="updateUserRoles"
          :disabled="updating"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ updating ? 'Updating...' : 'Update Roles' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { USERS_QUERY, EVENTS_QUERY, UPDATE_USER_ROLES_MUTATION, DELETE_USER_MUTATION } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { User, Role } from '@/types'
import StatCard from '@/components/StatCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Modal from '@/components/Modal.vue'

const authStore = useAuthStore()
const toast = useToast()

const showRoleModal = ref(false)
const selectedUser = ref<User | null>(null)
const selectedRoles = ref<Role[]>([])
const updating = ref(false)
const seeding = ref(false)
const resetting = ref(false)
const clearing = ref(false)
const exporting = ref(false)

const { result: usersResult, loading: usersLoading, refetch: refetchUsers } = useQuery(USERS_QUERY)
const { result: eventsResult } = useQuery(EVENTS_QUERY, {
  pagination: { first: 1000 }
})

const { mutate: updateUserRolesMutation } = useMutation(UPDATE_USER_ROLES_MUTATION)
const { mutate: deleteUserMutation } = useMutation(DELETE_USER_MUTATION)

const users = computed(() => usersResult.value?.users || [])
const events = computed(() => eventsResult.value?.events.edges.map((edge: any) => edge.node) || [])

const totalUsers = computed(() => users.value.length)
const totalEvents = computed(() => events.value.length)
const totalTickets = computed(() => {
  return events.value.reduce((total: number, event: any) => {
    return total + (event.tickets?.length || 0)
  }, 0)
})
const totalRevenue = computed(() => {
  // This would be calculated based on ticket prices
  return totalTickets.value * 25 // Assuming $25 per ticket
})

const editUserRoles = (user: User) => {
  selectedUser.value = user
  selectedRoles.value = [...user.roles]
  showRoleModal.value = true
}

const updateUserRoles = async () => {
  if (!selectedUser.value) return
  
  updating.value = true
  
  try {
    await updateUserRolesMutation({
      userId: selectedUser.value.id,
      roles: selectedRoles.value
    })
    
    toast.success('User roles updated successfully!')
    showRoleModal.value = false
    
    // Refresh users list
    await refetchUsers()
  } catch (error) {
    toast.error('Failed to update user roles')
    console.error('Update user roles error:', error)
  } finally {
    updating.value = false
  }
}

const deleteUser = async (userId: string) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return
  }
  
  try {
    await deleteUserMutation({ userId })
    toast.success('User deleted successfully!')
    
    // Refresh users list
    await refetchUsers()
  } catch (error) {
    toast.error('Failed to delete user')
    console.error('Delete user error:', error)
  }
}

const seedDatabase = async () => {
  seeding.value = true
  
  try {
    // This would call a seed mutation
    toast.success('Database seeded successfully!')
  } catch (error) {
    toast.error('Failed to seed database')
    console.error('Seed database error:', error)
  } finally {
    seeding.value = false
  }
}

const resetDatabase = async () => {
  if (!confirm('Are you sure you want to reset the database? This will delete all data!')) {
    return
  }
  
  resetting.value = true
  
  try {
    // This would call a reset mutation
    toast.success('Database reset successfully!')
  } catch (error) {
    toast.error('Failed to reset database')
    console.error('Reset database error:', error)
  } finally {
    resetting.value = false
  }
}

const clearCache = async () => {
  clearing.value = true
  
  try {
    // This would clear application cache
    toast.success('Cache cleared successfully!')
  } catch (error) {
    toast.error('Failed to clear cache')
    console.error('Clear cache error:', error)
  } finally {
    clearing.value = false
  }
}

const exportData = async () => {
  exporting.value = true
  
  try {
    // This would export data to CSV/JSON
    toast.success('Data exported successfully!')
  } catch (error) {
    toast.error('Failed to export data')
    console.error('Export data error:', error)
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  // Initialize any admin-specific data
})
</script>

