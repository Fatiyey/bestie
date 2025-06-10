import { ref } from 'vue'

interface SnackbarOptions {
  timeout?: number
  location?: 'top' | 'bottom'
}

export const useNotification = () => {
  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('success')
  const snackbarTimeout = ref(3000)
  const snackbarLocation = ref<'top' | 'bottom'>('top')
  
  const showSnackbar = (message: string, color: 'success' | 'error' | 'warning' | 'info' = 'success', options: SnackbarOptions = {}) => {
    snackbarMessage.value = message
    snackbarColor.value = color
    if (options.timeout) {
      snackbarTimeout.value = options.timeout
    }
    if (options.location) {
      snackbarLocation.value = options.location
    }
    snackbar.value = true
  }

  const hideSnackbar = () => {
    snackbar.value = false
  }

  return {
    snackbar,
    snackbarMessage,
    snackbarColor,
    snackbarTimeout,
    snackbarLocation,
    showSnackbar,
    hideSnackbar
  }
}
