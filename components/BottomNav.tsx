'use client';

import { Calendar, Moon, BookOpen, Quote, Settings } from 'lucide-react';
import { TabType } from '@/app/[locale]/page';
import { useTranslations } from 'next-intl';

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
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-4 bg-black/80 backdrop-blur-xl border-t border-white/[0.05]">
            <div className="max-w-md mx-auto flex justify-around items-center">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-16 group ${isActive ? 'text-white' : 'text-zinc-500'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                                <tab.icon
                                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-105' : 'scale-100'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                {t(tab.label)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
