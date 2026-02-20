// Notification utilities
export interface NotificationSettings {
    enabled: boolean;
    suhoorMinutes: number;
    iftarEnabled: boolean;
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

export function showNotification(title: string, body: string, icon?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'ramadan-hub',
            requireInteraction: true,
        });
    }
}

export function scheduleNotification(
    title: string,
    body: string,
    targetTime: Date
) {
    const now = new Date();
    const delay = targetTime.getTime() - now.getTime();

    if (delay > 0) {
        setTimeout(() => {
            showNotification(title, body);
        }, delay);
    }
}

// Generate ICS file for calendar export
export function generateICSFile(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date
): string {
    const formatDate = (date: Date) => {
        return date
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}/, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ramadan Hub//EN
BEGIN:VEVENT
UID:${Date.now()}@ramadanhub.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

    return icsContent;
}

export function downloadICSFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
