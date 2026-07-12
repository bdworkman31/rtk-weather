import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_KEY = "d408f27efbf2eb54ef2bd39871d4fe8b";

type WeatherItem = {
  dt_txt: string;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
};

type WeatherResponse = {
  city: {
    name: string;
  };
  list: WeatherItem[];
};

type WeatherChart = {
  city: string;
  forecast: WeatherResponse;
  temps: number[];
  humidity: number[];
  pressure: number[];
  meanTemp: number;
  meanHumidity: number;
  meanPressure: number;
};

type WeatherState = {
  city: string;
  defaultCity: string;
  charts: WeatherChart[];
  forecast: WeatherResponse | null;
  isLoading: boolean;
  error: string | undefined;
};

const initialState: WeatherState = {
  city: "",
  defaultCity: "",
  charts: [],
  forecast: null,
  isLoading: false,
  error: undefined,
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

export const fetchWeather = createAsyncThunk<WeatherResponse, string>(
  "fetchWeather",
  async (city: string) => {
    const response = await axios.get<WeatherResponse>(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`,
    );
    return response.data;
  },
);

export const geoLocateWeather = createAsyncThunk<WeatherResponse, Coordinates>(
  "weather/geoLocateWeather",
  async ({ latitude, longitude }) => {
    const response = await axios.get<WeatherResponse>(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: API_KEY,
          units: "imperial",
        },
      },
    );

    return response.data;
  },
);

const addWeatherChart = (state: WeatherState, forecast: WeatherResponse) => {
  state.isLoading = false;
  state.forecast = forecast;

  const getMean = (array: number[]) => {
    return Math.ceil(array.reduce((sum, item) => sum + item, 0) / array.length);
  };

  const groupedDays = forecast?.list.reduce<Record<string, WeatherItem[]>>(
    (days, item) => {
      const date = item.dt_txt.split(" ")[0];

      days[date] ??= [];
      days[date].push(item);

      return days;
    },
    {},
  );

  const dailyHigh_Lows = Object.values(groupedDays ?? {})
    .slice(1)
    .map((day) => ({
      high: Math.max(...day.map((item) => item.main.temp)),
      low: Math.min(...day.map((item) => item.main.temp)),
    }));

  const temps: number[] = [];

  dailyHigh_Lows.forEach((day) => {
    temps.push(day.low);
    temps.push(day.high);
  });

  const humidity = forecast?.list.map((item) => item.main.humidity) ?? [];

  const pressure = forecast?.list.map((item) => item.main.pressure) ?? [];

  const city = forecast.city.name;

  const cityInList = state.charts.some(
    (chart) => chart.city.toLowerCase() === city.toLowerCase(),
  );

  if (!cityInList) {
    state.charts.unshift({
      city,
      forecast,
      temps,
      humidity,
      pressure,
      meanTemp: getMean(temps),
      meanHumidity: getMean(humidity),
      meanPressure: getMean(pressure),
    });
  }
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,

  reducers: {
    setCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
    },
    setDefault: (state, action: PayloadAction<string>) => {
      state.defaultCity = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })

      .addCase(geoLocateWeather.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })

      .addCase(fetchWeather.fulfilled, (state, action) => {
        addWeatherChart(state, action.payload);
      })

      .addCase(geoLocateWeather.fulfilled, (state, action) => {
        addWeatherChart(state, action.payload);
      })

      .addCase(fetchWeather.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(geoLocateWeather.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setCity, setDefault } = weatherSlice.actions;

export default weatherSlice.reducer;
