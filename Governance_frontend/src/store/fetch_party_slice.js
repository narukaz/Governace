import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const fetch_party = createAsyncThunk(
  "party/fetchParties",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(
        "http://localhost:8080/fetch_party_results"
      );

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch failed"
      );
    }
  }
);

const party_slice = createSlice({
  name: "party",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetch_party.pending, (state) => {
        // console.log("action", state);
        state.loading = true;
        state.error = null;
      })
      .addCase(fetch_party.fulfilled, (state, action) => {
        // console.log("action", action);

        state.loading = false;
        state.data = action?.payload?.data || []; // Adjust if your response is wrapped
      })
      .addCase(fetch_party.rejected, (state, action) => {
        // console.log("action", action);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default party_slice.reducer;
export const partyReducer = party_slice.reducer;
