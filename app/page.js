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
  const { city, charts } = useSelector((state) => state.forecast);

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

      {charts.map((chart) => (
        <div className={styles.citySel}>
          <h2 className={styles.cityName}>{chart.city}</h2>
          <div className={styles.weatherContainer}>
            <div className={styles.card}>
              <p>Temperature</p>
              <Sparklines data={chart.temps}>
                <SparklinesLine color="orange" />
                <SparklinesReferenceLine type="mean" />
              </Sparklines>
              <p>{chart.meanTemp}°F</p>
            </div>

            <div className={styles.card}>
              <p>Humidity</p>
              <Sparklines data={chart.humidity}>
                <SparklinesLine color="red" />
                <SparklinesReferenceLine type="mean" />
              </Sparklines>
              <p>{chart.meanHumidity}%</p>
            </div>

            <div className={styles.card}>
              <p>Pressure</p>
              <Sparklines data={chart.pressure}>
                <SparklinesLine color="white" />
                <SparklinesReferenceLine type="mean" />
              </Sparklines>
              <p>{chart.meanPressure} hPa</p>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
