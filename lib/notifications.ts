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

export function playBeep() {
    if (typeof window === 'undefined') return;

    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Play beep 10 times (10 seconds)
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 10) {
                clearInterval(interval);
                return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // High pitch beep

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

            count++;
        }, 1000);
    } catch (e) {
        console.warn('Audio feedback failed:', e);
    }
}

export function showNotification(title: string, body: string, icon?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'ramadan-hub',
            requireInteraction: true,
        });
        playBeep();
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
