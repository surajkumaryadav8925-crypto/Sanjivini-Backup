// Healthcare Notification Types and Interfaces
export type NotificationType = 'appointment' | 'medicine' | 'follow_up' | 'diagnostic' | 'referral' | 'emergency' | 'general';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface HealthNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Demo notifications with realistic healthcare scenarios
export const demoNotifications: HealthNotification[] = [
  {
    id: 'notif-001',
    title: 'OPD Appointment Reminder',
    message: 'Your appointment with Dr. Anita Singh at District Hospital is scheduled for tomorrow at 10:00 AM.',
    type: 'appointment',
    priority: 'high',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/patient/opd',
  },
  {
    id: 'notif-002',
    title: 'Medicine Reminder',
    message: 'Time to take your prescribed medication - Metformin 500mg after lunch.',
    type: 'medicine',
    priority: 'medium',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/patient/medicines',
  },
  {
    id: 'notif-003',
    title: 'Follow-up Reminder',
    message: 'Your follow-up visit is due in 3 days. Please book an appointment.',
    type: 'follow_up',
    priority: 'medium',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/patient/opd',
  },
  {
    id: 'notif-004',
    title: 'Diagnostic Report Ready',
    message: 'Your CBC test results from District Hospital Bhagalpur are now available.',
    type: 'diagnostic',
    priority: 'high',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/patient/diagnostics',
  },
  {
    id: 'notif-005',
    title: 'Health Record Updated',
    message: 'A new medical record has been added to your health profile.',
    type: 'general',
    priority: 'low',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: '/patient/records',
  },
  {
    id: 'notif-006',
    title: 'Referral Notification',
    message: 'You have been referred to Cardiology at District Hospital. Appointment scheduled for next week.',
    type: 'referral',
    priority: 'medium',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: '/patient/opd',
  },
  {
    id: 'notif-007',
    title: 'Emergency Alert',
    message: 'Air quality alert: Sensitive groups should limit outdoor activities.',
    type: 'emergency',
    priority: 'critical',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: '/patient/emergency',
  },
  {
    id: 'notif-008',
    title: 'Health Tip',
    message: 'Remember to stay hydrated and maintain a balanced diet for better health.',
    type: 'general',
    priority: 'low',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];