import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";

const globalHistory = [];

//Slice
const globalSlice = createSlice({
  name: "global",
  initialState: {
    state: 1,
    statePayload: {},
    stateHistory: [],
    user: false,
  },
  reducers: {
    wentBack: (state, action) => {
      [state.state, state.statePayload] = globalHistory.pop();
      if (action.payload) {
        state.statePayload.result = action.payload;
      }
    },
    stateChanged: (state, action) => {
      globalHistory.push([state.state, action.payload.preserve || {}]);
      if (action.payload.payload) {
        if (action.payload.payload.resetHistory) {
          // wipe history on flag
          globalHistory.splice(0);
        } else if (action.payload.payload.skipHistory) {
          // remove last entity
          globalHistory.pop();
        }
      }
      state.state = action.payload.state;
      state.statePayload = action.payload.payload;
    },
  },
});

//Selectors
const selectRoot = (state) => state.global;

const selectState = createSelector(selectRoot, (state) => state.state);

const selectGlobal = createSelector(selectRoot, (state) => state); //TODO temporary

export const { actions, reducer } = globalSlice;
export { selectState, selectGlobal };
