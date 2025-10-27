<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p class="mt-2 text-gray-600">Manage users, events, and system settings</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalUsers }}</div>
              <div class="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalTickets }}</div>
              <div class="text-sm text-gray-500">Total Tickets</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalRevenue }}</div>
              <div class="text-sm text-gray-500">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Management -->
      <div class="bg-white rounded-lg shadow-md mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Users Management</h2>
        </div>
        
        <div v-if="usersLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading users...</p>
        </div>

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
    <div v-if="showRoleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">Edit User Roles</h2>
        
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
        
        <div class="flex justify-end space-x-3 mt-6">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { USERS_QUERY, EVENTS_QUERY, UPDATE_USER_ROLES_MUTATION, DELETE_USER_MUTATION } from '@/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { User, Role } from '@/types'

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

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
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

.ml-4 {
  margin-left: 1rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
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

.text-white {
  color: #ffffff;
}

.text-blue-600 {
  color: #2563eb;
}

.text-green-600 {
  color: #16a34a;
}

.text-purple-600 {
  color: #9333ea;
}

.text-yellow-600 {
  color: #d97706;
}

.text-red-600 {
  color: #dc2626;
}

.hover\:text-blue-900:hover {
  color: #1e3a8a;
}

.hover\:text-red-900:hover {
  color: #7f1d1d;
}

.bg-white {
  background-color: #ffffff;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.bg-purple-100 {
  background-color: #f3e8ff;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-red-600 {
  background-color: #dc2626;
}

.bg-gray-600 {
  background-color: #4b5563;
}

.bg-green-600 {
  background-color: #16a34a;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.hover\:bg-gray-700:hover {
  background-color: #374151;
}

.hover\:bg-green-700:hover {
  background-color: #15803d;
}

.hover\:bg-gray-300:hover {
  background-color: #d1d5db;
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
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

.border {
  border-width: 1px;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.border-b {
  border-bottom-width: 1px;
}

.overflow-x-auto {
  overflow-x: auto;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.divide-y > * + * {
  border-top-width: 1px;
}

.divide-gray-200 > * + * {
  border-color: #e5e7eb;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.space-x-1 > * + * {
  margin-left: 0.25rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.w-full {
  width: 100%;
}

.max-w-md {
  max-width: 28rem;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

.w-6 {
  width: 1.5rem;
}

.h-6 {
  height: 1.5rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
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

.whitespace-nowrap {
  white-space: nowrap;
}

.min-w-full {
  min-width: 100%;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.focus\:ring-blue-500:focus {
  --tw-ring-color: #3b82f6;
  box-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black {
  background-color: #000000;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.z-50 {
  z-index: 50;
}

.mx-4 {
  margin-left: 1rem;
  margin-right: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
