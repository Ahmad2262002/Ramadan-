'use client';

import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CALCULATION_METHODS } from '@/lib/prayer-times';

interface CalculationSettingsProps {
    calculationMethod: number;
    onUpdate: (updates: any) => void;
}

export function CalculationSettings({ calculationMethod, onUpdate }: CalculationSettingsProps) {
    const t = useTranslations();

    return (
        <div className="space-y-3">
            <h4 className="px-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('settings.methodology')}</h4>
            <div className="premium-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <Globe className="w-4 h-4 text-vibrant-indigo" />
                        </div>
                        <span className="font-bold text-sm text-white/80">{t('settings.prayerEngine')}</span>
                    </div>
                    <div className="premium-card p-1 flex bg-white/5 border-white/5 max-w-[140px]">
                        <select
                            value={calculationMethod}
                            onChange={(e) => onUpdate({ calculationMethod: parseInt(e.target.value) })}
                            className="flex-1 bg-transparent text-[11px] font-black uppercase tracking-widest text-white/60 outline-none px-4 py-2 truncate"
                        >
                            {Object.entries(CALCULATION_METHODS).map(([name, id]) => (
                                <option key={id} value={id} className="bg-zinc-900">{t(`methods.${name}`) || name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
