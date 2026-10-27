/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Live weather from Open-Meteo (free, no API key): https://open-meteo.com

export interface WeatherPlace {
  name: string;
  region: string;
  lat: number;
  lon: number;
}

export interface DailyForecast {
  date: string;
  day: string;
  max: number;
  min: number;
  rainProb: number;
  rainMm: number;
  code: number;
}

export interface LiveWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  code: number;
  isDay: boolean;
  rainProbToday: number;
  daily: DailyForecast[];
  fetchedAt: Date;
}

export const presetPlaces: WeatherPlace[] = [
  { name: "Indore", region: "Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { name: "Pune", region: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Ludhiana", region: "Punjab", lat: 30.901, lon: 75.8573 },
  { name: "Karnal", region: "Haryana", lat: 29.6857, lon: 76.9905 },
  { name: "Nashik", region: "Maharashtra", lat: 19.9975, lon: 73.7898 },
  { name: "Guntur", region: "Andhra Pradesh", lat: 16.3067, lon: 80.4365 },
  { name: "Coimbatore", region: "Tamil Nadu", lat: 11.0168, lon: 76.9558 },
  { name: "Patna", region: "Bihar", lat: 25.5941, lon: 85.1376 }
];

// WMO weather interpretation codes
export function describeWeather(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return code >= 65 ? "Heavy rain" : "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

export type WeatherKind = "sun" | "partly" | "cloud" | "fog" | "drizzle" | "rain" | "storm" | "snow";

export function weatherKind(code: number): WeatherKind {
  if (code === 0) return "sun";
  if (code <= 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  return "cloud";
}

export async function fetchWeather(place: WeatherPlace, signal?: AbortSignal): Promise<LiveWeather> {
  const params = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
    timezone: "auto",
    forecast_days: "7"
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!res.ok) throw new Error(`Weather service returned ${res.status}`);
  const data = await res.json();

  const d = data.daily;
  const daily: DailyForecast[] = d.time.map((date: string, i: number) => ({
    date,
    day: i === 0 ? "Today" : new Date(date + "T00:00").toLocaleDateString("en-IN", { weekday: "short" }),
    max: Math.round(d.temperature_2m_max[i]),
    min: Math.round(d.temperature_2m_min[i]),
    rainProb: d.precipitation_probability_max[i] ?? 0,
    rainMm: d.precipitation_sum[i] ?? 0,
    code: d.weather_code[i]
  }));

  return {
    temp: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    wind: Math.round(data.current.wind_speed_10m),
    code: data.current.weather_code,
    isDay: data.current.is_day === 1,
    rainProbToday: daily[0]?.rainProb ?? 0,
    daily,
    fetchedAt: new Date()
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<WeatherPlace[]> {
  const params = new URLSearchParams({ name: query, count: "6", language: "en", format: "json" });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude
  }));
}

// Field advice derived from the actual forecast numbers
export function farmingTips(w: LiveWeather): string[] {
  const tips: string[] = [];
  const next3 = w.daily.slice(0, 3);
  const rainSoon = next3.some((d) => d.rainProb >= 60);
  const rain3Total = next3.reduce((s, d) => s + d.rainMm, 0);
  const hottest = Math.max(...w.daily.map((d) => d.max));

  if (rainSoon) {
    tips.push(`Rain likely in the next 3 days (${rain3Total.toFixed(0)} mm expected). Hold off on pesticide and foliar sprays so they aren't washed off.`);
    tips.push("Clear field drainage channels and skip the next irrigation cycle to avoid waterlogging.");
  } else {
    tips.push("Dry spell ahead. A good window for spraying, weeding and harvesting operations.");
  }
  if (w.wind >= 20) tips.push(`Winds at ${w.wind} km/h. Avoid spraying today because of drift; stake tall crops if needed.`);
  if (hottest >= 35) tips.push(`Highs up to ${hottest}°C this week. Irrigate early morning or evening and mulch to cut evaporation.`);
  if (w.humidity >= 80) tips.push(`Humidity at ${w.humidity}%. Watch for fungal disease (blast, blight, mildew) and scout leaves this week.`);
  if (hottest < 35 && !rainSoon && w.humidity < 60) tips.push("Moderate temperatures and low humidity. Check soil moisture before watering; you may need less than usual.");
  return tips.slice(0, 4);
}
