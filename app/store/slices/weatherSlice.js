import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_KEY = "";

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
    forecast: null,
    isLoading: false,
    error: null,
  },

  reducers: {
    setCity: (state, action) => {
      state.city = action.payload;
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
      })

      .addCase(fetchWeather.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setCity } = weatherSlice.actions;

export default weatherSlice.reducer;
