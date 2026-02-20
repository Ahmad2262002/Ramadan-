'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown, ChevronUp, Quote, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, localizeDigits } from '@/lib/utils';
import hadithData from '@/data/hadith.json';

export default function HadithSection() {
    const t = useTranslations();
    const locale = useLocale();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Dynamic Hadith of the day based on date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const dailyIndex = dayOfYear % hadithData.length;
    const hadithOfTheDay = hadithData[dailyIndex];

    return (
        <div className="space-y-8 animate-spring pb-24 max-w-2xl mx-auto px-2 py-4">

            <div className="text-center space-y-3 mb-8">
                <h2 className="text-4xl font-black text-white tracking-tight">{t('hadith.title')}</h2>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80">{t('hadith.subtitle')}</span>
                </div>
            </div>

            {/* Hadith of the Day Highlight */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card p-8 border-amber-500/20 bg-amber-500/[0.03] mb-12 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4">
                    <span className="ios-pill text-amber-500 border-amber-500/20 bg-amber-500/10 text-[10px]">
                        {t('hadith.hadithOfDay') || 'Hadith of the Day'}
                    </span>
                </div>
                <Quote className="absolute -left-4 -top-4 w-24 h-24 text-amber-500/[0.03] -rotate-12 pointer-events-none" />

                <div className="space-y-6 relative z-10">
                    <p className={cn(
                        "text-2xl font-bold leading-relaxed",
                        locale === 'ar' ? 'text-white font-arabic text-right' : 'text-zinc-100'
                    )} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                        {locale === 'ar' ? hadithOfTheDay.textAr : hadithOfTheDay.textEn}
                    </p>
                    <div className="flex items-center gap-3 pt-6 border-t border-amber-500/10">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <ScrollText className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-white/60 font-black text-[10px] uppercase tracking-widest">{hadithOfTheDay.narrator}</div>
                            <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">
                                {t('hadith.reference')}: {locale === 'ar' ? localizeDigits(hadithOfTheDay.reference) : hadithOfTheDay.reference}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-4">
                {hadithData.map((hadith, index) => {
                    const isExpanded = expandedId === hadith.id;
                    const text = locale === 'ar' ? hadith.textAr : hadith.textEn;
                    const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;

                    return (
                        <motion.div
                            key={hadith.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "premium-card p-8 relative group overflow-hidden",
                                isExpanded && 'border-amber-500/20 bg-amber-500/[0.02]'
                            )}
                        >
                            <Quote className="absolute -left-2 -top-2 w-20 h-20 text-white/[0.02] -rotate-12 pointer-events-none" />

                            <div className="relative z-10 space-y-10">
                                <p
                                    className={cn(
                                        "text-xl font-medium leading-relaxed tracking-tight",
                                        locale === 'ar' ? 'text-white font-arabic text-right' : 'text-zinc-200'
                                    )}
                                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                >
                                    {isExpanded ? text : preview}
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-8 border-t border-white/5">
                                    <div className="space-y-2">
                                        <div className="text-white/60 font-black text-[11px] uppercase tracking-widest">{hadith.narrator}</div>
                                        <div className="text-[10px] text-white/10 font-black uppercase tracking-[0.2em]">
                                            {t('hadith.reference')}: {locale === 'ar' ? localizeDigits(hadith.reference) : hadith.reference}
                                        </div>
                                    </div>

                                    {text.length > 200 && (
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : hadith.id)}
                                            className="flex items-center justify-center gap-2 group/btn ios-pill border-white/5 hover:border-amber-500/30 transition-all"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover/btn:text-white transition-colors">
                                                {isExpanded ? t('hadith.showLess') : t('hadith.showMore')}
                                            </span>
                                            {isExpanded ? (
                                                <ChevronUp className="w-3.5 h-3.5 text-white/20 group-hover/btn:text-white" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover/btn:text-white" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
