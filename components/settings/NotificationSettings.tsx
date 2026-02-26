'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { localizeDigits } from '@/lib/utils';

interface NotificationSettingsProps {
    notifications: boolean;
    suhoorOffset: number;
    onUpdate: (updates: any) => void;
    onRequestPermission: () => void;
}

export function NotificationSettings({ notifications, suhoorOffset, onUpdate, onRequestPermission }: NotificationSettingsProps) {
    const t = useTranslations('settings');
    const locale = useLocale();

    return (
        <div className="space-y-3">
            <h4 className="px-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('alerts')}</h4>
            <div className="premium-card overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <Bell className="w-4 h-4 text-vibrant-amber" />
                        </div>
                        <span className="font-bold text-sm text-white/80">{t('pushAlerts')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer haptic-feedback">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications}
                            onChange={(e) => {
                                const newState = e.target.checked;
                                onUpdate({ notifications: newState });
                                if (newState) onRequestPermission();
                            }}
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                    </label>
                </div>

                <AnimatePresence>
                    {notifications && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-6 pt-2 space-y-6 border-t border-white/[0.03] bg-white/[0.01]"
                        >
                            <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                                <span>{t('suhoorBuffer')}</span>
                                <span className="text-vibrant-amber">{locale === 'ar' ? localizeDigits(suhoorOffset) : suhoorOffset} {t('minutesBeforeFajr')}</span>
                            </div>
                            <input
                                type="range"
                                min="10" max="90" step="5"
                                value={suhoorOffset}
                                onChange={(e) => onUpdate({ suhoorOffset: parseInt(e.target.value) })}
                                className="w-full h-1 bg-white/5 rounded-full appearance-none accent-vibrant-amber cursor-pointer"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
