import { create } from "zustand"

export type NotificationType = "success" | "error" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }))

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, 4000)
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))

