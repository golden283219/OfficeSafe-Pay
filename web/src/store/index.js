import { configureStore, combineReducers } from "@reduxjs/toolkit";
import globalReducer from "./global";

const reducer = combineReducers({
  global: globalReducer,
});

const store = configureStore({
  reducer,
});

export default store;
