'use client';

import { useNotifications, Notification } from '@/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, Check, X, Clock, Sparkles } from 'lucide-react';

export default function NotificationCenter() {
    const {
        notifications,
        removeNotification,
        clearAll,
        isPanelOpen,
        setIsPanelOpen,
        markAllAsRead
    } = useNotifications();

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'prayer':
                return <BellRing className="w-5 h-5 text-purple-400" />;
            case 'reminder':
                return <Clock className="w-5 h-5 text-blue-400" />;
            case 'success':
                return <Check className="w-5 h-5 text-green-400" />;
            default:
                return <Sparkles className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getGradient = (type: Notification['type']) => {
        switch (type) {
            case 'prayer':
                return 'from-purple-500/10 to-pink-500/10 border-purple-500/20';
            case 'reminder':
                return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
            case 'success':
                return 'from-green-500/10 to-emerald-500/10 border-green-500/20';
            default:
                return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20';
        }
    };

    return (
        <>
            {/* Notification Panel (integrated with Header bell later) */}
            <AnimatePresence>
                {isPanelOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
                            onClick={() => setIsPanelOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-24 right-6 w-80 md:w-96 luxury-glass rounded-3xl p-6 shadow-2xl z-[60] border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <BellRing className="w-5 h-5 text-amber-500" />
                                    Updates
                                </h3>
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                                >
                                    <X className="w-4 h-4 text-white/50" />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BellRing className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                        <p className="text-zinc-600 font-bold text-sm uppercase tracking-widest">Sky is clear</p>
                                    </div>
                                ) : (
                                    <>
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 rounded-2xl bg-gradient-to-br ${getGradient(notification.type)} border border-white/5`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white text-sm mb-0.5">{notification.title}</h4>
                                                        <p className="text-zinc-400 text-xs leading-relaxed">{notification.message}</p>
                                                        <p className="text-zinc-600 text-[9px] mt-2 font-black uppercase tracking-tighter">
                                                            {notification.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeNotification(notification.id)}
                                                        className="p-1 rounded-lg hover:bg-white/10 transition-all flex-shrink-0"
                                                    >
                                                        <X className="w-3.5 h-3.5 text-white/20" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={clearAll}
                                            className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                                        >
                                            Clear History
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast Notifications (bottom-right) */}
            <div className="fixed bottom-24 right-6 z-[100] space-y-3 max-w-sm pointer-events-none">
                <AnimatePresence>
                    {notifications.slice(0, 3).map((notification) => (
                        <motion.div
                            key={`toast-${notification.id}`}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className={`p-4 rounded-2xl bg-black/80 border border-amber-500/20 backdrop-blur-xl shadow-2xl pointer-events-auto flex items-start gap-4 min-w-[280px]`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-sm mb-0.5">{notification.title}</h4>
                                <p className="text-zinc-400 text-xs leading-snug">{notification.message}</p>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                            >
                                <X className="w-4 h-4 text-white/20" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}
