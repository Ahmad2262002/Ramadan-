'use client';

import { Calendar, Moon, BookOpen, Quote, Settings } from 'lucide-react';
import { TabType } from '@/app/[locale]/page';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const t = useTranslations('nav');

    const tabs: { id: TabType; icon: any; label: string }[] = [
        { id: 'today', icon: Moon, label: 'today' },
        { id: 'imsakiyah', icon: Calendar, label: 'imsakiyah' },
        { id: 'adhkar', icon: BookOpen, label: 'adhkar' },
        { id: 'hadith', icon: Quote, label: 'hadith' },
        { id: 'settings', icon: Settings, label: 'settings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-black/60 backdrop-blur-2xl border-t border-white/[0.05] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
            <div className="max-w-md mx-auto flex justify-around items-center">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 transition-all duration-300 w-16 group haptic-feedback",
                                isActive ? 'text-white' : 'text-zinc-500'
                            )}
                        >
                            <div className={cn(
                                "p-2.5 rounded-2xl transition-all duration-300 relative overflow-hidden premium-trigger",
                                isActive ? 'bg-white/10 shadow-inner' : 'bg-transparent'
                            )}>
                                <Icon
                                    className={cn("w-5 h-5 transition-transform duration-300", isActive ? 'scale-110' : 'scale-100')}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                                isActive ? 'text-white' : 'text-zinc-600'
                            )}>
                                {t(tab.label)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
