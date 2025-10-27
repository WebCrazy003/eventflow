<template>
  <Transition>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="close">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
        
        <slot></slot>
        
        <div v-if="$slots.footer" class="flex justify-end space-x-3 mt-6">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

