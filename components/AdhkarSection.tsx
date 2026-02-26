'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { RotateCcw, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, localizeDigits } from '@/lib/utils';
import adhkarData from '@/data/adhkar.json';

interface AdhkarCounter {
    [key: number]: number;
}

export default function AdhkarSection() {
    const t = useTranslations();
    const locale = useLocale();
    const [counters, setCounters] = useState<AdhkarCounter>({});
    const [selectedCategory, setSelectedCategory] = useState<string>('morning');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const categories = [
        { id: 'morning', label: t('adhkar.morning') },
        { id: 'evening', label: t('adhkar.evening') },
        { id: 'afterPrayer', label: t('adhkar.afterPrayer') },
        { id: 'beforeIftar', label: t('adhkar.beforeIftar') },
        { id: 'afterIftar', label: t('adhkar.afterIftar') },
        { id: 'beforeSuhoor', label: t('adhkar.beforeSuhoor') },
    ];

    const filteredAdhkar = adhkarData.filter((dhikr) => dhikr.category === selectedCategory);

    const incrementCounter = (id: number, max: number) => {
        setCounters((prev) => {
            const current = prev[id] || 0;
            return { ...prev, [id]: current >= max ? max : current + 1 };
        });
    };

    const resetCounter = (id: number) => {
        setCounters((prev) => ({ ...prev, [id]: 0 }));
    };

    const copyToClipboard = async (id: number, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            if ((window as any).showRamadanNotification) {
                (window as any).showRamadanNotification('Copied', 'Athkar copied to clipboard.', 'success');
            }
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <div className="space-y-8 animate-spring pb-24 max-w-2xl mx-auto px-2 py-4">

            <div className="text-center space-y-3 mb-8">
                <h2 className="text-4xl font-black text-white tracking-tight">{t('adhkar.title')}</h2>
                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                "ios-pill transition-all duration-300 premium-trigger haptic-feedback",
                                selectedCategory === category.id
                                    ? "bg-amber-500 text-black border-amber-500/50 shadow-lg shadow-amber-500/10"
                                    : "text-white/30 hover:text-white border-white/5"
                            )}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredAdhkar.map((dhikr, idx) => {
                    const currentCount = counters[dhikr.id] || 0;
                    const isComplete = currentCount >= dhikr.repetitions;
                    const textToCopy = locale === 'ar' ? dhikr.textAr : dhikr.textEn;

                    return (
                        <motion.div
                            key={dhikr.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                "premium-card p-8 group relative overflow-hidden transition-all duration-500",
                                isComplete ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : 'premium-trigger'
                            )}
                        >
                            <div className="flex items-start justify-between mb-8 gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="ios-pill text-amber-500 bg-amber-500/5 border-amber-500/10">
                                            {locale === 'ar' ? dhikr.titleAr : dhikr.titleEn}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(dhikr.id, textToCopy)}
                                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/10 hover:text-white transition-colors haptic-feedback premium-trigger"
                                        >
                                            {copiedId === dhikr.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <p className={cn(
                                        "text-2xl font-bold leading-relaxed tracking-tight",
                                        locale === 'ar' ? 'text-white font-arabic text-right' : 'text-zinc-200'
                                    )} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                        {textToCopy}
                                    </p>
                                    <div className="text-[10px] text-white/10 font-bold uppercase tracking-widest">{dhikr.reference}</div>
                                </div>
                                {isComplete && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0"
                                    >
                                        <Check className="w-5 h-5 text-black" strokeWidth={3} />
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => incrementCounter(dhikr.id, dhikr.repetitions)}
                                    disabled={isComplete}
                                    className={cn(
                                        "w-full py-10 rounded-[32px] border flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden group",
                                        isComplete ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/5 text-white hover:bg-white/[0.07] hover:border-amber-500/30"
                                    )}
                                >
                                    {!isComplete && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(currentCount / dhikr.repetitions) * 100}%` }}
                                            className="absolute bottom-0 left-0 h-1 bg-amber-500/30 transition-all"
                                        />
                                    )}

                                    <span className="flex items-center justify-center gap-2 relative z-10 font-black text-4xl tabular-nums">
                                        {locale === 'ar' ? localizeDigits(currentCount) : currentCount} <span className="text-white/20 text-2xl">/</span> {locale === 'ar' ? localizeDigits(dhikr.repetitions) : dhikr.repetitions}
                                    </span>
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => resetCounter(dhikr.id)}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-white/20 hover:text-white transition-all haptic-feedback premium-trigger"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
