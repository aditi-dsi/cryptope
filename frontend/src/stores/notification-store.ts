import { create } from "zustand"

export type NotificationType = "success" | "error" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number // Optional duration in milliseconds
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => string // Returns the ID
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    // Generate a more unique ID with timestamp
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const duration = notification.duration || 4000 // Default to 4 seconds if not specified

    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }))

    // Auto-dismiss after the specified duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }

    return id // Return the ID for potential future reference
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAllNotifications: () => set({ notifications: [] }),
}))

// Helper functions for common notification types
export const showSuccessNotification = (title: string, message: string, duration?: number) => {
  return useNotificationStore.getState().addNotification({
    type: "success",
    title,
    message,
    duration,
  })
}

export const showErrorNotification = (title: string, message: string, duration?: number) => {
  return useNotificationStore.getState().addNotification({
    type: "error",
    title,
    message,
    duration,
  })
}

export const showInfoNotification = (title: string, message: string, duration?: number) => {
  return useNotificationStore.getState().addNotification({
    type: "info",
    title,
    message,
    duration,
  })
}

