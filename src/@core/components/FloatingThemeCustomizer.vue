<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import type { ThemeSwitcherTheme } from '@layouts/types'

const dialog = ref(false)
const theme = useTheme()

const colors = [
  '#7367F0',  // Purple (Default)
  '#28C76F',  // Green
  '#EA5455',  // Red
  '#FF9F43',  // Orange
  '#00CFE8',  // Blue
  '#A8AAAE',  // Gray
]

const setThemeColor = (color: string) => {
  if (theme.current.value.dark) {
    theme.themes.value.dark.colors.primary = color
  } else {
    theme.themes.value.light.colors.primary = color
  }
}

const themes: ThemeSwitcherTheme[] = [
  {
    name: 'light',
    icon: 'ri-sun-line',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
  },
]

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<template>
  <div class="floating-customizer">
    <VBtn
      icon
      color="primary"
      size="large"
      class="floating-button"
      @click="dialog = true"
    >
      <VIcon icon="ri-settings-4-line" />
    </VBtn>

    <VNavigationDrawer
      v-model="dialog"
      location="right"
      width="400"
      temporary
      class="customizer-drawer"
    >
      <div class="d-flex justify-space-between align-center pa-4">
        <h6 class="text-h6 mb-0">
          Theme Customizer
        </h6>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="dialog = false"
        >
          <VIcon icon="ri-close-line" />
        </VBtn>
      </div>

      <VDivider />

      <div class="pa-4">
        <h6 class="text-h6 mb-4">
            Theme Mode
          </h6>
          <div class="d-flex gap-3">
            <VBtn
              variant="outlined"
              :color="!theme.global.current.value.dark ? 'primary' : undefined"
              class="flex-1 theme-btn"
              :class="{ 'active-theme': !theme.global.current.value.dark }"
              @click="theme.global.name.value = 'light'"
            >
              <VIcon
                icon="ri-sun-line"
                class="me-2"
              />
              Light
            </VBtn>
            <VBtn
              variant="outlined"
              :color="theme.global.current.value.dark ? 'primary' : undefined"
              class="flex-1 theme-btn"
              :class="{ 'active-theme': theme.global.current.value.dark }"
              @click="theme.global.name.value = 'dark'"
            >
              <VIcon
                icon="ri-moon-clear-line"
                class="me-2"
              />
              Dark
            </VBtn>
          </div>

          <h6 class="text-h6 mt-6 mb-4">
            Primary Color
          </h6>
          <div class="d-flex flex-wrap gap-3">
            <div
              v-for="color in colors"
              :key="color"
              class="color-radio"
              :style="{ backgroundColor: color }"
              :class="{ 'selected': theme.current.value.colors.primary === color }"
              @click="setThemeColor(color)"
            />
          </div>
      </div>
    </VNavigationDrawer>
  </div>
</template>

<style lang="scss" scoped>
.floating-customizer {
  position: fixed;
  top: 100px;
  right: 0;
  z-index: 1003;
}

.customizer-drawer {
  z-index: 1002;
  
  :deep(.v-navigation-drawer__content) {
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 5px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 5px;
    }
  }
}

:deep(.v-overlay__content) {
  width: 100%;
  height: 100%;
}

.floating-button {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.color-radio {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.05);
  }

  &.selected::after {
    content: "✓";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 20px;
  }
}

.flex-1 {
  flex: 1;
}

.theme-btn {
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-border-color), 0.22);
  
  &.active-theme {
    border-width: 2px;
    transform: scale(1.02);
    background-color: rgb(var(--v-theme-primary));
    color: white;
    border-color: rgb(var(--v-theme-primary));
    
    &::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 6px;
      border: 2px solid rgb(var(--v-theme-primary));
      opacity: 0.3;
    }

    .v-icon {
      color: rgb(var(--v-theme-on-primary));
    }
  }

  &:not(.active-theme) {
    opacity: 0.8;
    color: white;
    
    &:hover {
      opacity: 1;
      border-color: rgb(var(--v-theme-primary));
    }
  }
}
</style>
