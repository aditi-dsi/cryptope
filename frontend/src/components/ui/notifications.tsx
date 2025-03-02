"use client"

import { useNotificationStore } from "@/stores/notification-store"
import { Notification } from "./notification"

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

