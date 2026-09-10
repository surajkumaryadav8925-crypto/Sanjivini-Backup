// Network Status Hook
'use client';

import { useState, useEffect, useRef } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    
    const updateStatus = () => {
      setStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || null,
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null,
      });
    };

    const handleOnline = () => setStatus(s => ({ ...s, isOnline: true }));
    const handleOffline = () => setStatus(s => ({ ...s, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (connection) {
      connection.addEventListener('change', updateStatus);
      updateStatus();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return status;
}

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

// Check if connection is slow
export function useSlowConnection(): boolean {
  const { effectiveType, downlink } = useNetworkStatus();
  return effectiveType === '2g' || effectiveType === 'slow-2g' || (downlink !== null && downlink < 1);
}

// Hook to retry operations when back online
export function useOnlineEffect(callback: () => void, dependencies: unknown[] = []) {
  const { isOnline } = useNetworkStatus();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (isOnline) {
      callbackRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, ...dependencies]);
}
