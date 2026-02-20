// Weather API using Open-Meteo (no API key required)
export interface WeatherData {
    current: {
        temperature: number;
        apparent_temperature: number;
        windspeed: number;
        humidity: number;
        weathercode: number;
        time: string;
    };
    daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weathercode: number[];
    };
}

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

export async function getIPLocation(): Promise<{ latitude: number; longitude: number; city: string; country: string }> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('IP Geolocation failed');
        const data = await response.json();
        return {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            country: data.country_name,
        };
    } catch (error) {
        // Fallback to Chouf, Lebanon if IP detection also fails
        return {
            latitude: 33.6931,
            longitude: 35.5828,
            city: 'Chouf',
            country: 'Lebanon',
        };
    }
}

export async function getWeatherByCoordinates(
    latitude: number,
    longitude: number
): Promise<WeatherData> {
    const url = `${OPEN_METEO_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,windspeed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const response = await fetch(url, { next: { revalidate: 600 } }); // Cache for 10 minutes

    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    return {
        current: {
            temperature: data.current.temperature_2m,
            apparent_temperature: data.current.apparent_temperature,
            windspeed: data.current.windspeed_10m,
            humidity: data.current.relative_humidity_2m,
            weathercode: data.current.weathercode,
            time: data.current.time,
        },
        daily: {
            temperature_2m_max: data.daily.temperature_2m_max,
            temperature_2m_min: data.daily.temperature_2m_min,
            weathercode: data.daily.weathercode,
        },
    };
}
