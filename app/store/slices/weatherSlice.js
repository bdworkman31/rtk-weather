import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_KEY = "d408f27efbf2eb54ef2bd39871d4fe8b";

export const fetchWeather = createAsyncThunk("fetchWeather", async (city) => {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`,
  );
  return response.data;
});

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    city: "",
    defaultCity: "",
    charts: [],
    forecast: null,
    isLoading: false,
    error: null,
  },

  reducers: {
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setDefault: (state, action) => {
      state.defaultCity = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forecast = action.payload;

        const forecast = action.payload;

        const getMean = (array) => {
          return Math.ceil(
            array.reduce((sum, item) => sum + item, 0) / array.length,
          );
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

        const temps = [];

        dailyHigh_Lows.forEach((day) => {
          temps.push(day.low);
          temps.push(day.high);
        });

        const humidity = forecast?.list.map((item) => item.main.humidity) ?? [];

        const pressure = forecast?.list.map((item) => item.main.pressure) ?? [];

        const city = action.payload.city.name;

        const cityInList = state.charts.some(
          (chart) => chart.city.toLowerCase() === city.toLowerCase(),
        );

  

        if (!cityInList) {
          state.charts.unshift({
            city: action.payload.city.name,
            forecast: action.payload,
            temps,
            humidity,
            pressure,
            meanTemp: getMean(temps),
            meanHumidity: getMean(humidity),
            meanPressure: getMean(pressure),
          });
        }
      })

      .addCase(fetchWeather.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setCity, setDefault } = weatherSlice.actions;

export default weatherSlice.reducer;
