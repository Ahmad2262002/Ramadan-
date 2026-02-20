'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import TodaySection from '@/components/TodaySection';
import ImsakiyahSection from '@/components/ImsakiyahSection';
import AdhkarSection from '@/components/AdhkarSection';
import HadithSection from '@/components/HadithSection';
import SettingsSection from '@/components/SettingsSection';
import InsightsSection from '@/components/InsightsSection';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Footer from '@/components/Footer';
import Dock from '@/components/Dock';

import { AnimatePresence, motion } from 'framer-motion';

export type TabType = 'today' | 'imsakiyah' | 'adhkar' | 'hadith' | 'settings';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<TabType>('today');

    return (
        <div className="min-h-screen flex flex-col relative overflow-x-hidden">
            <Header activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 container mx-auto px-4 relative z-10 flex flex-col">
                <div className="flex-1 w-full max-w-2xl mx-auto pt-24 md:pt-36 pb-32 md:pb-40">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className="w-full flex flex-col gap-8"
                        >
                            <DisclaimerBanner />

                            <div className="w-full">
                                {activeTab === 'today' && (
                                    <div className="space-y-8">
                                        <TodaySection onTabChange={setActiveTab} />
                                        <InsightsSection />
                                    </div>
                                )}
                                {activeTab === 'imsakiyah' && <ImsakiyahSection />}
                                {activeTab === 'adhkar' && <AdhkarSection />}
                                {activeTab === 'hadith' && <HadithSection />}
                                {activeTab === 'settings' && <SettingsSection />}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <Footer />

            <Dock activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
