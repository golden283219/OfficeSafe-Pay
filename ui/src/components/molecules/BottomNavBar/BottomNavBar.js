import React from "react";
import {
  Wrapper,
  HomeButton,
  HomeButtonText,
  SupportButton,
  SupportButtonText,
  NotificationsButton,
  NotificationsButtonText,
  NotificationsBubble,
  AppVersion,
} from "./BottomNavBar.css";
import { Icon } from "../../atoms/Icon/Icon";
import HomeIcon from "../../../assets/images/icon-home.svg";
import RequestSupportIcon from "../../../assets/images/icon-request-support.svg";
import NotificationsIcon from "../../../assets/images/icon-notifications.svg";
import { goToHome } from "../../../utils";
import WinAutomate from "../../../WinAutomate";
import { goToScreen } from "../../../utils";
import { useSelector } from "react-redux";
import { selectNotificationQuantity } from "../../../store/notification";

let appVersion = "web-ui";
try {
  if (window.nodeapi) {
    appVersion = window.nodeapi.getAppMeta().appVersion;
  }
} catch (e) {
  // noop
}

const winAutomateTest = () => {
  let message = "focus";
  if (message && message.length) {
    WinAutomate.send(message).then(
      (x) => alert("WinAutomate reply:\n" + x),
      (x) => alert("WinAutomate error:\n" + x)
    );
  }
};

function BottomNavBar() {
  const notificationsQuantity = useSelector(selectNotificationQuantity);
  return (
    <Wrapper>
      <HomeButton onClick={goToHome}>
        <Icon width={0.806} height={0.792} src={HomeIcon} />
        <HomeButtonText>Home</HomeButtonText>
      </HomeButton>
      <SupportButton
        onClick={() => {
          goToScreen(11);
        }}
      >
        <Icon width={1.813} height={1.813} src={RequestSupportIcon} />
        <SupportButtonText>Request Support</SupportButtonText>
      </SupportButton>
      <NotificationsButton
        onClick={() => {
          goToScreen(15);
        }}
      >
        {notificationsQuantity > 0 && (
          <NotificationsBubble>
            {notificationsQuantity > 9 ? "9+" : notificationsQuantity}
          </NotificationsBubble>
        )}
        <Icon
          width={1.313}
          height={1.313}
          extendCSS={{ top: "-0.188rem", position: "relative" }}
          src={NotificationsIcon}
        />
        <NotificationsButtonText>Notifications</NotificationsButtonText>
      </NotificationsButton>
      <AppVersion onClick={winAutomateTest}>{appVersion}</AppVersion>
    </Wrapper>
  );
}

export { BottomNavBar };
