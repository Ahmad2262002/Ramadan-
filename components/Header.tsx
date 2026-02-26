'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, MoonStar, Languages, Calendar, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { TabType } from '@/app/[locale]/page';
import { useNotifications } from '@/context/NotificationContext';

interface HeaderProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const { unreadCount, markAllAsRead, setIsPanelOpen, isPanelOpen } = useNotifications();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'ar' : 'en';
        router.replace(pathname.replace(`/${locale}`, `/${newLocale}`));
    };

    const toggleNotifications = () => {
        if (!isPanelOpen) markAllAsRead();
        setIsPanelOpen(!isPanelOpen);
    };

    const navItems: { id: TabType; label: string }[] = [
        { id: 'today', label: t('nav.home') },
        { id: 'adhkar', label: t('nav.athkar') },
        { id: 'imsakiyah', label: t('nav.calendar') },
        { id: 'hadith', label: t('nav.guidance') },
        { id: 'settings', label: t('nav.settings') }
    ];

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-8 left-0 right-0 z-50 hidden md:flex justify-center px-6 pointer-events-none"
        >
            <motion.nav
                layout
                className={cn(
                    "pointer-events-auto flex items-center justify-between gap-8 px-8 py-3 rounded-[3rem] luxury-glass transition-all duration-1000 border border-white/10 shadow-spatial overflow-hidden",
                    scrolled ? "bg-black/95 scale-95 shadow-amber-500/10" : "w-full max-w-3xl"
                )}
            >
                {/* Brand / Logo */}
                <button
                    onClick={() => {
                        onTabChange('today');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-4 group"
                >
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-[1.25rem] bg-amber-500/[0.07] border border-amber-500/20 flex items-center justify-center shadow-lg relative overflow-hidden group-hover:border-amber-500/40 transition-colors"
                    >
                        <img
                            src="/favicon.ico"
                            alt="Logo"
                            className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>

                    <AnimatePresence>
                        {!scrolled && (
                            <motion.div
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="flex flex-col text-left"
                            >
                                <span className="text-[12px] font-black text-white uppercase tracking-[0.3em] leading-none mb-1">Ramadan</span>
                                <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.5em]">Hub Luxe</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {/* PC Menu Items */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (activeTab === item.id) {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    onTabChange(item.id);
                                }
                            }}
                            aria-label={item.label}
                            aria-current={activeTab === item.id ? 'page' : undefined}
                            className={cn(
                                "text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 relative group/link px-3 py-2 rounded-xl haptic-feedback",
                                activeTab === item.id ? "text-amber-500" : "text-white/30 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.label}
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="p-2.5 rounded-2xl hover:bg-white/5 transition-all group premium-trigger haptic-feedback"
                        title={locale === 'en' ? 'Arabic' : 'English'}
                    >
                        <Languages className="w-4 h-4 text-white/30 group-hover:text-amber-500 transition-colors" />
                    </button>

                    <div className="w-px h-5 bg-white/10 mx-1" />

                    <button
                        onClick={toggleNotifications}
                        aria-label={t('nav.settings')}
                        className={cn(
                            "p-2.5 rounded-2xl hover:bg-white/5 transition-all group relative premium-trigger haptic-feedback",
                            isPanelOpen && "bg-amber-500/[0.07] border-amber-500/20"
                        )}
                    >
                        <Bell className={cn("w-4 h-4 transition-all duration-500", (isPanelOpen || unreadCount > 0) ? "text-amber-500 scale-110" : "text-white/30 group-hover:text-white")} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,1)]" />
                        )}
                    </button>
                </div>
            </motion.nav>
        </motion.header>
    );
}
