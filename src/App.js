import React, { useState } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Geocoding
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        setLoading(false);
        return;
      }
      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        country,
        ...weatherData.current_weather,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">🌦️ Weather Now</h1>

      <form onSubmit={fetchWeather} className="flex gap-2 w-full max-w-lg mb-6">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-800 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 transition"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {weather && (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-sm text-center">
          <h2 className="text-xl font-semibold mb-2">
            {weather.city}, {weather.country}
          </h2>
          <p className="text-4xl font-bold">{weather.temperature}°C</p>
          <p className="text-gray-300 mt-2">
            Windspeed: {weather.windspeed} km/h
          </p>
          <p className="text-gray-400 text-sm">
            Updated: {new Date(weather.time).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}