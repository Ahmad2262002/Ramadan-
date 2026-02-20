'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

export default function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [timeTheme, setTimeTheme] = useState<'dawn' | 'day' | 'dusk' | 'night'>('night');

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 8) setTimeTheme('dawn');
            else if (hour >= 8 && hour < 17) setTimeTheme('day');
            else if (hour >= 17 && hour < 20) setTimeTheme('dusk');
            else setTimeTheme('night');
        };

        updateTheme();
        const timer = setInterval(updateTheme, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let celebrationActive = false;

        const handleCelebration = (e: any) => {
            celebrationActive = e.detail;
            if (celebrationActive) {
                // Boost particles
                for (let i = 0; i < 20; i++) particles.push(new Particle(true));
            }
        };

        window.addEventListener('maghrib-celebration', handleCelebration);

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            maxOpacity: number;
            fadeSpeed: number;
            isGold: boolean;

            constructor(isGold = false) {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 1.5 + 0.2;
                this.speedX = Math.random() * 0.2 - 0.1;
                this.speedY = Math.random() * 0.2 - 0.1;
                this.maxOpacity = Math.random() * 0.4 + 0.1;
                this.opacity = 0;
                this.fadeSpeed = Math.random() * 0.005 + 0.002;
                this.isGold = isGold;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.opacity < this.maxOpacity) {
                    this.opacity += this.fadeSpeed;
                }

                if (this.x < 0) this.x = canvas!.width;
                if (this.x > canvas!.width) this.x = 0;
                if (this.y < 0) this.y = canvas!.height;
                if (this.y > canvas!.height) this.y = 0;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.isGold ? `rgba(245, 158, 11, ${this.opacity})` : (celebrationActive ? `rgba(16, 185, 129, ${this.opacity})` : `rgba(255, 255, 255, ${this.opacity})`);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            const particleCount = Math.min(window.innerWidth * 0.03, 70);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });

        resizeCanvas();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('maghrib-celebration', handleCelebration);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const themes = {
        dawn: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
        day: 'from-[#020617] via-[#0f172a] to-[#1e293b]', // Darker for high-end feel
        dusk: 'from-[#020617] via-[#1e1b4b] to-[#312e81]',
        night: 'from-[#000000] via-[#020617] to-[#0f172a]'
    };

    return (
        <>
            {/* Base Theme Gradient */}
            <div className={`fixed inset-0 bg-gradient-to-b ${themes[timeTheme]} transition-colors duration-[10000ms] -z-50`} />

            {/* Mesh Gradient Blobs */}
            <div className="fixed inset-0 -z-40 pointer-events-none overflow-hidden opacity-40">
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -50, 100, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -left-1/4 w-full h-full bg-[radial-gradient(circle,var(--mesh-1),transparent_60%)] blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -120, 80, 0],
                        y: [0, 100, -80, 0],
                        rotate: [0, 120, 240, 360],
                    }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-[radial-gradient(circle,var(--mesh-2),transparent_60%)] blur-[140px]"
                />
                <motion.div
                    animate={{
                        x: [0, 150, -100, 0],
                        y: [0, 80, -120, 0],
                        scale: [0.8, 1.1, 0.9, 0.8],
                    }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,var(--mesh-3),transparent_60%)] blur-[160px]"
                />
            </div>

            {/* Ethereal Glow Transition Overlay */}
            <div className="fixed inset-0 -z-30 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent_70%)] mix-blend-screen" />

            {/* Animated Particles */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-[-25] opacity-50 contrast-125"
            />

            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 -z-20 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Luxury Vignette */}
            <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)] opacity-80" />
        </>
    );
}
