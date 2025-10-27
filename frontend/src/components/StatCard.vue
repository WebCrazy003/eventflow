<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center">
      <div :class="iconBgClass" class="p-2 rounded-lg">
        <svg class="w-6 h-6" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path :stroke-linecap="strokeLinecap" :stroke-linejoin="strokeLinejoin" :stroke-width="strokeWidth" :d="iconPath"></path>
        </svg>
      </div>
      <div class="ml-4">
        <div class="text-2xl font-bold text-gray-900">{{ value }}</div>
        <div class="text-sm text-gray-500">{{ label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: number | string
  label: string
  iconBgClass?: string
  iconColorClass?: string
  iconPath?: string
  strokeLinecap?: string
  strokeLinejoin?: string
  strokeWidth?: string
}>()

const iconBgClass = props.iconBgClass || 'bg-blue-100'
const iconColorClass = props.iconColorClass || 'text-blue-600'
const iconPath = props.iconPath || 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
const strokeLinecap = props.strokeLinecap || 'round'
const strokeLinejoin = props.strokeLinejoin || 'round'
const strokeWidth = props.strokeWidth || '2'
</script>

