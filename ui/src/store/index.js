import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { reducer as notificationReducer } from "./notification";
import { reducer as globalReducer } from "./global";
import { reducer as userReducer } from "./user";

const reducer = combineReducers({
  global: globalReducer,
  notification: notificationReducer,
  user: userReducer,
  //requests: requestsReducer,
});

const store = configureStore({
  reducer,
});

export default store;
