<template>
  <button
    :class="[
      baseClass,
      variantClasses[variant],
      sizeClasses[size],
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

defineEmits<{
  click: []
}>()

const baseClass = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
}
const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-lg'
}
</script>

