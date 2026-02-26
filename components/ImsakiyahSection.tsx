'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getMonthlyPrayerTimes, getMonthlyPrayerTimesByCity, getHijriMonthlyPrayerTimes, getHijriMonthlyPrayerTimesByCity, type MonthlyPrayerTimes } from '@/lib/prayer-times';
import LoadingSkeleton from './LoadingSkeleton';
import { Calendar, ChevronDown, MapPin, Search, Filter, MoonStar, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, format12h, localizeDigits } from '@/lib/utils';
import { getIPLocation } from '@/lib/weather';

export default function ImsakiyahSection() {
    const t = useTranslations();
    const locale = useLocale();
    const [monthlyTimes, setMonthlyTimes] = useState<MonthlyPrayerTimes[]>([]);
    const [loading, setLoading] = useState(true);
    // Default to Ramadan (Month 9) for 1447 if we are in 2026, 
    // but better to detect current Hijri month from a sample fetch or a logic.
    const [selectedMonth, setSelectedMonth] = useState(9); // Ramadan
    const [selectedYear, setSelectedYear] = useState(1447); // 1447 AH
    const [isHijriMode, setIsHijriMode] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);

    // Dynamic initial detection
    useEffect(() => {
        const savedMode = localStorage.getItem('calendar-mode');
        if (savedMode === 'gregorian') setIsHijriMode(false);

        // Initial fetch of current Hijri date to set defaults if not set
        const detectCurrentDate = async () => {
            try {
                const now = new Date();
                const day = now.getDate();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();

                // Fetch current Hijri date from Aladhan
                const res = await fetch(`https://api.aladhan.com/v1/gregorianToHijri/${day}-${month}-${year}`);
                const data = await res.json();
                if (data.code === 200) {
                    const hDate = data.data.hijri;
                    setSelectedMonth(parseInt(hDate.month.number));
                    setSelectedYear(parseInt(hDate.year));
                    // If we are currently in an older month, don't snap unless it's first load
                    // This is handled by the initial detection
                }
            } catch (e) {
                console.warn('Failed to detect current Hijri date, using defaults');
                const now = new Date();
                setSelectedMonth(now.getMonth() + 1);
                setSelectedYear(now.getFullYear());
            }
        };

        detectCurrentDate();
    }, []);

    useEffect(() => {
        localStorage.setItem('calendar-mode', isHijriMode ? 'hijri' : 'gregorian');
    }, [isHijriMode]);

    useEffect(() => {
        if (!loading && monthlyTimes.length > 0 && !hasScrolled) {
            const today = new Date().getDate();
            const currentMonth = new Date().getMonth() + 1;
            if (selectedMonth === currentMonth) {
                setTimeout(() => {
                    const el = document.getElementById(`day-${today}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHasScrolled(true);
                    }
                }, 500);
            }
        }
    }, [loading, monthlyTimes, selectedMonth, hasScrolled]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const savedSettings = localStorage.getItem('ramadan-settings');
            let settingsMode = 'geo';
            let manualCity = '';
            let manualCountry = '';
            let method = 5;
            let highPrecision = true;
            let offsets: Record<string, number> = {};

            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                settingsMode = parsed.locationMode;
                manualCity = parsed.city;
                manualCountry = parsed.country;
                method = parsed.calculationMethod || 5;
                highPrecision = parsed.highPrecision !== false;
                offsets = parsed.offsets || {};
            }

            const fetchCalibrated = async (data: MonthlyPrayerTimes[]) => {
                return data.map(day => {
                    const calibratedTimings = { ...day.timings };
                    Object.entries(offsets).forEach(([prayer, offset]) => {
                        if (offset === 0) return;
                        const key = prayer.charAt(0).toUpperCase() + prayer.slice(1);
                        const originalTime = (calibratedTimings as any)[key];
                        if (originalTime) {
                            const pureTime = originalTime.split(' ')[0];
                            const [h, m] = pureTime.split(':').map(Number);
                            const date = new Date();
                            date.setHours(h, m + offset, 0, 0);
                            (calibratedTimings as any)[key] = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                        }
                    });
                    return { ...day, timings: calibratedTimings };
                });
            };

            let times: MonthlyPrayerTimes[] = [];

            if (settingsMode === 'manual' && manualCity && manualCountry) {
                const data = isHijriMode
                    ? await getHijriMonthlyPrayerTimesByCity(manualCity, manualCountry, selectedMonth, selectedYear, method)
                    : await getMonthlyPrayerTimesByCity(manualCity, manualCountry, selectedMonth, selectedYear, method);
                times = await fetchCalibrated(data);
            } else {
                let geoSuccess = false;
                if (highPrecision && navigator.geolocation) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                        });
                        const data = isHijriMode
                            ? await getHijriMonthlyPrayerTimes(position.coords.latitude, position.coords.longitude, selectedMonth, selectedYear, method)
                            : await getMonthlyPrayerTimes(position.coords.latitude, position.coords.longitude, selectedMonth, selectedYear, method);
                        times = await fetchCalibrated(data);
                        geoSuccess = true;
                    } catch (e) { console.warn('Monthly GPS failed'); }
                }

                if (!geoSuccess) {
                    try {
                        const ipLoc = await getIPLocation();
                        const data = isHijriMode
                            ? await getHijriMonthlyPrayerTimes(ipLoc.latitude, ipLoc.longitude, selectedMonth, selectedYear, method)
                            : await getMonthlyPrayerTimes(ipLoc.latitude, ipLoc.longitude, selectedMonth, selectedYear, method);
                        times = await fetchCalibrated(data);
                    } catch (e) {
                        const data = isHijriMode
                            ? await getHijriMonthlyPrayerTimesByCity('Chouf', 'Lebanon', selectedMonth, selectedYear, 5)
                            : await getMonthlyPrayerTimesByCity('Chouf', 'Lebanon', selectedMonth, selectedYear, 5);
                        times = await fetchCalibrated(data);
                    }
                }
            }

            setMonthlyTimes(times);
            setLoading(false);
        } catch (err) {
            console.error('Error loading monthly times:', err);
            setLoading(false);
        }
    }, [selectedMonth, selectedYear, isHijriMode]);

    useEffect(() => {
        setHasScrolled(false);
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleSettingsUpdate = () => {
            fetchData();
        };
        window.addEventListener('ramadan-settings-updated', handleSettingsUpdate);
        return () => window.removeEventListener('ramadan-settings-updated', handleSettingsUpdate);
    }, [fetchData]); // Add fetchData to dependency array

    const HIJRI_MONTHS = [
        { en: 'Muharram', ar: 'المحرم' },
        { en: 'Safar', ar: 'صفر' },
        { en: 'Rabi\' al-Awwal', ar: 'ربيع الأول' },
        { en: 'Rabi\' al-Thani', ar: 'ربيع الثاني' },
        { en: 'Jumada al-Ula', ar: 'جمادى الأولى' },
        { en: 'Jumada al-Akhirah', ar: 'جمادى الآخرة' },
        { en: 'Rajab', ar: 'رجب' },
        { en: 'Sha\'ban', ar: 'شعبان' },
        { en: 'Ramadan', ar: 'رمضان' },
        { en: 'Shawwal', ar: 'شوال' },
        { en: 'Dhu al-Qi\'dah', ar: 'ذو القعدة' },
        { en: 'Dhu al-Hijjah', ar: 'ذو الحجة' }
    ];

    return (
        <div className="space-y-8 pb-32 max-w-2xl mx-auto px-2">

            {/* Header Content */}
            <div className="text-center space-y-4 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60">{t('imsakiyah.subtitle')}</span>
                </div>
                <h2 className="text-5xl font-black tracking-tight text-white mb-2">{t('imsakiyah.title')}</h2>
                <div className="flex items-center justify-center gap-3">
                    <span className="ios-pill text-amber-500 border-amber-500/20 bg-amber-500/5 min-w-[140px]">
                        {isHijriMode ? (
                            locale === 'ar'
                                ? `${HIJRI_MONTHS[selectedMonth - 1].ar} ${localizeDigits(selectedYear)}`
                                : `${HIJRI_MONTHS[selectedMonth - 1].en} ${selectedYear}`
                        ) : (
                            locale === 'ar'
                                ? localizeDigits(new Date(selectedYear, selectedMonth - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' }))
                                : new Date(selectedYear, selectedMonth - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
                        )}
                    </span>
                    <button
                        onClick={async () => {
                            const now = new Date();
                            const day = now.getDate();
                            const month = now.getMonth() + 1;
                            const year = now.getFullYear();

                            if (isHijriMode) {
                                try {
                                    const res = await fetch(`https://api.aladhan.com/v1/gregorianToHijri/${day}-${month}-${year}`);
                                    const data = await res.json();
                                    if (data.code === 200) {
                                        setSelectedMonth(parseInt(data.data.hijri.month.number));
                                        setSelectedYear(parseInt(data.data.hijri.year));
                                    }
                                } catch (e) {
                                    setSelectedMonth(9); // Fallback to Ramadan
                                    setSelectedYear(1447);
                                }
                            } else {
                                setSelectedMonth(month);
                                setSelectedYear(year);
                            }
                            setHasScrolled(false);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all premium-trigger haptic-feedback"
                        title={t('imsakiyah.snapToCurrent')}
                    >
                        <RefreshCw className="w-4 h-4 text-white/40" />
                    </button>
                </div>
            </div>

            {/* Selectors Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => setIsHijriMode(!isHijriMode)}
                    className="premium-card p-4 flex items-center justify-between group overflow-hidden premium-trigger haptic-feedback"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <MoonStar className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{t('imsakiyah.calendarView')}</span>
                            <span className="text-sm font-bold text-white">{isHijriMode ? t('imsakiyah.hijri') : t('imsakiyah.gregorian')}</span>
                        </div>
                    </div>
                    <div className="w-10 h-6 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-all">
                        <div className={cn(
                            "w-4 h-4 rounded-full bg-amber-500 transition-all",
                            isHijriMode ? "translate-x-4" : "translate-x-0 opacity-40"
                        )} />
                    </div>
                </button>

                <div className="premium-card p-4 flex items-center justify-between col-span-1 md:col-span-1">
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{t('imsakiyah.period')}</span>
                            <div className="flex items-center gap-2 mt-1 overflow-x-auto scrollbar-hide pb-1">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer border-none p-0 focus:ring-0"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1} className="bg-zinc-900">
                                            {isHijriMode
                                                ? (locale === 'ar' ? HIJRI_MONTHS[i].ar : HIJRI_MONTHS[i].en)
                                                : new Date(2000, i, 1).toLocaleString(locale, { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-white/20">/</span>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="bg-transparent text-sm font-bold text-white w-14 outline-none border-none p-0 focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List View (Native App Style) */}
            <div className="space-y-3">
                {monthlyTimes.map((day, index) => {
                    const today = new Date();
                    const dateStr = day.date.gregorian.date; // format: DD-MM-YYYY
                    const [d, m, y] = dateStr.split('-');
                    const isToday = today.getDate() === Number(d) &&
                        (today.getMonth() + 1) === Number(m) &&
                        today.getFullYear() === Number(y);

                    // Ramadan focus: The user wants to see their Ramadan day (e.g., "Day 2")
                    const hijriDay = day.date.hijri.day;
                    const hijriMonth = locale === 'ar'
                        ? (day.date.hijri as any).month?.ar
                        : (day.date.hijri as any).month?.en || 'Ramadan';

                    return (
                        <motion.div
                            key={index}
                            id={`day-${isHijriMode ? hijriDay : Number(d)}`}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (index % 15) * 0.03 }}
                            className={cn(
                                "premium-card flex flex-col gap-4 py-6 transition-all duration-500 relative overflow-hidden",
                                isToday ? "border-amber-500 bg-amber-500/[0.08] ring-4 ring-amber-500/10 scale-[1.02] z-10" : "bg-white/[0.02]"
                            )}
                        >
                            {/* Card Header: Hijri Focus */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all",
                                        isToday ? "bg-amber-500 text-black shadow-xl shadow-amber-500/40 scale-110" : "bg-white/5 text-white/60"
                                    )}>
                                        <span className="text-xl leading-none">{locale === 'ar' ? localizeDigits(hijriDay) : hijriDay}</span>
                                        <span className="text-[7px] uppercase tracking-tighter mt-1">{hijriMonth}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-xs font-black uppercase tracking-[0.2em]", isToday ? "text-amber-500" : "text-white/40")}>
                                            {day.date.readable.split(' ')[0]} {locale === 'ar' ? localizeDigits(index + 1) : index + 1}
                                        </span>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mt-1">
                                            {day.date.readable.split(' ').slice(1).join(' ')}
                                        </span>
                                        {isToday && <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.3em] mt-2">{t('imsakiyah.today')}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{t('imsakiyah.iftar')}</span>
                                    <div className="ios-pill border-emerald-500/20 bg-emerald-500/5 text-emerald-500">
                                        {format12h(day.timings.Maghrib.split(' ')[0], locale)}
                                    </div>
                                </div>
                            </div>

                            {/* Grid of Times */}
                            <div className="grid grid-cols-3 gap-y-4 gap-x-2 pt-2 border-t border-white/5">
                                {[
                                    { label: t('imsakiyah.fajr'), time: day.timings.Fajr },
                                    { label: t('prayer.sunrise'), time: day.timings.Sunrise },
                                    { label: t('imsakiyah.dhuhr'), time: day.timings.Dhuhr },
                                    { label: t('imsakiyah.asr'), time: day.timings.Asr },
                                    { label: t('imsakiyah.maghrib'), time: day.timings.Maghrib },
                                    { label: t('imsakiyah.isha'), time: day.timings.Isha }
                                ].map((p, pi) => (
                                    <div key={pi} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 whitespace-nowrap">{p.label}</span>
                                        <span className="text-[11px] font-bold tabular-nums text-white/60">{format12h(p.time.split(' ')[0], locale)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <p className="text-center text-xs text-white/10 font-medium py-8">
                {t('imsakiyah.issues')} <button onClick={() => window.location.reload()} className="text-white/20 underline hover:text-white transition-colors haptic-feedback">{t('imsakiyah.refresh')}</button>
            </p>
        </div>
    );
}
