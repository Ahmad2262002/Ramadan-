'use client';

import { Code, Heart, Facebook, Instagram, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export default function Footer() {
    const t = useTranslations('footer');

    return (
        <footer className="relative py-24 px-6 overflow-hidden">
            <div className="max-w-md mx-auto flex flex-col items-center gap-10 relative z-10">
                {/* Credit */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">{t('craftedWithDevotion')}</span>
                    <a
                        href="https://portfolio-kappa-seven-93.vercel.app/#contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-1"
                    >
                        <h3 className="text-[11px] font-black text-white/40 group-hover:text-amber-500 transition-colors tracking-[0.2em] uppercase">Developed by Ahmad Alkadri</h3>
                        <span className="text-[9px] font-bold text-white/20 group-hover:text-amber-500/40 transition-colors uppercase tracking-widest">FullStack dev</span>
                    </a>
                </div>

                <div className="flex flex-col items-center gap-8 w-full">
                    <div className="flex items-center gap-3">
                        {[
                            { icon: Facebook, href: "https://www.facebook.com/share/17yLpinBAt/?mibextid=wwXIfr", label: "Facebook" },
                            { icon: Instagram, href: "https://www.instagram.com/blackstack_solutions?igsh=N2N1OXZ2OW4xMTgz&utm_source=qr", label: "Instagram" },
                            { icon: Linkedin, href: "https://www.linkedin.com/in/ahmad-alkadri-42770927a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app", label: "LinkedIn" }
                        ].map((item, index) => (
                            <motion.a
                                key={index}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/20 hover:text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all"
                                aria-label={item.label}
                            >
                                <item.icon className="w-4 h-4" />
                            </motion.a>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="ios-pill bg-white/[0.02] border-white/5 text-white/10 text-[9px]">
                            Ramadan Hub Luxe • 2026
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
