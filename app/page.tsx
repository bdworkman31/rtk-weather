"use client";

import type { AppDispatch, RootState } from "./store/configureStore";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCity,
  setDefault,
  fetchWeather,
  geoLocateWeather,
} from "./store/slices/weatherSlice";
import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";

const useAppDispatch = useDispatch.withTypes<AppDispatch>();
const useAppSelector = useSelector.withTypes<RootState>();

export default function Home() {
  const { city, charts, defaultCity, isLoading, error } = useAppSelector(
    (state) => state.forecast,
  );

  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isLocating, setIsLocating] = useState(false);

  const API_KEY = "AIzaSyAssh9tmRV-DW_7coXhPbjzojPxue3A0mQ";

  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(fetchWeather(city));
    dispatch(setCity(""));
  };

  const handleDefault = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    localStorage.setItem("defaultWeatherCity", charts[0].city);
    dispatch(setCity(""));
    alert(`${charts[0].city} has been saved to default!`);
  };

  const handleCurrentLocation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };

        setCurrentCoords(location);

        dispatch(geoLocateWeather(location)).finally(() => {
          setIsLocating(false);
        });
      },
      (error) => {
        setIsLocating(false);
        alert(error.message);
      },
    );
  };

  useEffect(() => {
    const savedCity = localStorage.getItem("defaultWeatherCity");

    if (savedCity) {
      dispatch(setDefault(savedCity));
      dispatch(fetchWeather(savedCity));
      dispatch(setCity(savedCity));
      dispatch(setCity(""));
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
          type="button"
          onClick={handleDefault}
        >
          Set as Default
        </button>
      </form>

      <button
        className={styles.geoLocate}
        type="button"
        onClick={handleCurrentLocation}
      >
        Find Current Location
      </button>

      {(isLocating || isLoading) && <p>Loading...</p>}

      {currentCoords && (
        <iframe
          className={styles.map}
          title="Current location map"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${currentCoords.latitude},${currentCoords.longitude}`}
        />
      )}

      {defaultCity && (
        <p className={styles.card}>Default city: {defaultCity}</p>
      )}

      {(isLocating || isLoading) && <p>Loading...</p>}

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
