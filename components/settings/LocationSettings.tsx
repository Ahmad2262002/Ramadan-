'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getCountries, getCities, type Country } from '@/lib/location-data';
import { cn } from '@/lib/utils';

interface LocationSettingsProps {
    locationMode: string;
    city: string;
    country: string;
    onUpdate: (updates: any) => void;
}

export function LocationSettings({ locationMode, city, country, onUpdate }: LocationSettingsProps) {
    const t = useTranslations('settings');
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [citySearch, setCitySearch] = useState('');

    const filteredCities = cities.filter(c =>
        c.toLowerCase().includes(citySearch.toLowerCase())
    );

    useEffect(() => {
        if (locationMode === 'manual') {
            setLoadingCountries(true);
            getCountries().then(data => {
                setCountries(data);
                setLoadingCountries(false);
            });
        }
    }, [locationMode]);

    useEffect(() => {
        if (locationMode === 'manual' && country) {
            setLoadingCities(true);
            getCities(country).then(data => {
                setCities(data);
                setLoadingCities(false);
            });
        } else {
            setCities([]);
        }
    }, [locationMode, country]);

    return (
        <div className="space-y-3">
            <h4 className="px-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('discovery')}</h4>
            <div className="premium-card overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-white/[0.03]">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <MapPin className="w-4 h-4 text-vibrant-blue" />
                        </div>
                        <span className="font-bold text-sm text-white/80">{t('detection')}</span>
                    </div>
                    <div className="premium-card p-1 flex bg-white/5 border-white/5 relative premium-trigger">
                        <select
                            value={locationMode}
                            onChange={(e) => onUpdate({ locationMode: e.target.value })}
                            className="bg-transparent text-[11px] font-black uppercase tracking-widest text-white/60 outline-none cursor-pointer appearance-none px-8 py-2 hover:text-white transition-colors"
                        >
                            <option value="geo" className="bg-zinc-900">{t('useGeolocation')}</option>
                            <option value="manual" className="bg-zinc-900">{t('manualLocation')}</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                    </div>
                </div>

                <AnimatePresence>
                    {locationMode === 'manual' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-6 space-y-4 bg-white/[0.01]"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between group border-b border-white/[0.03] pb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{t('country')}</span>
                                    <div className="relative min-w-[200px] flex justify-end">
                                        {loadingCountries ? (
                                            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                        ) : (
                                            <select
                                                value={country}
                                                onChange={(e) => onUpdate({ country: e.target.value, city: '' })}
                                                className="bg-transparent text-right text-sm font-bold text-white outline-none cursor-pointer appearance-none pr-6 w-full"
                                            >
                                                <option value="" className="bg-zinc-900">{t('country')}</option>
                                                {countries.map((c, index) => (
                                                    <option key={`${c.iso2}-${index}`} value={c.name} className="bg-zinc-900">{c.name}</option>
                                                ))}
                                            </select>
                                        )}
                                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{t('city')}</span>
                                        {country && (
                                            <input
                                                type="text"
                                                placeholder="Search city..."
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] text-white outline-none focus:border-amber-500/50 transition-colors w-32"
                                                onChange={(e) => setCitySearch(e.target.value)}
                                            />
                                        )}
                                    </div>
                                    <div className="relative">
                                        {loadingCities ? (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="max-h-40 overflow-y-auto custom-scrollbar bg-white/[0.02] rounded-xl border border-white/5">
                                                {!country ? (
                                                    <div className="p-4 text-center text-[10px] text-white/20 uppercase tracking-widest">{t('selectCountryFirst')}</div>
                                                ) : filteredCities.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-1 p-2">
                                                        {filteredCities.map((c, index) => (
                                                            <button
                                                                key={`${c}-${index}`}
                                                                onClick={() => onUpdate({ city: c })}
                                                                className={cn(
                                                                    "text-left px-3 py-2 rounded-lg text-xs transition-all haptic-feedback",
                                                                    city === c ? "bg-amber-500 text-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                                                                )}
                                                            >
                                                                {c}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-center text-[10px] text-white/20 uppercase tracking-widest">No cities found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
