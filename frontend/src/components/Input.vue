<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="inputClass"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  inputId?: string
}>(), {
  type: 'text',
  required: false
})

const inputId = props.inputId || `input-${Math.random().toString(36).substring(7)}`
const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-500 text-gray-900'

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

