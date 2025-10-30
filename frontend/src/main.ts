import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createApolloClient } from './apollo/client'
import { DefaultApolloClient } from '@vue/apollo-composable'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Create Apollo Client
const apolloClient = createApolloClient()

// Create Pinia store
const pinia = createPinia()

// Use plugins
app.use(pinia)
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
})

// Provide Apollo Client
app.provide(DefaultApolloClient, apolloClient)

// Initialize auth state before mounting
async function initAuth() {
  const { useAuthStore } = await import('./stores/auth')
  const authStore = useAuthStore()

  // If we have a token but no user, fetch the user directly
  if (authStore.accessToken && !authStore.user) {
    try {
      // Fetch user data directly using the Apollo client
      const result = await apolloClient.query({
        query: (await import('./graphql/queries')).ME_QUERY,
        fetchPolicy: 'network-only',
      })

      if (result?.data?.me) {
        authStore.setUser(result.data.me)
      }
    } catch (error) {
      console.error('Failed to fetch user on init:', error)
      // If fetch fails, clear the tokens
      authStore.logout()
    }
  }
}

// Initialize auth and then mount
initAuth().then(() => {
  app.mount('#app')
})
