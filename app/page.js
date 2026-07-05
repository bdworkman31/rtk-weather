"use client";

import styles from "./page.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setCity, fetchWeather } from "./store/slices/weatherSlice";
import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";

export default function Home() {
  const { city, forecast } = useSelector((state) => state.forecast);

  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchWeather(city));
  };

  const groupedDays = forecast?.list.reduce((days, item) => {
    const date = item.dt_txt.split(" ")[0];

    days[date] ??= [];
    days[date].push(item);

    return days;
  }, {});

  const dailyHigh_Lows = Object.values(groupedDays ?? {})
    .slice(1)
    .map((day) => ({
      high: Math.max(...day.map((item) => item.main.temp)),
      low: Math.min(...day.map((item) => item.main.temp)),
    }));

  const sparklineHumidity = forecast?.list.map((item) => item.main.humidity);

  const sparklinePressure = forecast?.list.map((item) => item.main.pressure);

  const sparklineTemps = [];

  dailyHigh_Lows.forEach((day) => {
    sparklineTemps.push(day.low);
    sparklineTemps.push(day.high);
  });

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
      {sparklineTemps.length > 0 &&
        sparklineHumidity.length > 0 &&
        sparklinePressure.length > 0 && (
          <div className={styles.weatherContainer}>
            <div className={styles.card}>
              <p>Daily Highs / Lows</p>
              <Sparklines data={sparklineTemps}>
                <SparklinesLine color="orange" />
                <SparklinesReferenceLine type="mean" />
              </Sparklines>
            </div>

            <div className={styles.card}>
              <p>Humidity</p>
              <Sparklines data={sparklineHumidity}>
                <SparklinesLine color="red" />
                <SparklinesReferenceLine type="mean" />
              </Sparklines>
            </div>

            <div className={styles.card}>
              <p>Pressure</p>
              <Sparklines data={sparklinePressure}>
                <SparklinesLine color="white" />
                <SparklinesReferenceLine type="mean" />
              </Sparklines>
            </div>
          </div>
        )}
    </main>
  );
}
