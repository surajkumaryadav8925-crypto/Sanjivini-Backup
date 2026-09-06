"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Bell, Calendar, Pill, Stethoscope, FlaskConical, FileText, AlertCircle, Info, Check, X, Filter } from "lucide-react";
import { useNotificationStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import type { NotificationType } from "@/data/notifications";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  appointment: <Calendar className="h-5 w-5 text-blue-600" />,
  medicine: <Pill className="h-5 w-5 text-purple-600" />,
  follow_up: <Stethoscope className="h-5 w-5 text-teal-600" />,
  diagnostic: <FlaskConical className="h-5 w-5 text-cyan-600" />,
  referral: <FileText className="h-5 w-5 text-amber-600" />,
  emergency: <AlertCircle className="h-5 w-5 text-red-600" />,
  general: <Info className="h-5 w-5 text-muted-foreground" />,
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

const priorityColors = {
  low: "bg-gray-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");

  const { notifications, markAsRead, markAllAsRead, dismissNotification } = useNotificationStore();

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string, read: boolean, actionUrl?: string) => {
    if (!read) {
      markAsRead(id);
    }
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const filterOptions: { value: "all" | "unread" | NotificationType; label: string }[] = [
    { value: "all", label: t("notifications.filterAll") },
    { value: "unread", label: t("notifications.unread") },
    { value: "appointment", label: t("notifications.types.appointment") },
    { value: "medicine", label: t("notifications.types.medicine") },
    { value: "follow_up", label: t("notifications.types.follow_up") },
    { value: "diagnostic", label: t("notifications.types.diagnostic") },
    { value: "referral", label: t("notifications.types.referral") },
    { value: "emergency", label: t("notifications.types.emergency") },
    { value: "general", label: t("notifications.types.general") },
  ];

  const introText = `${t("notifications.title")}. ${t("notifications.pageDesc")}`;

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            {t("notifications.title")}
          </h1>
          <SpeakButton text={introText} />
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()} className="gap-2">
            <Check className="h-4 w-4" />
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("notifications.filter")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950/20">
        <CardContent className="flex items-center gap-3 py-3">
          <Badge variant="default" className="bg-blue-500">{unreadCount}</Badge>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t("notifications.unreadCount")}
          </p>
        </CardContent>
      </Card>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">{t("notifications.empty")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "unread" ? t("notifications.allRead") : t("notifications.noNotifications")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.read
                  ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/10"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${typeBgColors[notification.type]}`}>
                    {typeIcons[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${!notification.read ? "text-foreground dark:text-foreground" : "text-muted-foreground dark:text-muted-foreground"}`}>
                          {notification.title}
                        </h3>
                        <div className={`h-2 w-2 rounded-full ${priorityColors[notification.priority]}`} title={t(`notifications.priority.${notification.priority}`)} />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {notification.actionUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotificationClick(notification.id, notification.read, notification.actionUrl)}
                          className="gap-1"
                        >
                          {t("notifications.viewAction")}
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="gap-1 text-blue-600"
                        >
                          <Check className="h-4 w-4" />
                          {t("notifications.markRead")}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                        {t("notifications.dismiss")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

