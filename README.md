# Global Ramadan Hub - Setup & Deployment Guide

## 🌙 Overview

Global Ramadan Hub is a comprehensive PWA built with Next.js 14 that provides Muslims worldwide with prayer times, weather information, duas, authentic hadith, and daily adhkar. The application supports both English and Arabic with automatic RTL/LTR switching.

## ✨ Features

- **Auto Language Detection**: Automatically detects browser/device language
- **Prayer Times**: Real-time prayer times using Aladhan API with geolocation or manual city selection
- **Live Weather**: Current weather conditions using Open-Meteo API
- **Live Clock**: Real-time clock with timezone support
- **Iftar Countdown**: Dynamic countdown to Maghrib prayer
- **Monthly Imsakiyah**: Complete monthly prayer timetable
- **Duas Collection**: 30 authentic Ramadan duas in English and Arabic
- **Hadith**: Authentic hadith from Sahih al-Bukhari and Sahih Muslim
- **Adhkar**: Daily adhkar with interactive counters
- **Notifications**: Browser notifications for Suhoor and Iftar
- **Calendar Export**: Export prayer times to calendar (.ics files)
- **PWA Support**: Installable app with offline support
- **Premium UI**: Modern, responsive design with smooth animations

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

## 🚀 Installation

### 1. Install Dependencies

```bash
cd ramadan-hub
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and configure everything
6. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

### Environment Variables

No environment variables are required! The app uses:
- **Aladhan API**: Public API, no key needed
- **Open-Meteo API**: Public API, no key needed

## 📱 PWA Installation

### On Desktop (Chrome/Edge):
1. Visit the deployed site
2. Look for the install icon in the address bar
3. Click "Install"

### On Mobile (iOS/Android):
1. Visit the site in Safari (iOS) or Chrome (Android)
2. Tap the share button
3. Select "Add to Home Screen"

## 🎨 Customization

### Changing Calculation Methods

Users can select from 7 different prayer time calculation methods in Settings:
- Muslim World League (MWL)
- Islamic Society of North America (ISNA)
- Egyptian General Authority
- Umm Al-Qura University, Makkah
- University of Islamic Sciences, Karachi
- Institute of Geophysics, University of Tehran
- Shia Ithna-Ashari, Leva Institute, Qum

### Adding More Languages

1. Create a new translation file in `/messages/[locale].json`
2. Add the locale to `i18n/routing.ts`
3. Update the language toggle in `components/Header.tsx`

## 📂 Project Structure

```
ramadan-hub/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx       # Localized layout with RTL support
│   │   └── page.tsx          # Main page with tab navigation
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── TodaySection.tsx      # Prayer times & weather
│   ├── ImsakiyahSection.tsx  # Monthly timetable
│   ├── AdhkarSection.tsx     # Daily adhkar with counters
│   ├── HadithSection.tsx     # Hadith collection
│   ├── SettingsSection.tsx   # User settings
│   ├── DisclaimerBanner.tsx  # Disclaimer notice
│   └── LoadingSkeleton.tsx   # Loading state
├── data/
│   ├── duas.json             # 30 Ramadan duas
│   ├── hadith.json           # Authentic hadith
│   └── adhkar.json           # Daily adhkar
├── lib/
│   ├── prayer-times.ts       # Aladhan API integration
│   ├── weather.ts            # Open-Meteo API integration
│   └── notifications.ts      # Notifications & calendar export
├── messages/
│   ├── en.json               # English translations
│   └── ar.json               # Arabic translations
├── public/
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker
└── i18n/
    └── routing.ts            # i18n routing config
```

## ⚙️ Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Date Handling**: date-fns
- **Icons**: lucide-react
- **APIs**: Aladhan (prayer times), Open-Meteo (weather)

## 🔧 Configuration

All user settings are stored in `localStorage`:
- Language preference
- Location mode (geolocation vs manual)
- City and country (for manual mode)
- Calculation method
- Notification preferences
- Theme preference

## ⚠️ Important Disclaimers

**Prayer Times**: Prayer times are calculated using the Aladhan API and may vary. Users should always confirm with their local mosque or Islamic center for the most accurate times.

**Weather Data**: Weather information is provided for convenience and may not reflect actual conditions. Always check official weather sources for critical decisions.

**Hadith Authenticity**: All hadith included are from Sahih al-Bukhari and Sahih Muslim with proper references. No fabricated or weak hadith are included.

## 🐛 Troubleshooting

### Geolocation Not Working
- Ensure the browser has location permissions enabled
- Use HTTPS (required for geolocation API)
- Fallback to manual city selection in Settings

### Notifications Not Showing
- Check browser notification permissions
- Ensure notifications are enabled in Settings
- Some browsers block notifications on HTTP (use HTTPS)

### Prayer Times Not Loading
- Check internet connection
- Verify Aladhan API is accessible
- Try switching between geolocation and manual city mode

## 📄 License

This project is open source and available for use by the Muslim community worldwide.

## 🤲 Credits

- Prayer times data: [Aladhan API](https://aladhan.com/prayer-times-api)
- Weather data: [Open-Meteo](https://open-meteo.com/)
- Hadith references: Sahih al-Bukhari, Sahih Muslim
- Built with ❤️ for the Muslim Ummah

---

**May Allah accept this effort and make it beneficial for Muslims worldwide. Ramadan Mubarak! 🌙**
