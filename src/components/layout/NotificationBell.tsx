"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Calendar, Pill, Stethoscope, FlaskConical, AlertCircle, Info, ChevronRight } from "lucide-react";
import { useNotificationStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import type { NotificationType } from "@/data/notifications";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  appointment: <Calendar className="h-4 w-4 text-blue-600" />,
  medicine: <Pill className="h-4 w-4 text-purple-600" />,
  follow_up: <Stethoscope className="h-4 w-4 text-teal-600" />,
  diagnostic: <FlaskConical className="h-4 w-4 text-cyan-600" />,
  referral: <ChevronRight className="h-4 w-4 text-amber-600" />,
  emergency: <AlertCircle className="h-4 w-4 text-red-600" />,
  general: <Info className="h-4 w-4 text-muted-foreground" />,
};

const typeBgColors: Record<NotificationType, string> = {
  appointment: "bg-blue-100 dark:bg-blue-900/30",
  medicine: "bg-purple-100 dark:bg-purple-900/30",
  follow_up: "bg-teal-100 dark:bg-teal-900/30",
  diagnostic: "bg-cyan-100 dark:bg-cyan-900/30",
  referral: "bg-amber-100 dark:bg-amber-900/30",
  emergency: "bg-red-100 dark:bg-red-900/30",
  general: "bg-muted dark:bg-muted",
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, read: boolean, actionUrl?: string) => {
    if (!read) {
      markAsRead(id);
    }
    setIsOpen(false);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label={t("notifications.title")}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium notification-badge-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border rounded-xl shadow-lg overflow-hidden z-50 notification-panel">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{t("notifications.title")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t("notifications.empty")}</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.read, notification.actionUrl)}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${typeBgColors[notification.type]}`}>
                      {typeIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-sm truncate ${!notification.read ? "text-foreground dark:text-foreground" : "text-muted-foreground dark:text-muted-foreground"}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t bg-muted/30">
            <Link
              href="/patient/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t("notifications.viewAll")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

