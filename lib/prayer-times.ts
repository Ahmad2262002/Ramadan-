// Prayer Times API using Aladhan
export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
}

export interface PrayerTimesResponse {
    timings: PrayerTimes;
    date: {
        readable: string;
        gregorian: {
            date: string;
            day: string;
            month: { number: number; en: string };
            year: string;
        };
        hijri: {
            date: string;
            day: string;
            month: { number: number; en: string; ar: string };
            year: string;
        };
    };
    meta: {
        timezone: string;
        latitude: number;
        longitude: number;
        method: {
            id: number;
            name: string;
        };
    };
}

export interface MonthlyPrayerTimes {
    timings: PrayerTimes;
    date: {
        readable: string;
        gregorian: { date: string; day: string };
        hijri: {
            date: string;
            day: string;
            month: { number: number; en: string; ar: string };
            year: string;
        };
    };
}

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';

export async function getPrayerTimesByCoordinates(
    latitude: number,
    longitude: number,
    method: number = 2
): Promise<PrayerTimesResponse> {
    const today = new Date();
    const timestamp = Math.floor(today.getTime() / 1000);

    const url = `${ALADHAN_BASE_URL}/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    return data.data;
}

export async function getPrayerTimesByCity(
    city: string,
    country: string,
    method: number = 2
): Promise<PrayerTimesResponse> {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const url = `${ALADHAN_BASE_URL}/timingsByCity/${day}-${month}-${year}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    return data.data;
}

export async function getMonthlyPrayerTimes(
    latitude: number,
    longitude: number,
    month: number,
    year: number,
    method: number = 2
): Promise<MonthlyPrayerTimes[]> {
    const url = `${ALADHAN_BASE_URL}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours

    if (!response.ok) {
        throw new Error('Failed to fetch monthly prayer times');
    }

    const data = await response.json();
    return data.data;
}

export async function getMonthlyPrayerTimesByCity(
    city: string,
    country: string,
    month: number,
    year: number,
    method: number = 2
): Promise<MonthlyPrayerTimes[]> {
    const url = `${ALADHAN_BASE_URL}/calendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });

    if (!response.ok) {
        throw new Error('Failed to fetch monthly prayer times');
    }

    const data = await response.json();
    return data.data;
}

export async function getHijriMonthlyPrayerTimes(
    latitude: number,
    longitude: number,
    month: number,
    year: number,
    method: number = 2
): Promise<MonthlyPrayerTimes[]> {
    const url = `${ALADHAN_BASE_URL}/hijriCalendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });

    if (!response.ok) {
        throw new Error('Failed to fetch hijri monthly prayer times');
    }

    const data = await response.json();
    return data.data;
}

export async function getHijriMonthlyPrayerTimesByCity(
    city: string,
    country: string,
    month: number,
    year: number,
    method: number = 2
): Promise<MonthlyPrayerTimes[]> {
    const url = `${ALADHAN_BASE_URL}/hijriCalendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });

    if (!response.ok) {
        throw new Error('Failed to fetch hijri monthly prayer times');
    }

    const data = await response.json();
    return data.data;
}

export const CALCULATION_METHODS = {
    MWL: 3,
    ISNA: 2,
    Egypt: 5,
    Makkah: 4,
    Karachi: 1,
    Tehran: 7,
    Jafari: 0,
};
