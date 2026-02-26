'use client';

import { Clock, Plus, Minus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { localizeDigits } from '@/lib/utils';

interface PrayerOffsetsProps {
    offsets: {
        fajr: number;
        dhuhr: number;
        asr: number;
        maghrib: number;
        isha: number;
    };
    onUpdate: (updates: any) => void;
}

export function PrayerOffsets({ offsets, onUpdate }: PrayerOffsetsProps) {
    const t = useTranslations();
    const locale = useLocale();

    const updateOffset = (prayer: string, delta: number) => {
        const newOffsets = { ...offsets, [prayer]: (offsets as any)[prayer] + delta };
        onUpdate({ offsets: newOffsets });
    };

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    return (
        <div className="space-y-4">
            <h4 className="px-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('settings.offsets')}</h4>
            <div className="premium-card p-6 space-y-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-loose">
                    {t('settings.offsetsSubtitle')}
                </p>
                <div className="grid grid-cols-1 gap-3">
                    {prayers.map((prayer) => (
                        <div key={prayer} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-amber-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                    <Clock className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-white/80">{t(`settings.${prayer}Adjustment`)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => updateOffset(prayer, -1)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all haptic-feedback"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-black text-white w-8 text-center tabular-nums">
                                    {locale === 'ar'
                                        ? ((offsets as any)[prayer] > 0 ? `+${localizeDigits((offsets as any)[prayer])}` : localizeDigits((offsets as any)[prayer]))
                                        : ((offsets as any)[prayer] > 0 ? `+${(offsets as any)[prayer]}` : (offsets as any)[prayer])}
                                </span>
                                <button
                                    onClick={() => updateOffset(prayer, 1)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-500 transition-all haptic-feedback"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
