<script lang="ts" setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
import { useAuthService } from '@/features/auth/services/authService'

const { authState } = useAuthService()
</script>

<template>
  <!-- 👉 Dashboards -->
  <VerticalNavGroup
    :item="{
      title: 'Dashboards',
      badgeContent: '5',
      badgeClass: 'bg-error',
      icon: 'ri-home-smile-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Analytics',
        to: '/dashboard',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'CRM',
        href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/dashboards/crm',
        target: '_blank',
        badgeContent: 'Pro',
        badgeClass: 'bg-light-primary text-primary',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'ECommerce',
        href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/dashboards/ecommerce',
        target: '_blank',
        badgeContent: 'Pro',
        badgeClass: 'bg-light-primary text-primary',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Academy',
        href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/dashboards/academy',
        target: '_blank',
        badgeContent: 'Pro',
        badgeClass: 'bg-light-primary text-primary',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Logistics',
        href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/demo-1/dashboards/logistics',
        target: '_blank',
        badgeContent: 'Pro',
        badgeClass: 'bg-light-primary text-primary',
      }"
    />
  </VerticalNavGroup>      <!-- 👉 Manajemen Kegiatan -->
  <VerticalNavGroup
    :item="{
      title: 'Manajemen Kegiatan',
      icon: 'ri-calendar-event-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Survei',
        to: '/manajemen-kegiatan/survei',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Periode',
        to: '/manajemen-kegiatan/periode',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Tipe Periode',
        to: '/manajemen-kegiatan/tipe-periode',
      }"
    />
  </VerticalNavGroup>


  <!-- 👉 Apps & Pages -->
  <VerticalNavSectionTitle
    :item="{
      heading: 'Pelayanan',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Chat',
      icon: 'ri-wechat-line',
      to: '/chat',
    }"
  /> 


  <VerticalNavLink
    :item="{
      title: 'Account Settings',
      icon: 'ri-user-settings-line',
      to: '/account-settings',
    }"
  />

  <VerticalNavLink
    v-if="authState.user"
    :item="{
      title: 'Users Management',
      icon: 'ri-team-line',
      to: '/users',
    }"
  />

  <VerticalNavLink
    v-if="authState.user"
    :item="{
      title: 'Members',
      icon: 'ri-user-star-line',
      to: '/members',
    }"
  />

  <VerticalNavLink
    v-if="authState.user"
    :item="{
      title: 'Visitors',
      icon: 'ri-user-follow-line',
      to: '/visitors',
    }"
  />

  <VerticalNavLink
    v-if="authState.user"
    :item="{
      title: 'WhatsApp Settings',
      icon: 'ri-whatsapp-line',
      to: '/whatsapp-settings',
    }"
  />

  <VerticalNavLink
    v-if="authState.user"
    :item="{
      title: 'Message Templates',
      icon: 'ri-message-3-line',
      to: '/templates',
    }"
  />

  <!-- Conditionally show Login/Register -->
  <template v-if="!authState.user">
    <VerticalNavLink
      :item="{
        title: 'Login',
        icon: 'ri-login-box-line',
        to: '/login',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Register',
        icon: 'ri-user-add-line',
        to: '/register',
      }"
    />
  </template>

  <VerticalNavLink
    :item="{
      title: 'Error',
      icon: 'ri-information-line',
      to: '/no-existence',
    }"
  />

  <!-- 👉 User Interface -->
  <VerticalNavSectionTitle
    :item="{
      heading: 'User Interface',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Typography',
      icon: 'ri-text',
      to: '/typography',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Icons',
      icon: 'ri-remixicon-line',
      to: '/icons',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Cards',
      icon: 'ri-bar-chart-box-line',
      to: '/cards',
    }"
  />

  <!-- 👉 Forms & Tables -->
   
  <VerticalNavSectionTitle
    :item="{
      heading: 'Forms & Tables',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Form Layouts',
      icon: 'ri-layout-4-line',
      to: '/form-layouts',
    }"
  />
<VerticalNavGroup
    :item="{
      title: 'Tables',
      // badgeContent: '5',
      // badgeClass: 'bg-error',
      icon: 'ri-table-alt-line',
    }"
  >
      <VerticalNavLink
    :item="{
      title: 'Simple Tables',
      // icon: 'bg-light-primary text-primary',
      to: '/tables',
    }"
    />
   
    <VerticalNavLink
    :item="{
      title: 'Data Tables',
      // icon: 'bg-light-primary text-primary',
      to: '/datatables',
    }"
    />
    </VerticalNavGroup>

</template>
