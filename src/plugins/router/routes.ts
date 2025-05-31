export const routes = [
  { path: '/', redirect: '/login' }, // Ubah redirect default ke /login
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/features/home/views/HomePage.vue'),
        meta: { requiresAuth: true }, // Tambahkan meta field
      },
      {
        path: 'account-settings',
        component: () => import('@/features/account-settings/views/AccountSettingsPage.vue'),
        meta: { requiresAuth: true }, // Tambahkan meta field
      },
      {
        path: 'chat',
        component: () => import('@/features/chat/views/ChatPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'typography',
        component: () => import('@/pages/typography.vue'),
      },
      {
        path: 'icons',
        component: () => import('@/pages/icons.vue'),
      },
      {
        path: 'cards',
        component: () => import('@/features/cardsDemo/views/CardsDemoPage.vue'),
      },
      {
        path: 'tables',
        component: () => import('@/features/tablesDemo/views/TablesDemoPage.vue'),
      },
      {
        path: 'form-layouts',
        component: () => import('@/pages/form-layouts.vue'),
      },
      {
        path: 'datatables',
        component: () => import('@/pages/datatables.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'users',
        component: () => import('@/features/users/views/UsersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'members',
        component: () => import('@/features/members/views/MembersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'visitors',
        component: () => import('@/features/visitors/views/VisitorsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'whatsapp-settings',
        component: () => import('@/features/visitors/views/WhatsAppSettingsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'templates',
        component: () => import('@/features/message-templates/views/TemplatesPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    children: [
      {
        path: 'login',
        component: () => import('@/features/auth/views/LoginPage.vue'),
        meta: { guestOnly: true }, // Tambahkan meta field
      },
      {
        path: 'register',
        component: () => import('@/features/auth/views/RegisterPage.vue'),
        meta: { guestOnly: true }, // Tambahkan meta field
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/pages/[...error].vue'),
      },
    ],
  },
]
