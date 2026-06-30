"use client";

import styles from "./page.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setCity, fetchWeather } from "./store/slices/weatherSlice";
// import { Sparklines } from "react-sparklines";

export default function Home() {
  const { city, forecast } = useSelector((state) => state.weather);

  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchWeather(city));
  };

  return (
    <main className={styles.main}>
      <h1>Weather App</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          placeholder="Enter city"
          onChange={(e) => dispatch(setCity(e.target.value))}
        />

        <button type="submit">Get Weather</button>
      </form>

      {
        <div>
          <h2>{forecast.name}</h2>
          <p>{weather.main.temp}°F</p>
        </div>
      }
    </main>
  );
}
