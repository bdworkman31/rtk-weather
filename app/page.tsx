"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";

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

  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isLocating, setIsLocating] = useState(false);

  const API_KEY = "AIzaSyDbcmkOz0m2H2Eo5eum8Cm61U4jWCrn6rg";
  const MAP_ID = "a6a16c3d3827ae115b8017cd";

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

  const handleMapClick = (event: MapMouseEvent) => {
    const clickedCoords = event.detail.latLng;

    if (!clickedCoords) {
      return;
    }

    const location = {
      latitude: clickedCoords.lat,
      longitude: clickedCoords.lng,
    };

    setSelectedCoords(location);
    dispatch(geoLocateWeather(location));
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
        setSelectedCoords(location);

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
        <APIProvider apiKey={API_KEY}>
          <div className={styles.map}>
            <Map
              defaultCenter={{
                lat: currentCoords.latitude,
                lng: currentCoords.longitude,
              }}
              defaultZoom={10}
              mapId={MAP_ID}
              gestureHandling="greedy"
              onClick={handleMapClick}
              style={{
                width: "100%",
                height: "400px",
                border: "4 px solid blue",
              }}
            >
              {selectedCoords && (
                <AdvancedMarker
                  position={{
                    lat: selectedCoords.latitude,
                    lng: selectedCoords.longitude,
                  }}
                  title="Selected location"
                >
                  <Pin
                    background="#4285F4"
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                  />
                </AdvancedMarker>
              )}
            </Map>
          </div>
        </APIProvider>
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
        <div key={chart.city} className={styles.weatherContainer}>
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
