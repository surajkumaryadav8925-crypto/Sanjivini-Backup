"use client";

import { useSyncExternalStore } from "react";
import { useOfflineStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function SyncStatusBanner() {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const isSyncing = useOfflineStore((state) => state.isSyncing);
  const pendingOperations = useOfflineStore((state) => state.pendingOperations);
  const mounted = useIsHydrated();
  const { t } = useTranslation();

  const pendingCount = mounted ? pendingOperations.filter(op => op.status === "pending").length : 0;
  const failedCount = mounted ? pendingOperations.filter(op => op.status === "failed").length : 0;

  if (!mounted) {
    return null;
  }

  if (isOnline && !isSyncing && pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {!isOnline ? (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            {t("common.offlineMessage")}
          </span>
          {pendingCount > 0 && (
            <span className="bg-white/20 dark:bg-white/10 px-2 py-0.5 rounded text-sm">
              {pendingCount} {t("common.pending")}
            </span>
          )}
        </div>
      ) : isSyncing ? (
        <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">{t("common.syncingChanges")}</span>
        </div>
      ) : failedCount > 0 ? (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {failedCount} {t("common.syncFailed")}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function SyncIndicator() {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const isSyncing = useOfflineStore((state) => state.isSyncing);
  const pendingOperations = useOfflineStore((state) => state.pendingOperations);
  const mounted = useIsHydrated();
  const { t } = useTranslation();

  const pendingCount = mounted ? pendingOperations.filter(op => op.status === "pending").length : 0;
  const failedCount = mounted ? pendingOperations.filter(op => op.status === "failed").length : 0;

  if (!mounted) {
    return null;
  }

  if (isOnline && !isSyncing && pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
      !isOnline && "bg-amber-100 text-amber-700",
      isSyncing && "bg-blue-100 text-blue-700",
      failedCount > 0 && "bg-red-100 text-red-700",
      isOnline && !isSyncing && pendingCount > 0 && failedCount === 0 && "bg-muted text-muted-foreground"
    )}>
      {!isOnline && <WifiOff className="h-3 w-3" />}
      {isSyncing && <RefreshCw className="h-3 w-3 animate-spin" />}
      {isOnline && !isSyncing && pendingCount > 0 && failedCount === 0 && <Wifi className="h-3 w-3" />}
      {failedCount > 0 && <AlertTriangle className="h-3 w-3" />}
      
      {!isOnline && t("status.offline")}
      {isSyncing && t("status.syncing")}
      {isOnline && !isSyncing && pendingCount > 0 && failedCount === 0 && `${pendingCount} ${t("common.pending")}`}
      {failedCount > 0 && `${failedCount} ${t("common.failed")}`}
    </div>
  );
}
