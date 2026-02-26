import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Geist } from "next/font/google";
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationCenter from '@/components/NotificationCenter';
import Background from '@/components/Background';
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#000000',
    viewportFit: 'cover',
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'app' });

    const baseUrl = 'https://ramadan-jade.vercel.app';
    const localizedTitle = `${t('title')} | Luxe Spiritual Hub`;
    const localizedDesc = t('subtitle');

    return {
        title: localizedTitle,
        description: localizedDesc,
        keywords: ['Ramadan 1447', 'Prayer Times', 'Athkar', 'Imsakiyah', 'Islamic App', 'Ramadan Hub Luxe', 'Ramadan 2026'],
        authors: [{ name: 'Ahmad Alkadri' }],
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: `/${locale}`,
            languages: {
                'en': '/en',
                'ar': '/ar',
            },
        },
        openGraph: {
            title: localizedTitle,
            description: localizedDesc,
            url: `${baseUrl}/${locale}`,
            siteName: 'Ramadan Hub Luxe',
            images: [
                {
                    url: '/favicon.ico',
                    width: 1200,
                    height: 630,
                    alt: 'Ramadan Hub Luxe',
                },
            ],
            locale: locale === 'ar' ? 'ar_SA' : 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: localizedTitle,
            description: localizedDesc,
            images: ['/favicon.ico'],
        },
        robots: {
            index: true,
            follow: true,
        },
        icons: {
            icon: [
                { url: '/favicon.ico', sizes: 'any' },
                { url: '/icon.svg', type: 'image/svg+xml' },
            ],
            shortcut: '/favicon.ico',
            apple: [
                { url: '/favicon.ico', sizes: '180x180', type: 'image/png' },
            ],
        },
        manifest: '/manifest.json',
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = (await import(`../../messages/${locale}.json`)).default;

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={geistSans.variable} suppressHydrationWarning>
            <body className="antialiased min-h-screen bg-black text-zinc-100 relative flex flex-col font-sans selection:bg-zinc-500/30">
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <NotificationProvider>
                        <ServiceWorkerRegistration />
                        <NotificationCenter />
                        <Background />
                        <main className="relative z-10 flex-1 flex flex-col">
                            {children}
                        </main>
                    </NotificationProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
