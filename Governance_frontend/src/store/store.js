import { configureStore } from "@reduxjs/toolkit";
import { partyReducer } from "./fetch_party_slice";
let store = configureStore({
  reducer: {
    party: partyReducer,
  },
});

export default store;
