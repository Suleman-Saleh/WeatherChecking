# 🌦️ Weather Checking

A clean weather app: search any city, or use your current location, for the current conditions, air quality and a 3-day forecast, and bookmark your favourite cities so they are one click away next time. Built with **React**, **Vite** and **TypeScript**, styled with **Tailwind CSS** and shadcn/ui components, using [WeatherAPI.com](https://www.weatherapi.com/).

## Features

- Search a city, or use **your location**, for temperature, conditions, humidity, wind and **air quality**
- **3-day forecast** in a detail pop-up
- **Bookmark cities**, saved in the browser (`localStorage`)
- Toast notifications and a responsive layout

## Run it locally

```bash
npm install
npm run dev          # http://localhost:8080
```

The app calls `api.weatherapi.com` with a WeatherAPI key set in `src/pages/Index.tsx` (`API_KEY`); use your own free key from weatherapi.com.

## Tech

React · Vite · TypeScript · Tailwind CSS · shadcn/ui (Radix) · TanStack Query · WeatherAPI.com

---

Built by [Muhammad Suleman](https://github.com/Suleman-Saleh)
