import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";

// Services
const GET_NOTIFICATIONS = createAsyncThunk("notification/GET_all", async () => {
  //It's possible to pass payload as first param and {dispatch, getState} as second param and use inside this func
  // const { global } = getState()
  // you can dispatch any action from here
  // dispatch()
  return fetch(`http://localhost:5000/notifications.json`).then((res) =>
    res.json()
  );
});

const DELETE_NOTIFICATION = createAsyncThunk(
  "notification/DELETE_single",
  async (id) => {
    //It's possible to pass payload as first param and {dispatch, getState} as second param and use inside this func
    // const { global } = getState()
    // you can dispatch any action from here
    // dispatch()
    //
    // fetch()
    return Promise.resolve(id);
  }
);

// Slice
const notificationSlice = createSlice({
  name: "notification",
  initialState: { list: [], status: null },
  reducers: {},
  extraReducers: {
    [GET_NOTIFICATIONS.pending]: (state) => {
      state.status = "loading";
    },
    [GET_NOTIFICATIONS.fulfilled]: (state, { payload }) => {
      state.list = payload;
      state.status = "success";
    },
    [GET_NOTIFICATIONS.rejected]: (state) => {
      state.status = "failed";
    },
    [DELETE_NOTIFICATION.fulfilled]: (state, { payload }) => {
      state.list = state.list.filter((item) => item.id !== payload);
    },
  },
});

// Selectors
const selectRoot = (state) => state.notification;

const selectNotificationQuantity = createSelector(
  selectRoot,
  (state) => state.list.length
);

const selectNotificationList = createSelector(
  selectRoot,
  (state) => state.list
);

export const { actions, reducer } = notificationSlice;
export { selectNotificationQuantity, selectNotificationList };
export const asyncActions = { GET_NOTIFICATIONS, DELETE_NOTIFICATION };
