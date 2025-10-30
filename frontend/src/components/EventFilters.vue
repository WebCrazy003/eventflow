<template>
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            id="search"
            v-model="localFilters.search"
            type="text"
            placeholder="Search events..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1"
            >Location</label
          >
          <input
            id="location"
            v-model="localFilters.location"
            type="text"
            placeholder="City, venue..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1"
            >Start Date</label
          >
          <input
            id="startDate"
            v-model="localFilters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            id="endDate"
            v-model="localFilters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button class="text-sm text-gray-600 hover:text-gray-800" @click="clearFilters">
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface FilterType {
  search: string
  location: string
  startDate: string
  endDate: string
}

const props = defineProps<{
  modelValue: FilterType
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterType]
}>()

const localFilters = reactive({ ...props.modelValue })

// Watch props to update localFilters when parent changes
watch(
  () => props.modelValue,
  newValue => {
    Object.assign(localFilters, newValue)
  },
  { deep: true }
)

// Watch localFilters to emit changes to parent
watch(
  localFilters,
  newValue => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

const clearFilters = () => {
  localFilters.search = ''
  localFilters.location = ''
  localFilters.startDate = ''
  localFilters.endDate = ''
}
</script>
