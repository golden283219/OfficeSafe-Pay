import React from "react";
import Routes from "./routes";
import { Provider as ReduxProvider } from "react-redux";
import Grid from "@material-ui/core/Grid";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Footer } from "./components/layout/Footer";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import "./App.css";
// redux
import store from "./store/index";

const theme = createTheme({
  palette: {
    primary: {
      main: "#435E73",
    },
  },
});

function App() {
  return (
    <React.Fragment>
      <MuiThemeProvider theme={theme}>
        <ReduxProvider store={store}>
          <div
            style={{ height: "100%", minHeight: "100vh", position: "relative" }}
          >
            <Header />
            <Grid
              container
              style={{
                paddingTop: 80,
                overflow: "auto",
                paddingBottom: 60,
                height: "100%",
              }}
            >
              <Grid item sm={2} id="sidebar">
                <Sidebar />
              </Grid>
              <Grid item xs={12} sm={10} md={10} id="main">
                <Routes />
              </Grid>
            </Grid>
            <Footer></Footer>
          </div>
        </ReduxProvider>
      </MuiThemeProvider>
    </React.Fragment>
  );
}

export default App;
