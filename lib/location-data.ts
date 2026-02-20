export interface Country {
    name: string;
    iso2: string;
    iso3: string;
}

export interface CityResponse {
    error: boolean;
    msg: string;
    data: string[];
}

export interface CountryResponse {
    error: boolean;
    msg: string;
    data: Country[];
}

const BASE_URL = 'https://countriesnow.space/api/v0.1/countries';

export async function getCountries(): Promise<Country[]> {
    try {
        const response = await fetch(`${BASE_URL}/iso`);
        const data: CountryResponse = await response.json();
        return data.data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
}

export async function getCities(country: string): Promise<string[]> {
    try {
        const response = await fetch(`${BASE_URL}/cities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ country }),
        });
        const data: CityResponse = await response.json();
        return data.data.sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
}
