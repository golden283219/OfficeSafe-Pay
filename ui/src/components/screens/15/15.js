import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { goBack } from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Notification } from "../../molecules/Notification/Notification";
import { Wrapper, NotificationList } from "./15.css";
import {
  asyncActions as notificationAsyncActions,
  selectNotificationList,
} from "../../../store/notification";

function Screen15() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotificationList);
  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton onClick={goBack} />
        <Title>Notifications</Title>
        <NotificationList>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              status={notification.status}
              message={notification.message}
              onClick={() => {
                alert(`Retry ${notification.id}`);
              }}
              cancelOnClick={() => {
                alert(`Cancel ${notification.id}`);
                dispatch(
                  notificationAsyncActions.DELETE_NOTIFICATION(notification.id)
                );
              }}
            />
          ))}
        </NotificationList>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen15 };
