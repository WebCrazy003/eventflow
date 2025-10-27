import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Role } from '@/types'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/events',
      name: 'Events',
      component: () => import('@/pages/EventsPage.vue'),
    },
    {
      path: '/events/:id',
      name: 'EventDetails',
      component: () => import('@/pages/EventDetailsPage.vue'),
      props: true,
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/my-tickets',
      name: 'MyTickets',
      component: () => import('@/pages/MyTicketsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { 
        requiresAuth: true,
        requiredRoles: [Role.ORGANIZER, Role.ADMIN]
      },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/pages/AdminPage.vue'),
      meta: { 
        requiresAuth: true,
        requiredRoles: [Role.ADMIN]
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  // Check if route requires specific roles
  // Note: user might not be loaded yet on initial page load
  if (to.meta.requiredRoles && authStore.isAuthenticated) {
    if (!authStore.user) {
      // User not loaded yet, allow navigation and let the component handle auth
      next()
      return
    }
    
    const hasRequiredRole = (to.meta.requiredRoles as Role[]).some((role: Role) => 
      authStore.user?.roles.includes(role)
    )
    
    if (!hasRequiredRole) {
      next('/')
      return
    }
  }
  
  next()
})

export default router
