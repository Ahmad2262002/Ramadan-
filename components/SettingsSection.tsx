'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Bell, Globe, Save, ChevronRight, Check, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CALCULATION_METHODS } from '@/lib/prayer-times';
import { cn } from '@/lib/utils';

import { useRouter, usePathname } from 'next/navigation';
import { LocationSettings } from './settings/LocationSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { CalculationSettings } from './settings/CalculationSettings';
import { PrayerOffsets } from './settings/PrayerOffsets';

export default function SettingsSection() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations();
    const [settings, setSettings] = useState({
        locationMode: 'geo',
        highPrecision: true,
        city: '',
        country: '',
        calculationMethod: 5,
        notifications: true,
        suhoorOffset: 30, // Reminder buffer
        theme: 'auto',
        soundEnabled: true,
        offsets: {
            fajr: 0,
            dhuhr: 0,
            asr: 0,
            maghrib: 0,
            isha: 0
        }
    });
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('ramadan-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse settings', e);
            }
        }
    }, []);

    const handleUpdate = (updates: any) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        localStorage.setItem('ramadan-settings', JSON.stringify(settings));
        setIsSaved(true);

        // Real-time synchronization event
        window.dispatchEvent(new CustomEvent('ramadan-settings-updated', { detail: settings }));

        if ((window as any).showRamadanNotification) {
            (window as any).showRamadanNotification(t('settings.synchronized'), t('settings.saved'), 'success');
        }
        setTimeout(() => {
            setIsSaved(false);
            // window.location.reload(); // Removed reload for 100% dynamic feel
        }, 800);
    };

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'ar' : 'en';
        router.replace(pathname.replace(`/${locale}`, `/${newLocale}`));
    };


    const requestNotificationPermission = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') handleUpdate({ notifications: true });
            });
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-spring pb-32 px-2 py-4">

            <div className="text-center space-y-3 mb-10">
                <h2 className="text-4xl font-black text-white tracking-tight">{t('settings.title')}</h2>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80">{t('settings.preferencesSubtitle') || 'Preferences'}</span>
                </div>
            </div>

            {/* High Precision Mode - Feature Card */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpdate({ highPrecision: !settings.highPrecision })}
                className={cn(
                    "w-full premium-card p-6 flex items-center justify-between group transition-all overflow-hidden",
                    settings.highPrecision ? "border-amber-500/20 bg-amber-500/[0.03]" : "border-white/5 bg-white/[0.02]"
                )}
            >
                <div className="flex items-center gap-5 text-left relative z-10">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shadow-inner transition-colors",
                        settings.highPrecision ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-white/5 border-white/10 text-white/20"
                    )}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-lg leading-tight uppercase tracking-tight">{t('settings.highPrecision')}</h3>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{t('settings.highPrecisionSubtitle')}</p>
                    </div>
                </div>
                <div className={cn(
                    "w-12 h-6 rounded-full border transition-all relative",
                    settings.highPrecision ? "bg-amber-500/20 border-amber-500/30" : "bg-white/5 border-white/10"
                )}>
                    <motion.div
                        animate={{ x: settings.highPrecision ? 24 : 4 }}
                        className={cn(
                            "w-4 h-4 rounded-full mt-1",
                            settings.highPrecision ? "bg-amber-500" : "bg-white/20"
                        )}
                    />
                </div>
            </motion.button>

            {/* Preferences Section */}
            <div className="space-y-4">
                <h4 className="px-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('settings.preferencesSubtitle')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="premium-card p-4 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-xs font-bold text-white/80">{locale === 'en' ? 'Arabic' : 'English'}</span>
                        </div>
                        <span className="text-[10px] font-black text-white/20">{locale.toUpperCase()}</span>
                    </button>

                    {/* Sound Toggle */}
                    <button
                        onClick={() => handleUpdate({ soundEnabled: !settings.soundEnabled })}
                        className={cn(
                            "premium-card p-4 flex items-center justify-between group",
                            settings.soundEnabled ? "border-amber-500/20 bg-amber-500/[0.02]" : ""
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                settings.soundEnabled ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-white/20"
                            )}>
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white/80">{t('settings.audioAlerts')}</span>
                        </div>
                        <div className={cn(
                            "w-8 h-4 rounded-full border transition-all relative",
                            settings.soundEnabled ? "bg-amber-500/20 border-amber-500/30" : "bg-white/5 border-white/10"
                        )}>
                            <motion.div
                                animate={{ x: settings.soundEnabled ? 16 : 4 }}
                                className={cn(
                                    "w-2 h-2 rounded-full mt-0.5",
                                    settings.soundEnabled ? "bg-amber-500" : "bg-white/20"
                                )}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-10">
                <LocationSettings
                    locationMode={settings.locationMode}
                    city={settings.city}
                    country={settings.country}
                    onUpdate={handleUpdate}
                />

                <CalculationSettings
                    calculationMethod={settings.calculationMethod}
                    onUpdate={handleUpdate}
                />

                <PrayerOffsets
                    offsets={settings.offsets}
                    onUpdate={handleUpdate}
                />

                <NotificationSettings
                    notifications={settings.notifications}
                    suhoorOffset={settings.suhoorOffset}
                    onUpdate={handleUpdate}
                    onRequestPermission={requestNotificationPermission}
                />
            </div>

            {/* Save Action */}
            <div className="pt-10">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaved}
                    className={cn(
                        "w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
                        isSaved ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 border border-white/5 text-white/40 hover:text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/20"
                    )}
                >
                    {isSaved ? <Check className="w-5 h-5" strokeWidth={3} /> : <Save className="w-4 h-4" />}
                    {isSaved ? t('settings.synchronized') : t('settings.applyEvolution')}
                </motion.button>
            </div>
        </div>
    );
}
