import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Global stubs for router components
config.global.stubs = {
  'router-link': true,
  'router-view': true,
}

// Mock toast globally
vi.mock('vue-toastification', () => {
  const success = vi.fn()
  const error = vi.fn()
  const info = vi.fn()
  return { useToast: () => ({ success, error, info }) }
})


