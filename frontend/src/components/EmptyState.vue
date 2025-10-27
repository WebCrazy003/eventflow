<template>
  <div class="text-center py-12">
    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path :stroke-linecap="strokeLinecap" :stroke-linejoin="strokeLinejoin" :stroke-width="strokeWidth" :d="path"></path>
    </svg>
    <h3 class="mt-2 text-sm font-medium text-gray-900">{{ title }}</h3>
    <p class="mt-1 text-sm text-gray-500">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
type StrokeLinecap = 'inherit' | 'round' | 'butt' | 'square'
type StrokeLinejoin = 'inherit' | 'round' | 'miter' | 'bevel'

withDefaults(defineProps<{
  title: string
  description: string
  path?: string
  strokeLinecap?: StrokeLinecap
  strokeLinejoin?: StrokeLinejoin
  strokeWidth?: string
}>(), {
  path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  strokeLinecap: 'round' as StrokeLinecap,
  strokeLinejoin: 'round' as StrokeLinejoin,
  strokeWidth: '2'
})
</script>

