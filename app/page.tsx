"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";

import type { AppDispatch, RootState } from "./store/configureStore";
import type { Coordinates } from "./store/slices/weatherSlice";
import styles from "./page.module.css";

import {
  setCity,
  setDefault,
  fetchWeather,
  geoLocateWeather,
  setError,
  clearError,
} from "./store/slices/weatherSlice";

import WeatherSearch from "./components/WeatherSearch";
import GoogleMap from "./components/GoogleMap";
import WeatherCharts from "./components/WeatherCharts";

const useAppDispatch = useDispatch.withTypes<AppDispatch>();
const useAppSelector = useSelector.withTypes<RootState>();

export default function Home() {
  const { city, charts, defaultCity, isLoading, error } = useAppSelector(
    (state) => state.forecast,
  );

  const dispatch = useAppDispatch();

  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(
    null,
  );

  const [isLocating, setIsLocating] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cityInList = charts.some(
      (chart) => chart.city.toLowerCase() === city.toLowerCase(),
    );

    if (cityInList) {
      alert("Cirty already exists");
      dispatch(setError("City already exists."));

      setTimeout(() => {
        dispatch(clearError());
      }, 3000);

      return;
    }

    if (!city.trim()) {
      alert("Please Select a City");
      dispatch(setError("Please select a city."));

      setTimeout(() => {
        dispatch(clearError());
      }, 3000);

      return;
    }

    dispatch(fetchWeather(city));
    dispatch(setCity(""));
  };

  const handleCityChange = (newCity: string) => {
    dispatch(setCity(newCity));
  };

  const handleDefault = () => {
    if (!charts[0]) {
      alert("Search for a city first.");
      return;
    }

    localStorage.setItem("defaultWeatherCity", charts[0].city);
    dispatch(setDefault(charts[0].city));

    alert(`${charts[0].city} has been saved to default!`);
  };

  const handleMapClick = (event: MapMouseEvent) => {
    const clickedCoords = event.detail.latLng;

    if (!clickedCoords) {
      return;
    }

    const location: Coordinates = {
      latitude: clickedCoords.lat,
      longitude: clickedCoords.lng,
    };

    setSelectedCoords(location);
    dispatch(geoLocateWeather(location));
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location: Coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };

        setCurrentCoords(location);
        setSelectedCoords(location);

        dispatch(geoLocateWeather(location)).finally(() => {
          setIsLocating(false);
        });
      },
      (geolocationError) => {
        setIsLocating(false);
        alert(geolocationError.message);
      },
    );
  };

  useEffect(() => {
    const savedCity = localStorage.getItem("defaultWeatherCity");

    if (savedCity) {
      dispatch(setDefault(savedCity));
      dispatch(fetchWeather(savedCity));
      dispatch(setCity(""));
    }
  }, [dispatch]);

  return (
    <main className={styles.main}>
      <h1>Search the Weather</h1>

      <WeatherSearch
        city={city}
        onCityChange={handleCityChange}
        onSubmit={handleSubmit}
        onSetDefault={handleDefault}
        onCurrentLocation={handleCurrentLocation}
      />

      {(isLocating || isLoading) && (
        <p className={styles.loading}>Retrieving weather information...</p>
      )}

      <GoogleMap
        currentCoords={currentCoords}
        selectedCoords={selectedCoords}
        onMapClick={handleMapClick}
      />

      {defaultCity && (
        <p className={styles.defaultCity}>
          Default city: <strong>{defaultCity}</strong>
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <WeatherCharts charts={charts} />
    </main>
  );
}
