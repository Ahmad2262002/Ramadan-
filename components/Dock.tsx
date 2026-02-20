'use client';

import { motion } from 'framer-motion';
import { Home, Calendar, BookOpen, Quote, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabType } from '@/app/[locale]/page';
import { useTranslations } from 'next-intl';

interface DockProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function Dock({ activeTab, onTabChange }: DockProps) {
    const t = useTranslations('nav');
    const items: { id: TabType; icon: any; label: string }[] = [
        { id: 'today', icon: Home, label: t('home') },
        { id: 'imsakiyah', icon: Calendar, label: t('calendar') },
        { id: 'adhkar', icon: BookOpen, label: t('athkar') },
        { id: 'hadith', icon: Quote, label: t('hadith') },
        { id: 'settings', icon: Settings, label: t('settings') },
    ];

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 md:hidden w-full max-w-[360px] px-6">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="luxury-glass rounded-[3rem] p-2 flex items-center justify-between gap-1 shadow-spatial border border-white/10 relative overflow-hidden group/dock"
            >
                {/* Floating shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />

                {items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => {
                                if (activeTab === item.id) {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    onTabChange(item.id);
                                }
                            }}
                            whileHover={{ scale: 1.15, y: -5 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                "relative flex items-center justify-center w-14 h-14 rounded-[1.5rem] transition-all duration-700",
                                isActive ? "bg-amber-500 text-black shadow-[0_10px_20px_rgba(245,158,11,0.3)]" : "text-white/30 hover:text-white group-hover/dock:opacity-100"
                            )}
                        >
                            <item.icon className="w-6 h-6" strokeWidth={2.2} />

                            {isActive && (
                                <motion.div
                                    layoutId="dock-indicator"
                                    className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
