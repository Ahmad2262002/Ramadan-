'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type NotificationType = 'prayer' | 'reminder' | 'success' | 'info';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (title: string, message: string, type?: NotificationType) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    unreadCount: number;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const addNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            type,
            timestamp: new Date(),
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);

        // Browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/icon-192.png',
            });
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const markAllAsRead = useCallback(() => {
        setUnreadCount(0);
    }, []);

    // Expose global helper for legacy/simple calls
    useEffect(() => {
        (window as any).showRamadanNotification = addNotification;
    }, [addNotification]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                removeNotification,
                clearAll,
                isPanelOpen,
                setIsPanelOpen,
                unreadCount,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
