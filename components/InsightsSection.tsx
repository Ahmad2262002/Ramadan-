'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Lightbulb, Gift, ScrollText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import insightsData from '@/data/insights.json';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function InsightsSection() {
    const t = useTranslations('insights');
    const locale = useLocale();
    const [dailyData, setDailyData] = useState<{ deed: any; fact: any } | null>(null);

    useEffect(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

        const deedIndex = dayOfYear % insightsData.deeds.length;
        const factIndex = dayOfYear % insightsData.facts.length;

        setDailyData({
            deed: insightsData.deeds[deedIndex],
            fact: insightsData.facts[factIndex]
        });
    }, []);

    if (!dailyData) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 max-w-4xl mx-auto px-4 py-8">
            {/* Daily Deed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card p-8 bg-amber-500/[0.03] border-amber-500/20 relative overflow-hidden group"
            >
                <div className="absolute -right-6 -bottom-6 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Gift className="w-32 h-32 text-amber-500" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-lg leading-tight uppercase tracking-tight">{t('dailyDeed')}</h3>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{t('smallActionBigReward')}</p>
                    </div>
                </div>

                <p className={cn(
                    "text-xl font-bold leading-relaxed text-zinc-100 relative z-10",
                    locale === 'ar' ? 'font-arabic text-right' : ''
                )}>
                    {locale === 'ar' ? dailyData.deed.textAr : dailyData.deed.textEn}
                </p>
            </motion.div>

            {/* Ramadan Fact */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="premium-card p-8 bg-blue-500/[0.03] border-blue-500/20 relative overflow-hidden group"
            >
                <div className="absolute -right-6 -bottom-6 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Lightbulb className="w-32 h-32 text-blue-500" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-lg leading-tight uppercase tracking-tight">{t('didYouKnow')}</h3>
                        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{t('learnAndGrow')}</p>
                    </div>
                </div>

                <p className={cn(
                    "text-xl font-bold leading-relaxed text-zinc-100 relative z-10",
                    locale === 'ar' ? 'font-arabic text-right' : ''
                )}>
                    {locale === 'ar' ? dailyData.fact.textAr : dailyData.fact.textEn}
                </p>
            </motion.div>

            {/* Spriritual Sparkle - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 premium-card p-10 bg-gradient-to-br from-emerald-500/[0.05] to-teal-500/[0.05] border-emerald-500/20 text-center relative overflow-hidden"
            >
                <Sparkles className="absolute left-6 top-6 w-12 h-12 text-emerald-500/10" />
                <Sparkles className="absolute right-6 bottom-6 w-12 h-12 text-teal-500/10" />

                <div className="max-w-xl mx-auto space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">{t('ramadanSpirit')}</h4>
                    <p className={cn(
                        "text-2xl italic font-bold text-white",
                        locale === 'ar' ? 'font-arabic' : ''
                    )}>
                        {t('spiritQuote')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
