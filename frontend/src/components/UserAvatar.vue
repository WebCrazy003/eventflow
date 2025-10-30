<template>
  <div ref="menuRef" class="relative">
    <button
      class="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-haspopup="true"
      :aria-expanded="isMenuOpen ? 'true' : 'false'"
      @click="toggleMenu"
    >
      <span class="text-sm font-semibold">
        {{ userInitials }}
      </span>
    </button>
    <div
      v-if="isMenuOpen"
      class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50"
      role="menu"
    >
      <div class="px-4 py-3 border-b">
        <p class="text-sm text-gray-500">Signed in as</p>
        <p class="text-sm font-medium text-gray-900 truncate">{{ name }}</p>
      </div>
      <div class="py-1">
        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          @click="emitLogout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ name: string }>()
const emit = defineEmits<{ (e: 'logout'): void }>()

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const userInitials = computed(() => {
  const name = props.name?.trim() || ''
  if (!name) return 'U'
  const parts = name.split(/\s+/)
  const first = parts[0]?.charAt(0) || ''
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return (first + last).toUpperCase() || first.toUpperCase() || 'U'
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as Node
  if (isMenuOpen.value && menuRef.value && !menuRef.value.contains(target)) {
    isMenuOpen.value = false
  }
}

const emitLogout = () => {
  isMenuOpen.value = false
  emit('logout')
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
