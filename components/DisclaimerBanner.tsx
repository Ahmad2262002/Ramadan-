'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisclaimerBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('disclaimer');

    useEffect(() => {
        setMounted(true);
        const isDismissed = localStorage.getItem('ramadan-disclaimer-dismissed');
        if (!isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('ramadan-disclaimer-dismissed', 'true');
    };

    if (!mounted || !isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="premium-card p-6 mb-8 border-amber-500/10 group relative"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-500/60" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-amber-500/80 uppercase tracking-widest mb-1">
                        {t('title')}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed font-medium">{t('message')}</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/10 hover:text-white transition-all"
                    aria-label="Close disclaimer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
