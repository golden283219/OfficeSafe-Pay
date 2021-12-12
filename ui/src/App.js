import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectState } from "./store/global";
import { asyncActions as notificationAsyncActions } from "./store/notification";
import "./assets/css/reset.css";
import "./assets/css/style.css";
import { Screen0 } from "./components/screens/0/0";
import { Screen1 } from "./components/screens/1/1";
import { Screen2 } from "./components/screens/2/2";
import { Screen3 } from "./components/screens/3/3";
import { Screen4 } from "./components/screens/4/4";
import { Screen5 } from "./components/screens/5/5";
import { Screen6 } from "./components/screens/6/6";
import { Screen7 } from "./components/screens/7/7";
import { Screen8 } from "./components/screens/8/8";
import { Screen9 } from "./components/screens/9/9";
import { Screen10 } from "./components/screens/10/10";
import { Screen11 } from "./components/screens/11/11";
import { Screen12 } from "./components/screens/12/12";
import { Screen13 } from "./components/screens/13/13";
import { Screen14 } from "./components/screens/14/14";
import { Screen15 } from "./components/screens/15/15";
import { Screen16 } from "./components/screens/16/16";
import { Screen17 } from "./components/screens/17/17";
import { Screen18 } from "./components/screens/18/18";
import { Screen19 } from "./components/screens/19/19";
import { Screen20 } from "./components/screens/20/20";

function App() {
  const dispatch = useDispatch();

  const state = useSelector(selectState);

  useEffect(() => {
    dispatch(notificationAsyncActions.GET_NOTIFICATIONS());
  }, [dispatch]);

  switch (state) {
    case 0:
      return <Screen0 />;
    case 1:
      return <Screen1 />;
    case 2:
      return <Screen2 />;
    case 3:
      return <Screen3 />;
    case 4:
      return <Screen4 />;
    case 5:
      return <Screen5 />;
    case 6:
      return <Screen6 />;
    case 7:
      return <Screen7 />;
    case 8:
      return <Screen8 />;
    case 9:
      return <Screen9 />;
    case 10:
      return <Screen10 />;
    case 11:
      return <Screen11 />;
    case 12:
      return <Screen12 />;
    case 13:
      return <Screen13 />;
    case 14:
      return <Screen14 />;
    case 15:
      return <Screen15 />;
    case 16:
      return <Screen16 />;
    case 17:
      return <Screen17 />;
    case 18:
      return <Screen18 />;
    case 19:
      return <Screen19 />;
    case 20:
      return <Screen20 />;
    default:
      return <Screen0 />;
  }
}

export default App;
