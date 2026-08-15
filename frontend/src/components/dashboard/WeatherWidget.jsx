import React, { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudRain,
};

export default function WeatherWidget({ user }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        navigator.geolocation?.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await base44.integrations.Core.InvokeLLM({
              prompt: `Get current weather for coordinates ${latitude}, ${longitude}. Return only: city name, temperature in Celsius, and weather condition (sunny/cloudy/rainy/stormy).`,
              add_context_from_internet: true,
              response_json_schema: {
                type: "object",
                properties: {
                  city: { type: "string" },
                  temperature: { type: "number" },
                  condition: { type: "string" },
                },
              },
            });
            if (!cancelled) setWeather(response);
          },
          () => {
            // Location denied — silently skip, dashboard still works without weather.
          }
        );
      } catch (error) {
        console.error("Error loading weather:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading weather...
      </div>
    );
  }

  if (!weather) return null;

  const Icon = ICONS[weather.condition?.toLowerCase()] || Sun;

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
      <Icon className="w-8 h-8 text-amber-500" />
      <div>
        <p className="font-semibold text-gray-800">{Math.round(weather.temperature)}°C</p>
        <p className="text-xs text-gray-500">{weather.city}</p>
      </div>
    </div>
  );
}
