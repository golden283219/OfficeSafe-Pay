import { createSlice } from "@reduxjs/toolkit";

//Slice
const slice = createSlice({
  name: "global",
  initialState: {
    isLoading: false,
    error: false,
    patient: {},
    user: {},
  },
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // INITIALISE
    getInitialize(state, action) {
      state.isLoading = false;
      state.patient = action.payload.patient;
    },

    setPatient(state, action) {
      state.isLoading = false;
      state.patient = action.payload;
    },
  },
});

// export function getInitialize() {
//   return async (dispatch) => {
//     dispatch(slice.actions.startLoading());
//   };
// }

export function setPatient(data) {
  return async (dispatch) => {
    dispatch(slice.actions.setPatient(data));
  };
}

export default slice.reducer;
