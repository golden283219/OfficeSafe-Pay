import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";

//Slice
const userSlice = createSlice({
  name: "user",
  initialState: false,
  reducers: {
    setUser: (state, action) => {
      state = action.payload;
      return state; //TODO fix it. without this returns "A case reducer on a non-draftable value must not return undefined"
    },
  },
});

//Selectors
const selectRoot = (state) => state.user;

const selectUser = createSelector(selectRoot, (state) => state);

export const { actions, reducer } = userSlice;
export { selectUser };
