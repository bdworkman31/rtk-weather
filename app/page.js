"use client";

import styles from "./page.module.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCity, setDefault, fetchWeather } from "./store/slices/weatherSlice";
import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";

export default function Home() {
  const { city, charts, defaultCity, isLoading, error } = useSelector(
    (state) => state.forecast,
  );

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchWeather(city));
    dispatch(setCity(""));
  };

  const handleDefault = (e) => {
    e.preventDefault();
    dispatch(setDefault(city));
    localStorage.setItem("defaultWeatherCity", city);
    alert(`${city} has been saved to default!`);
  };

  useEffect(() => {
    const savedCity = localStorage.getItem("defaultWeatherCity");

    if (savedCity) {
      dispatch(setDefault(savedCity));
      dispatch(fetchWeather(savedCity));
    }
  }, [dispatch]);

  return (
    <main className={styles.main}>
      <h1>Weather App</h1>

      <form className={styles.card} onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          placeholder="Enter city"
          onChange={(e) => dispatch(setCity(e.target.value))}
        />

        <button className={styles.buttonClass} type="submit">
          Get Weather
        </button>
        <button
          className={styles.buttonClass}
          type="submit"
          onClick={handleDefault}
        >
          Set as Default
        </button>
      </form>

      {defaultCity && (
        <p className={styles.card}>Default city: {defaultCity}</p>
      )}

      {isLoading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      <div className={styles.columnNameContainer}>
        <div className={styles.card}>City</div>
        <div className={styles.card}>Temperature</div>
        <div className={styles.card}>Humidity</div>
        <div className={styles.card}>Pressure</div>
      </div>

      {charts.map((chart) => (
        <div key={`${chart}`} className={styles.weatherContainer}>
          <div className={styles.card}>
            <h2 className={styles.cityName}>{chart.city}</h2>
          </div>

          <div className={styles.card}>
            <Sparklines data={chart.temps}>
              <SparklinesLine color="orange" />
              <SparklinesReferenceLine type="mean" />
            </Sparklines>
            <p>{chart.meanTemp}°F</p>
          </div>

          <div className={styles.card}>
            <Sparklines data={chart.humidity}>
              <SparklinesLine color="red" />
              <SparklinesReferenceLine type="mean" />
            </Sparklines>
            <p>{chart.meanHumidity}%</p>
          </div>

          <div className={styles.card}>
            <Sparklines data={chart.pressure}>
              <SparklinesLine color="white" />
              <SparklinesReferenceLine type="mean" />
            </Sparklines>
            <p>{chart.meanPressure} hPa</p>
          </div>
        </div>
      ))}
    </main>
  );
}
