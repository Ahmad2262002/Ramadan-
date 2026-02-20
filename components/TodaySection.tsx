'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Calendar, RefreshCw, Wind, Droplets, ArrowUp, ArrowDown, Clock, Sparkles, ChevronRight, Quote, ScrollText, MoonStar, Sun, Sunrise, Sunset, Compass, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon } from 'lucide-react';
import { getPrayerTimesByCoordinates, getPrayerTimesByCity, type PrayerTimesResponse } from '@/lib/prayer-times';
import { getIPLocation, getWeatherByCoordinates, type WeatherData } from '@/lib/weather';
import { downloadICSFile } from '@/lib/notifications';
import LoadingSkeleton from './LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, format12h, localizeDigits, formatLocalizedNumber } from '@/lib/utils';
import duasData from '@/data/duas.json';
import hadithData from '@/data/hadith.json';
import { useCallback } from 'react';

import { TabType } from '@/app/[locale]/page';

interface TodayProps {
    onTabChange: (tab: TabType) => void;
}

export default function TodaySection({ onTabChange }: TodayProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResponse | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [location, setLocation] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; timeLeft: string; progress: number } | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [detectionMethod, setDetectionMethod] = useState<'gps' | 'ip' | 'manual' | 'fallback' | null>(null);
    const [isIftarTime, setIsIftarTime] = useState(false);
    const [celebrationActive, setCelebrationActive] = useState(false);

    const dailyDua = useMemo(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        return (duasData as any)[dayOfYear % (duasData as any).length];
    }, []);

    const hadithOfTheDay = useMemo(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        return (hadithData as any)[dayOfYear % (hadithData as any).length];
    }, []);

    const weatherInfo = useMemo(() => {
        if (!weather) return null;
        const code = weather.current.weathercode;
        const hour = currentTime?.getHours() ?? new Date().getHours();
        const isNight = hour >= 18 || hour < 6;

        const mapping: Record<number, { icon: any; color: string; labelEn: string; labelAr: string }> = {
            0: { icon: isNight ? Moon : Sun, color: 'text-amber-400', labelEn: 'Clear Sky', labelAr: 'سماء صافية' },
            1: { icon: isNight ? Moon : CloudSun, color: 'text-zinc-400', labelEn: 'Mainly Clear', labelAr: 'صافٍ غالباً' },
            2: { icon: CloudSun, color: 'text-zinc-400', labelEn: 'Partly Cloudy', labelAr: 'غائم جزئياً' },
            3: { icon: Cloud, color: 'text-zinc-500', labelEn: 'Overcast', labelAr: 'غائم' },
            45: { icon: CloudFog, color: 'text-zinc-300', labelEn: 'Fog', labelAr: 'ضباب' },
            48: { icon: CloudFog, color: 'text-zinc-300', labelEn: 'Depositing Rime Fog', labelAr: 'ضباب جليدي' },
            51: { icon: CloudDrizzle, color: 'text-blue-400', labelEn: 'Light Drizzle', labelAr: 'رذاذ خفيف' },
            53: { icon: CloudDrizzle, color: 'text-blue-400', labelEn: 'Moderate Drizzle', labelAr: 'رذاذ متوسط' },
            55: { icon: CloudDrizzle, color: 'text-blue-400', labelEn: 'Dense Drizzle', labelAr: 'رذاذ كثيف' },
            61: { icon: CloudRain, color: 'text-blue-500', labelEn: 'Slight Rain', labelAr: 'مطر خفيف' },
            63: { icon: CloudRain, color: 'text-blue-500', labelEn: 'Moderate Rain', labelAr: 'مطر متوسط' },
            65: { icon: CloudRain, color: 'text-blue-500', labelEn: 'Heavy Rain', labelAr: 'مطر غزير' },
            71: { icon: CloudSnow, color: 'text-zinc-100', labelEn: 'Slight Snow', labelAr: 'ثلج خفيف' },
            77: { icon: CloudSnow, color: 'text-zinc-100', labelEn: 'Snow Grains', labelAr: 'حبيبات ثلجية' },
            80: { icon: CloudRain, color: 'text-blue-600', labelEn: 'Slight Rain Showers', labelAr: 'زخات مطر خفيفة' },
            95: { icon: CloudLightning, color: 'text-amber-500', labelEn: 'Thunderstorm', labelAr: 'عاصفة رعدية' },
        };

        return mapping[code] || mapping[0];
    }, [weather, currentTime]);

    const weatherLabel = weatherInfo ? (locale === 'ar' ? weatherInfo.labelAr : weatherInfo.labelEn) : '';
    const WeatherIcon = weatherInfo?.icon || Sun;

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimeLeft = useCallback((ms: number) => {
        const h = Math.floor(ms / (1000 * 60 * 60));
        const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((ms % (1000 * 60)) / 1000);
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return locale === 'ar' ? localizeDigits(timeStr) : timeStr;
    }, [locale]);

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) setIsRefreshing(true);
        else setLoading(true);

        const aborter = new AbortController();
        const timeoutId = setTimeout(() => aborter.abort(), 10000);

        try {
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

            let times: PrayerTimesResponse | null = null;
            let finalCoords: { lat: number; lng: number } | null = null;
            let finalLocationName = '';
            let detectedVia: 'gps' | 'ip' | 'manual' | 'fallback' = 'fallback';

            // Waterfall detection logic
            if (settingsMode === 'manual' && manualCity && manualCountry) {
                times = await getPrayerTimesByCity(manualCity, manualCountry, method);
                finalLocationName = `${manualCity}, ${manualCountry}`;
                if (times && times.meta) {
                    finalCoords = {
                        lat: typeof times.meta.latitude === 'string' ? Number(times.meta.latitude) : times.meta.latitude,
                        lng: typeof times.meta.longitude === 'string' ? Number(times.meta.longitude) : times.meta.longitude
                    };
                }
                detectedVia = 'manual';
            } else {
                // Try Browser Geolocation if high precision or direct geo mode
                let geoSuccess = false;
                if (highPrecision) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, {
                                enableHighAccuracy: true,
                                timeout: 5000
                            });
                        });
                        finalCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                        times = await getPrayerTimesByCoordinates(finalCoords.lat, finalCoords.lng, method);
                        const timezoneCity = times?.meta.timezone.split('/').pop()?.replace('_', ' ');
                        finalLocationName = timezoneCity || t('today.location');
                        detectedVia = 'gps';
                        geoSuccess = true;
                    } catch (e) {
                        console.warn('GPS failed, trying IP fallback...');
                    }
                }

                if (!geoSuccess) {
                    // Fallback to IP Geolocation
                    try {
                        const ipLoc = await getIPLocation();
                        finalCoords = { lat: ipLoc.latitude, lng: ipLoc.longitude };
                        finalLocationName = `${ipLoc.city}, ${ipLoc.country}`;
                        times = await getPrayerTimesByCoordinates(finalCoords.lat, finalCoords.lng, method);
                        detectedVia = 'ip';
                    } catch (ipErr) {
                        // Final Fallback
                        finalCoords = { lat: 33.6931, lng: 35.5828 };
                        finalLocationName = 'Chouf, Lebanon';
                        times = await getPrayerTimesByCity('Chouf', 'Lebanon', 5);
                        detectedVia = 'fallback';
                    }
                }
            }

            // Apply manual offsets to prayer times for 100% calibration
            if (times && times.timings) {
                const calibratedTimings = { ...times.timings };
                Object.entries(offsets).forEach(([prayer, offset]) => {
                    const key = prayer.charAt(0).toUpperCase() + prayer.slice(1);
                    const originalTime = (calibratedTimings as any)[key];
                    if (originalTime && offset !== 0) {
                        const [h, m] = originalTime.split(':').map(Number);
                        const date = new Date();
                        date.setHours(h, m + (offset || 0), 0, 0);
                        (calibratedTimings as any)[key] = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    }
                });
                times.timings = calibratedTimings;
            }

            // Fetch precise weather
            if (finalCoords) {
                try {
                    const wData = await getWeatherByCoordinates(finalCoords.lat, finalCoords.lng);
                    setWeather(wData);
                } catch (weatherErr) {
                    console.error('Failed to fetch weather:', weatherErr);
                }
            }

            setLocation(finalLocationName);
            setDetectionMethod(detectedVia);
            setPrayerTimes(times);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        const handleSettingsUpdate = () => {
            fetchData();
        };
        window.addEventListener('ramadan-settings-updated', handleSettingsUpdate);
        return () => window.removeEventListener('ramadan-settings-updated', handleSettingsUpdate);
    }, [fetchData]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (prayerTimes && currentTime) {
            const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const timings = prayerTimes.timings as any;
            let next = null;
            let current = null;
            let minDiff = Infinity;

            const prayerDates = prayers.map(name => {
                const [h, m] = timings[name].split(':').map(Number);
                const d = new Date(currentTime);
                d.setHours(h, m, 0, 0);
                return { name, date: d };
            });

            const sortedPrayers = [...prayerDates].sort((a, b) => a.date.getTime() - b.date.getTime());

            for (let i = 0; i < sortedPrayers.length; i++) {
                if (sortedPrayers[i].date.getTime() > currentTime.getTime()) {
                    next = sortedPrayers[i];
                    current = i > 0 ? sortedPrayers[i - 1] : sortedPrayers[sortedPrayers.length - 1];
                    if (current.date.getTime() > currentTime.getTime()) {
                        current.date.setDate(current.date.getDate() - 1);
                    }
                    break;
                }
            }

            if (!next) {
                next = { ...sortedPrayers[0] };
                next.date.setDate(next.date.getDate() + 1);
                current = sortedPrayers[sortedPrayers.length - 1];
            }

            if (next && current) {
                const totalDuration = next.date.getTime() - current.date.getTime();
                const elapsed = currentTime.getTime() - current.date.getTime();
                const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
                const diff = next.date.getTime() - currentTime.getTime();
                const isSubMinute = diff > 0 && diff < 60000;

                setNextPrayer({
                    name: next.name,
                    time: timings[next.name],
                    timeLeft: formatTimeLeft(diff),
                    progress
                });

                // Iftar celebration logic
                if (next.name === 'Maghrib' && diff <= 0 && diff > -300000) { // 5 mins of celebration
                    if (!isIftarTime) {
                        setIsIftarTime(true);
                        setCelebrationActive(true);
                        window.dispatchEvent(new CustomEvent('maghrib-celebration', { detail: true }));

                        // Play sound if enabled
                        const savedSettings = localStorage.getItem('ramadan-settings');
                        if (savedSettings) {
                            const parsed = JSON.parse(savedSettings);
                            if (parsed.soundEnabled) {
                                try {
                                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                                    audio.volume = 0.5;
                                    const playPromise = audio.play();
                                    if (playPromise !== undefined) {
                                        playPromise.catch(e => {
                                            if (e.name !== 'NotAllowedError') {
                                                console.warn('Audio play auto-blocked or failed:', e);
                                            }
                                        });
                                    }
                                } catch (e) {
                                    console.warn('Audio initialization failed');
                                }
                            }
                        }
                    }
                } else if (isIftarTime) {
                    setIsIftarTime(false);
                    setCelebrationActive(false);
                    try {
                        window.dispatchEvent(new CustomEvent('maghrib-celebration', { detail: false }));
                    } catch (e) {
                        console.warn('Celebration event dispatch failed');
                    }
                }
            }
        }
    }, [currentTime, prayerTimes, isIftarTime, formatTimeLeft]);

    // Dynamic Background Logic
    useEffect(() => {
        if (!nextPrayer) return;

        const prayer = nextPrayer.name.toLowerCase();
        let colors = {
            main: '#0a0e14',
            glow1: 'rgba(255, 159, 10, 0.12)',
            glow2: 'rgba(94, 92, 230, 0.07)',
            glow3: 'rgba(0, 122, 255, 0.07)'
        };

        // Base theme by prayer time
        if (prayer === 'fajr' || prayer === 'imsak') {
            colors = {
                main: '#0f172a', // Deep navy
                glow1: 'rgba(94, 92, 230, 0.15)', // Indigo
                glow2: 'rgba(212, 175, 55, 0.05)', // Gold hint
                glow3: 'rgba(0, 122, 255, 0.1)'
            };
        } else if (prayer === 'dhuhr' || prayer === 'asr') {
            colors = {
                main: '#0c0c0c',
                glow1: 'rgba(0, 122, 255, 0.1)', // Blue sky
                glow2: 'rgba(255, 255, 255, 0.05)',
                glow3: 'rgba(94, 92, 230, 0.05)'
            };
        } else if (prayer === 'maghrib') {
            colors = {
                main: '#1a0f0f', // Warm sunset dark
                glow1: 'rgba(245, 158, 11, 0.15)', // Orange
                glow2: 'rgba(220, 38, 38, 0.05)', // Red
                glow3: 'rgba(94, 92, 230, 0.08)'
            };
        } else if (prayer === 'isha') {
            colors = {
                main: '#050505', // Almost black
                glow1: 'rgba(94, 92, 230, 0.1)', // Indigo night
                glow2: 'rgba(0, 0, 0, 0)',
                glow3: 'rgba(0, 122, 255, 0.05)'
            };
        }

        // Adjust for weather (Cloudy/Rainy = Muted)
        if (weather) {
            const condition = weather.current.weathercode;
            if (condition > 3) { // Cloudy, rainy, snowy
                colors.glow1 = colors.glow1.replace('0.15', '0.05').replace('0.1', '0.03');
                colors.main = '#111827'; // Greyish navy
            }
        }

        const root = document.documentElement;
        root.style.setProperty('--bg-color-main', colors.main);
        root.style.setProperty('--bg-glow-1', colors.glow1);
        root.style.setProperty('--bg-glow-2', colors.glow2);
        root.style.setProperty('--bg-glow-3', colors.glow3);
    }, [nextPrayer, weather]);

    if (loading || !currentTime) return <LoadingSkeleton />;

    // Weather Effects Components
    const RainEffect = () => (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -20, x: `${Math.random() * 100}%`, opacity: 0 }}
                    animate={{
                        y: 600,
                        opacity: [0, 0.4, 0],
                    }}
                    transition={{
                        duration: 0.8 + Math.random() * 0.4,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "linear"
                    }}
                    className="absolute w-[1px] h-3 bg-blue-300/40"
                    style={{ left: `${Math.random() * 100}%` }}
                />
            ))}
        </div>
    );

    const CloudEffect = () => (
        <div className="absolute inset-0 pointer-events-none opacity-20">
            <motion.div
                animate={{ x: [-100, 500] }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 left-0 w-64 h-32 bg-white/30 blur-[60px] rounded-full"
            />
            <motion.div
                animate={{ x: [600, -200] }}
                transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 right-0 w-96 h-48 bg-zinc-500/20 blur-[90px] rounded-full"
            />
        </div>
    );

    const isRainy = weather && [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.current.weathercode);
    const isCloudy = weather && [2, 3, 45, 48].includes(weather.current.weathercode);

    const prayersList = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    return (
        <div className="space-y-12 animate-spring px-2 max-w-5xl mx-auto">
            {/* Header / Date Info */}
            <div className="flex flex-col items-center gap-2 mb-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ios-pill text-white/40 border-white/5 bg-white/[0.02]"
                >
                    {new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(currentTime || new Date())}
                </motion.div>
                <h1 className="text-2xl font-black text-white tracking-tight">{t('today.title')}</h1>
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">

                {/* Celestial Hero Widget: Next Prayer Countdown */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        backgroundColor: isIftarTime ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                    }}
                    className={cn(
                        "md:col-span-4 premium-card min-h-[450px] flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-1000 gpu-accelerate",
                        isIftarTime && "border-emerald-500/30"
                    )}
                >
                    {/* Background Visuals */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-transparent opacity-60",
                        isIftarTime && "from-emerald-500/15"
                    )} />

                    {isRainy && <RainEffect />}
                    {isCloudy && <CloudEffect />}

                    <div className={cn(
                        "absolute -top-32 -right-32 w-80 h-80 bg-amber-500/[0.08] rounded-full blur-[120px] mix-blend-screen",
                        isIftarTime && "bg-emerald-500/20"
                    )} />

                    {/* Celestial Watch Interface */}
                    <div className="relative w-80 h-80 flex items-center justify-center z-10">
                        {/* Dynamic Progress Rings */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110">
                            {/* Inner Ring (Static) */}
                            <circle cx="50%" cy="50%" r="42%" className="fill-none stroke-white/[0.03] stroke-[1px]" />
                            {/* Main Progress Ring */}
                            <circle cx="50%" cy="50%" r="48%" className="fill-none stroke-white/[0.05] stroke-[1px]" />
                            <motion.circle
                                cx="50%" cy="50%" r="48%"
                                className={cn(
                                    "fill-none stroke-[8px] stroke-linecap-round transition-colors duration-1000",
                                    isIftarTime ? "stroke-emerald-400" : "stroke-amber-400"
                                )}
                                style={{
                                    strokeDasharray: "301.5% 301.5%",
                                    strokeDashoffset: `${301.5 - (301.5 * (nextPrayer?.progress || 0)) / 100}%`,
                                    filter: isIftarTime ? 'drop-shadow(0 0 12px rgba(16,185,129,0.5))' : 'drop-shadow(0 0 12px rgba(245,158,11,0.5))'
                                }}
                            />

                            {/* Orbiting celestial indicator */}
                            <motion.circle
                                cx="50%" cy="2%" r="4"
                                className={isIftarTime ? "fill-emerald-400" : "fill-amber-400"}
                                style={{
                                    transformOrigin: '50% 50%',
                                    rotate: `${(nextPrayer?.progress || 0) * 3.6}deg`
                                }}
                            />
                        </svg>

                        <div className="text-center relative z-20">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isIftarTime ? 'iftar' : 'prayer'}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    className="mb-6"
                                >
                                    <span className={cn(
                                        "px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.3em] inline-block shadow-xl border border-white/5",
                                        isIftarTime
                                            ? "text-emerald-400 bg-emerald-500/[0.08]"
                                            : "text-amber-400 bg-amber-500/[0.08]"
                                    )}>
                                        {isIftarTime ? t('today.timeUntilIftar').split(' ')[0] : (nextPrayer ? t(`prayer.${nextPrayer.name.toLowerCase()}`) : '---')}
                                    </span>
                                </motion.div>
                            </AnimatePresence>

                            <motion.div
                                className={cn(
                                    "text-7xl md:text-8xl font-black text-white tracking-tighter tabular-nums mb-3 drop-shadow-2xl",
                                    isIftarTime ? "text-glow-emerald" : "text-glow-amber"
                                )}
                                animate={isIftarTime ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                {isIftarTime ? t('today.mubarak') : (nextPrayer?.timeLeft || "00:00:00")}
                            </motion.div>
                            <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] md:tracking-[0.6em]">
                                {isIftarTime ? t('today.maghrib') : t('today.timeUntilNextPrayer')}
                            </span>
                        </div>
                    </div>

                    {/* Celebration Particles */}
                    {celebrationActive && (
                        <div className="absolute inset-0 pointer-events-none opacity-40">
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: -20, x: Math.random() * 800 - 400, opacity: 1 }}
                                    animate={{
                                        y: [null, 600],
                                        opacity: [1, 0],
                                        rotate: [0, 720]
                                    }}
                                    transition={{
                                        duration: 3 + Math.random() * 3,
                                        repeat: Infinity,
                                        delay: Math.random() * 5
                                    }}
                                    className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
                                    style={{ left: `${Math.random() * 100}%` }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Weather Widget */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 premium-card flex flex-col justify-between group h-full overflow-hidden gpu-accelerate"
                >
                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('today.location')}</span>
                            <div className="flex items-center gap-2 group/loc cursor-default">
                                <MapPin className="w-3.5 h-3.5 text-amber-500/60 transition-colors group-hover/loc:text-amber-500" />
                                <span className="text-sm font-bold text-white/80 transition-colors group-hover/loc:text-white line-clamp-1">{location}</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                            <WeatherIcon className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>

                    <div className="mt-8 flex items-end justify-between relative z-10">
                        <div>
                            <div className="text-5xl font-black text-white tracking-tighter tabular-nums leading-none mb-2">
                                {weather ? `${Math.round(weather.current.temperature)}°` : '--°'}
                            </div>
                            <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
                                {weather ? (locale === 'ar' ? 'درجة الحرارة' : 'Temperature') : '---'}
                            </span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <CloudRain className="w-4 h-4 text-white/20" />
                            <span className="text-[11px] font-bold text-amber-500/80">{weather ? `${weather.current.humidity}%` : '--%'}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Imsak/Iftar Quick Access */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 premium-card flex flex-col justify-between h-full bg-gradient-to-br from-white/[0.02] to-transparent"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('today.title')}</span>
                        <div className="w-8 h-8 rounded-full bg-amber-500/5 border border-amber-500/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-amber-500/60" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between group/row cursor-default">
                            <div>
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 group-hover/row:text-amber-500/60 transition-colors">{t('today.imsak')}</div>
                                <div className="text-2xl font-black text-white tracking-tight tabular-nums">{prayerTimes?.timings.Imsak || "--:--"}</div>
                            </div>
                            <Sunrise className="w-6 h-6 text-white/10 group-hover/row:text-amber-500/30 transition-all group-hover/row:scale-110" />
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/[0.02] to-transparent" />
                        <div className="flex items-center justify-between group/row cursor-default">
                            <div>
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 group-hover/row:text-emerald-500/60 transition-colors">{t('today.maghrib')}</div>
                                <div className="text-2xl font-black text-white tracking-tight tabular-nums">{prayerTimes?.timings.Maghrib || "--:--"}</div>
                            </div>
                            <Sunset className="w-6 h-6 text-white/10 group-hover/row:text-emerald-500/30 transition-all group-hover/row:scale-110" />
                        </div>
                    </div>
                </motion.div>

                {/* Quick Guidance Links */}
                <div className="md:col-span-2 grid grid-cols-1 gap-4">
                    {[
                        { icon: MoonStar, label: t('nav.calendar'), tab: 'imsakiyah', color: 'text-amber-500' },
                        { icon: ScrollText, label: t('nav.athkar'), tab: 'adhkar', color: 'text-emerald-500' },
                        { icon: Quote, label: t('nav.guidance'), tab: 'hadith', color: 'text-blue-500' }
                    ].map((item, i) => (
                        <motion.button
                            key={i}
                            onClick={() => onTabChange(item.tab as TabType)}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className="premium-card flex items-center gap-4 py-4 group bg-white/[0.01]"
                        >
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 bg-white/[0.03] border border-white/5">
                                <item.icon className={cn("w-5 h-5", item.color)} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">{item.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Prayer List Layout (Refined Apple Health Style) */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-6 premium-card mt-6"
                >
                    <div className="flex justify-between items-center mb-8 px-2">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{t('today.dailyFlow')}</h3>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">{t('app.subtitle')}</span>
                        </div>
                        <button
                            onClick={() => downloadICSFile("Ramadan Hub", "ramadan.ics")}
                            className="ios-pill text-[10px] font-black text-amber-500/40 hover:text-amber-500 border-amber-500/10 hover:border-amber-500 transition-all uppercase tracking-widest"
                        >
                            {t('common.download')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {prayerTimes && prayersList.map((name, i) => {
                            const time = (prayerTimes.timings as any)[name];
                            const isNext = nextPrayer?.name === name;

                            return (
                                <motion.div
                                    key={name}
                                    whileHover={{ scale: 1.02 }}
                                    className={cn(
                                        "bento-inner flex items-center justify-between p-4 cursor-default transition-all duration-700",
                                        isNext ? "border-amber-500/30 bg-amber-500/[0.05] shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20" : "opacity-60 bg-white/[0.01]"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500",
                                            isNext ? "bg-amber-500 text-black shadow-lg shadow-amber-500/40" : "bg-white/[0.03] text-white/20"
                                        )}>
                                            {name === 'Fajr' && <Sunrise className="w-5 h-5" />}
                                            {name === 'Sunrise' && <Sun className="w-5 h-5" />}
                                            {name === 'Dhuhr' && <Sun className="w-5 h-5" />}
                                            {name === 'Asr' && <Sun className="w-5 h-5 opacity-70" />}
                                            {name === 'Maghrib' && <Sunset className="w-5 h-5" />}
                                            {name === 'Isha' && <MoonStar className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className={cn("text-base font-black tracking-tight", isNext ? "text-white" : "text-white/60")}>
                                                {t(`prayer.${name.toLowerCase()}`)}
                                            </h4>
                                            {isNext && <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">Next Prayer</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn("text-lg font-black tabular-nums tracking-tighter", isNext ? "text-white" : "text-white/40")}>
                                            {format12h(time, locale)}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Prophetic Guidance Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="md:col-span-6 premium-card p-8 md:p-12 text-center relative overflow-hidden group border-amber-500/5 mt-8 bg-gradient-to-b from-white/[0.02] to-transparent gpu-accelerate"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.5)]" />

                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Sparkles className="w-5 h-5 text-amber-500/40 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">{t('insights.didYouKnow')}</span>
                        <Sparkles className="w-5 h-5 text-amber-500/40 animate-pulse" />
                    </div>

                    <div className="max-w-3xl mx-auto space-y-8">
                        <p className="text-xl md:text-2xl font-medium text-white/90 italic leading-relaxed font-serif tracking-tight">
                            &quot;{locale === 'ar' ? hadithOfTheDay.textAr : hadithOfTheDay.textEn}&quot;
                        </p>

                        <div className="flex flex-col items-center gap-4">
                            <div className="h-px w-12 bg-white/10" />
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">
                                {hadithOfTheDay.reference}
                            </span>
                        </div>

                        {/* Practical Takeaway Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl p-6 md:p-8 mt-4 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20" />
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/50">Practical Takeaway</span>
                                <p className="text-sm md:text-base font-medium text-white/70 leading-relaxed">
                                    {locale === 'ar' ? hadithOfTheDay.takeawayAr : hadithOfTheDay.takeawayEn}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-[80px]" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-[80px]" />
                </motion.div>
            </div>
        </div>
    );
}
